// Tipe data sisi-client (amount sudah berupa number).

export interface Expense {
  id: string
  userId: string
  amount: number
  category: string
  description: string | null
  date: string
  paymentMethod: string
  recurringExpenseId: string | null
  createdAt: string
  updatedAt: string
}

export interface ExpenseListResponse {
  data: Expense[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  filteredSum: number
}

export interface ExpenseFormData {
  amount: number | string
  category: string
  description: string
  date: string
  paymentMethod: string
}

export interface Budget {
  id: string
  userId: string
  category: string
  monthlyLimit: number
  currentMonth: number
  currentYear: number
  createdAt: string
  updatedAt: string
}

export interface BudgetWithProgress extends Budget {
  spent: number
  remaining: number
  percentage: number
  exceeded: boolean
}

export interface BudgetListResponse {
  month: number
  year: number
  totalLimit: number
  totalSpent: number
  items: BudgetWithProgress[]
}

export interface Goal {
  id: string
  userId: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  description: string | null
  isCompleted: boolean
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface RecurringExpense {
  id: string
  userId: string
  amount: number
  category: string
  description: string | null
  paymentMethod: string
  frequency: string
  startDate: string
  endDate: string | null
  isActive: boolean
  lastGeneratedDate: string | null
  createdAt: string
  updatedAt: string
  nextDue?: string | null
}

export type SortDir = 'asc' | 'desc'
