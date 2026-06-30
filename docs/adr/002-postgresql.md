# ADR-002: PostgreSQL as the Primary Database

Status: Accepted
Version: 1.0.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

# Decision

UnityFund will use PostgreSQL as its primary relational database.

PostgreSQL will be the system of record for all business data, including organizations, funds, members, collection cycles, contributions, payments, payouts, audit logs, and application configuration.

---

# Context

UnityFund is a financial platform responsible for managing organizational funds and recording financial transactions.

The database must provide:

* Strong data consistency
* Reliable transactions
* Referential integrity
* High reliability
* Excellent query capabilities
* Long-term scalability

Financial systems require correctness over convenience.

---

# Requirements

The selected database must support:

* ACID transactions
* Foreign key constraints
* Complex relationships
* Strong indexing
* Data integrity
* Reliable backups
* High availability
* Mature tooling
* Broad ecosystem support

---

# Alternatives Considered

## MongoDB

Advantages:

* Flexible document model
* Rapid schema evolution

Reasons not selected:

* Application data is highly relational.
* Financial records require strong referential integrity.
* Relationship-heavy queries become more complex.

---

## MySQL

Advantages:

* Mature ecosystem
* Broad community support

Reasons not selected:

* PostgreSQL provides richer SQL capabilities.
* Better support for advanced indexing and analytical queries.
* Stronger feature set for long-term growth.

---

## SQLite

Advantages:

* Extremely simple deployment
* Lightweight

Reasons not selected:

* Not designed for a multi-user production financial platform.
* Limited scalability for UnityFund's expected growth.

---

# Why PostgreSQL

PostgreSQL provides the capabilities required for a financial platform.

These include:

* ACID-compliant transactions
* Foreign key enforcement
* Check constraints
* Rich indexing strategies
* Transaction isolation
* Views and materialized views
* JSON support for flexible metadata
* Excellent performance for relational workloads
* Mature backup and replication options

These features align well with UnityFund's architecture and business requirements.

---

# Design Principles

The application should rely on PostgreSQL to enforce important data integrity rules where appropriate.

Examples include:

* Foreign key relationships
* Unique constraints
* Check constraints
* Transaction boundaries

Business rules remain the responsibility of the application and Business Rules Engine.

---

# Consequences

## Positive

* Strong financial consistency
* Reliable transactions
* Excellent reporting capabilities
* Mature ecosystem
* Scalable architecture
* Reduced risk of data corruption

## Negative

* Requires relational schema design.
* Developers must understand transactions and relational modeling.
* Database migrations must be managed carefully.

---

# Related Documents

* Database Schema
* Entity Relationship Diagram
* Backend Architecture
* ADR-001 — Fund is the Primary Business Entity
* ADR-009 — Money Handling

---

# Future Considerations

Future versions may introduce:

* Read replicas
* Partitioning
* Archiving strategies
* Performance tuning
* Analytics databases

These enhancements should complement PostgreSQL rather than replace it.

---

# Summary

PostgreSQL is the authoritative data store for UnityFund because it provides the transactional integrity, relational capabilities, and reliability required to support a secure, scalable financial platform.
