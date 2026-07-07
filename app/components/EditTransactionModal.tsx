"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Trash2, Loader2 } from "lucide-react";
import { updateTransaction, deleteTransaction } from "../actions/transaction";
import { Select } from "./Select";

type Transaction = {
  id: string;
  amountMinor: number;
  description: string;
  type: string;
  date: Date;
  categoryId: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
};

type Category = {
  id: string;
  name: string;
  icon: string;
  type: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  txn: Transaction;
  categories: Category[];
  currency: string;
};

export function EditTransactionModal({ isOpen, onClose, txn, categories, currency }: Props) {
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      setMounted(true);
    });
  }, []);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const fd = new FormData(e.currentTarget);
      await updateTransaction(fd);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update transaction");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("id", txn.id);
      await deleteTransaction(fd);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete transaction");
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");
  const incomeCategories = categories.filter((c) => c.type === "INCOME");

  const selectGroups = [
    {
      label: "Expenses",
      options: expenseCategories.map((c) => ({
        value: c.id,
        label: c.name,
        icon: c.icon,
      })),
    },
    {
      label: "Income",
      options: incomeCategories.map((c) => ({
        value: c.id,
        label: c.name,
        icon: c.icon,
      })),
    },
  ];

  return createPortal(
    <div 
      className="fixed inset-0 z-[200] bg-background/50 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        className="bg-surface-container-lowest rounded-[32px] p-6 max-w-md w-full relative z-10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-outline-variant/10 animate-in zoom-in-95 duration-200 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between">
          <h2 className="font-headline text-lg font-bold text-on-surface">Edit Transaction</h2>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high active:scale-95 transition-all"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </header>

        {error && (
          <div className="bg-error-container text-on-error-container p-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={txn.id} />
          
          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label text-[11px] font-bold text-secondary uppercase tracking-wider pl-1">
              Amount ({currency})
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 font-headline text-lg font-bold text-on-surface-variant">
                {currency}
              </span>
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={(txn.amountMinor / 100).toFixed(2)}
                required
                className="w-full rounded-2xl bg-surface-container-low py-3 pl-12 pr-4 text-lg font-headline font-bold text-on-surface focus:bg-surface-container-high focus:outline-none transition-colors border-none"
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label text-[11px] font-bold text-secondary uppercase tracking-wider pl-1">
              Description
            </label>
            <input
              name="description"
              type="text"
              defaultValue={txn.description}
              required
              className="w-full rounded-2xl bg-surface-container-low p-3 font-body text-sm text-on-surface focus:bg-surface-container-high focus:outline-none transition-colors border-none"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label text-[11px] font-bold text-secondary uppercase tracking-wider pl-1">
              Category
            </label>
            <Select
              name="categoryId"
              defaultValue={txn.categoryId}
              groups={selectGroups}
              required
            />
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label text-[11px] font-bold text-secondary uppercase tracking-wider pl-1">
              Date
            </label>
            <input
              name="date"
              type="date"
              defaultValue={new Date(txn.date).toISOString().split("T")[0]}
              required
              className="w-full rounded-2xl bg-surface-container-low p-3 font-body text-sm text-on-surface focus:bg-surface-container-high focus:outline-none transition-colors border-none"
            />
          </div>

          {/* Save Action Button */}
          <button
            type="submit"
            disabled={isSaving || isDeleting}
            className="mt-2 w-full h-12 rounded-full bg-primary text-on-primary font-headline text-sm font-bold shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Save Changes"
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="border-t border-outline-variant/30 my-1"></div>

        {/* Delete Confirmation / Trigger */}
        <div className="w-full">
          {confirmDelete ? (
            <div className="flex gap-2 w-full animate-in fade-in zoom-in-95 duration-200">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-grow h-12 rounded-full bg-error text-on-error font-headline text-sm font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 className="animate-spin" size={18} /> : "Confirm Delete"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="h-12 px-6 rounded-full bg-surface-container-high text-on-surface font-headline text-sm font-bold hover:opacity-80 active:scale-95 transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              disabled={isSaving || isDeleting}
              className="w-full h-12 rounded-full bg-error/10 text-error font-headline text-sm font-bold hover:bg-error/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              <span>Delete Transaction</span>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
