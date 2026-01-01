import { BaseCrudModel } from '@/abstracts/base-crud-model';
import { LeaveTypeInterceptor } from '@/model-interceptors/features/business/leave-type.interceptor';
import { LeaveTypeService } from '@/services/features/business/leave-type.service';
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
  declare canApplyInPast: boolean;
  declare genderType: number;                   // 0 = both, 1 = male, 2 = female...
  declare monthsOfExperienceRequired: number;
  declare months: number;
  declare years: number;
  declare minAge?: number;
  declare requireAttachment: boolean;

  buildForm(){
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
      canApplyInPast,
      genderType,
      monthsOfExperienceRequired,
      months,
      years,
      minAge,
      requireAttachment } = this;
  

    const form = {
      nameAr: [nameAr, [Validators.required]],
      nameEn: [nameEn, [Validators.required]],
      isActive: [isActive, [Validators.required]],
      canApplyOnHalfDay: [canApplyOnHalfDay, [Validators.required]],
      isBalanceTransferrable: [isBalanceTransferrable, [Validators.required]],
      needManagerApproval: [needManagerApproval, [Validators.required]],
      needHRApproval: [needHRApproval, [Validators.required]],
      hasAnnualBalance: [hasAnnualBalance, [Validators.required]],
      annualBalance: [annualBalance, []],
      hasLimitedTimesDuringServicePeriod: [hasLimitedTimesDuringServicePeriod, [Validators.required]],
      availableTimesDuringServicePeriod: [availableTimesDuringServicePeriod, [Validators.required]],
      continuousDaysLimit: [continuousDaysLimit, [Validators.required]],
      areHolidaysAndWeekendsIncludedInLeave: [areHolidaysAndWeekendsIncludedInLeave, [Validators.required]],
      canApplyInPast: [canApplyInPast, [Validators.required]],
      genderType: [genderType, [Validators.required]],
      monthsOfExperienceRequired: [monthsOfExperienceRequired, [Validators.required]],
      months: [months, [Validators.required]],
      years: [years, [Validators.required]],
      minAge: [minAge, []],
      requireAttachment: [requireAttachment, [Validators.required]],
    };

    return form;
  }
}
