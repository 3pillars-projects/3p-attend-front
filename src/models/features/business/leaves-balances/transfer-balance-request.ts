import { LeaveTransferActionType } from '@/enums/leave-transfer-action-type';

export class TransferBalanceRequest {
  actionType!: LeaveTransferActionType; // Maps to operation type (1=Forward, 2=Backward, 3=Add)
  departmentId?: number; // Filter (optional)
  leaveTypeId!: number; // Required filter
  transferAmount?: number; // Number of days to transfer/add
  year!: number; // Target year (required)
  employees: number[] = []; // Array of employee IDs
}
