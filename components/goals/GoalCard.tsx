"use client";

import { formatCurrency } from "@/lib/utils/format";
import { Goal } from "@/lib/db/schema";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Edit, Trash2 } from "lucide-react";

interface GoalCardProps {
  goal: Goal;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function GoalCard({
  goal,
  onEdit,
  onDelete,
  showActions = false,
}: GoalCardProps) {
  const percentage = goal.targetAmount > 0 
    ? (goal.spent / goal.targetAmount) * 100 
    : 0;
  const exceeded = goal.spent > goal.targetAmount;
  const remaining = Math.max(0, goal.targetAmount - goal.spent);

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-gray-900 dark:text-white">
          {goal.category}
        </span>
        {showActions && (
          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(goal.id)}
                aria-label="Edit goal"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(goal.id)}
                aria-label="Delete goal"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">
            {formatCurrency(goal.spent)} of {formatCurrency(goal.targetAmount)}
          </span>
          <Badge 
            variant={exceeded ? "danger" : percentage > 80 ? "warning" : "success"}
          >
            {percentage.toFixed(0)}%
          </Badge>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              exceeded
                ? "bg-red-600"
                : percentage > 80
                ? "bg-yellow-500"
                : "bg-green-600"
            }`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
        <span>Remaining: {formatCurrency(remaining)}</span>
        {exceeded && (
          <span className="text-red-600 font-medium">
            Over by {formatCurrency(goal.spent - goal.targetAmount)}
          </span>
        )}
      </div>
    </div>
  );
}

