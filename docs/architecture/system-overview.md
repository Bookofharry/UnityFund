# System Overview

Status: Draft
Version: 1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

# Purpose

This document defines the high-level system architecture for UnityFund.

It explains how the major parts of the application work together before defining backend, frontend, database, API, or deployment details.

---

# Architecture Goal

UnityFund should be designed as a secure, modular, and workflow-driven financial operations platform.

The architecture must support:

* Organizations
* Members
* Funds
* Fund Rules
* Collection Cycles
* Payments
* Webhook reconciliation
* Payouts
* Reports
* Audit logs

---

# Core Architecture Principle

UnityFund separates business logic from payment infrastructure.

The **UnityFund Business Engine** decides what should happen.

The **Nomba Integration Layer** executes payment-related actions.

```text
Business Rules
      ↓
Workflow Engine
      ↓
Nomba Integration
      ↓
Payments / Webhooks / Transfers
```

---

# High-Level System Components

## Frontend Application

The frontend provides dashboards and workflows for:

* Organization admins
* Treasurers
* Members

It communicates with the backend through secure APIs.

---

## Backend API

The backend contains the main application logic.

It handles:

* Authentication
* Organizations
* Members
* Funds
* Fund Rules
* Collections
* Payments
* Payouts
* Reports
* Notifications
* Audit logs

---

## Database

The database stores all persistent business data.

Core data includes:

* Users
* Organizations
* Members
* Funds
* Fund Rules
* Collection Cycles
* Contributions
* Payments
* Payouts
* Audit Logs

---

## Workflow Engine

The Workflow Engine evaluates fund rules and determines what happens after key events.

Examples:

* Payment confirmed
* Collection cycle completed
* Payout requested
* Member overdue
* Fund rule updated

---

## Nomba Integration Layer

The Nomba Integration Layer handles communication with Nomba APIs.

It supports:

* Direct Debit
* Checkout
* Virtual Accounts
* Webhooks
* Transfers

---

## Notification System

The notification system informs users about important events.

Examples:

* Payment successful
* Contribution overdue
* Payout completed
* Fund cycle started

---

## Audit System

The audit system records important financial and administrative actions.

Audit logs must be immutable from the user’s perspective.

---

# System Flow

```text
User Action
    ↓
Frontend
    ↓
Backend API
    ↓
Business Logic
    ↓
Workflow Engine
    ↓
Database
    ↓
Nomba Integration / Notifications / Reports
```

---

# Payment Flow

```text
Member initiates payment
    ↓
Backend creates payment request
    ↓
Nomba processes payment
    ↓
Nomba sends webhook
    ↓
Backend verifies webhook
    ↓
Contribution is reconciled
    ↓
Workflow Engine runs
    ↓
Dashboard updates
    ↓
Audit log is created
```

---

# Payout Flow

```text
Payout requested
    ↓
Fund Rules are checked
    ↓
Approval is verified if required
    ↓
Nomba Transfer is initiated
    ↓
Payout webhook confirms status
    ↓
Payout record updates
    ↓
Audit log is created
```

---

# Architectural Requirements

The system must be:

* Secure
* Modular
* Auditable
* Extensible
* Reliable
* Easy to test
* Easy to maintain

---

# Key Design Decisions

## Funds Drive the System

All major financial workflows begin from a Fund.

## Rules Drive Behaviour

Fund Rules determine what actions are allowed.

## Webhooks Confirm Payments

Payments are only trusted after successful webhook verification.

## Audit Logs Protect Trust

Every important financial action must be recorded.

## Nomba Is Infrastructure

Nomba executes payment operations, while UnityFund manages business workflows.

---

# Summary

UnityFund is designed as a workflow-driven financial operations platform.

Its architecture separates business rules, payment infrastructure, user interfaces, and persistent data so the system can remain secure, maintainable, and extensible as the product grows.
