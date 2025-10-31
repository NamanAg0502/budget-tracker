"use client";

import { useState } from "react";
import { TransactionList } from "@/components/transactions/TransactionList";
import { AddTransactionForm } from "@/components/transactions/AddTransactionForm";
import { Modal } from "@/components/ui/Modal";
import { Transaction } from "@/lib/db/schema";

export default function TransactionsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setShowAddModal(true);
  };

  const handleEditTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`);
      if (!response.ok) throw new Error("Failed to fetch transaction");
      
      const data = await response.json();
      setEditingTransaction(data.transaction);
      setShowAddModal(true);
    } catch (error) {
      console.error("Error fetching transaction:", error);
      alert("Failed to load transaction");
    }
  };

  const handleSubmitTransaction = async (transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt" | "source">) => {
    try {
      let response;
      
      if (editingTransaction) {
        // Update existing
        response = await fetch(`/api/transactions/${editingTransaction.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transaction),
        });
      } else {
        // Create new
        response = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transaction),
        });
      }

      if (!response.ok) throw new Error("Failed to save transaction");

      setShowAddModal(false);
      setEditingTransaction(null);
      
      // Trigger a page refresh by reloading
      window.location.reload();
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Failed to save transaction");
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto">
        <TransactionList
          onAddTransaction={handleAddTransaction}
          onEditTransaction={handleEditTransaction}
        />

        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingTransaction(null);
          }}
          title={editingTransaction ? "Edit Transaction" : "Add Transaction"}
        >
          <AddTransactionForm
            onSubmit={handleSubmitTransaction}
            onCancel={() => {
              setShowAddModal(false);
              setEditingTransaction(null);
            }}
            initialData={editingTransaction || undefined}
          />
        </Modal>
      </div>
    </div>
  );
}

