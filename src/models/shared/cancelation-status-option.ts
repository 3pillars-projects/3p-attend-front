import { CancelationRequestStatus } from '@/enums/cancelation-request-status-enum';

export interface CancelationStatusOption {
  id: CancelationRequestStatus;
  nameEn: string;
  nameAr: string;
  value: CancelationRequestStatus;
  [key: string]: any;
}

export const CANCELATION_STATUS_OPTIONS: CancelationStatusOption[] = [
  {
    id: CancelationRequestStatus.New,
    nameEn: 'New',
    nameAr: 'جديد',
    value: CancelationRequestStatus.New,
  },
  {
    id: CancelationRequestStatus.EmployeeAcceptance,
    nameEn: 'Employee Accepted',
    nameAr: 'مقبول من الموظف',
    value: CancelationRequestStatus.EmployeeAcceptance,
  },
  {
    id: CancelationRequestStatus.Accepted,
    nameEn: 'Accepted',
    nameAr: 'مقبول',
    value: CancelationRequestStatus.Accepted,
  },
  {
    id: CancelationRequestStatus.RejectedByEmployee,
    nameEn: 'Rejected by Employee',
    nameAr: 'مرفوض من الموظف',
    value: CancelationRequestStatus.RejectedByEmployee,
  },
  {
    id: CancelationRequestStatus.RejectedByHR,
    nameEn: 'Rejected by HR',
    nameAr: 'مرفوض من الـ HR',
    value: CancelationRequestStatus.RejectedByHR,
  },
];
