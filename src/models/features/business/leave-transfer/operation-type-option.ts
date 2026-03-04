import { LeaveTransferActionType } from '@/enums/leave-transfer-action-type';

export interface OperationTypeOption {
  nameAr: string;
  nameEn: string;
  value: LeaveTransferActionType;
}

export const OPERATION_TYPE_OPTIONS: OperationTypeOption[] = [
  {
    nameAr: 'تجديد الرصيد',
    nameEn: 'Renew Balance',
    value: LeaveTransferActionType.RenewLeaveBalance,
  },
  {
    nameAr: 'ترحيل الرصيد',
    nameEn: 'Transfer Balance',
    value: LeaveTransferActionType.TransferBalance,
  },
  {
    nameAr: 'ترحيل عكسي للرصيد',
    nameEn: 'Reverse Transfer',
    value: LeaveTransferActionType.ReverseTransferBalance,
  },
];
