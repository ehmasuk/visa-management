# Tasks

Assumptions recorded: fee stored as integer (taka); collector is name-only display text (no login); passport entry uses free-text agency/collector names validated against the admin registry; initial statuses are received/processing/delivered only; comment edits overwrite without audit trail; reports computed on demand from live data.

## 1. Data model

- [x] 1.1 Add Branch, Agency, Collector, Staff, Passport, Payment models to `prisma/schema.prisma`; Passport gains comment, contactNumber, receiptDate, deliveryDate fields; verify `prisma generate` succeeds
- [x] 1.2 Apply schema to MongoDB and verify new collections are queryable and existing `User` model is unchanged

## 2. Auth & registry (admin allow-list + role lookup)

- [x] 2.1 Update `auth.ts` signIn callback to look up the Google email in the admin-defined registry, enforce the allow-list (only allow-listed emails can log in), and stamp role onto the JWT/session; verify an allow-listed email signs in and a non-allow-listed email is denied
- [x] 2.2 Extend `types/next-auth.d.ts` so `Session`, `User`, and `JWT` include `role` and `email`; verify `pnpm typecheck` passes
- [x] 2.3 Update `middleware.ts` to redirect after login by role (admin → `/admin`, staff → `/staff`, agency → `/agency`); verify each role lands on its intended route

## 3. Admin management UI

- [x] 3.1 Build admin branch CRUD page (`/admin/branches`) and verify branches can be created, read, updated, deleted
- [x] 3.2 Build admin agency CRUD page (`/admin/agencies`) with Gmail allow-list and verify an agency email can be added/removed
- [x] 3.3 Build admin collector CRUD page (`/admin/collectors`) and verify collectors can be managed
- [x] 3.4 Build admin staff CRUD page (`/admin/staff`) with Gmail + role and verify staff records are created
- [x] 3.5 Protect admin routes so only role ADMIN can access; verify staff/agency are redirected away

## 4. Staff passport entry

- [x] 4.1 Build staff passport entry page (`/staff/passports`) capturing agency name, collector name, passport number, passport holder name, contact number, comment, and fee; verify a new passport is created with status "received" and receipt date set automatically
- [x] 4.2 Validate required fields on entry and verify missing fields are rejected with clear errors
- [x] 4.3 Build comment edit on passport records so staff can edit a passport's comment anytime; verify the comment is updated and all other fields preserved

## 5. Staff status & delivery

- [x] 5.1 Build staff passport status-change page allowing status updates between received/processing/delivered; verify status is persisted
- [x] 5.2 Enforce that "delivered" status requires a collector assignment; verify delivery without a collector is rejected
- [x] 5.3 Set delivery date automatically when status becomes "delivered"; verify delivery date is the delivery timestamp
- [x] 5.4 Build staff passport list/detail view showing all passports with status, assigned collector, receipt date, delivery date, comment, and contact number; verify data displays correctly

## 6. Agency dashboard & payment

- [x] 6.1 Build agency dashboard (`/agency`) showing only that agency's passports with status and payment status; verify other agencies' passports are not visible
- [x] 6.2 Display a "pay" button on delivered passports and hide it on non-delivered passports; verify visibility rules
- [x] 6.3 On pay click, create a Payment record with status "unpaid" linked to the passport; verify the unpaid status is stored

## 7. Staff payment approval

- [x] 7.1 Build staff payment approval page listing unpaid payment requests with approve/reject actions; verify requests are listed
- [x] 7.2 On approve, set payment status to "paid"; on reject, keep "unpaid"; verify both transitions persist

## 8. Admin reports

- [x] 8.1 Build admin reports page (`/admin/reports`) showing passport counts grouped by day, month, or agency; verify counts match actual passport records
- [x] 8.2 Build money collected report showing paid vs unpaid amounts grouped by day, month, or agency; verify totals match payment records
- [x] 8.3 Add report filters for date range and agency; verify filtered results match the selected criteria

## 9. Integration verification

- [x] 9.1 End-to-end flow: admin allow-lists an agency email → agency signs in with Gmail → sees own passports → staff enters a passport with comment/contact/fee for that agency (receipt date auto) → staff delivers it with a collector (delivery date auto) → staff edits comment anytime → agency clicks pay → staff approves payment → verify paid status visible to agency → admin views reports for counts and money by day/month/agency

## Workflow follow-up

- Review the completed change artifacts with the team.
- Archive the change after the project's review requirements are satisfied.
- Verify the archived result.
