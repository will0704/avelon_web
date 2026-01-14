import { useState } from "react"
import type { PageId, AuthState } from "../models/appModels"

import Login from "../components/Login"
import Sidebar from "../components/Sidebar"

// Views (page-level components)
import Dashboard from "../components/Dashboard"
import Users from "../components/Users"
import LoanRequests from "../components/LoanRequests"
import LoanPlans from "../components/Loan Plans"
import PaymentHistory from "../components/Paymenthistory"
import Transaction from "../components/Transaction"
import LoanStatus from "../components/LoanStatus"
import Deposits from "../components/Deposits"
import Wallet from "../components/Wallet"
import CompletedLoans from "../components/CompletedLoans"
import Settings from "../components/Settings"

// Controller component (C in MVC) - coordinates auth, navigation, and which view to show.
export default function AppController() {
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false })
  const [currentPage, setCurrentPage] = useState<PageId>("dashboard")

  const handleLogin = () => setAuthState({ isAuthenticated: true })

  const handleLogout = () => {
    setAuthState({ isAuthenticated: false })
    setCurrentPage("dashboard")
  }

  const handleNavigate = (page: string) => {
    // Narrow incoming string to known PageId; fallback to dashboard
    if (page as PageId) {
      setCurrentPage(page as PageId)
    } else {
      setCurrentPage("dashboard")
    }
  }

  if (!authState.isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      case "users":
        return <Users />
      case "loan-plans":
        return <LoanPlans />
      case "loan-requests":
        return <LoanRequests />
      case "payment-history":
        return <PaymentHistory />
      case "transaction-history":
        return <Transaction />
      case "loan-status":
        return <LoanStatus />
      case "deposits":
        return <Deposits />
      case "wallet":
        return <Wallet />
      case "completed-loans":
        return <CompletedLoans />
      case "settings":
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (part of the View layer) */}
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout} />

      {/* Main Content (View container) */}
      <div className="flex-1 overflow-auto">{renderPage()}</div>
    </div>
  )
}

