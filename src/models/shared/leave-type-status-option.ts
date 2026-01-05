import { LeaveTypeStatus } from "@/enums/leave-type-status-enum";

export interface LeaveTypeStatusOption {
  id: boolean;
  nameEn: string;
  nameAr: string;
  value: LeaveTypeStatus;
}

export const LEAVE_TYPE_STATUS_OPTIONS: LeaveTypeStatusOption[] = [
  {
    id: true,
    nameEn: 'Active',
    nameAr: 'مفعلة',
    value: LeaveTypeStatus.ACTIVE,
  },
  {
    id: false,
    nameEn: 'Inactive',
    nameAr: 'غير مفعلة',
    value: LeaveTypeStatus.INACTIVE,
  },
];
