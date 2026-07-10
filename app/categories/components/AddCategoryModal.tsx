"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { createCategoryAction } from "@/app/actions/category";
import { CategoryIcon } from "@/app/components/CategoryIcon";
import { Select } from "@/app/components/Select";
import { toast } from "sonner";
import { Input } from "./Input";

const TYPE_GROUPS = [
  {
    label: "Category Type",
    options: [
      { value: "EXPENSE", label: "Expense", icon: "trending_down" },
      { value: "INCOME", label: "Income", icon: "trending_up" }
    ]
  }
];

const PRESET_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", 
  "#FFEEAD", "#D4A5A5", "#9B5DE5", "#F15BB5", 
  "#00F5D4", "#7C7CF8", "#95A5A6"
];

const PRESET_ICONS = [
  { name: "restaurant", label: "Dining" },
  { name: "local_cafe", label: "Coffee" },
  { name: "shopping_basket", label: "Groceries" },
  { name: "fastfood", label: "Snacks" },
  { name: "local_bar", label: "Drinks" },
  { name: "directions_car", label: "Car" },
  { name: "commute", label: "Transit" },
  { name: "flight", label: "Flights" },
  { name: "local_gas_station", label: "Fuel" },
  { name: "pedal_bike", label: "Bike" },
  { name: "home", label: "Rent" },
  { name: "electric_bolt", label: "Power" },
  { name: "water_drop", label: "Water" },
  { name: "wifi", label: "Internet" },
  { name: "plumbing", label: "Repairs" },
  { name: "sports_esports", label: "Gaming" },
  { name: "movie", label: "Movies" },
  { name: "fitness_center", label: "Gym" },
  { name: "theater_comedy", label: "Events" },
  { name: "spa", label: "Wellness" },
  { name: "payments", label: "Bills" },
  { name: "savings", label: "Savings" },
  { name: "credit_card", label: "Debt" },
  { name: "monetization_on", label: "Income" },
  { name: "trending_up", label: "Invest" },
  { name: "medical_services", label: "Health" },
  { name: "shopping_cart", label: "Shopping" },
  { name: "local_mall", label: "Clothes" },
  { name: "pets", label: "Pets" },
  { name: "redeem", label: "Gifts" },
  { name: "work", label: "Job" },
  { name: "school", label: "School" },
  { name: "subscriptions", label: "Sub" },
  { name: "build", label: "Tools" },
  { name: "help", label: "Other" }
];

type AddCategoryModalProps = {
  currency: string;
  isOpen: boolean;
  onClose: () => void;
};

export function AddCategoryModal({ currency, isOpen, onClose }: AddCategoryModalProps) {
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[9]); // Muted Iris
  const [selectedIcon, setSelectedIcon] = useState(PRESET_ICONS[0].name);
  const [categoryType, setCategoryType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const fd = new FormData(e.currentTarget);
    fd.set("color", selectedColor);
    fd.set("icon", selectedIcon);

    try {
      const res = await createCategoryAction(fd);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Category created successfully!");
        (e.target as HTMLFormElement).reset();
        setSelectedColor(PRESET_COLORS[9]);
        setSelectedIcon(PRESET_ICONS[0].name);
        setCategoryType("EXPENSE");
        onClose();
      }
    } catch (err) {
      toast.error("Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[200] bg-background/50 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-surface-container-lowest rounded-[32px] p-6 max-w-md w-full relative z-10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-outline-variant/10 animate-in zoom-in-95 duration-200 flex flex-col gap-5 overflow-y-auto max-h-[90vh] hide-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h2 className="font-headline text-lg font-bold text-on-surface">Create Category</h2>
            <p className="font-body text-xs text-on-surface-variant mt-0.5">Add a new category with custom limits</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high active:scale-95 transition-all border-none cursor-pointer bg-transparent"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name input */}
          <Input
            name="name"
            label="Name"
            type="text"
            placeholder="e.g. Coffee, Salary, Gym"
            required
          />

          {/* Type picker (no custom color) */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">Type</label>
            <Select
              name="type"
              defaultValue={categoryType}
              groups={TYPE_GROUPS}
              onChange={(val) => setCategoryType(val as "EXPENSE" | "INCOME")}
            />
          </div>

          {/* Preset colors */}
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">Color Palette</label>
            <div className="flex flex-wrap gap-2.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className="w-7 h-7 rounded-full transition-all duration-200 active-press cursor-pointer flex items-center justify-center border-none"
                  style={{
                    backgroundColor: c,
                    boxShadow: selectedColor.toLowerCase() === c.toLowerCase() ? `0 0 0 2px var(--color-background), 0 0 0 4px ${c}` : "none",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Icon Grid Picker */}
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">Select Icon</label>
            <div className="grid grid-cols-7 gap-2 max-h-44 overflow-y-auto p-1 border border-outline-variant/10 rounded-2xl bg-surface hide-scrollbar">
              {PRESET_ICONS.map((ico) => {
                const isActive = selectedIcon === ico.name;
                return (
                  <button
                    key={ico.name}
                    type="button"
                    title={ico.label}
                    onClick={() => setSelectedIcon(ico.name)}
                    className="aspect-square rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-surface-container-high border-none active-press"
                    style={{
                      backgroundColor: isActive ? `${selectedColor}15` : "transparent",
                      color: isActive ? selectedColor : "var(--color-on-surface-variant)",
                      transform: isActive ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    <CategoryIcon icon={ico.name} className="text-xl" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Budget Section (Expense only) */}
          {categoryType === "EXPENSE" && (
            <div className="border-t border-outline-variant/10 pt-4 flex flex-col gap-3">
              <h3 className="font-label-sm text-primary uppercase tracking-wider text-[10px]">Monthly / Weekly / Yearly Budget Limit</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Input
                    name="budgetAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00 (Optional)"
                    iconPrefix={currency}
                  />
                </div>
                <select
                  name="budgetPeriod"
                  defaultValue="MONTHLY"
                  className="w-full rounded-2xl bg-surface px-3 py-3 text-sm font-body text-on-surface focus:outline-none border border-outline-variant/20 cursor-pointer"
                >
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-primary text-on-primary rounded-full font-headline font-bold flex items-center justify-center gap-2 transition-all hover:bg-primary-container hover:text-on-primary-container active-press disabled:opacity-55 cursor-pointer shadow-md shadow-primary/10 border-none mt-2"
          >
            {isSubmitting ? (
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-on-primary border-t-transparent" />
            ) : (
              <>
                <Plus size={18} /> Create Category
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
