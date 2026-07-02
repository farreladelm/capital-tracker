import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const ParsedTransactionSchema = z.object({
  amount: z.number().describe("The parsed amount (e.g. 15.50). Never invent amounts. If missing, return exactly 0."),
  category: z.string().describe("The closest category name, or 'Uncategorized' if unsure."),
  type: z.enum(["EXPENSE", "INCOME"]).describe("Whether this represents money spent or gained."),
  date: z.string().describe("The ISO 8601 UTC date string. Resolve relative dates based on current UTC time."),
  description: z.string().describe("A concise description of the transaction."),
});

const ParserResponseSchema = z.object({
  transactions: z.array(ParsedTransactionSchema),
});

export type ParsedTransaction = z.infer<typeof ParsedTransactionSchema>;

export class AIParserError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "AIParserError";
  }
}

export async function parseTransactionInput(input: string, currentUtcTime: string, categoryNames: string[] = []): Promise<ParsedTransaction[]> {
  // E2E Mock Path to avoid external Gemini API dependencies during tests
  if (process.env.MOCK_AI === "true") {
    const isCoffee = input.toLowerCase().includes("coffee");
    return [
      {
        amount: isCoffee ? 4 : 10,
        category: isCoffee ? "Food" : (categoryNames[0] || "Uncategorized"),
        type: "EXPENSE",
        date: currentUtcTime,
        description: isCoffee ? "coffee" : input,
      },
    ];
  }

  const categoryListStr = categoryNames.length > 0 ? categoryNames.join(", ") : "None provided";
  
  const prompt = `
    You are an expert financial parsing assistant. Extract transaction details from the user's input.
    Current Server UTC Time: ${currentUtcTime}
    Available Categories: ${categoryListStr}

    Rules:
    - If the input contains multiple distinct transactions (e.g., "coffee 5 and lunch 10"), return multiple objects.
    - If the amount is missing, return 0 for the amount.
    - Do NOT invent dates or amounts. Use the current UTC time for "today".
    - Try to map the transaction to one of the Available Categories exactly. If none match, use 'Uncategorized' or the closest match.
    
    Input: "${input}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            transactions: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  amount: { type: "NUMBER" },
                  category: { type: "STRING" },
                  type: { type: "STRING", enum: ["EXPENSE", "INCOME"] },
                  date: { type: "STRING" },
                  description: { type: "STRING" }
                },
                required: ["amount", "category", "type", "date", "description"]
              }
            }
          },
          required: ["transactions"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from AI provider.");
    }

    console.log("=== LLM API RESPONSE ===");
    console.log(`Input: "${input}"`);
    console.log(`Output: ${response.text}`);
    console.log("========================");

    const json = JSON.parse(response.text);
    const parsed = ParserResponseSchema.parse(json);

    // Validate that we got a valid amount for at least one transaction
    const validTransactions = parsed.transactions.filter((t) => t.amount > 0);
    
    if (validTransactions.length === 0) {
      throw new AIParserError("No valid amount detected in input.", "MISSING_AMOUNT");
    }

    return validTransactions;
  } catch (error) {
    if (error instanceof AIParserError) throw error;
    console.error("[AI Parser Error]:", error);
    throw new AIParserError("Failed to parse transaction via AI provider.", "AI_PROVIDER_FAILURE");
  }
}
