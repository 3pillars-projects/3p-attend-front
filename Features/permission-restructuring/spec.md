# Feature: permission-restructuring — short-time permissions, missing time, and penalties

## Status and ownership

- Status: accepted (2026-09-13), implementation in progress
- Owner: backend team
- Backend repository/revision: `3p-attend-back`, branch `permission-restructuring`, based on `e651429` with uncommitted changes
- Frontend repository/revision: `3p-attend-front`, inspected only (`src/services/features/lookups/limited-time-permission.service.ts`, `src/models/features/attendance/attendance-report/attendance-report.ts`)
- Accepted baseline: Q&A decisions below, accepted by the product owner in the planning session on 2026-09-13

## Goal and user journey

Monthly permission quotas are replaced by daily rules, and attendance processing tracks three kinds of time:

- **Missing time**: required shift minutes not worked inside the shift window. It can be made up by extra time worked inside the shift window during the same payroll month.
- **Penalty time**: late arrival or early leave beyond the buffers that has no accepted permission. It is deducted directly and can never be made up.
- **Extra time**: time worked inside the shift window beyond the required minutes makes up missing time automatically. Time before the earliest allowed arrival or after the latest allowed departure is *out-of-shift extra* and needs overtime approval (a separate, later feature).

Example (shift 09:00–17:00, all buffers 30 minutes):

- Day 1: arrives 10:30 with an accepted 60-minute shift-beginning permission and leaves 17:30. Missing 60, penalty 0.
- Same day without the permission: missing 60 and penalty 60, so 2 hours are deducted in total.
- Day 2: arrives 08:30 and leaves 17:30, giving 60 minutes of in-shift extra time. The payroll-month net missing time becomes 0.

## Scope and exclusions

- In scope: permission validation and authorization, attendance processing procedures and triggers, per-day report columns, and a payroll-month time balance endpoint.
- Out of scope: overtime approval workflow, salary calculation, and Angular implementation (a handoff is provided).
- Compatibility constraints: existing routes and the three permission types are kept. `TotalOvertimeMinutes` keeps meaning "all extra time", and `TotalMissingMinutes` keeps its name.

## Accepted decisions

1. An accepted permission only removes the penalty; its minutes remain missing time. It no longer reduces the required shift minutes.
2. Early leave without a permission is doubled exactly like late arrival.
3. In-shift extra time and missing time are netted within the payroll month (`Setting.AppConfig.StartDayOfMonth`), in either order. Missing time left at the end of the month is deductible.
4. Daily limits:
   - At most 3 permissions per day.
   - Each permission lasts at least 1 minute.
   - All permissions on the same day together last at most half of the shift (e.g. 240 minutes for an 8-hour shift).
   - There is no monthly limit.
5. Manager/HR approval is kept. Only status Accepted (2) protects from the penalty. Approving late queues the day for reprocessing.
6. Managers and HR can create permissions for their employees at any time, including the past; these are created as Accepted. They can also edit a permission after it has started.
7. The three types are kept:
   - Shift beginning (1) excuses late arrival.
   - Shift ending (3) excuses early leave.
   - Mid-shift (2) counts toward the daily limits but does not affect the calculation.
8. The double deduction also applies to full-day absence, single fingerprint days, and flexible shifts.

## Assumptions accepted with the plan

- A1 Late minutes = floor(first fingerprint) − latest allowed arrival. Early minutes = earliest allowed departure − floor(last fingerprint). Arrival within the buffer is never penalised, although the minutes can still be missing.
- A2 A permission covers up to its own duration. Uncovered minutes are penalised; permission minutes beyond the actual late or early time add nothing.
- A3 On days with no fingerprint or a single fingerprint, missing = required minutes and penalty = required minutes − accepted beginning/ending permission minutes (never below 0).
- A4 When an employee edits their own Accepted or FirstAccepted permission before it starts, it returns to New. Edits by a manager or HR keep the status.
- A5 A permission needs a working shift on its date: not a weekend, holiday, or full-day leave.
- A6 Duration is free minutes. `GET api/LimitedTimePermissions/GetTimeOptions` stays available but is not enforced.
- A7 `TotalOvertimeMinutes` = in-shift extra + out-of-shift extra.

## Acceptance criteria

