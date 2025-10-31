export interface Transaction {
  id: string;
  date: string;
  amount: number;
  merchant: string;
  category: string;
  description?: string;
  source: "manual" | "email";
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  category: string;
  targetAmount: number;
  spent: number;
  month: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
}
