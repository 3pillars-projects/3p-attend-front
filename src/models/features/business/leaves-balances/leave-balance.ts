import { BaseCrudModel } from '@/abstracts/base-crud-model';
import { LeaveBalanceInterceptor } from '@/model-interceptors/features/business/leave-balance.interceptor';
import { LeaveBalanceService } from '@/services/features/business/leave-balance.service';
import { Validators } from '@angular/forms';
import { InterceptModel } from 'cast-response';

const { send, receive } = new LeaveBalanceInterceptor();

@InterceptModel({ send, receive })
export class LeaveBalance extends BaseCrudModel<LeaveBalance, LeaveBalanceService> {
  override $$__service_name__$$: string = 'LeaveBalanceService';

  declare fkUserId: number;
  declare fkLeaveTypeId: number;
  declare year: number;
  declare totalBalance: number;
  declare usedBalance: number;
  declare remainingBalance: number;
  declare transferredBalance: number;

  // Navigation properties (optional, for display)
  declare userName?: string;
  declare leaveTypeName?: string;

  buildForm() {
    const {
      fkUserId,
      fkLeaveTypeId,
      year,
      totalBalance,
      usedBalance,
      remainingBalance,
      transferredBalance,
    } = this;

    const form = {
      fkUserId: [fkUserId, [Validators.required]],
      fkLeaveTypeId: [fkLeaveTypeId, [Validators.required]],
      year: [year, [Validators.required, Validators.min(1900), Validators.max(2100)]],
      totalBalance: [totalBalance, [Validators.required, Validators.min(0)]],
      usedBalance: [usedBalance ?? 0, [Validators.required, Validators.min(0)]],
      remainingBalance: [remainingBalance ?? 0, [Validators.required, Validators.min(0)]],
      transferredBalance: [transferredBalance ?? 0, [Validators.required, Validators.min(0)]],
    };

    return form;
  }
}