| ID | Given / When / Then | Verification approach |
|---|---|---|
| AC-01 | An employee creates a permission whose start is at or before the current app time → 400 `PERMISSION_MUST_START_IN_FUTURE` | Service rule `LimitedTimePermissionService.AddAsync`; manual API check |
| AC-02 | Duration below 1 → 400 `PERMISSION_MIN_DURATION` | `LimitedTimePermissionHelper.ValidateDailyRulesAsync`; manual API check |
| AC-03 | A 4th non-rejected, non-canceled permission on the same day → 400 `PERMISSION_DAILY_COUNT_EXCEEDED` | Same as AC-02 |
| AC-04 | Total same-day duration above half the shift → 400 `PERMISSION_DAILY_DURATION_EXCEEDED` | Same as AC-02; `PermissionShiftWindow` unit test |
| AC-05 | Date without a working shift (weekend, holiday, full-day leave, no shift) → 400 `PERMISSION_NO_SHIFT_ON_DATE` | Manual API check |
| AC-06 | Overlapping permissions or an interval outside the shift window are rejected with the existing overlap/boundary keys | Unit tests for intervals; manual API check |
| AC-07 | An employee updates their own permission before it starts → saved, status New. After it starts → 400 `PERMISSION_ALREADY_STARTED` | Manual API check |
| AC-08 | A manager of the employee's department (or its parent tree), or HR, updates the permission after it starts → saved, status unchanged. Any other user → 403 `AUTH_FORBIDDEN_ACTION` | Manual API check |
| AC-09 | A manager or HR creates a permission with `fkUserId` for their employee (past allowed) → status Accepted, and a past date queues reprocessing. For a user they don't manage → 403 | Manual API check; `NeedReprocessingLog` row |
| AC-10 | Delete is allowed only for the owner, only for status New, and only before the permission starts | Manual API check |
| AC-11 | Only the owner can request a cancel. Approving or rejecting a cancel requires the approver rules | Manual API check |
| AC-12 | Reads (`GET /`, `GET /{id}`, `GetByIds`) return only the user's own permissions, their managed departments, or everything for HR/Admin. `lookup` and `GetWithPagingSP` are HR/Admin only | Manual API check |
| AC-13 | Processing of the example day with a 60-minute beginning permission → missing 60, penalty 0 | `Sql/Tests/PermissionDeductionScenarios.sql` |
| AC-14 | Same day without a permission → missing 60, unpermitted late 60, penalty 60 | Scenario script |
| AC-15 | Unpermitted early leave → missing plus equal penalty | Scenario script |
| AC-16 | 08:30–17:30 → in-shift extra 60. 08:00–18:00 → in-shift extra 60 and out-of-shift extra 60 | Scenario script |
| AC-17 | Absence and single fingerprint → missing = required minutes, penalty per A3 | Scenario script |
| AC-18 | Holiday or weekend work → out-of-shift extra only, no penalty | Scenario script |
| AC-19 | `GET api/AttendanceReports/time-balance` returns payroll-cycle totals with net missing = max(0, Σmissing − Σin-shift extra) | `AttendanceTimeBalanceCalculator` unit tests; manual API check |
| AC-20 | Accepting, canceling or changing an accepted permission, or deleting or inserting one dated today or earlier, inserts a `Business.NeedReprocessingLog` row | Scenario/manual DB check |

## Business rules and permissions

- **Owner:** `LimitedTimePermission.FkUserId` is the owner. `CreationUserId` stays the audit creator; existing rows are backfilled with `FkUserId = CreationUserId`.
- **Manager of an owner:** a user whose profile is the manager (`Department.FkManagerId`) of the owner's department, or a `DEPARTMENT_MANAGER` whose department or one of its child departments contains the owner. HR = `HR_OFFICER`.
- **Permission interval**, on the permission's date, which is the shift/processing date for every type:
  - Beginning: [latest allowed arrival, + duration]
  - Ending: [earliest allowed departure − duration, earliest allowed departure]
  - Mid-shift: `TimeFrom` (required); on cross-day shifts, a time before the window belongs to the next calendar day.
  - The interval must lie inside [earliest allowed arrival, latest allowed departure].
- **Shift selection:** mirrors `Business.Processing_Shifts_Flexible`. The assigned `ShiftLog` wins over the general one; weekends come from `EmployeeWorkingDays` or the latest `WorkDaysSetting`.
- **Date/time semantics:** all times are application local time (`DateTimeHelper.ToAppTimeZone`, `dbo.GetAppCurrentDateTimeLocal`).

