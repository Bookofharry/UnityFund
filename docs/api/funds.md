# Funds API

Status: Draft
Version: 0.1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

## Purpose

This document defines the API requirements for managing Funds within UnityFund.

Funds are the primary business entity of the platform. Every collection cycle, contribution, payment, payout, and report originates from a Fund.

---

## Scope

This document covers:

* Creating funds
* Viewing funds
* Updating funds
* Archiving funds
* Listing organization funds

This document does not cover:

* Fund members
* Fund rules
* Collection cycles
* Contributions
* Payments
* Payouts

Those capabilities are defined in their respective APIs.

---

## Business Rules

* Every Fund belongs to exactly one Organization.
* Every Fund must have one Fund Type.
* Every Fund must have one active Fund Rules configuration before collections can begin.
* A Fund cannot begin collecting contributions until it is Active.
* Archived Funds remain available for historical reporting.
* Financial history must never be lost because a Fund changes status.

---

## Endpoints

### Create Fund

```http
POST /api/organizations/:organizationId/funds
```

Creates a new Fund.

Required information:

* Fund name
* Fund type
* Description (optional)
* Initial status

Authorization:

* Organization Admin

Business Outcome:

A new Fund is created within the organization and becomes available for configuration.

---

### List Funds

```http
GET /api/organizations/:organizationId/funds
```

Returns all Funds belonging to an organization.

Supported filters:

* Status
* Fund Type
* Search by name

Authorization:

* Organization Member

Business Outcome:

Returns only Funds belonging to the selected organization.

---

### Get Fund

```http
GET /api/organizations/:organizationId/funds/:fundId
```

Returns detailed information about a specific Fund.

Information may include:

* Basic details
* Fund Type
* Current status
* Active collection cycle
* Member count
* Financial summary

Authorization:

* Organization Member

---

### Update Fund

```http
PATCH /api/organizations/:organizationId/funds/:fundId
```

Allows updates to editable Fund information.

Editable fields may include:

* Name
* Description
* Status

Changing operational rules should be handled through the Fund Rules API.

Authorization:

* Organization Admin

Business Rules:

* Changes must be audited.
* Updates must not invalidate historical financial records.

---

### Archive Fund

```http
POST /api/organizations/:organizationId/funds/:fundId/archive
```

Archives a Fund.

Business Rules:

* Active collection cycles must be closed before archival.
* Historical data remains accessible.
* Archived Funds cannot start new collection cycles.

Authorization:

* Organization Admin

---

## Fund Status

Supported statuses:

```text
draft
active
inactive
archived
```

### Draft

Fund is being configured.

Collections cannot begin.

---

### Active

Fund is operational.

Collection cycles may be created.

Members may participate according to Fund Rules.

---

### Inactive

Fund is temporarily unavailable.

Existing records remain available.

No new operational activities should begin.

---

### Archived

Fund is permanently retired from active operation.

Historical records remain accessible.

---

## Authorization Matrix

| Action       | Member | Treasurer | Organization Admin |
| ------------ | :----: | :-------: | :----------------: |
| View Fund    |    ✓   |     ✓     |          ✓         |
| List Funds   |    ✓   |     ✓     |          ✓         |
| Create Fund  |    ✗   |     ✗     |          ✓         |
| Update Fund  |    ✗   |     ✗     |          ✓         |
| Archive Fund |    ✗   |     ✗     |          ✓         |

---

## Audit Requirements

The system should record:

* Fund created
* Fund updated
* Fund activated
* Fund deactivated
* Fund archived

---

## Error Scenarios

Examples include:

* Organization not found
* Fund not found
* Duplicate fund name (if uniqueness is enforced)
* Invalid fund type
* Unauthorized action
* Attempt to archive a fund with an active collection cycle

---

## Open Questions

* Should fund names be unique within an organization?
* Can an archived fund be restored?
* Can organizations duplicate an existing fund as a template?
* Should a draft fund automatically expire if never activated?

---

## Review Checklist

* [ ] Aligns with Vision documents
* [ ] Aligns with Business Domain
* [ ] Matches ADR decisions
* [ ] Contains only verified facts or documented product decisions
* [ ] Avoids implementation details
* [ ] Ready for implementation review

---

## Summary

The Funds API manages the lifecycle of UnityFund's core business entity. It enables organizations to create, maintain, and retire Funds while preserving financial integrity, auditability, and historical records.
