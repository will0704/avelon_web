# Avelon:  Complete Project Overview - Part 2 of 6

## 4. System Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACES                              │
│  ┌──────────────────────┐              ┌──────────────────────┐    │
│  │   Next.js Web App    │              │  React Native Mobile │    │
│  │  (avelon_web)        │              │  (avelon_mobile)     │    │
│  │  ├─ Landing Page     │              │  ├─ Authentication   │    │
│  │  ├─ Auth (SignUp/In) │              │  ├─ Dashboard        │    │
│  │  ├─ Onboarding/KYC   │              │  ├─ Loan Management  │    │
│  │  ├─ Borrower Dashboard│             │  ├─ Notifications    │    │
│  │  ├─ Admin Dashboard  │              │  └─ Settings         │    │
│  │  └─ Loan Management  │              │                      │    │
│  └──────────────────────┘              └──────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                │
                    Uses @avelon/types (avelon_types)
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND SERVICES (avelon_backend)                 │
│  ┌──────────────────────┐              ┌──────────────────────┐    │
│  │   Hono API Server    │              │   NextAuth. js        │    │
│  │  ├─ User Management  │              │  ├─ Session Mgmt     │    │
│  │  ├─ Loan Operations  │              │  ├─ JWT Tokens       │    │
│  │  ├─ Admin Operations │              │  └─ OAuth Providers  │    │
│  │  ├─ Blockchain Sync  │              │                      │    │
│  │  └─ Notification Svc │              │                      │    │
│  └──────────────────────┘              └──────────────────────┘    │
│                                                                     │
│  ┌──────────────────────┐              ┌──────────────────────┐    │
│  │   Liquidation Bot    │              │   Email Service      │    │
│  │  ├─ Ratio Monitor    │              │  ├─ Resend API       │    │
│  │  ├─ Warning Sender   │              │  ├─ React Email      │    │
│  │  └─ Auto-Liquidate   │              │  └─ Templates        │    │
│  └──────────────────────┘              └──────────────────────┘    │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │   Smart Contracts (Hardhat)                                   │  │
│  │  ├─ AvelonCore. sol      ├─ Treasury.sol                      │  │
│  │  ├─ LoanManager.sol     ├─ PriceOracle. sol                   │  │
│  │  └─ AccessControl.sol                                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
┌───────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐
│    PostgreSQL     │ │  AI Microservice│ │   Ethereum Blockchain   │
│  ├─ Users         │ │  (avelon_llm)   │ │   (Ganache Local)       │
│  ├─ Wallets       │ │  ├─ OCR Engine  │ │  ├─ AvelonCore.sol      │
│  ├─ Loans         │ │  ├─ Doc Classify│ │  ├─ LoanManager.sol     │
│  ├─ LoanPlans     │ │  ├─ Fraud Detect│ │  ├─ Treasury.sol        │
│  ├─ Documents     │ │  └─ Credit Score│ │  ├─ PriceOracle.sol     │
│  ├─ Notifications │ │                 │ │  └─ AccessControl.sol   │
│  └─ AuditLogs     │ │                 │ │                         │
└───────────────────┘ └─────────────────┘ └─────────────────────────┘
        │                     │                       │
        ▼                     ▼                       ▼
