import { LeaveTransferActionType } from '@/enums/leave-transfer-action-type';

export interface OperationTypeOption {
  nameAr: string;
  nameEn: string;
  value: LeaveTransferActionType;
}

export const OPERATION_TYPE_OPTIONS: OperationTypeOption[] = [
  {
    nameAr: 'إضافة رصيد',
    nameEn: 'Add Balance',
    value: LeaveTransferActionType.RenewLeaveBalance,
  },
  {
    nameAr: 'ترحيل',
    nameEn: 'Transfer Balance',
    value: LeaveTransferActionType.TransferBalance,
  },
  {
    nameAr: 'ترحيل عكسي',
    nameEn: 'Reverse Transfer',
    value: LeaveTransferActionType.ReverseTransferBalance,
  },
];
