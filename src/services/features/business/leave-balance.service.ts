import { BaseCrudService } from '@/abstracts/base-crud-service';
import { LeaveBalance } from '@/models/features/business/leaves-balances/leave-balance';
import { PaginatedList } from '@/models/shared/response/paginated-list';
import { Injectable } from '@angular/core';
import { CastResponseContainer } from 'cast-response';

@CastResponseContainer({
  $default: {
    model: () => LeaveBalance,
  },
  $pagination: {
    model: () => PaginatedList<LeaveBalance>,
    unwrap: 'data',
    shape: { 'list.*': () => LeaveBalance },
  },
})
@Injectable({
  providedIn: 'root',
})
export class LeaveBalanceService extends BaseCrudService<LeaveBalance> {
  serviceName: string = 'LeaveBalanceService';

  override getUrlSegment(): string {
    return this.urlService.URLS.LEAVE_BALANCE;
  }
}
