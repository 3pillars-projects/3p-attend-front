import { LeaveStatus } from '@/enums/leave-status-enum';

export class LeaveFilter {
  declare fkLeaveTypeId?: number;
  declare fkUserId?: number;
  declare dateFrom?: string | Date;
  declare dateTo?: string | Date;
  declare status?: LeaveStatus;
  declare isCancelRequested?: boolean;
}
