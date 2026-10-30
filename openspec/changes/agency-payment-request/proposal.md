# Proposal

## Why

Agencies need a way to request payment on delivered passports, and staff need to approve those requests before payment is marked complete. Currently payment status is binary (paid/unpaid), which forces agencies to skip the "requested" intermediate state and gives staff no explicit approval step. Adding a third payment status ("requested") creates a clear request → approve → paid lifecycle.

## What Changes

- Add "requested" as a third payment status alongside "paid" and "unpaid".
- Default payment status to "unpaid" when staff enters a new passport.
- Agency can click "pay" on a delivered passport to send a payment request to staff, moving payment status to "requested".
- Staff can approve a "requested" payment request, moving payment status to "paid".
- Staff can reject a "requested" payment request, keeping it at "unpaid".
- A pending "requested" payment cannot be duplicated; a paid passport cannot accept another request.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `visa/payment`: Add "requested" as a valid payment status; define the request → approve/reject flow.
- `agency/dashboard`: Show "requested" as a possible payment status alongside paid/unpaid.
- `visa/passport-entry`: Default payment status to "unpaid" on new passport entry.

## Impact

- `components/admin-reports-client.tsx` — payment status filter options may need "Requested" added.
- `app/admin/reports/page.tsx` — payment status filter defaults and query handling.
- `lib/reports.ts` — payment aggregation may need to account for "requested" status.
- `components/admin-dashboard-client.tsx` — agency dashboard payment status display.
- `visa/passport-entry` related components — default payment status on entry.
