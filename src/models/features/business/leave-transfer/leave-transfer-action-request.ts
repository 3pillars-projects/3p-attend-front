import { LeaveTransferActionType } from '@/enums/leave-transfer-action-type';

export class LeaveTransferActionRequest {
  declare actionType: LeaveTransferActionType;
  declare leaveTypeId: number;
  declare transferAmount?: number;
  declare year: number;
  declare employees: number[];
}
