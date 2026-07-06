# User Roles

Status: Draft
Version: 1.1
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-07-06

---

# Purpose

This document defines the business roles within UnityFund and the responsibilities, permissions, and restrictions associated with each role.

User Roles determine **what a user is allowed to do within an organization**. They are independent of technical authentication mechanisms and are used to enforce business policies.

---

# Scope

This document covers:

* Platform roles
* Organization roles
* Business responsibilities
* Permissions
* Role restrictions

---

# Role Hierarchy

```text
Platform Admin
        │
        ▼
Organization Admin
        │
        ▼
Treasurer
        │
        ▼
Member
```

Higher roles inherit the permissions of lower roles unless explicitly restricted.

---

# Platform Admin

## Purpose

The Platform Admin manages the UnityFund platform itself.

This role belongs to the UnityFund team and is **not** part of customer organizations.

## Responsibilities

* Manage platform configuration.
* View organizations.
* Monitor system health.
* Manage platform-wide settings.
* Support customer organizations.

## Restrictions

Platform Administrators do **not** participate in customer fund operations unless explicitly acting in a support capacity.

---

# Organization Admin

## Purpose

The Organization Admin is responsible for managing an organization's activities within UnityFund.

## Responsibilities

* Manage organization settings.
* Create and manage funds.
* Invite and manage members.
* Configure fund rules.
* Start collection cycles.
* Assign organizational roles.
* Access reports.
* Approve or reject payout requests.

## Restrictions

Organization Administrators cannot modify platform-level settings.

---

# Treasurer

## Purpose

The Treasurer manages the financial operations of an organization.

## Responsibilities

* Monitor contributions.
* Review payment status.
* Initiate approved payouts.
* Monitor fund balances.
* Generate financial reports.

## Restrictions

Treasurers cannot alter organization ownership or platform settings.

---

# Member

## Purpose

Members participate in one or more organizational funds.

## Responsibilities

* Join eligible funds.
* Make contributions.
* View contribution history.
* Track fund participation.
* Receive notifications.

## Restrictions

Members cannot modify organizational settings, create funds, or approve financial actions.

---

# Permission Matrix

| Action               | Platform Admin | Organization Admin | Treasurer |  Member  |
| -------------------- | :------------: | :----------------: | :-------: | :------: |
| Manage platform      |        ✓       |          ✗         |     ✗     |     ✗    |
| Manage organization  |        ✓       |          ✓         |     ✗     |     ✗    |
| Create funds         |        ✗       |          ✓         |     ✗     |     ✗    |
| Configure fund rules |        ✗       |          ✓         |     ✗     |     ✗    |
| Invite members       |        ✗       |          ✓         |     ✗     |     ✗    |
| View contributions   |        ✓       |          ✓         |     ✓     | Own only |
| Make contributions   |        ✗       |          ✗         |     ✓*    |     ✓    |
| Initiate payouts     |        ✗       |          ✓         |     ✓     |     ✗    |
| Approve payouts      |        ✗       |          ✓         |     ✗     |     ✗    |
| View reports         |        ✓       |          ✓         |     ✓     | Own only |

* A Treasurer may also be a participating member, depending on the organization's policies.

---

# Role Principles

User roles should:

* Reflect real organizational responsibilities.
* Follow the principle of least privilege.
* Clearly separate financial execution from approval.
* Support organizational accountability.
* Be extensible as UnityFund evolves.

---

# Future Considerations

Future versions of UnityFund may introduce additional roles, including:

* Auditor
* Secretary
* Committee Member
* Branch Administrator
* Read-Only Observer

These roles are outside the scope of the MVP but should be supported by an extensible authorization model.

---

# Summary

User Roles define how responsibilities are distributed within UnityFund.

By separating administration, financial management, approvals, and member participation, the platform maintains clear accountability, improves security, and supports the governance structures commonly found in member-based organizations.
