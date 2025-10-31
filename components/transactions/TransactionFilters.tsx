"use client";

import { useState } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Filter, X } from "lucide-react";

interface TransactionFiltersProps {
  onFilterChange: (filters: {
    from?: string;
    to?: string;
    category?: string;
  }) => void;
  categories: string[];
}

export function TransactionFilters({
  onFilterChange,
  categories,
}: TransactionFiltersProps) {
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    category: "",
  });

  const handleFilterChange = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    onFilterChange(filters);
  };

  const clearFilters = () => {
    const emptyFilters = { from: "", to: "", category: "" };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasFilters = filters.from || filters.to || filters.category;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Filter className="w-4 h-4" />
        Filters
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
          type="date"
          label="From Date"
          value={filters.from}
          onChange={(e) => handleFilterChange("from", e.target.value)}
        />
        <Input
          type="date"
          label="To Date"
          value={filters.to}
          onChange={(e) => handleFilterChange("to", e.target.value)}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={applyFilters}>Apply Filters</Button>
        {hasFilters && (
          <Button variant="secondary" onClick={clearFilters}>
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

