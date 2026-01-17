# Avelon:  Decentralized Crypto Lending Platform
## Complete Project Overview & Technical Specification

**Version:** 3.0 (Final)  
**Last Updated:** January 2026  
**Project Type:** Capstone/Thesis - System Development  
**Status:** Ready for Development

---

## Table of Contents

### Part 1 (This Document)
1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Solution Overview](#3-solution-overview)

### Part 2
4. [System Architecture](#4-system-architecture)
5. [Repository Structure](#5-repository-structure)

### Part 3
6. [User Roles & Permissions](#6-user-roles--permissions)
7. [Loan Plans & Interest Model](#7-loan-plans--interest-model)
8. [Credit Scoring System](#8-credit-scoring-system)

### Part 4
9. [Loan Lifecycle](#9-loan-lifecycle)
10. [Fee Structure & Revenue Model](#10-fee-structure--revenue-model)
11. [Smart Contract Architecture](#11-smart-contract-architecture)

### Part 5
12. [AI Verification System](#12-ai-verification-system)
13. [Security & Compliance](#13-security--compliance)
14. [Technology Stack](#14-technology-stack)

### Part 6
15. [Database Schema](#15-database-schema)
16. [API Specification](#16-api-specification)
17. [Development Roadmap](#17-development-roadmap)
18. [Demo Scope & Limitations](#18-demo-scope--limitations)
19. [Success Criteria](#19-success-criteria)
20. [Glossary](#20-glossary)
21. [Appendices](#21-appendices)

---

## 1. Executive Summary

### What is Avelon?

**Avelon** is a blockchain-based digital lending platform that operates as a decentralized financial institution.  Unlike peer-to-peer lending platforms, Avelon itself serves as the sole lender, providing crypto-collateralized loans to verified borrowers while leveraging artificial intelligence for document verification and credit scoring.

### Core Value Proposition

Avelon bridges traditional banking practices with blockchain technology by offering: 

- **AI-Powered KYC:** Automated document verification and fraud detection
- **Transparent Credit Scoring:** Quantitative, explainable borrower assessment (0-100 scale)
- **Smart Contract Enforcement:** Immutable loan terms with automated collateral management
- **User-Friendly Experience:** Hybrid authentication (email + wallet) with real-time ETH/PHP conversion
- **Automated Liquidation:** Bot-driven monitoring and enforcement

### Platform Model

```
┌─────────────────────────────────────────────────────────────┐
│                     AVELON PLATFORM MODEL                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────┐                      ┌─────────────┐     │
│   │   AVELON    │ ──── Loans ────────► │  BORROWERS  │     │
│   │  TREASURY   │ ◄─── Repayments ──── │             │     │
│   │  (Lender)   │ ◄─── Collateral ──── │             │     │
│   └─────────────┘                      └─────────────┘     │
│         │                                     │             │
│         │ Managed by                          │ Verified by │
│         ▼                                     ▼             │
│   ┌─────────────┐                      ┌─────────────┐     │
│   │    ADMIN    │                      │   AI MODEL  │     │
│   │  Dashboard  │                      │  (KYC/Score)│     │
│   └─────────────┘                      └─────────────┘     │
│                                                             │
│   INFRASTRUCTURE:                                           │
│   ├─ Smart Contracts:  Loan enforcement, collateral mgmt    │
│   ├─ AI System: Document verification, credit scoring      │
│   └─ Backend: User management, notifications, analytics    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Target Market

- **Primary:** Filipino crypto holders seeking collateralized loans
- **Secondary:** Underbanked individuals with valid identification documents
- **Geographic Focus:** Philippines (compliant with RA 10173 Data Privacy Act)

### Project Scope

This is a **capstone/thesis demonstration project** featuring: 
- Functional AI document verification (demo-grade training data)
- Working smart contracts on Ganache (local Ethereum testnet)
- Complete web and mobile applications
- End-to-end loan lifecycle demonstration

### Key Differentiators

| Feature | Traditional Banks | Current DeFi | Avelon |
|---------|-------------------|--------------|--------|
| KYC Verification | ✅ Yes | ❌ No | ✅ Yes (AI-powered) |
| Credit Scoring | ✅ Yes | ❌ No | ✅ Yes (0-100 scale) |
| Transparent Terms | ❌ No | ✅ Yes | ✅ Yes (smart contracts) |
| Collateral Security | ❌ No | ✅ Yes | ✅ Yes (150%+ ratio) |
| Easy Onboarding | ❌ No | ❌ No | ✅ Yes (email + wallet) |
| Real-time Updates | ❌ No | ⚠️ Limited | ✅ Yes (email + push) |

---

## 2. Problem Statement

### Current DeFi Lending Challenges

#### 2.1 Inadequate Borrower Verification
- Most DeFi platforms rely solely on over-collateralization
- No identity verification leads to potential fraud
- Anonymous borrowers provide no accountability

#### 2.2 Poor Risk Assessment
- Lack of creditworthiness evaluation
- No predictive modeling for borrower reliability
- One-size-fits-all loan terms regardless of borrower quality

#### 2.3 High Barrier to Entry
- Wallet-only authentication intimidates newcomers
- Complex interfaces designed for crypto-native users
- No communication system (emails, notifications)

#### 2.4 Limited Transparency
- Borrowers don't understand liquidation risks
- Opaque fee structures
- No clear explanation of loan terms

### The Gap Avelon Fills

Traditional banks have robust KYC and credit scoring but lack transparency and accessibility. DeFi platforms have transparency but lack borrower verification.  **Avelon combines the best of both worlds.**

```
┌─────────────────────────────────────────────────────────────┐
│                    THE AVELON ADVANTAGE                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  TRADITIONAL BANKING           DEFI PLATFORMS               │
│  ┌─────────────────┐          ┌─────────────────┐          │
│  │ ✅ KYC          │          │ ❌ No KYC       │          │
│  │ ✅ Credit Score │          │ ❌ No Scoring   │          │
│  │ ❌ Opaque Terms │          │ ✅ Transparent  │          │
│  │ ❌ Slow Process │          │ ✅ Fast         │          │
│  │ ❌ High Fees    │          │ ⚠️ Variable Fees│          │
│  └────────┬────────┘          └────────┬────────┘          │
│           │                            │                    │
│           └──────────┬─────────────────┘                    │
│                      ▼                                      │
│           ┌─────────────────────┐                          │
│           │       AVELON        │                          │
│           │  ✅ AI-Powered KYC  │                          │
│           │  ✅ Credit Scoring  │                          │
│           │  ✅ Smart Contracts │                          │
│           │  ✅ Easy Onboarding │                          │
│           │  ✅ Fair Fees       │                          │
│           └─────────────────────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Solution Overview

### 3.1 Three Pillars of Avelon

#### Pillar 1: AI-Powered Verification & Scoring
- Document OCR and classification using trained CNN models
- Fraud detection and anomaly analysis
- Quantitative credit scoring (0-100)
- Tier-based loan plan eligibility

#### Pillar 2: Smart Contract Enforcement
- Immutable loan terms on Ethereum blockchain
- Automated collateral locking and release
- Automatic liquidation when conditions are met
- Transparent, auditable transaction history

#### Pillar 3: User-Centric Experience
- Email/password registration with wallet linking
- Real-time ETH/PHP conversion display
- Push notifications for loan updates
- Mobile app for on-the-go management

### 3.2 Key Features Summary

| Feature | Description |
|---------|-------------|
| **Hybrid Authentication** | Email signup → Wallet connection → Document verification |
| **AI Document Verification** | Automated KYC using trained ML models |
| **Credit Scoring** | 0-100 score determining loan plan eligibility |
| **Tiered Loan Plans** | Admin-defined plans with varying terms based on score |
| **ETH Collateral** | All loans backed by Ethereum collateral |
| **PHP Display** | Loan amounts shown in ETH with real-time PHP equivalent |
| **Automated Liquidation** | Bot monitors collateral ratios, triggers liquidation |
| **Partial Repayment** | Users can make incremental payments |
| **Collateral Top-Up** | Users can add collateral to avoid liquidation |
| **Loan Extension** | VIP users (score ≥90) can extend loan duration |
| **Email Notifications** | All loan lifecycle events trigger emails |
| **Push Notifications** | Mobile alerts for critical updates |

### 3.3 User Journey Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      COMPLETE USER JOURNEY                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PHASE 1: ONBOARDING                                                │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐         │
│  │ Sign Up │───►│ Verify  │───►│ Connect │───►│ Upload  │         │
│  │ (Email) │    │ Email   │    │ Wallet  │    │  Docs   │         │
│  └─────────┘    └─────────┘    └─────────┘    └────┬────┘         │
│                                                     │               │
│                                                     ▼               │
│  PHASE 2: VERIFICATION                        ┌─────────┐          │
│                                               │   AI    │          │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐   │ Verify  │          │
│  │  Tier   │◄───│ Credit  │◄───│  Data   │◄──│         │          │
│  │ Assign  │    │  Score  │    │ Extract │   └─────────┘          │
│  └────┬────┘    └─────────┘    └─────────┘                        │
│       │                                                            │
│       ▼                                                            │
│  PHASE 3: BORROWING                                                │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐         │
│  │ Select  │───►│ Review  │───►│ Deposit │───►│  Loan   │         │
│  │  Plan   │    │  Terms  │    │Collateral   │Disbursed│         │
│  └─────────┘    └─────────┘    └─────────┘    └────┬────┘         │
│                                                     │               │
│                                                     ▼               │
│  PHASE 4: ACTIVE LOAN                         ┌─────────┐          │
│                                               │ Monitor │          │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐   │  Ratio  │          │
│  │  View   │◄───│  Alerts │◄───│   Bot   │◄──│         │          │
│  │Dashboard│    │         │    │ Checks  │   └─────────┘          │
│  └────┬────┘    └─────────┘    └─────────┘                        │
│       │                                                            │
│       ▼                                                            │
│  PHASE 5: COMPLETION                                               │
│  ┌─────────────────────┐    ┌─────────────────────┐               │
│  │   REPAY LOAN        │ OR │   LIQUIDATION       │               │
│  │ ✓ Pay full amount   │    │ ✗ Ratio drops <120% │               │
│  │ ✓ Get collateral    │    │ ✗ Collateral seized │               │
│  │ ✓ Score improves    │    │ ✗ Score decreases   │               │
│  └─────────────────────┘    └─────────────────────┘               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.4 Loan Currency Model

**All loans are denominated in ETH** with PHP display for user convenience: 

```
┌─────────────────────────────────────────────────────────────┐
│                    CURRENCY MODEL                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LOAN DENOMINATION:  ETH (Ethereum)                          │
│  DISPLAY CURRENCY: PHP (Philippine Peso)                    │
│                                                             │
│  EXAMPLE DISPLAY:                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Loan Amount:         0.5 ETH                        │   │
│  │  PHP Equivalent:     ₱75,000.00                     │   │
│  │  Rate:  1 ETH = ₱150,000.00                          │   │
│  │  Last Updated:  2 minutes ago                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  PRICE ORACLE:                                              │
│  ├─ Demo:  Admin manually sets ETH/PHP rate                 │
│  ├─ Production:  Chainlink oracle integration               │
│  └─ Update Frequency: Every 5 minutes (demo)               │
│                                                             │
│  WHY ETH?                                                    │
│  ├─ Native blockchain currency (no token conversion)       │
│  ├─ High liquidity and acceptance                          │
│  ├─ Direct smart contract integration                      │
│  └─ Simplified collateral management                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

*End of Part 1 - Continue to Part 2 for System Architecture and Repository Structure*