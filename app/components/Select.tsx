"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "./CategoryIcon";

export type SelectOption = {
  value: string;
  label: string;
  icon?: string;
};

export type SelectGroup = {
  label: string;
  options: SelectOption[];
};

type SelectProps = {
  name: string;
  defaultValue?: string;
  groups: SelectGroup[];
  required?: boolean;
  className?: string;
  onChange?: (value: string) => void;
};

export function Select({ name, defaultValue, groups, required = false, className, onChange }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(defaultValue || "");
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync defaultValue when changed by parent
  useEffect(() => {
    if (defaultValue !== undefined) {
      setSelectedValue(defaultValue);
    }
  }, [defaultValue]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find currently selected option to show in the trigger button
  const allOptions = groups.flatMap((g) => g.options);
  const selectedOption = allOptions.find((opt) => opt.value === selectedValue);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Hidden input for HTML form submission */}
      <input type="hidden" name={name} value={selectedValue} required={required} />

      {/* Select Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between rounded-2xl bg-surface py-3 px-4 font-body text-sm text-on-surface hover:bg-surface-container-low focus:outline-none transition-all border border-outline-variant/50 cursor-pointer",
          isOpen && "border-primary/50 ring-1 ring-primary/10"
        )}
      >
        <span className="flex items-center gap-2">
          {selectedOption ? (
            <>
              {selectedOption.icon && <CategoryIcon icon={selectedOption.icon} className="w-5 h-5" />}
              <span>{selectedOption.label}</span>
            </>
          ) : (
            <span className="text-on-surface-variant/60">Select category…</span>
          )}
        </span>
        <ChevronDown size={18} className={cn("text-on-surface-variant transition-transform duration-200", isOpen && "transform rotate-180")} />
      </button>

      {/* Select Dropdown Content */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 z-50 bg-surface-container-lowest rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-outline-variant/10 p-2 max-h-60 overflow-y-auto select-none animate-in fade-in slide-in-from-top-2 duration-150">
          {groups.map((group) => {
            if (group.options.length === 0) return null;
            return (
              <div key={group.label} className="flex flex-col gap-0.5">
                {/* Group Label */}
                <div className="font-label text-[10px] font-bold text-secondary uppercase tracking-wider px-3 py-2">
                  {group.label}
                </div>
                {/* Options list */}
                {group.options.map((option) => {
                  const isSelected = option.value === selectedValue;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSelectedValue(option.value);
                        setIsOpen(false);
                        if (onChange) onChange(option.value);
                      }}
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2 rounded-xl text-sm font-body cursor-pointer text-left transition-colors hover:bg-surface-container-low",
                        isSelected ? "bg-primary/5 text-primary font-semibold" : "text-on-surface"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {option.icon && <CategoryIcon icon={option.icon} className="w-5 h-5 text-on-surface-variant/80" />}
                        <span>{option.label}</span>
                      </span>
                      {isSelected && <Check size={16} className="text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
