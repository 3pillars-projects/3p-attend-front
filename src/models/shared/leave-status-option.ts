import { LeaveStatus } from '@/enums/leave-status-enum';

export interface LeaveStatusOption {
  id: LeaveStatus;
  nameEn: string;
  nameAr: string;
  value: LeaveStatus;
  [key: string]: any;
}

export const LEAVE_STATUS_OPTIONS: LeaveStatusOption[] = [
  {
    id: LeaveStatus.New,
    nameEn: 'New',
    nameAr: 'جديد',
    value: LeaveStatus.New,
  },
  {
    id: LeaveStatus.Accepted,
    nameEn: 'Accepted',
    nameAr: 'مقبول',
    value: LeaveStatus.Accepted,
  },
  {
    id: LeaveStatus.Rejected,
    nameEn: 'Rejected',
    nameAr: 'مرفوض',
    value: LeaveStatus.Rejected,
  },
  {
    id: LeaveStatus.Canceled,
    nameEn: 'Canceled',
    nameAr: 'ملغي',
    value: LeaveStatus.Canceled,
  },
  {
    id: LeaveStatus.HRAcceptance,
    nameEn: 'HR Accepted',
    nameAr: 'مقبول من الـ HR',
    value: LeaveStatus.HRAcceptance,
  },
  {
    id: LeaveStatus.ManagementAcceptance,
    nameEn: 'Management Accepted',
    nameAr: 'مقبول من الادارة',
    value: LeaveStatus.ManagementAcceptance,
  },
];