┌───────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐
│      Redis        │ │  File Storage   │ │   Firebase (FCM)        │
│  ├─ Session Cache │ │  ├─ KYC Docs    │ │  ├─ Push Tokens         │
│  ├─ Rate Limiting │ │  └─ Encrypted   │ │  └─ Mobile Notifications│
│  └─ Price Cache   │ │                 │ │                         │
└───────────────────┘ └─────────────────┘ └─────────────────────────┘
```

### 4.2 Cross-Repository Communication

```
┌─────────────────────────────────────────────────────────────────────┐
│                    REPOSITORY COMMUNICATION                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  avelon_web ◄──────── REST API ────────► avelon_backend            │
│      │                                        │                     │
│      │                                        │                     │
│      └───── WebSocket (notifications) ────────┘                     │
│                                                                     │
│  avelon_mobile ◄───── REST API ───────► avelon_backend             │
│      │                                        │                     │
│      │                                        │                     │
│      └───── FCM (push notifications) ─────────┘                     │
│                                                                     │
│  avelon_backend ◄──── REST API ────────► avelon_llm                │
│      │                                                              │
│      │                                                              │
│      └───── Ethers.js ────────► Ganache/Ethereum                   │
│                                                                     │
│  SHARED TYPES (avelon_types):                                       │
│  ├─ Published as @avelon/types npm package                         │
│  ├─ Installed in web, mobile, and backend repos                   │
│  └─ Ensures type consistency across all applications              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.3 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      USER JOURNEY DATA FLOW                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1.  REGISTRATION & VERIFICATION                                     │
│  ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐             │
│  │ SignUp │───►│ Email  │───►│ Connect│───►│ Upload │             │
│  │ (Email)│    │ Verify │    │ Wallet │    │  Docs  │             │
│  └────────┘    └────────┘    └────────┘    └───┬────┘             │
│                                                 │                   │
│                                                 ▼                   │
│  2. AI VERIFICATION                        ┌────────┐              │
│                                            │   AI   │              │
│  ┌────────┐    ┌────────┐    ┌────────┐   │ Verify │              │
│  │ Score  │◄───│ Fraud  │◄───│  OCR   │◄──│        │              │
│  │ Assign │    │ Check  │    │ Extract│   └────────┘              │
│  └───┬────┘    └────────┘    └────────┘                           │
│      │                                                             │
│      ▼                                                             │
│  3. LOAN APPLICATION                                               │
│  ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐             │
│  │ Select │───►│ Review │───►│ Deposit│───►│  Loan  │             │
│  │  Plan  │    │ Terms  │    │Collateral   │Disbursed│             │
│  └────────┘    └────────┘    └────────┘    └───┬────┘             │
│                                                 │                   │
│                                                 ▼                   │
│  4. LOAN MONITORING                        ┌────────┐              │
│                                            │ Active │              │
│  ┌────────┐    ┌────────┐    ┌────────┐   │  Loan  │              │
│  │Monitor │◄───│ Ratio  │◄───│  Bot   │◄──│        │              │
│  │Dashboard    │ Display│    │ Checks │   └────────┘              │
│  └────────┘    └────────┘    └────────┘                           │
│      │                                                             │
│      ▼                                                             │
│  5. REPAYMENT / LIQUIDATION                                        │
│  ┌────────┐              ┌────────┐                               │
│  │ Repay  │──────OR──────│Liquidate│                              │
│  │  Loan  │              │  (Auto) │                              │
│  └───┬────┘              └────┬────┘                              │
│      │                        │                                    │
│      ▼                        ▼                                    │
│  ┌────────┐              ┌────────┐                               │
│  │Collateral             │ Debt   │                               │
│  │Released │             │Settled │                               │
│  └────────┘              └────────┘                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Repository Structure

### 5.1 Repository Overview

Avelon uses a **multi-repository architecture** with 5 separate repositories:

| Repository | Purpose | Tech Stack |
|------------|---------|------------|
| `avelon_web` | Web Application | Next.js, TypeScript, TailwindCSS |
| `avelon_mobile` | Mobile App | React Native, TypeScript |
| `avelon_backend` | API + Smart Contracts | Hono, Prisma, Hardhat, Solidity |
| `avelon_llm` | AI Microservice | Python, FastAPI, PyTorch |
| `avelon_types` | Shared Types (npm) | TypeScript |

### 5.2 avelon_web (Next.js Web Application)

