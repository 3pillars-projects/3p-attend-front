import { BaseCrudModel } from '@/abstracts/base-crud-model';
import { GENDER_ENUM } from '@/enums/gender-enum';
import { LeaveTypeInterceptor } from '@/model-interceptors/features/business/leave-type.interceptor';
import { LeaveTypeService } from '@/services/features/business/leave-type.service';
import { CustomValidators } from '@/validators/custom-validators';
import { Validators } from '@angular/forms';
import { InterceptModel } from 'cast-response';
const { send, receive } = new LeaveTypeInterceptor();

@InterceptModel({ send, receive })
export class LeaveType extends BaseCrudModel<LeaveType, LeaveTypeService> {
  override $$__service_name__$$: string = 'LeaveTypeService';

  declare nameAr: string;
  declare nameEn: string;
  declare isActive: boolean;
  declare canApplyOnHalfDay: boolean;
  declare isBalanceTransferrable: boolean;
  declare needManagerApproval: boolean;
  declare needHRApproval: boolean;
  declare hasAnnualBalance: boolean;
  declare annualBalance?: number;
  declare hasLimitedTimesDuringServicePeriod: boolean;
  declare availableTimesDuringServicePeriod: number;
  declare continuousDaysLimit: number;
  declare areHolidaysAndWeekendsIncludedInLeave: boolean;
  declare canApplyInPastOnly: boolean;
  declare canApplyInFutureOnly: boolean;
  declare canApplyInPresentOnly: boolean;
  declare genderType: number; // 0 = both, 1 = male, 2 = female...
  declare monthsOfExperienceRequired: number;
  declare months: number;
  declare years: number;
  declare minAge?: number;
  declare religion?: number;
  declare requireAttachment: boolean;

  buildForm() {
    const {
      nameAr,
      nameEn,
      isActive,
      canApplyOnHalfDay,
      isBalanceTransferrable,
      needManagerApproval,
      needHRApproval,
      hasAnnualBalance,
      annualBalance,
      hasLimitedTimesDuringServicePeriod,
      availableTimesDuringServicePeriod,
      continuousDaysLimit,
      areHolidaysAndWeekendsIncludedInLeave,
      canApplyInPastOnly,
      canApplyInFutureOnly,
      canApplyInPresentOnly,
      genderType,
      months,
      years,
      minAge,
      requireAttachment,
      religion,
    } = this;

    const form = {
      nameAr: [
        nameAr,
        [Validators.required, Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)],
      ],
      nameEn: [
        nameEn,
        [Validators.required, Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)],
      ],

      isActive: [isActive ?? true, [Validators.required]],
      canApplyOnHalfDay: [canApplyOnHalfDay ?? false, [Validators.required]],
      isBalanceTransferrable: [isBalanceTransferrable ?? null, [Validators.required]],
      needManagerApproval: [needManagerApproval ?? false, [Validators.required]],
      needHRApproval: [needHRApproval ?? false, [Validators.required]],

      hasAnnualBalance: [hasAnnualBalance ?? null, [Validators.required]],
      annualBalance: [annualBalance, []], // add conditional validators when hasAnnualBalance = true
      hasLimitedTimesDuringServicePeriod: [
        hasLimitedTimesDuringServicePeriod ?? null,
        [Validators.required],
      ],
      availableTimesDuringServicePeriod: [availableTimesDuringServicePeriod, []], // conditional validators when hasLimitedTimesDuringServicePeriod = true

      continuousDaysLimit: [continuousDaysLimit, [Validators.required]],
      areHolidaysAndWeekendsIncludedInLeave: [
        areHolidaysAndWeekendsIncludedInLeave ?? null,
        [Validators.required],
      ],

      canApplyInPastOnly: [canApplyInPastOnly ?? true, [Validators.required]],
      canApplyInPresentOnly: [canApplyInPresentOnly ?? true, [Validators.required]],
      canApplyInFutureOnly: [canApplyInFutureOnly ?? true, [Validators.required]],

      genderType: [genderType ?? GENDER_ENUM.BOTH /* Both */, [Validators.required]],

      minAge: [minAge, []],
      months: [months, []],
      years: [years, []],
      requireAttachment: [requireAttachment ?? false, [Validators.required]],
      religion: [religion, []],
    };

    return form;
  }
}
