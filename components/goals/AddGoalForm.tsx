"use client";

import { useState } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { getCurrentMonth } from "@/lib/utils/format";

interface AddGoalFormProps {
  onSubmit: (goal: {
    category: string;
    targetAmount: number;
    month: string;
  }) => void;
  onCancel?: () => void;
  initialData?: { category?: string; targetAmount?: number; month?: string };
}

const CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Shopping",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Uncategorized",
];

export function AddGoalForm({
  onSubmit,
  onCancel,
  initialData,
}: AddGoalFormProps) {
  const [formData, setFormData] = useState({
    category: initialData?.category || "Food & Dining",
    targetAmount: initialData?.targetAmount?.toString() || "",
    month: initialData?.month || getCurrentMonth(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.targetAmount) {
      newErrors.targetAmount = "Target amount is required";
    } else if (
      isNaN(parseFloat(formData.targetAmount)) ||
      parseFloat(formData.targetAmount) <= 0
    ) {
      newErrors.targetAmount = "Target amount must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit({
      category: formData.category,
      targetAmount: parseFloat(formData.targetAmount),
      month: formData.month,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <Input
        type="number"
        label="Target Amount"
        value={formData.targetAmount}
        onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
        error={errors.targetAmount}
        placeholder="0.00"
        step="0.01"
        required
      />

      <Input
        type="month"
        label="Month"
        value={formData.month}
        onChange={(e) => setFormData({ ...formData, month: e.target.value })}
        required
      />

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1">
          {initialData ? "Update Goal" : "Create Goal"}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