```
avelon_web/
├── public/
│   ├── images/
│   └── favicon.ico
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Auth route group
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── verify-email/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/          # Protected routes
│   │   │   ├── dashboard/
│   │   │   ├── loans/
│   │   │   ├── kyc/
│   │   │   └── settings/
│   │   ├── (admin)/              # Admin routes
│   │   │   ├── admin/
│   │   │   ├── admin/users/
│   │   │   ├── admin/loans/
│   │   │   ├── admin/plans/
│   │   │   └── admin/kyc/
│   │   ├── api/                  # API routes (NextAuth, etc.)
│   │   │   └── auth/[...nextauth]/
│   │   ├── layout.tsx
│   │   └── page.tsx              # Landing page
│   ├── components/
│   │   ├── ui/                   # Base UI components
│   │   ├── forms/                # Form components
│   │   ├── layout/               # Layout components
│   │   ├── dashboard/            # Dashboard components
│   │   ├── loans/                # Loan-related components
│   │   ├── kyc/                  # KYC components
│   │   └── admin/                # Admin components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/
│   │   ├── api.ts                # API client
│   │   ├── auth.ts               # Auth configuration
│   │   ├── utils.ts              # Utility functions
│   │   └── constants.ts          # Constants
│   ├── services/
│   │   ├── loan. service.ts
│   │   ├── user.service.ts
│   │   └── kyc.service.ts
│   ├── stores/                   # Zustand stores
│   │   ├── user.store.ts
│   │   └── loan.store. ts
│   └── styles/
│       └── globals.css
├── contracts/                    # Smart contract ABIs & deployment
│   ├── abis/                     # Contract ABIs (JSON)
│   ├── addresses.ts              # Deployed addresses
│   └── hooks/                    # Contract interaction hooks
├── emails/                       # React Email templates
│   ├── verification.tsx
│   ├── loan-approved.tsx
│   └── liquidation-warning.tsx
├── . env.example
├── .env.local
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

**Key Dependencies (avelon_web):**
```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "framer-motion": "^10.18.0",
    "@tanstack/react-query": "^5.17.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.0",
    "next-auth": "^5.0.0-beta",
    "wagmi": "^2.5.0",
    "@rainbow-me/rainbowkit": "^2.0.0",
    "ethers": "^6.10.0",
    "@react-email/components": "^0.0.14",
    "resend": "^3.0.0",
    "@avelon/types":  "^1.0.0"
  }
}
```

### 5.3 avelon_mobile (React Native Mobile App)

```
avelon_mobile/
├── android/                      # Android native project
├── ios/                          # iOS native project
├── src/
│   ├── app/                      # Main app entry
│   │   └── App.tsx
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── VerifyEmailScreen.tsx
│   │   ├── onboarding/
│   │   │   ├── WalletConnectScreen.tsx
│   │   │   └── KYCScreen.tsx
│   │   ├── main/
│   │   │   ├── DashboardScreen.tsx
│   │   │   ├── LoansScreen.tsx
│   │   │   ├── LoanDetailScreen.tsx
│   │   │   └── RepaymentScreen.tsx
│   │   ├── notifications/
│   │   │   └── NotificationsScreen.tsx
│   │   └── settings/
│   │       ├── SettingsScreen.tsx
│   │       └── ProfileScreen.tsx
│   ├── components/
│   │   ├── ui/                   # Base UI components
│   │   ├── forms/                # Form components
│   │   ├── cards/                # Card components
│   │   └── modals/               # Modal components
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── hooks/
│   │   ├── useAuth. ts
│   │   ├── useLoans.ts
│   │   └── useBiometrics.ts
│   ├── services/
│   │   ├── api.ts                # API client
│   │   ├── auth.service.ts
│   │   ├── loan.service.ts
│   │   └── notification.service.ts
│   ├── stores/                   # Zustand stores
│   │   ├── auth.store.ts
│   │   └── loan.store. ts
│   ├── utils/
│   │   ├── storage.ts            # Secure storage
│   │   ├── formatting.ts
│   │   └── constants.ts
│   └── config/
│       ├── firebase.ts           # FCM configuration
│       └── walletconnect.ts
├── assets/
│   ├── images/
│   └── fonts/
├── . env.example
├── app.json
├── babel.config.js
├── metro.config.js
├── tsconfig.json
├── package.json
└── README.md
```

**Key Dependencies (avelon_mobile):**
```json
{
  "dependencies":  {
    "react": "^18.2.0",
    "react-native": "^0.73.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/native-stack": "^6.9.0",
    "@tanstack/react-query": "^5.17.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.0",
    "@react-native-firebase/app": "^18.7.0",
    "@react-native-firebase/messaging": "^18.7.0",
    "@walletconnect/modal-react-native": "^1.0.0",
    "ethers": "^6.10.0",
    "react-native-keychain": "^8.1.0",
    "nativewind": "^2.0.0",
    "@avelon/types":  "^1.0.0"
  }
}
```

### 5.4 avelon_backend (Hono API + Smart Contracts)

```
avelon_backend/
├── src/
│   ├── index.ts                  # Main entry point
│   ├── app. ts                    # Hono app configuration
│   ├── routes/
│   │   ├── index.ts              # Route aggregator
│   │   ├── auth. routes.ts
│   │   ├── user.routes.ts
│   │   ├── wallet.routes.ts
│   │   ├── kyc.routes.ts
│   │   ├── plan.routes.ts
│   │   ├── loan.routes.ts
│   │   ├── notification.routes.ts
│   │   ├── market.routes.ts
│   │   └── admin/
│   │       ├── index. ts
│   │       ├── users.routes.ts
│   │       ├── loans.routes.ts
│   │       ├── plans.routes.ts
│   │       └── kyc. routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── wallet.controller.ts
│   │   ├── kyc. controller.ts
│   │   ├── plan.controller.ts
│   │   ├── loan.controller.ts
│   │   └── notification.controller. ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── wallet.service.ts
│   │   ├── kyc.service.ts
│   │   ├── loan.service.ts
│   │   ├── blockchain.service.ts
│   │   ├── ai.service.ts         # Calls AI microservice
│   │   ├── email.service.ts
│   │   ├── notification.service.ts
│   │   └── price.service.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── admin.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── ratelimit.middleware.ts
│   │   └── error.middleware.ts
│   ├── validators/               # Zod schemas
│   │   ├── auth. validator.ts
│   │   ├── user.validator.ts
│   │   ├── loan.validator.ts
│   │   └── kyc.validator.ts
│   ├── lib/
│   │   ├── prisma.ts             # Prisma client
│   │   ├── redis.ts              # Redis client
│   │   ├── ethers.ts             # Ethers. js setup
│   │   ├── email.ts              # Resend client
│   │   ├── firebase.ts           # FCM client
│   │   └── utils.ts
│   ├── jobs/                     # Background jobs
│   │   ├── liquidation.job.ts    # Liquidation bot
│   │   ├── notification.job.ts
│   │   └── price-update.job.ts
│   └── config/
│       ├── constants.ts
│       └── contracts.ts          # Contract addresses & ABIs
├── prisma/
│   ├── schema. prisma
│   ├── migrations/
│   └── seed.ts
├── contracts/                    # Smart Contracts (Hardhat)
│   ├── contracts/
│   │   ├── AvelonCore.sol
│   │   ├── LoanManager. sol
│   │   ├── Treasury.sol
│   │   ├── PriceOracle.sol
│   │   └── AccessControl.sol
│   ├── test/
│   │   ├── AvelonCore.test.ts
│   │   ├── LoanManager.test.ts
│   │   └── Treasury.test. ts
│   ├── scripts/
│   │   ├── deploy.ts
│   │   └── seed-demo.ts
│   ├── typechain-types/          # Auto-generated types
│   ├── hardhat. config.ts
│   └── package. json              # Hardhat dependencies
├── emails/                       # React Email templates
│   ├── templates/
│   │   ├── verification.tsx
│   │   ├── password-reset.tsx
│   │   ├── kyc-approved.tsx
│   │   ├── kyc-rejected.tsx
│   │   ├── loan-approved.tsx
│   │   ├── loan-disbursed.tsx
│   │   ├── repayment-reminder.tsx
│   │   ├── liquidation-warning.tsx
│   │   └── loan-repaid.tsx
│   └── index.ts
├── . env.example
├── .env
├── docker-compose.yml            # PostgreSQL, Redis, Ganache
├── Dockerfile
├── tsconfig.json
├── package.json
└── README.md
```

**Key Dependencies (avelon_backend):**
```json
{
  "dependencies": {
    "hono": "^4.0.0",
    "@hono/node-server": "^1.4.0",
    "@prisma/client": "^5.8.0",
    "zod": "^3.22.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "ethers": "^6.10.0",
    "ioredis": "^5.3.0",
    "resend": "^3.0.0",
    "@react-email/components":  "^0.0.14",
    "firebase-admin": "^12.0.0",
    "node-cron": "^3.0.0",
    "@avelon/types": "^1.0.0"
  },
  "devDependencies": {
    "prisma": "^5.8.0",
    "hardhat": "^2.19.0",
    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
    "@openzeppelin/contracts":  "^5.0.0"
  }
}
```

### 5.5 avelon_llm (Python AI Microservice)

```
avelon_llm/
├── app/
│   ├── __init__.py
│   ├── main.py                   # FastAPI entry point
│   ├── config.py                 # Configuration
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── health.py
│   │   │   ├── verify.py         # Document verification
│   │   │   └── score.py          # Credit scoring
│   │   └── dependencies.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ocr_service.py        # Text extraction
│   │   ├── classifier_service.py # Document classification
│   │   ├── extractor_service.py  # NER data extraction
│   │   ├── fraud_service.py      # Fraud detection
│   │   └── scorer_service.py     # Credit scoring
│   ├── models/
│   │   ├── __init__. py
│   │   ├── document_classifier/  # CNN model
│   │   │   ├── model.py
│   │   │   └── weights/          # Trained weights (. pt)
│   │   │       └── classifier.pt
│   │   ├── ner_extractor/        # BERT-based NER
│   │   │   ├── model. py
│   │   │   └── weights/
│   │   ├── fraud_detector/       # Fraud detection model
│   │   │   ├── model.py
│   │   │   └── weights/
│   │   └── credit_scorer/        # XGBoost scorer
│   │       ├── model. py
│   │       └── weights/
│   ├── schemas/                  # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── document. py
│   │   ├── verification.py
│   │   └── score.py
│   └── utils/
│       ├── __init__.py
│       ├── image_processing.py
│       ├── text_processing.py
│       └── constants.py
├── training/                     # Model training scripts
│   ├── data/
│   │   ├── raw/                  # Raw document images
│   │   ├── processed/            # Preprocessed data
│   │   └── annotations/          # Labels/annotations
│   ├── notebooks/                # Jupyter/Colab notebooks
│   │   ├── 01_document_classifier. ipynb
│   │   ├── 02_ner_training.ipynb
│   │   ├── 03_fraud_detection.ipynb
│   │   └── 04_credit_scoring. ipynb
│   ├── scripts/
│   │   ├── prepare_data.py
│   │   ├── train_classifier.py
│   │   ├── train_ner.py
│   │   ├── train_fraud. py
│   │   ├── train_scorer.py
│   │   └── evaluate_models.py
│   └── configs/                  # Training configurations
│       ├── classifier_config.yaml
│       ├── ner_config.yaml
│       └── scorer_config.yaml
├── tests/
│   ├── __init__.py
│   ├── test_ocr.py
│   ├── test_classifier.py
│   ├── test_extractor. py
│   ├── test_fraud.py
│   └── test_scorer. py
├── . env.example
├── .env
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── requirements-dev.txt
├── setup.py
└── README.md
```

**Key Dependencies (avelon_llm - requirements.txt):**
```txt
# Web Framework
fastapi==0.109.0
uvicorn==0.27.0
python-multipart==0.0.6

