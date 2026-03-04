import { LeaveTransferActionType } from '@/enums/leave-transfer-action-type';
import { LeaveTransferActionResult } from './leave-transfer-action-result';

export class LeaveTransferActionResponse {
  declare actionType: LeaveTransferActionType;
  declare year: number;
  declare leaveTypeId: number;
  declare requestedTransferAmount?: number;
  declare results: LeaveTransferActionResult[];
}
