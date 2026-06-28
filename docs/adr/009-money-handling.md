# ADR-009: Money Handling

Status: Accepted
Version: 0.1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

# Decision

UnityFund will represent monetary values using the smallest currency unit (for example, Kobo for the Nigerian Naira) stored as integers.

Floating-point data types must never be used to store or calculate money.

---

# Context

Financial applications require exact calculations.

Floating-point arithmetic can introduce rounding errors due to the way decimal values are represented in computer memory.

Even very small inaccuracies can accumulate over thousands of financial transactions, resulting in incorrect balances and reports.

---

# Examples

Instead of storing:

```text
₦1,250.50
```

UnityFund will store:

```text
125050
```

Where:

* Currency = NGN
* Amount = 125050 Kobo

---

# Supported Currency

For the MVP:

```text
NGN
```

is the only supported currency.

All calculations, reports, and transfers assume Nigerian Naira.

Future versions may introduce multi-currency support.

---

# Display Rules

Internal storage:

```text
125050
```

Display to users:

```text
₦1,250.50
```

Conversion between storage and display should happen within the application layer.

---

# Calculation Rules

Financial calculations should:

* Use integer arithmetic.
* Avoid floating-point operations.
* Produce deterministic results.
* Preserve precision.

Examples include:

* Contribution totals
* Outstanding balances
* Collection summaries
* Payout calculations

---

# Currency Consistency

Every financial record should include a currency field, even though the MVP supports only NGN.

This keeps the data model extensible for future versions.

---

# Reporting

Reports should be generated from stored integer values.

Formatting into currency strings should occur only when presenting information to users or exporting reports.

---

# Integration

When communicating with payment providers, UnityFund should convert values according to the provider's documented requirements while maintaining integer values internally.

---

# Business Principles

* Money must never lose precision.
* Money calculations must be reproducible.
* Reports generated today should match reports generated tomorrow using the same underlying records.

---

# Consequences

## Positive

* Accurate financial calculations.
* No floating-point rounding errors.
* Predictable reporting.
* Easier reconciliation.

## Negative

* Developers must convert between stored values and displayed currency.
* Additional care is required when integrating with external payment providers.

---

# Future Considerations

Future versions may support:

* Multi-currency organizations.
* Exchange rates.
* Currency conversion.
* Currency-specific formatting.

These enhancements should not require changes to the core storage strategy.

---

# Related Documents

* Database Schema
* Payments API
* Payouts API
* Reporting Strategy (Future)

---

# Summary

UnityFund will store all monetary values as integers representing the smallest currency unit. This approach provides accurate financial calculations, reliable reporting, and a strong foundation for future growth while avoiding floating-point precision errors.
