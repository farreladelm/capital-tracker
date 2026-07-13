"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { MainContainer } from "../components/MainContainer";
import { BottomNav } from "../components/BottomNav";
import { AddCategoryModal } from "./components/AddCategoryModal";
import { CategoryList } from "./components/CategoryList";
import { EditCategoryModal } from "./components/EditCategoryModal";

type CategoryWithDetails = {
  id: string;
  name: string;
  type: string;
  color: string;
  icon: string;
  _count: { transactions: number };
  budget: { amountMinor: number; period: string } | null;
};

type CategoriesClientProps = {
  categories: CategoryWithDetails[];
  currency: string;
  spentData: Record<string, { week: number; month: number; year: number }>;
};

export function CategoriesClient({
  categories,
  currency,
  spentData,
}: CategoriesClientProps) {
  const [editingCategory, setEditingCategory] = useState<CategoryWithDetails | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleEdit = (category: CategoryWithDetails) => {
    setEditingCategory(category);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setTimeout(() => {
      setEditingCategory(null);
    }, 200);
  };

  return (
    <div className="flex min-h-screen flex-col text-on-surface pb-32">
      {/* Main Content Area */}
      <MainContainer className="pt-8 md:pt-24 gap-stack-lg max-w-4xl mx-auto w-full">
        
        {/* Header Block with Title & Create Category Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <section className="text-left flex flex-col gap-1">
            <span className="font-label-sm text-primary uppercase tracking-wider">Settings</span>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface">Categories</h1>
          </section>

          {/* Action Trigger */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary text-on-primary font-bold px-6 py-3 rounded-full flex items-center gap-1.5 active-press text-sm border-none shadow-md shadow-primary/10 cursor-pointer self-start sm:self-auto hover:bg-primary-container hover:text-on-primary-container transition-colors"
          >
            <Plus size={16} /> Create Category
          </button>
        </div>

        {/* Categories List View */}
        <div className="flex flex-col gap-6 w-full">
          <CategoryList
            categories={categories}
            currency={currency}
            spentData={spentData}
            onEditCategory={handleEdit}
          />
        </div>
      </MainContainer>

      {/* Shared Bottom Navigation */}
      <BottomNav />

      {/* Create Category Overlay Modal */}
      <AddCategoryModal
        currency={currency}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Category Overlay Modal */}
      <EditCategoryModal
        category={editingCategory}
        currency={currency}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
      />
    </div>
  );
}
