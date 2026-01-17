# Avelon Web

**Avelon** is a decentralized crypto-lending platform that connects borrowers seeking capital with lenders looking for secure, transparent investment opportunities—all powered by smart contracts and AI-driven risk assessment.

This repository contains the **Admin Dashboard** for the Avelon platform, built with Next.js 16.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **UI:** React 19, TailwindCSS
- **Icons:** Lucide React
- **Blockchain:** Ethers.js

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Project Structure

```
avelon_web/
├── public/                    # Static assets
│   └── images/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing (redirects to /admin)
│   │   ├── (auth)/            # Auth route group
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   └── (admin)/           # Admin route group
│   │       ├── layout.tsx     # Admin layout with Sidebar
│   │       └── admin/
│   │           ├── page.tsx            # Dashboard
│   │           ├── users/
│   │           ├── loan-plans/
│   │           ├── loan-requests/
│   │           ├── payment-history/
│   │           ├── transactions/
│   │           ├── loan-status/
│   │           ├── deposits/
│   │           ├── wallet/
│   │           ├── completed-loans/
│   │           └── settings/
│   ├── components/
│   │   ├── layout/            # Layout components (Sidebar)
│   │   └── pages/             # Page content components
│   ├── assets/                # Images and static assets
│   └── styles/
│       └── globals.css        # Global styles (TailwindCSS)
├── next.config.ts             # Next.js configuration
├── tailwind.config.js         # TailwindCSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json
```

## Admin Routes

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard overview |
| `/admin/users` | User management |
| `/admin/loan-plans` | Loan plan configuration |
| `/admin/loan-requests` | Pending loan requests |
| `/admin/loan-status` | Active loan monitoring |
| `/admin/payment-history` | Payment records |
| `/admin/transactions` | Transaction history |
| `/admin/deposits` | Deposit tracking |
| `/admin/wallet` | Wallet management |
| `/admin/completed-loans` | Completed loans archive |
| `/admin/settings` | Admin settings |

## Features

- **Authentication** - Secure admin login
- **Dashboard** - Real-time metrics and analytics
- **User Management** - View, verify, and manage users
- **Loan Management** - Create and manage loan plans
- **Analytics** - Loan volume trends and ETH volatility predictions
- **Transaction Tracking** - Complete transaction history

## Documentation

For detailed project documentation, see the `/docs` folder:
- [Project Overview](./docs/avelon_overview/)

## License

Private - Avelon Team
