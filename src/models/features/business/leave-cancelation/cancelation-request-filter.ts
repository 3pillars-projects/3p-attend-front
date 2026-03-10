import { CancelationRequestStatus } from '@/enums/cancelation-request-status-enum';

export class CancelationRequestFilter {
  fkLeaveId?: number;
  status?: CancelationRequestStatus;
  requireHRAction?: boolean;
  dateFrom?: string | Date;
  dateTo?: string | Date;
  fkDepartmentId?: number;
  fkEmployeeId?: number;
}
