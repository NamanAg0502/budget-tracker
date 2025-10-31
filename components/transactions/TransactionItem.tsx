"use client";

import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Transaction } from "@/lib/db/schema";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Trash2, Edit } from "lucide-react";

interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function TransactionItem({
  transaction,
  onEdit,
  onDelete,
  showActions = false,
}: TransactionItemProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-gray-900 dark:text-white">
            {transaction.merchant}
          </span>
          <Badge variant="info">{transaction.category}</Badge>
          {transaction.source === "email" && (
            <Badge variant="success">Auto</Badge>
          )}
        </div>
        {transaction.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {transaction.description}
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {formatDate(transaction.date)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-semibold text-lg text-gray-900 dark:text-white">
          {formatCurrency(transaction.amount)}
        </span>
        {showActions && (
          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(transaction.id)}
                aria-label="Edit transaction"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(transaction.id)}
                aria-label="Delete transaction"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

