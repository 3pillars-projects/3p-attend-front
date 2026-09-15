# Handoff: permission-restructuring → 3p-attend-front

## Backend state

- Repository/branch: `3p-attend-back`, `permission-restructuring`, based on `e651429`. **All changes are uncommitted**, so a commit ID does not identify this API.
- Specification: [spec.md](spec.md)
- Contract: proposed in the spec's API table. The OpenAPI document has not been exported; export Swagger from the running API before generating or updating clients.
- Migrations to apply, in order:
  1. `20260913081226_PermissionOwnerAndAttendanceDeductions`
  2. `20260913081555_ProcessingPermissionDeductions`
  3. `20260914120000_CountMidShiftPermissionsAsMissingTime`

## Verification

| Check | Result |
|---|---|
| `dotnet build 3p_attend_back.sln` | Required SDK 8.0.419 unavailable. Fallback SDK 8.0.131 passed: 0 errors, 28 existing warnings |
| `dotnet test Services.Tests/Services.Tests.csproj` | Passed: 18 tests, 0 failed, 0 skipped. Covers permission intervals, the half-shift limit, cross-day mid-shift, payroll cycles, and netting |
| `dotnet ef migrations list --no-connect --no-build` | Passed: corrective migration `20260914120000_CountMidShiftPermissionsAsMissingTime` discovered |
| `Sql/Tests/PermissionDeductionScenarios.sql` (18 processing scenarios) | **Not run**: no SQL Server is available in the implementation environment |
| Migrations applied to a database | **Not run** |
| Manual API checks AC-01…AC-12, AC-19, AC-20 | **Not run** |

The service rules that depend on the database are verified only by build and code review:
- daily count and duration
- no-past-date rule for employees
- owner vs manager vs HR authorization
- reprocessing triggers

## Frontend changes needed

Verified frontend files:
- `src/services/features/lookups/limited-time-permission.service.ts`
- the limited-time-permission model
- `src/models/features/attendance/attendance-report/attendance-report.ts`

### Permission form and lists

1. **Duration:** free minutes from 1 up to the remaining half-shift limit for the day. The `GetTimeOptions` endpoint was removed and now returns 404: stop calling `getTimeOptions()` and replace the `availableTimeOptions` dropdown in `limited-time-permission-container` with a minutes input.
2. **Past dates:** employees can choose today or a future date; any time today is allowed. Past dates return `PERMISSION_DATE_IN_PAST`.
3. **Mid-shift:** `limitedTimePermissionTimeFrom` is always required. For other types it is ignored and stored as null.
4. **Creating for an employee:** managers and HR can send `fkUserId`, and past dates are allowed. The result is created with status Accepted.
5. **Response fields:** both list responses now include `fkUserId`, `user` (the owner; `creationUser` is now the creator), and `canEdit`. Show the edit action only when `canEdit` is true. Employees lose edit once the permission starts; managers and HR keep it until the permission is rejected or canceled.
6. **Employee edits:** when the employee edits an Accepted permission, it returns to New and needs approval again.
7. **Delete:** only the owner can delete, only while the status is New and before the permission starts.
8. **Forbidden responses:** accept, reject, approve-cancel and reject-cancel return 403 `AUTH_FORBIDDEN_ACTION` when the user is not allowed. Previously they returned `RECORD_MODIFIED_BY_ANOTHER_USER`.
9. **Monthly limit errors:** the `EXCEEDED_NUMBER_Of_PERMISSIONS`, `EXCEEDED_PERMISSIONS_DURATION` and `EMPLOYEE_EXCEEDED_*` keys were removed from the backend; their translations can be deleted.

New error keys to translate:

| Key | Default text |
|---|---|
| `PERMISSION_DATE_IN_PAST` | The permission date cannot be in the past. |
| `PERMISSION_MIN_DURATION` | The permission duration must be at least 1 minute. |
| `PERMISSION_DAILY_COUNT_EXCEEDED` | You cannot have more than 3 permissions on the same day. |
| `PERMISSION_DAILY_DURATION_EXCEEDED` | The total permission duration on the same day cannot exceed half of the shift duration. |
| `PERMISSION_NO_SHIFT_ON_DATE` | There is no working shift on the selected date. |
| `PERMISSION_ALREADY_STARTED` | The permission has already started. Only the manager or HR can change it. |
| `PERMISSION_INVALID_STATUS` | Invalid permission status for this operation. |
| `PERMISSION_INVALID_TYPE` | Invalid permission type. |
| `MID_SHIFT_TIME_FROM_REQUIRED` | Start time is required for mid-shift permissions. |
| `PERMISSION_CANCEL_ALREADY_REQUESTED` | A cancel request has already been submitted for this permission. |
| `PERMISSION_NO_CANCEL_REQUEST` | No cancel request has been submitted for this permission. |

### Attendance report

`AttendanceReportModel` adds these nullable ints (null for days processed before deployment):
- `inShiftExtraMinutes`: substitutes missing time
- `outOfShiftExtraMinutes`: needs overtime approval
- `unpermittedLateMinutes`
- `unpermittedEarlyLeaveMinutes`
- `penaltyMinutes`: direct deduction

`totalOvertimeMinutes` now equals in-shift extra + out-of-shift extra.

`totalMissingMinutes` now counts only time inside the shift window. Accepted permissions no longer reduce it.

For a mid-shift permission, the accepted interval overlapping the employee's in-shift fingerprint
span is excluded from attended time. It therefore appears as missing time unless additional work
inside the allowed shift window makes it up; it does not create a penalty.

### Time balance (new)

`GET api/AttendanceReports/time-balance?userId={optional}&date={optional yyyy-MM-dd}`

- Returns `ApiResponse<AttendanceTimeBalanceModel>` for the payroll cycle containing `date` (default: today).
- Default user is the current user. Other users are allowed for their manager, HR and Admin; otherwise 403.

```json
{
  "userId": 7,
  "cycleStartDate": "2026-08-26",
  "cycleEndDate": "2026-09-25",
  "totalMissingMinutes": 60,
  "totalInShiftExtraMinutes": 60,
  "netMissingMinutes": 0,
  "remainingInShiftExtraMinutes": 0,
  "totalPenaltyMinutes": 60,
  "totalDeductibleMinutes": 60,
  "pendingOvertimeMinutes": 0
}
```

## Unresolved items

- Confirm that no existing `Lookup.LimitedTimePermission` row has a NULL `CreationUserId`; otherwise the FK in migration 1 fails.
- After deployment, run manual processing for the current payroll cycle to fill the new report columns.
- Deviation from the plan: `Processing_AttendanceStatus_flexible.sql` is unchanged. The new `Processing_AttendanceDeductions_Flexible` sets all new columns for every status instead.

## Next action

Apply both migrations to a local/test database. Then run `Sql/Tests/PermissionDeductionScenarios.sql` and the manual API checks, and record the results here.
