"use client";

import { useEffect, useState } from "react";
import { Card } from "../ui/Card";
import { Transaction } from "@/lib/db/schema";
import { TransactionItem } from "../transactions/TransactionItem";
import Link from "next/link";
import { Button } from "../ui/Button";
import { ArrowRight } from "lucide-react";

interface RecentTransactionsProps {
  limit?: number;
}

export function RecentTransactions({ limit = 5 }: RecentTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`/api/transactions?limit=${limit}`);
        if (!response.ok) throw new Error("Failed to fetch transactions");

        const data = await response.json();
        setTransactions(data.transactions);
      } catch (error) {
        console.error("Error fetching recent transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [limit]);

  if (loading) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Transactions
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Loading...
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Transactions
        </h3>
        <Link href="/transactions">
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
      {transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No transactions found
        </div>
      ) : (
        <div className="space-y-0">
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              showActions={false}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