## API contract intent

- Authoritative contract: proposed, not yet exported from Swagger. Reconcile against the implemented OpenAPI before frontend work.

| Operation | Method/path | Request | Success | Failures | Access |
|---|---|---|---|---|---|
| Create | `POST api/LimitedTimePermissions` | `LimitedTimePermissionModel`; new optional `fkUserId` | `ApiResponse<LimitedTimePermissionModel>` | 400 keys above, 403 `AUTH_FORBIDDEN_ACTION` | Owner, or manager/HR of `fkUserId` |
| Update | `PUT api/LimitedTimePermissions` | `id`, `concurrencyUpdateVersion`, date, type, reason, duration, timeFrom. Status and owner are ignored | `ApiResponse<LimitedTimePermissionModel>` | 400, 403, 404, 409 `RECORD_MODIFIED_BY_ANOTHER_USER` | AC-07/AC-08 |
| Delete | `DELETE api/LimitedTimePermissions/{id}` | — | `ApiResponse<string>` | 400 `PERMISSION_INVALID_STATUS` / `PERMISSION_ALREADY_STARTED`, 403 | Owner |
| My list | `POST api/LimitedTimePermissions/GetWithPaging` | unchanged | adds `fkUserId`, `user`, `canEdit` | — | Authenticated |
| Team list | `POST api/LimitedTimePermissions/GetDepartmentLimitedTimePermissionsWithPaging` | unchanged | adds `fkUserId`, `user`, `canEdit` | — | Manager, HR |
| Accept / reject | `PUT api/LimitedTimePermissions/{id}/accept`, `/reject` | — | model (unchanged, not wrapped) | 403 `AUTH_FORBIDDEN_ACTION` (previously `RECORD_MODIFIED_BY_ANOTHER_USER`) | Approver rules |
| Request cancel | `PUT .../{id}/requestCancel` | — | model | 400 `PERMISSION_INVALID_STATUS` / `PERMISSION_CANCEL_ALREADY_REQUESTED`, 403 | Owner |
| Approve / reject cancel | `PUT .../{id}/approveCancel`, `/rejectCancel` | — | model | 400 `PERMISSION_INVALID_STATUS` / `PERMISSION_NO_CANCEL_REQUEST`, 403 | Approver rules |
| Reads | `GET api/LimitedTimePermissions`, `GET .../{id}`, `POST .../GetByIds` | — | scoped | 404 when out of scope (by id) | AC-12 |
| Lookup / SP paging | `GET .../lookup`, `POST .../GetWithPagingSP` | — | unchanged | 403 | HR, Admin |
| Time balance | `GET api/AttendanceReports/time-balance?userId=&date=yyyy-MM-dd` | both optional | `ApiResponse<AttendanceTimeBalanceModel>` | 403, 404 | Self, manager, HR, Admin |

`AttendanceReportModel` adds `inShiftExtraMinutes`, `outOfShiftExtraMinutes`, `unpermittedLateMinutes`, `unpermittedEarlyLeaveMinutes`, and `penaltyMinutes` (nullable int; null on days processed before this change).

## Decisions and open questions

| Question or proposed change | Evidence/options and impact | Resolution/owner |
|---|---|---|
| Mission days with fingerprints | Legacy `TotalOvertimeMinutes` still equals attended minutes; new extra and penalty columns are 0 | Kept as before; revisit with the overtime feature |
| Existing permissions whose `CreationUserId` is NULL | The FK on `FkUserId` fails if such rows exist | Check production data before migrating |
| Mid-shift permission date on cross-day shifts | Processing previously matched mid-shift permissions by calendar date and time; now by processing date | Accepted as part of A5/the interval rule |
| Existing processed days | Report columns change meaning only after reprocessing | Run manual processing for the current payroll month after deployment |

## Completion and rollout

- **Required checks:** solution build; unit tests in `Services.Tests`; `Sql/Tests/PermissionDeductionScenarios.sql` against a local/test database; the manual API checks listed above.
- **Migrations:**
  1. `20260913081226_PermissionOwnerAndAttendanceDeductions`: columns, backfill, index, FK.
  2. `20260913081555_ProcessingPermissionDeductions`: procedures and triggers; Down restores the previous procedure text.
- **Rollout:** deploy, then reprocess the current payroll month so the new columns are filled.
- **Evidence location:** `Features/permission-restructuring/handoff.md`.