# ML/AI
torch==2.1.0
torchvision==0.16.0
transformers==4.36.0
scikit-learn==1.4.0
xgboost==2.0.0
opencv-python==4.9.0.80
Pillow==10.2.0

# OCR
pytesseract==0.3.10

# NLP
spacy==3.7.0

# Data Processing
numpy==1.26.0
pandas==2.2.0

# Validation
pydantic==2.5.0

# Configuration
python-dotenv==1.0.0
pyyaml==6.0.0

# Testing
pytest==8.0.0
pytest-asyncio==0.23.0
httpx==0.26.0
```

### 5.6 avelon_types (Shared TypeScript Types)

```
avelon_types/
├── src/
│   ├── index.ts                  # Main export file
│   ├── user/
│   │   ├── index.ts
│   │   ├── user.types.ts         # User-related types
│   │   ├── auth. types.ts         # Authentication types
│   │   └── wallet.types.ts       # Wallet types
│   ├── loan/
│   │   ├── index.ts
│   │   ├── loan.types. ts         # Loan types
│   │   ├── plan. types.ts         # Loan plan types
│   │   └── transaction.types.ts  # Transaction types
│   ├── kyc/
│   │   ├── index. ts
│   │   ├── document.types.ts     # Document types
│   │   └── verification.types. ts # Verification types
│   ├── notification/
│   │   ├── index.ts
│   │   └── notification.types. ts
│   ├── api/
│   │   ├── index.ts
│   │   ├── request.types.ts      # API request types
│   │   ├── response.types.ts     # API response types
│   │   └── error.types.ts        # Error types
│   └── blockchain/
│       ├── index.ts
│       ├── contract.types.ts     # Smart contract types
│       └── transaction.types.ts  # Blockchain transaction types
├── dist/                         # Compiled output
├── . npmignore
├── .gitignore
├── package.json
├── tsconfig.json
└── README. md
```

**Package Configuration (package.json):**
```json
{
  "name":  "@avelon/types",
  "version": "1.0.0",
  "description": "Shared TypeScript types for Avelon platform",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts":  {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

### 5.7 AI Training Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AI TRAINING WORKFLOW                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  LOCAL (Your Laptop):                                               │
│  1.  Collect/create training data                                   │
│  2. Write training scripts in avelon_llm/training/                 │
│  3. Test with tiny dataset (5-10 samples)                          │
│  4. Upload data folder to Google Drive                             │
│                                                                     │
│  GOOGLE DRIVE:                                                        │
│  avelon_training/                                                   │
│  ├── data/                                                         │
│  │   ├── government_ids/                                           │
│  │   ├── payslips/                                                 │
│  │   └── utility_bills/                                            │
│  ├── notebooks/  (copy from avelon_llm/training/notebooks/)        │
│  └── models/     (trained models saved here)                       │
│                                                                     │
│  GOOGLE COLAB (Free GPU):                                           │
│  1. Open notebook from Google Drive                                │
│  2. Enable GPU runtime (Runtime → Change runtime type → GPU)       │
│  3. Mount Google Drive                                             │
│  4. Run training (10-50x faster than laptop)                       │
│  5. Save model to Drive                                            │
│                                                                     │
│  BACK TO LOCAL:                                                     │
│  1. Download trained weights from Google Drive                     │
│  2. Add to avelon_llm/app/models/[model]/weights/                  │
│  3. Test inference locally                                         │
│  4. Commit weights to repository (or use Git LFS for large files) │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.8 Repository Setup Commands

```bash
# Clone all repositories
git clone https://github.com/[your-org]/avelon_web.git
git clone https://github.com/[your-org]/avelon_mobile.git
git clone https://github.com/[your-org]/avelon_backend.git
git clone https://github.com/[your-org]/avelon_llm.git
git clone https://github.com/[your-org]/avelon_types.git

# Setup avelon_types (Shared Types - publish first)
cd avelon_types
npm install
npm run build
npm publish  # Publishes to GitHub Packages

# Setup avelon_backend (Backend - start first)
cd ../avelon_backend
npm install
cp .env.example . env
docker-compose up -d  # PostgreSQL, Redis, Ganache
npx prisma migrate dev
npx prisma db seed
npm run dev

# Setup avelon_llm (AI Service)
cd ../avelon_llm
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements. txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000

# Setup avelon_web (Web Frontend)
cd ../avelon_web
npm install
cp .env.example . env. local
npm run dev

# Setup avelon_mobile (Mobile App)
cd ../avelon_mobile
npm install
cp .env.example .env
npx react-native run-android  # or run-ios
```

---

*End of Part 2 - Continue to Part 3 for User Roles, Loan Plans, and Credit Scoring*