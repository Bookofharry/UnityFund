# Fund Types

Status: Draft
Version: 1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

# Purpose

This document defines the supported fund types within UnityFund and the business behavior associated with each type.

Fund Types represent reusable financial models that organizations can create and manage. Each fund type has a distinct purpose, lifecycle, and operational rules.

The purpose of this document is to establish a consistent understanding of how different funds behave before defining detailed business rules or technical implementation.

---

# Scope

This document covers:

* Supported fund types
* Business purpose
* Contribution behavior
* Payout behavior
* Typical use cases

This document does not define:

* Detailed validation rules
* Approval workflows
* Database implementation
* API design

---

# Fund Type Overview

Every Fund belongs to exactly one Fund Type.

The Fund Type determines the default operational behaviour of the Fund.

Organizations may configure additional rules, but the core characteristics of each Fund Type remain consistent.

---

# Annual Dues

## Purpose

Annual Dues are recurring payments required to maintain active membership within an organization.

These contributions support the day-to-day operation of the organization rather than accumulating personal balances.

---

## Contribution Behaviour

* Fixed contribution amount
* Usually collected annually
* Required for eligible members

---

## Payout Behaviour

Annual Dues do not produce payouts to individual members.

Funds are retained by the organization for operational expenses.

---

## Typical Use Cases

* Association membership fees
* Alumni dues
* Professional body subscriptions

---

# Savings Fund

## Purpose

A Savings Fund allows members to build personal savings through recurring contributions.

Each contribution increases the member's personal savings balance.

---

## Contribution Behaviour

* Fixed or configurable contribution amount
* Collected on a recurring schedule
* Contributions accumulate over time

---

## Payout Behaviour

Savings are withdrawn only according to the organization's policies.

Automatic payouts are **not** performed.

Withdrawals typically require administrative approval.

---

## Typical Use Cases

* Cooperative savings
* Staff savings plans
* Community savings groups

---

# Welfare Fund

## Purpose

A Welfare Fund provides financial assistance to members during approved situations such as illness, bereavement, or emergencies.

Members contribute collectively to support one another.

---

## Contribution Behaviour

* Regular recurring contributions
* Equal contribution from eligible members

---

## Payout Behaviour

Payouts are initiated only after an approved welfare request.

Funds are distributed to approved beneficiaries rather than all members.

---

## Typical Use Cases

* Medical support
* Funeral assistance
* Emergency welfare

---

# Emergency Fund

## Purpose

An Emergency Fund provides financial support for unexpected organizational or member-related emergencies.

---

## Contribution Behaviour

* Regular or ad hoc contributions
* Configurable contribution schedule

---

## Payout Behaviour

Every payout requires approval based on the organization's governance process.

---

## Typical Use Cases

* Disaster relief
* Unexpected operational expenses
* Emergency member assistance

---

# Building Fund

## Purpose

A Building Fund finances long-term infrastructure or capital projects.

---

## Contribution Behaviour

* Fixed recurring contributions
* Project-specific duration

---

## Payout Behaviour

Funds are disbursed only for approved project expenses.

No member receives direct payouts.

---

## Typical Use Cases

* Office construction
* Church buildings
* Community development projects

---

# Rotational Savings Fund

## Purpose

A Rotational Savings Fund allows members to contribute regularly while one eligible member receives the pooled contribution during each collection cycle.

The recipient changes according to the organization's agreed rotation.

---

## Contribution Behaviour

* Equal recurring contributions
* Every participating member contributes during each cycle

---

## Payout Behaviour

Exactly one scheduled recipient receives the payout for each completed collection cycle.

The payout sequence follows the organization's predefined rotation.

---

## Typical Use Cases

* Ajo
* Esusu
* Rotating savings groups
* Cooperative rotational schemes

---

# Investment Fund

## Purpose

An Investment Fund pools member contributions for future investment opportunities.

Support for this fund type is planned for future versions of UnityFund.

---

## Contribution Behaviour

Recurring or one-time contributions.

---

## Payout Behaviour

Returns depend on the organization's investment policies.

This behaviour is outside the MVP scope.

---

# Fund Type Comparison

| Fund Type          | Recurring Contributions | Personal Balance | Member Payout    | Organization Payout | Approval Required |
| ------------------ | ----------------------- | ---------------- | ---------------- | ------------------- | ----------------- |
| Annual Dues        | Yes                     | No               | No               | Yes                 | No                |
| Savings Fund       | Yes                     | Yes              | Yes (On Request) | No                  | Yes               |
| Welfare Fund       | Yes                     | No               | Yes              | No                  | Yes               |
| Emergency Fund     | Yes                     | No               | Yes              | No                  | Yes               |
| Building Fund      | Yes                     | No               | No               | Yes                 | Yes               |
| Rotational Savings | Yes                     | No               | Yes (Scheduled)  | No                  | No                |
| Investment Fund    | Yes                     | Yes              | Future           | Future              | Future            |

---

# Design Principles

Every Fund Type should:

* Have a clearly defined purpose.
* Follow predictable business behaviour.
* Support configurable rules where appropriate.
* Preserve financial transparency.
* Operate independently of other fund types.

---

# Summary

Fund Types provide the business templates that define how organizations collect, manage, and distribute money.

They establish consistent financial behaviour while allowing organizations to configure operational rules that reflect their specific needs.
