// Basic domain models for the app (M in MVC)
// You can expand these as your data becomes more real / comes from an API.

export type PageId =
  | "dashboard"
  | "users"
  | "loan-plans"
  | "loan-requests"
  | "payment-history"
  | "transaction-history"
  | "loan-status"
  | "deposits"
  | "wallet"
  | "completed-loans"
  | "settings"

export interface AuthState {
  isAuthenticated: boolean
}

