import { AttendanceTimeBalance } from '@/models/features/attendance/attendance-report/attendance-time-balance';
import { AttendanceReportService } from '@/services/features/attendance-report.service';
import { formatMinutes } from '@/utils/general-helper';
import { Component, inject, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { finalize } from 'rxjs';

type BalanceTone = 'neutral' | 'positive' | 'negative';

@Component({
  selector: 'app-time-balance-card',
  imports: [TranslatePipe],
  templateUrl: './time-balance-card.component.html',
})
export class TimeBalanceCardComponent implements OnInit {
  private attendanceReportService = inject(AttendanceReportService);

  balance: AttendanceTimeBalance | null = null;
  isLoading = false;
  hasError = false;

  ngOnInit(): void {
    this.loadBalance();
  }

  // Current user, payroll cycle containing today (endpoint defaults)
  loadBalance(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.hasError = false;
    this.attendanceReportService
      .getTimeBalance()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (balance) => {
          this.balance = balance;
        },
        error: () => {
          this.balance = null;
          this.hasError = true;
        },
      });
  }

  get items(): { labelKey: string; value: number; tone: BalanceTone }[] {
    if (!this.balance) return [];
    const b = this.balance;
    return [
      { labelKey: 'TOTAL_MISSING', value: b.totalMissingMinutes, tone: 'neutral' },
      { labelKey: 'TOTAL_IN_SHIFT_EXTRA', value: b.totalInShiftExtraMinutes, tone: 'positive' },
      { labelKey: 'NET_MISSING', value: b.netMissingMinutes, tone: 'negative' },
      {
        labelKey: 'REMAINING_IN_SHIFT_EXTRA',
        value: b.remainingInShiftExtraMinutes,
        tone: 'positive',
      },
      { labelKey: 'TOTAL_PENALTY', value: b.totalPenaltyMinutes, tone: 'negative' },
      { labelKey: 'TOTAL_DEDUCTIBLE', value: b.totalDeductibleMinutes, tone: 'negative' },
      { labelKey: 'PENDING_OVERTIME', value: b.pendingOvertimeMinutes, tone: 'neutral' },
    ];
  }

  formatMinutes(value?: number | null): string {
    return value == null ? '-' : formatMinutes(value);
  }

  // Server sends yyyy-MM-dd; avoid Date parsing so the day never shifts with the browser time zone
  formatCycleDate(value?: string | null): string {
    if (!value) return '-';
    const [year, month, day] = value.substring(0, 10).split('-');
    return `${day}/${month}/${year}`;
  }
}
