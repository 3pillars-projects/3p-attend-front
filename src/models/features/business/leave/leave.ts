import { BaseCrudModel } from '@/abstracts/base-crud-model';
import { LeaveStatus } from '@/enums/leave-status-enum';
import { PartialLeavePosition } from '@/enums/partial-leave-position-enum';
import { LeaveInterceptor } from '@/model-interceptors/features/business/leave.interceptor';
import { BaseLookupModel } from '@/models/features/lookups/base-lookup-model';
import { LeaveService } from '@/services/features/business/leave.service';
import { Validators } from '@angular/forms';
import { InterceptModel } from 'cast-response';

const { send, receive } = new LeaveInterceptor();

@InterceptModel({ send, receive })
export class Leave extends BaseCrudModel<Leave, LeaveService> {
  override $$__service_name__$$: string = 'LeaveService';

  declare fkUserId: number;
  declare fkLeaveTypeId: number;
  declare fkParentLeaveId?: number;

  declare dateFrom: string;
  declare dateTo: string;
  declare daysCount: number;

  declare partialLeavePosition: PartialLeavePosition;
  declare isHalfDay?: boolean;

  declare notes?: string;
  declare rejectionNote?: string;
  declare attachmentId?: number;

  declare status: LeaveStatus;
  declare lastActionDate?: string;
  declare lastAcceptanceDate?: string;
  declare isCancelRequested: boolean;

  // Nested / computed from server
  declare leaveType?: BaseLookupModel;
  declare employee?: BaseLookupModel;
  declare department?: BaseLookupModel;
  declare canTakeAction?: boolean;

  buildForm() {
    const {
      fkLeaveTypeId,
      fkUserId,
      dateFrom,
      dateTo,
      daysCount,
      partialLeavePosition,
      isHalfDay,
      notes,
      attachmentId,
    } = this;

    return {
      fkLeaveTypeId: [fkLeaveTypeId, [Validators.required]],
      fkUserId: [fkUserId ?? null, []],
      dateFrom: [dateFrom, [Validators.required]],
      dateTo: [dateTo, [Validators.required]],
      daysCount: [daysCount, [Validators.required, Validators.min(0.5)]],
      partialLeavePosition: [partialLeavePosition ?? PartialLeavePosition.None, []],
      isHalfDay: [isHalfDay ?? false, []],
      notes: [notes, []],
      attachmentId: [attachmentId ?? null, []],
    };
  }
}
