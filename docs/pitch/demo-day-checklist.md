# UnityFund Demo Day Checklist

Status: Active  
Audience: Team Zero Downtime  
Purpose: Keep the MVP demo reliable, repeatable, and honest.

---

## Demo Goal

Prove one end-to-end organizational fund workflow:

`organization -> fund -> cycle -> contribution -> payment -> webhook -> payout -> dashboard`

The demo is successful only if this flow works cleanly without manual database intervention.

---

## MVP Freeze Line

Keep the live demo focused on these areas only:

- Authentication and organization context
- One organization
- One hero fund flow
- Collection cycle creation and start
- Contribution payment through Nomba Checkout
- Webhook-based reconciliation
- Payout creation, approval, and execution
- Dashboard proof that the system state changed

Cut or hide these during the presentation unless they are fully rehearsed:

- Direct debit live flow
- Multiple fund-type walkthroughs
- Platform admin area
- Advanced reports
- Notifications as a headline feature
- Audit log UI
- Forgot-password flow

---

## Safest Demo Mode

The safest presentation path is to use the seeded organization and the preconfigured rotational savings fund from [api/prisma/seed.ts](api/prisma/seed.ts#L1).

Recommended seeded assets:

- Organization: `Lagos Teachers Cooperative`
- Fund: `Monthly Contribution Pool`
- Roles:
  - `admin@unityfund.dev`
  - `treasurer@unityfund.dev`
  - `amaka@unityfund.dev`
  - `tunde@unityfund.dev`
  - `ngozi@unityfund.dev`
- Shared password: `Password123!`

Why this is safest:

- The rotational fund already has rules configured.
- Fund members are already enrolled.
- Rotation positions are already assigned.
- It reduces live setup risk and keeps the demo focused on the business workflow.

---

## Environment Lock

Before demo day, make local runtime settings agree on one convention.

Current repo behavior to align:

- Vite runs on `3000` in [web/vite.config.ts](web/vite.config.ts#L13).
- Vite proxies `/api` to `http://localhost:4000` in [web/vite.config.ts](web/vite.config.ts#L16).
- API env defaults still use `3000` and `http://localhost:5173` in [api/.env.example](api/.env.example#L12) and [api/src/config/env.ts](api/src/config/env.ts#L8).

Demo machine target:

- API: `http://localhost:4000`
- Web: `http://localhost:3000`
- `CORS_ORIGIN=http://localhost:3000`
- `APP_URL=http://localhost:3000`

If these values are not aligned, stop and fix them before rehearsal.

---

## File-By-File Critical Path

| Stage | UI / Client Files | API / Service Files | Must Be True |
|---|---|---|---|
| Login and session restore | [web/src/context/AuthContext.tsx](web/src/context/AuthContext.tsx#L23), [web/src/App.tsx](web/src/App.tsx#L41), [web/src/components/ProtectedRoute.tsx](web/src/components/ProtectedRoute.tsx#L5) | [api/src/modules/auth/auth.service.ts](api/src/modules/auth/auth.service.ts#L13) | User logs in and lands in the correct organization context. |
| Fund setup and cycle control | [web/src/pages/FundsPage.tsx](web/src/pages/FundsPage.tsx#L1), [web/src/pages/FundDetailPage.tsx](web/src/pages/FundDetailPage.tsx#L1) | [api/src/modules/funds/fund.service.ts](api/src/modules/funds/fund.service.ts#L1), [api/src/modules/cycles/cycle.service.ts](api/src/modules/cycles/cycle.service.ts#L1) | Admin can view a rotational fund, confirm rules, and start a cycle. |
| Bank account readiness | [web/src/pages/BankAccountsPage.tsx](web/src/pages/BankAccountsPage.tsx#L1) | [api/src/modules/bank-accounts/bank-account.service.ts](api/src/modules/bank-accounts/bank-account.service.ts#L1), [api/src/lib/nomba.ts](api/src/lib/nomba.ts#L237) | The payout recipient has one active, verified, default bank account. |
| Contribution payment | [web/src/pages/ContributionsPage.tsx](web/src/pages/ContributionsPage.tsx#L1), [web/src/pages/PaymentCallbackPage.tsx](web/src/pages/PaymentCallbackPage.tsx#L1), [web/src/api/contributions.ts](web/src/api/contributions.ts#L1) | [api/src/modules/payments/payment.service.ts](api/src/modules/payments/payment.service.ts#L1), [api/src/lib/nomba.ts](api/src/lib/nomba.ts#L159) | Member can click `Pay`, get a checkout URL, and return to a clear payment state. |
| Webhook reconciliation | No direct UI file; confirmed via callback page and refreshed contribution status | [api/src/modules/webhooks/webhook.service.ts](api/src/modules/webhooks/webhook.service.ts#L2), [api/src/modules/payments/payment.service.ts](api/src/modules/payments/payment.service.ts#L141), [api/src/services/bre.service.ts](api/src/services/bre.service.ts#L13) | Payment becomes `successful` and the contribution updates without manual fixes. |
| Payout review and execution | [web/src/pages/PayoutsPage.tsx](web/src/pages/PayoutsPage.tsx#L1) | [api/src/modules/payouts/payout.service.ts](api/src/modules/payouts/payout.service.ts#L1), [api/src/services/bre.service.ts](api/src/services/bre.service.ts#L13) | Closing the cycle creates a payout, and the right role can approve and execute it. |
| Dashboard proof | [web/src/pages/DashboardPage.tsx](web/src/pages/DashboardPage.tsx#L1) | [api/src/modules/reports/report.service.ts](api/src/modules/reports/report.service.ts#L4) | The counts and totals visibly change after payment and payout steps. |

---

## Pre-Demo Setup Checklist

- [ ] `docker-compose` services are running if you depend on local Postgres and Redis.
- [ ] API boots successfully and connects to the database.
- [ ] Web app opens on `http://localhost:3000`.
- [ ] Seed has been run successfully.
- [ ] Nomba sandbox credentials are valid.
- [ ] Webhook endpoint is reachable from the sandbox setup you will demo with.
- [ ] At least one member bank account is registered, verified, and defaulted.
- [ ] The chosen fund has active members and valid rotational positions.
- [ ] The presenter has exact demo credentials ready in a private note.
- [ ] Browser tabs are pre-opened only to relevant app screens.

---

## Rehearsal Checklist

- [ ] Log in as `admin@unityfund.dev`.
- [ ] Confirm the active organization is correct in the app shell.
- [ ] Open the rotational fund and verify rules look correct.
- [ ] Start a fresh collection cycle.
- [ ] Confirm contributions appear for members.
- [ ] Log in as one member and initiate Checkout payment.
- [ ] Confirm the callback page reaches `successful`, not just `pending`.
- [ ] Refresh contributions and verify the paid amount changed.
- [ ] Return to admin or treasurer role and close the cycle.
- [ ] Confirm payout creation happened automatically.
- [ ] Approve payout if the chosen fund requires approval.
- [ ] Execute payout.
- [ ] Refresh payouts and dashboard and confirm the final state.
- [ ] Repeat the same full script a second time.

If you cannot complete this flow twice in a row, the demo is not yet presentation-safe.

---

## Recommended Live Demo Paths

### Option A: Safest Live Demo

Use the seeded rotational fund.

1. Log in as org admin.
2. Open `Monthly Contribution Pool`.
3. Show that members and rotation order already exist.
4. Start a new cycle.
5. Switch to a member account and pay one contribution through Checkout.
6. Show the payment callback result.
7. Return to admin view and show updated contribution/dashboard state.
8. Close the cycle after all required member payments are satisfied in rehearsal conditions.
9. Show payout creation.
10. Approve or execute payout depending on the chosen fund rules.

This is the preferred route for judging reliability.

### Option B: Extended Demo

Only use this if rehearsed multiple times.

1. Create a new rotational fund live in [web/src/pages/FundsPage.tsx](web/src/pages/FundsPage.tsx#L1).
2. Configure rules and rotation members in [web/src/pages/FundDetailPage.tsx](web/src/pages/FundDetailPage.tsx#L1).
3. Then continue with the standard payment and payout flow.

This is more impressive, but it is also riskier.

---

## Presentation Blockers

Do not start the live presentation if any of these are true:

- Payment callback does not consistently reach a terminal state.
- Webhook delivery is not confirmed in your environment.
- The payout recipient has no verified default bank account.
- Presenter cannot switch quickly between required user roles.
- The chosen fund has no clean path to payout creation.
- The demo depends on explaining away a broken screen.

---

## Do Not Promise Live

To keep the MVP credible, do not present these as finished live-demo features unless you have hardened them:

- Full audit trail viewing UI
  - Current audit findings in [audit_report.md](audit_report.md#L14) note that logs are written but not yet exposed through a retrieval UI.
- Direct debit as a live-demoable payment path
  - There is currently no UI entry point to pay via mandate — [web/src/pages/ContributionsPage.tsx](web/src/pages/ContributionsPage.tsx#L34) always initiates Checkout, regardless of whether the member has an active mandate. Mandate *setup* (`web/src/pages/MandatesPage.tsx`) works and can be shown, but do not imply a member can actually pay this way today.
- All seven fund types as equally polished
  - Present the product vision broadly, but prove one hero workflow deeply.

---

## Demo Talking Points

Use these short lines during the demo:

- `UnityFund is built around funds, not just payments.`
- `We automate the workflow from member contribution to reconciled payout.`
- `Payments are only trusted after verified webhook confirmation.`
- `Payouts use verified bank accounts and controlled approval states.`
- `The dashboard reflects real workflow state, not manual spreadsheet updates.`

---

## Final Go / No-Go Rule

The MVP is ready to present when:

- The chosen flow works end to end twice in a row.
- The team knows which route they are taking: seeded or extended.
- Every live click maps to a stable screen already rehearsed.
- No part of the story depends on apology, improvisation, or hidden manual repair.

If any of those are missing, reduce scope again before demo day.
