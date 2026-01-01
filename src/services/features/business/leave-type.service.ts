import { BaseCrudService } from '@/abstracts/base-crud-service';
import { LeaveType } from '@/models/features/business/leave-type';
import { PaginatedList } from '@/models/shared/response/paginated-list';
import { Injectable } from '@angular/core';
import { CastResponseContainer } from 'cast-response';

@CastResponseContainer({
  $default: {
    model: () => LeaveType,
  },
  $pagination: {
    model: () => PaginatedList<LeaveType>,
    unwrap: 'data',
    shape: { 'list.*': () => LeaveType },
  },
})
@Injectable({
  providedIn: 'root',
})
export class LeaveTypeService extends BaseCrudService<LeaveType> {
  serviceName: string = 'LeaveService';

  override getUrlSegment(): string {
    return this.urlService.URLS.LEAVE_TYPE;
  }
}
