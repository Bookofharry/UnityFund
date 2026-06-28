# Product Assumptions

**Status:** Draft
**Version:** 0.1
**Project:** UnityFund
**Team:** Zero Downtime
**Owner:** Harry
**Last Updated:** 2026-06-27

---

# Introduction

Every startup begins with assumptions.

An assumption is something we currently believe to be true but have not yet fully validated through customer research, industry evidence, or product testing.

The purpose of this document is to make those assumptions visible, prioritize them by risk, and define how they will be validated.

As UnityFund evolves, assumptions should either become:

* **Validated** (supported by evidence)
* **Rejected** (proven false)
* **Business Rules** (intentional product decisions)
* **Facts** (verified through research or documentation)

---

# Assumption Status

* 🟡 Pending
* 🔵 Researching
* 🟢 Validated
* 🔴 Rejected

---

# Confidence Levels

**High** — Strong evidence already exists.

**Medium** — Reasonable assumption but requires validation.

**Low** — Significant uncertainty.

---

# Assumptions

| ID   | Category  | Assumption                                                                                                                      | Confidence | Risk   | Validation Method                                                        | Status                          |
| ---- | --------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------ | ------------------------------- |
| A001 | Customer  | Member-based organizations manage multiple funds simultaneously.                                                                | High       | High   | Interview cooperative administrators and welfare association executives. | 🟡 Pending                      |
| A002 | Customer  | Organizations still rely heavily on spreadsheets, WhatsApp, and manual reconciliation.                                          | High       | High   | Customer interviews and industry research.                               | 🟡 Pending                      |
| A003 | Customer  | Treasurers spend significant time tracking payments and preparing reports manually.                                             | High       | High   | Observe current workflows and conduct interviews.                        | 🟡 Pending                      |
| A004 | Product   | Organizations want recurring payment automation instead of manual collections.                                                  | Medium     | High   | Customer interviews and MVP feedback.                                    | 🟡 Pending                      |
| A005 | Product   | Different fund types require different operational workflows.                                                                   | High       | High   | Research cooperative operations and validate with users.                 | 🟡 Pending                      |
| A006 | Business  | Organizations are willing to pay a monthly subscription for software that reduces administrative work.                          | Medium     | High   | Pricing interviews and MVP trials.                                       | 🟡 Pending                      |
| A007 | Technical | Nomba's APIs are sufficient to support UnityFund's MVP workflows.                                                               | High       | Medium | Prototype and integration testing using Nomba sandbox.                   | 🟢 Validated (Current Research) |
| A008 | Market    | Cooperatives, welfare associations, alumni groups, and professional bodies represent a large enough market for a SaaS business. | Medium     | High   | Market size research and industry reports.                               | 🟡 Pending                      |
| A009 | Product   | Members value transparency and self-service access to their payment history and fund status.                                    | Medium     | Medium | User interviews and MVP feedback.                                        | 🟡 Pending                      |
| A010 | Technical | Automated payment reconciliation will significantly reduce administrative workload compared to current manual processes.        | High       | Medium | Prototype testing and customer feedback.                                 | 🟡 Pending                      |

---

# Highest-Risk Assumptions

The following assumptions have the greatest impact on the success of UnityFund:

1. Organizations are willing to adopt dedicated fund management software.
2. Organizations are willing to pay for the platform.
3. Organizations want recurring payment automation.
4. Different fund types genuinely require different workflows.
5. Nomba's payment infrastructure can support the required workflows for the MVP.

These assumptions should be validated before expanding the product beyond the MVP.

---

# Validation Strategy

Assumptions will be validated through:

* Customer interviews
* Industry research
* Competitor analysis
* MVP testing
* Nomba sandbox integration
* Hackathon feedback
* Pilot organizations

---

# Review Process

This document is a living record.

Every assumption should eventually become one of the following:

* ✅ Validated
* ❌ Rejected
* 📘 Business Rule
* 📖 Verified Fact

Assumptions should never remain "Pending" indefinitely.

Each major product iteration should reduce uncertainty by validating or rejecting assumptions.
