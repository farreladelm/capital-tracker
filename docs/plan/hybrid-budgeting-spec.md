# Specification: Hybrid Budgeting Architecture

This document describes the design and database architecture for a hybrid budgeting model. It balances automated, zero-friction category-based budgeting with flexible, tag-based project budgeting (e.g., tracking a "Trip to Tokyo" across multiple categories).

---

## 1. Product Tradeoffs & Strategy

We evaluated two core approaches for budgeting:

| Approach | User Friction | Flexibility | Use Case |
| :--- | :--- | :--- | :--- |
| **Category-Based** | **Zero** (Auto-rolls up based on transaction category) | Low (Cannot track cross-category trips or multiple budgets per category) | Monthly recurring spending (Food, Transport, Utilities) |
| **Transaction-Linked (`budgetId`)** | **High** (User must manually link a budget to every transaction) | High (Supports custom envelopes, one-off events, and projects) | Specific events, trips, or irregular projects |

### The Recommendation: The Hybrid "Category-default + Tag-override" Model
We default to automatic **Category-based** budgets to keep day-to-day usage effortless. For custom events (like travel or renovation projects), we support **Tag-based** budgets. The system automatically routes transactions to budgets using a simple parsing fallback.

---

## 2. Database Schema Design (Prisma)

Update the database schema to support optional category linking and tag matching:

```prisma
model Budget {
  id          String    @id @default(uuid())
  name        String    // e.g., "Monthly Food" or "Japan Trip"
  limit       Decimal   @db.Decimal(12, 2)
  startDate   DateTime
  endDate     DateTime
  
  // Relations
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Rule A: Link to a Category for auto-aggregation (Category Budget)
  categoryId  String?   
  category    Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  
  // Rule B: Match a text tag/project (Project Budget)
  tag         String?   // e.g., "japantrip" (matched against transaction tags or notes)

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId])
  @@index([categoryId])
}

model Transaction {
  id          String    @id @default(uuid())
  amount      Decimal   @db.Decimal(12, 2)
  description String    // e.g., "Lunch at ramen shop #japantrip"
  date        DateTime
  tags        String[]  // e.g., ["japantrip"] (extracted from description)
  
  // Relations
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId])
  @@index([categoryId])
}
```

---

## 3. Data Aggregation & Queries (Service Layer)

When querying budget progress in `lib/services/budget.service.ts`, we compute the spent amount dynamically using a unified query:

```typescript
import { prisma } from "@/lib/prisma";

export class BudgetService {
  /**
   * Retrieves active budgets for a user and calculates the spent amount for each.
   */
  static async getBudgetsWithSpent(userId: string, date: Date = new Date()) {
    // 1. Fetch all budgets active in the target date range
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        startDate: { lte: date },
        endDate: { gte: date },
      },
    });

    const results = [];

    for (const budget of budgets) {
      let spent = 0;

      if (budget.categoryId) {
        // Case A: Category Budget
        // Sum all transactions in this category within the budget's start/end dates
        const agg = await prisma.transaction.aggregate({
          where: {
            userId,
            categoryId: budget.categoryId,
            date: {
              gte: budget.startDate,
              lte: budget.endDate,
            },
          },
          _sum: {
            amount: true,
          },
        });
        spent = Number(agg._sum.amount || 0);
      } else if (budget.tag) {
        // Case B: Project/Tag Budget
        // Sum all transactions containing the specific tag in their array
        const agg = await prisma.transaction.aggregate({
          where: {
            userId,
            tags: {
              has: budget.tag.toLowerCase(),
            },
            date: {
              gte: budget.startDate,
              lte: budget.endDate,
            },
          },
          _sum: {
            amount: true,
          },
        });
        spent = Number(agg._sum.amount || 0);
      }

      results.push({
        ...budget,
        spent,
        remaining: Number(budget.limit) - spent,
      });
    }

    return results;
  }
}
```

---

## 4. NLP Parser & Tag Extraction Rules

Our NLP parsing logic (used when adding transactions via quick text or voice command) must extract hashtags automatically:

1. **Text input**: *"spent $45 on dinner at Ichiran #japantrip"*
2. **Parsing steps**:
   * Extract amount: `$45`
   * Extract description: `"dinner at Ichiran"` (strip out hashtags for a cleaner description)
   * Extract tags: Find any word starting with `#`, convert to lowercase, and strip punctuation -> `["japantrip"]`
   * Classify Category: Determine that `"dinner"` or `"restaurant"` maps to Category `Food`.
3. **Database Insertion**:
   * Create `Transaction` with category `Food` and tags `["japantrip"]`.
   * The transaction will automatically roll up under **both** the "Food" category budget and the "Japan Trip" tag budget.
