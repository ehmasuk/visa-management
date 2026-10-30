# Tasks

## 1. Server-side payment status model

- [x] 1.1 Update Payment model to add "requested" as a valid payment status alongside "paid" and "unpaid", verify schema compiles
- [x] 1.2 Update passport entry logic to default payment status to "unpaid" on new passport entry, verify default is applied
- [x] 1.3 Implement agency payment request endpoint: agency clicks "pay" on delivered passport → payment status becomes "requested", verify request is created
- [x] 1.4 Implement staff approve payment request: staff approves "requested" → payment status becomes "paid", verify status changes
- [x] 1.5 Implement staff reject payment request: staff rejects "requested" → payment status returns to "unpaid", verify status changes
- [x] 1.6 Prevent duplicate payment requests on a passport with pending "requested" status, verify duplicate is blocked
- [x] 1.7 Prevent payment request on a passport with status "paid", verify request is blocked

## 2. Client-side UI

- [x] 2.1 Agency dashboard: show "pay" button on delivered passports belonging to the agency, verify button appears only on delivered passports
- [x] 2.2 Agency dashboard: show payment status as paid/unpaid/requested for each passport, verify all three statuses display correctly
- [x] 2.3 Staff dashboard: show list of pending "requested" payment requests with approve/reject actions, verify actions work
- [x] 2.4 Admin report: add "Requested" to payment status filter options, verify filter works

## 3. Verification

- [x] 3.1 Run `tsc --noEmit` and `next build`, verify both complete without errors
- [x] 3.2 Run `openspec validate --change agency-payment-request`, verify validation passes

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
- Verify the archived result.
