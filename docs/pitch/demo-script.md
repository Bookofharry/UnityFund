# UnityFund Demo Script

Status: Active
Purpose: Timed run-of-show for the live pitch, plus prepared answers for likely judge questions.

Pairs with [demo-day-checklist.md](demo-day-checklist.md) — rehearse the actual click-path there before using this script. This file is what you *say*; that file is what you *click*.

---

## Timed Run-of-Show (~4 minutes + buffer)

### [0:00–0:15] Opening line

> "We're Zero Downtime, and this is UnityFund — the financial operating system for organizations that manage other people's money the hard way: cooperative societies, welfare associations, alumni groups, running everything through WhatsApp and Excel."

### [0:15–0:45] The problem, fast

> "Every collection cycle, a treasurer manually reminds thirty people to pay, cross-checks bank alerts by hand, and updates a spreadsheet — with zero visibility for members into where their money actually is. That's not a technology gap, that's a structural one: every tool out there moves money. Nobody manages the *fund* the money belongs to."

### [0:45–1:00] The insight (bridge into demo)

> "So we built around one idea: organizations don't manage payments, they manage funds. Let me show you, live."

### [1:00–3:00] Live demo — follow "Option A: Safest Live Demo" in demo-day-checklist.md

1. Log in as org admin → open **Monthly Contribution Pool** (rotational fund).
   > "Members and rotation order already exist — this is a real Ajo/Esusu structure, not a toy example."
2. Start a new cycle.
   > "One click, and contribution records generate automatically for every enrolled member."
3. Switch to a member account, click Pay → real Nomba Checkout opens (same tab, lands back on the callback page).
   > "This isn't fake — it's hitting Nomba's actual sandbox."
4. Back on admin view, show the contribution/dashboard state updated.
   > "No one touched a database. That update came from a signed webhook we verified server-side."
5. Show payout creation after cycle close.
   > "And on the other end, payouts route through approval before a single naira moves."

### [3:00–3:30] Technical credibility — one breath, don't dwell

> "Every one of these permissions — who can approve, who can see whose contributions — is enforced server-side, not just hidden in the UI. We ran our own internal audit against this exact codebase and fixed seventeen findings, including duplicate-payout prevention under concurrent webhooks, before we'd call this demo-ready."

### [3:30–4:00] Closing line

> "This is a working MVP you can log into right now, not a mockup. UnityFund — replacing spreadsheets with structure."

---

## Rehearsal Notes

- Practice the full demo path **twice in a row** without a hiccup — that's the go/no-go bar in demo-day-checklist.md.
- Have the Bank Accounts tab pre-verified for whichever member you demo as, so the Pay button isn't blocked mid-pitch.
- Don't ad-lib into Direct Debit or the audit-log UI if asked live — both are explicitly flagged as "not demo-ready." Redirect to roadmap (see Q&A below) instead of showing them.

---

## Anticipated Judge Questions

Nomba is the sponsor here — expect harder probing on integration depth and money-correctness than a generic hackathon panel.

**Q: What happens if two payments or two webhook deliveries hit at the same time — do you double-credit?**
> "No — every payment confirmation is a single atomic, conditional database update, not a read-then-write. We found and fixed this exact race during our own internal audit; a duplicate webhook delivery now affects zero rows and becomes a safe no-op instead of a double-credit."

**Q: How deep is your Nomba integration — are you just wrapping Checkout?**
> "Four surfaces, not one: Checkout for one-off payments, Direct Debit for recurring mandates, Transfers for payouts scoped to our sub-account, and signed webhooks as the single source of truth for reconciliation — nothing is marked paid until a verified webhook says so."

**Q: What's your security model — this is handling other people's money?**
> "Role permissions are enforced server-side on every endpoint, not hidden in the UI; every organization's data is structurally isolated; and we ran our own internal audit against this exact codebase and fixed seventeen findings — including two independently-discovered duplicate-payout bugs — before calling it demo-ready."

**Q: What's the business model / how does this make money?**
> "Per-organization SaaS subscription, tiered by member count and fund complexity — we don't touch transaction economics, that's Nomba's rail; we monetize the workflow layer organizations can't get anywhere else."

**Q: What's not done yet?**
> "Two honest gaps, both already documented in our own roadmap: an audit-log viewing UI — the data's captured server-side today, just not exposed yet — and direct debit as a fully member-facing payment option, since mandate setup works but initiating a debit payment isn't wired to the UI yet."
>
> Worth volunteering this last one unprompted if nobody asks — naming your own gap before a judge finds it reads as confidence, not weakness.
