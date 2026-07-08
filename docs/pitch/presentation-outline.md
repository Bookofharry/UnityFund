# UnityFund Presentation Outline

Status: Active
Purpose: Slide-by-slide deck outline, built for a live-demo-first pitch. Pairs with [demo-script.md](demo-script.md) (what you say) and [demo-day-checklist.md](demo-day-checklist.md) (what you click).

Matches the deck already generated in Canva from this outline — keep both in sync if either changes.

---

**Slide 1 — Title**
"UnityFund." Tagline: "The financial operating platform for member-based organizations." Team Zero Downtime, DevCareer × Nomba Hackathon 2026.

**Slide 2 — The Problem**
Cooperative societies, welfare associations, alumni groups, and professional bodies across Africa manage shared finances through WhatsApp reminders, spreadsheets, and manual bank reconciliation. Administrators lose hours every cycle; members have no visibility into fund status.

**Slide 3 — The Insight**
Pull-quote slide: "Organizations don't manage payments. They manage funds." Payments are one step in a larger workflow of rules, cycles, and approvals that existing tools don't understand.

**Slide 4 — The Solution**
One platform automating the full fund lifecycle: organization → fund → collection cycle → contribution → payment → webhook reconciliation → payout → dashboard. Built on Nomba's payment infrastructure.

**Slide 5 — Fund Types**
7-item grid: Annual Dues, Savings Fund, Welfare Fund, Emergency Fund, Building Fund, Rotational Savings (Ajo/Esusu), Investment Fund. Each has its own rules and payout behavior.

**Slide 6 — How It Works**
Left-to-right workflow diagram: Admin configures fund rules → starts a cycle → contributions auto-generate for every member → member pays via Nomba Checkout → signed webhook confirms payment instantly → cycle closes → payout is created, approved, and executed.

**Slide 7 — Role-Based Access, Enforced for Real**
Four roles — Organization Admin, Treasurer, Member, Platform Admin — each permission enforced server-side, not just hidden in the UI. Callout: an internal security audit found and fixed 17 issues before launch.

**Slide 8 — Built for Trust**
Four principles: payments trusted only after verified webhooks; money stored as integer kobo, never floating point; every organization's data structurally isolated; every action logged in a full audit trail.

**Slide 9 — Tech Stack**
React, TypeScript, TanStack Query, Tailwind on the frontend. Express, Prisma, PostgreSQL on the backend. Deployed on Vercel and Railway. Powered by Nomba.

**Slide 10 — Status & What's Next**
"Functional MVP, live today" as the headline. Roadmap: audit-log viewing UI, member-facing direct debit, advanced reporting. Closing line: "UnityFund — replacing spreadsheets with structure."

---

## Live-Demo-First Format

Don't present all 10 slides start to finish before demoing — that's the generic hackathon failure mode (judges glaze over before you've proven anything works). Recommended flow:

1. Slides 1–4 (title through solution) — sets up the problem and insight, ~45 seconds total.
2. Cut to the live demo (see demo-script.md's timed run-of-show) — this is the centerpiece, not an afterthought.
3. Slides 7–8 (RBAC, built for trust) — one breath each while narrating, not read verbatim.
4. Slide 10 (status & next) as the closer.

Slides 5, 6, and 9 exist for reference/backup (if a judge asks "what fund types do you support" or "what's your stack") — don't dwell on them live unless asked.
