# Design

## Context

See proposal.md - Why. The existing `visa/payment` spec restricts payment status to "paid" or "unpaid". The `agency/dashboard` spec shows payment status as paid or unpaid. The `visa/passport-entry` spec does not specify a default payment status. This change adds a third payment status ("requested") and defines the agency-request → staff-approve flow.

## Goals / Non-Goals

**Goals:**
- Payment status supports three values: unpaid (default on entry), requested (agency has asked staff to pay), paid (staff has approved).
- Agency can send a payment request on a delivered passport, moving status to "requested".
- Staff can approve a "requested" payment request, moving status to "paid".
- Staff can reject a "requested" payment request, moving status back to "unpaid".
- A pending "requested" payment cannot be duplicated; a paid passport cannot accept another request.

**Non-Goals:**
- Actual money transfer or integration with a payment gateway.
- Changing passport status (received/delivered) as a result of payment.
- Refunds or partial payments.

## Decisions

| Decision | Rationale | Alternatives considered |
|---|---|---|
| Payment status stored as a string enum: unpaid/requested/paid | Simple, matches existing pattern where payment status is a string field. | Boolean paid flag + separate requested flag (more complex state machine). |
| "Requested" is set by agency clicking "pay" on a delivered passport | Matches existing "pay" button pattern; agency initiates, staff approves. | Staff initiates request (inverted flow, doesn't match agency-initiated payment need). |
| Staff approves/rejects on the payment request, not directly on passport | Keeps approval logic separate from passport lifecycle. | Direct status change on passport without intermediate request (lacks audit trail). |
| Default payment status on entry is "unpaid" | Every new passport starts unpaid until agency requests payment. | Default to "requested" (would require agency action immediately, not practical). |
| Paid passport cannot accept another payment request | Prevents duplicate payments; matches existing behavior in `visa/payment`. | Allow re-request (would create duplicate payment obligations). |

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Agency may click "pay" multiple times on the same passport | UI disables the button while a request is pending; backend rejects duplicate requests. |
| Staff may forget to approve pending requests | Staff dashboard shows pending requests prominently; agency can follow up outside the system. |
| Payment status and passport status are separate concepts | Clear documentation and UI labeling to avoid confusion between passport status (received/delivered) and payment status (unpaid/requested/paid). |

## Migration Plan

Deploy the updated client and server code together. No data migration needed — existing passports with payment status "unpaid" remain "unpaid"; no existing passports have "requested" status since it is new. Rollback is a revert of the changed components.

## Open Questions

None.
