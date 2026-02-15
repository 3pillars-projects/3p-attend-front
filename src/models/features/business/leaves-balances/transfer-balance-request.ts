import { BalanceOperationType } from '@/enums/balance-operation-type-enum';

export class TransferBalanceRequest {
  actionType!: BalanceOperationType; // Maps to operation type (1=Forward, 2=Backward, 3=Add)
  departmentId?: number; // Filter (optional)
  leaveTypeId!: number; // Required filter
  transferAmount?: number; // Number of days to transfer/add
  year!: number; // Target year (required)
  employees: number[] = []; // Array of employee IDs
}
