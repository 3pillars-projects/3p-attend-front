// Payroll-cycle totals from GET attendancereports/time-balance (permission-restructuring handoff).
export class AttendanceTimeBalance {
  declare userId: number;
  // yyyy-MM-dd, application local date
  declare cycleStartDate: string;
  declare cycleEndDate: string;
  declare totalMissingMinutes: number;
  declare totalInShiftExtraMinutes: number;
  declare netMissingMinutes: number;
  declare remainingInShiftExtraMinutes: number;
  declare totalPenaltyMinutes: number;
  declare totalDeductibleMinutes: number;
  declare pendingOvertimeMinutes: number;
}
