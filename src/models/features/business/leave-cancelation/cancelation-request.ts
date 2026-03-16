import { BaseCrudModel } from '@/abstracts/base-crud-model';
import { Leave } from '../leave/leave';
import { CancelationRequestStatus } from '@/enums/cancelation-request-status-enum';
import { CancelationRequestInterceptor } from '@/model-interceptors/features/business/cancelation-request.interceptor';
import { CancelationRequestService } from '@/services/features/business/cancelation-request.service';

import { InterceptModel } from 'cast-response';
import { BaseLookupModel } from '../../lookups/base-lookup-model';
import { LeaveStatus } from '@/enums/leave-status-enum';

const { send, receive } = new CancelationRequestInterceptor();

@InterceptModel({ send, receive })
export class CancelationRequest extends BaseCrudModel<
  CancelationRequest,
  CancelationRequestService
> {
  override $$__service_name__$$: string = 'CancelationRequestService';

  declare fkLeaveId: number;
  declare dateFrom: string | Date;
  declare dateTo: string | Date;
  declare note?: string;
  declare rejectionNote?: string;
  declare actionDate?: string | Date;
  declare status: CancelationRequestStatus;
  declare requireHRAction: boolean;
  declare canTakeAction: boolean;
  declare canDelete: boolean;
  declare leaveType?: BaseLookupModel;
  declare employee?: BaseLookupModel;
  declare department?: BaseLookupModel;
  declare leaveStatus?: LeaveStatus;

  buildForm() {
    const { fkLeaveId, dateFrom, dateTo, note, status, requireHRAction } = this;
    return {
      fkLeaveId: [fkLeaveId, []],
      dateFrom: [dateFrom, []],
      dateTo: [dateTo, []],
      note: [note, []],
      status: [status, []],
      requireHRAction: [requireHRAction ?? false, []],
    };
  }
}
