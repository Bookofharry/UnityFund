# ADR-006: Business Rules Engine

Status: Proposed
Version: 0.1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

## Decision

UnityFund will use a **Business Rules Engine** to evaluate fund rules and determine what actions should happen after important business events.

The term **Business Rules Engine** is preferred over **Workflow Engine** because the engine’s primary responsibility is to evaluate business rules before deciding which workflow to execute.

---

## Context

UnityFund supports multiple fund types, including:

* Annual Dues
* Savings Fund
* Welfare Fund
* Emergency Fund
* Building Fund
* Rotational Savings Fund

Each fund type behaves differently.

For example:

* Annual Dues may renew membership after payment.
* Savings Funds may update member savings balances.
* Welfare Funds may require approval before payouts.
* Rotational Savings Funds may trigger scheduled member payouts after a cycle is completed.

Because different funds follow different rules, UnityFund should not hardcode all fund behavior directly into controllers or services.

---

## Architecture Principle

The Business Rules Engine decides **what should happen next**.

Payment providers, such as Nomba, only execute supported payment operations.

```text
Business Event
    ↓
Business Rules Engine
    ↓
Evaluate Fund Rules
    ↓
Determine Next Action
    ↓
Trigger Workflow or Service
```

---

## Events Evaluated by the Engine

The engine may evaluate events such as:

* Fund created
* Collection cycle started
* Contribution created
* Payment confirmed
* Payment failed
* Collection cycle closed
* Payout requested
* Payout completed

---

## Responsibilities

The Business Rules Engine is responsible for:

* Reading Fund Rules.
* Evaluating the current Fund Type.
* Checking business conditions.
* Determining whether an action is allowed.
* Triggering the correct workflow.
* Preventing invalid state transitions.
* Producing auditable outcomes.

---

## Non-Responsibilities

The Business Rules Engine should not:

* Call Nomba directly.
* Store payment provider credentials.
* Render UI.
* Handle HTTP requests directly.
* Own database persistence logic.
* Bypass authorization checks.

---

## Example: Payment Confirmed

When a payment is confirmed:

```text
Payment Confirmed
    ↓
Business Rules Engine
    ↓
Check Fund Type and Fund Rules
    ↓
Update Contribution
    ↓
Determine Post-Payment Action
```

Possible post-payment actions:

| Fund Type          | Possible Action                                          |
| ------------------ | -------------------------------------------------------- |
| Annual Dues        | Renew member status                                      |
| Savings Fund       | Update member contribution balance                       |
| Welfare Fund       | Update fund pool                                         |
| Rotational Savings | Check if cycle is complete and create payout if eligible |

---

## Example: Rotational Savings

```text
Payment Confirmed
    ↓
Check Collection Cycle
    ↓
Have required members paid?
    ↓
If yes, identify scheduled recipient
    ↓
Create payout request
    ↓
Transfer Service handles payout execution
```

The Business Rules Engine does not execute the transfer directly.

It creates or triggers the business action that leads to payout execution.

---

## Synchronous vs Asynchronous Work

Critical financial record updates should happen safely and predictably.

Non-critical actions may be handled asynchronously.

### Synchronous Examples

* Payment verification
* Contribution status update
* Payout eligibility check
* Audit log creation

### Asynchronous Examples

* Email notifications
* SMS reminders
* Analytics updates
* Report refresh jobs

---

## Consequences

### Positive

* Fund behavior becomes easier to extend.
* Business rules are centralized.
* Controllers remain simple.
* Payment providers remain isolated from business logic.
* New fund types can be added more cleanly.
* Testing fund behavior becomes easier.

### Negative

* Requires careful design.
* May add complexity compared to hardcoded fund logic.
* Poorly designed rules could become difficult to maintain.

---

## MVP Approach

For the MVP, the Business Rules Engine should remain simple.

It should support:

* Annual Dues post-payment behavior.
* Savings Fund post-payment behavior.
* Rotational Savings cycle completion check.
* Basic payout eligibility evaluation.
* Audit logging for important decisions.

Advanced custom rule builders are outside the MVP scope.

---

## Future Considerations

Future versions may support:

* Custom workflows
* Multi-level approvals
* Configurable rule templates
* Rule versioning
* Rule simulation before activation
* Admin-defined automation rules

---

## Summary

UnityFund will use a Business Rules Engine to evaluate fund-specific rules and determine the next business action after important events.

This keeps UnityFund centered around fund logic while allowing Nomba and other payment providers to remain external infrastructure layers.
