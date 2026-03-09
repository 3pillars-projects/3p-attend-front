import { BaseCrudModel } from '@/abstracts/base-crud-model';
import { LeaveStatus } from '@/enums/leave-status-enum';
import { PartialLeavePosition } from '@/enums/partial-leave-position-enum';
import { LeaveInterceptor } from '@/model-interceptors/features/business/leave.interceptor';
import { BaseLookupModel } from '@/models/features/lookups/base-lookup-model';
import { LeaveService } from '@/services/features/business/leave.service';
import { CustomValidators } from '@/validators/custom-validators';
import { Validators } from '@angular/forms';
import { InterceptModel } from 'cast-response';

const { send, receive } = new LeaveInterceptor();

@InterceptModel({ send, receive })
export class Leave extends BaseCrudModel<Leave, LeaveService> {
  override $$__service_name__$$: string = 'LeaveService';

  declare fkUserId: number;
  declare fkLeaveTypeId: number;
  declare fkParentLeaveId?: number;

  declare dateFrom: string | Date;
  declare dateTo: string | Date;
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
      daysCount: [daysCount, [Validators.required, Validators.min(CustomValidators.defaultLengths.HALF_DAY_MIN)]],
      partialLeavePosition: [partialLeavePosition ?? PartialLeavePosition.None, []],
      isHalfDay: [isHalfDay ?? false, []],
      notes: [notes, []],
      attachmentId: [attachmentId ?? null, []],
    };
  }

  // The following section is an implementation plan and not valid TypeScript code.
  // It has been commented out to maintain syntactical correctness of the file.
  /*
  6. Submit a leave request and verify it appears in the list.

  ## Translation Plan

  ### Translation Keys
  #### [MODIFY] `ar.json` & `en.json`
  - Add a new section `LEAVE_REQUEST_PAGE` containing all labels, placeholders, and status names for the leave request feature.
  - Include keys for:
      - Tab titles (My Leaves, Team Leaves).
      - Status names (New, Accepted, Rejected, etc.).
      - Form labels (Date From, Date To, Leave Type, Notes, etc.).
      - Table headers.
      - Button text.

  ### Components Refactor
  #### [MODIFY] `leaves-request-list.component.html`, `add-new-leave-request.component.html`, `view-leave-request.component.html`
  - Replace hardcoded Arabic text with `{{ 'KEY' | translate }}`.
  - Update `p-select` labels and placeholders to use translated keys.
  - Update table headers and status badges.

  ### Model Integration
  #### [MODIFY] `LeavesRequestListComponent`
  - Ensure the `columns` definition uses translation keys.
  - Use `LanguageService` to determine which name (Ar/En) to show for lookups if needed, or better, use the pipe/service.
  */

  approve() {
    return this.$$getService$$<LeaveService>().approveLeave(this.id);
  }

  reject() {
    return this.$$getService$$<LeaveService>().rejectLeave({
      leaveId: this.id,
      rejectionNote: this.rejectionNote,
    });
  }
}
