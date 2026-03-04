import { LeaveStatus } from '@/enums/leave-status-enum';

export class TeamLeaveFilter {
  declare fkLeaveTypeId?: number;
  declare fkDepartmentId?: number;
  declare fkUserId?: number;
  declare dateFrom?: string;
  declare dateTo?: string;
  declare status?: LeaveStatus;
  declare isCancelRequested?: boolean;
}
