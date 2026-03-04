export class LeaveTypeWithBalance {
  nameAr!: string;
  nameEn!: string;
  canApplyOnHalfDay!: boolean;
  canApplyInPastOnly!: boolean;
  canApplyInPresentOnly!: boolean;
  canApplyInFutureOnly!: boolean;
  annualBalance?: number;
  availableTimesDuringServicePeriod?: number;
}
