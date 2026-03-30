import { BaseCrudModel } from '@/abstracts/base-crud-model';
import { EmployeeBalanceService } from '@/services/features/business/employee-balance.service';
import { AnnualLeaveBalanceModel } from './AnnualLeaveBalanceModel';
import { LimitedTimesLeaveBalanceModel } from './LimitedTimesLeaveBalanceModel';
import { InterceptModel } from 'cast-response';
import { employeeLeaveBalanceInterceptor } from '@/model-interceptors/features/business/employee-leave-balance.interceptor';
import { FormBuilder, FormGroup } from '@angular/forms';

const { send, receive } = new employeeLeaveBalanceInterceptor();

@InterceptModel({ send, receive })
export class EmployeeLeaveBalance extends BaseCrudModel<
  EmployeeLeaveBalance,
  EmployeeBalanceService
> {
  override $$__service_name__$$: string = 'EmployeeLeaveBalance';
  employeeId!: number;
  fullNameAr!: string;
  fullNameEn!: string;
  fkGenderId!: number;
  religion!: number;
  monthsOfExperience!: number;
  year?: number;
  annualLeaves: AnnualLeaveBalanceModel[] = [];
  limitedTimesLeaves: LimitedTimesLeaveBalanceModel[] = [];

  buildForm(fb: FormBuilder): FormGroup {
    return fb.group({
      year: [this.year ?? new Date().getFullYear()],
      annualLeaves: fb.array(this.getAnnualLeavesFormGroups(fb)),
      limitedTimesLeaves: fb.array(this.getLimitedTimesLeavesFormGroups(fb)),
    });
  }

  getAnnualLeavesFormGroups(fb: FormBuilder): FormGroup[] {
    const result: FormGroup[] = [];
    this.annualLeaves?.forEach((item: AnnualLeaveBalanceModel) => {
      // Cast to any because the model instances coming from API might not have the prototype methods if not properly instantiated
      // However, usually CastResponse handles this. If not, we might need Object.assign or similar.
      // Assuming CastResponse works as expected and returns instances of the class.
      if (item instanceof AnnualLeaveBalanceModel) {
        result.push(item.buildForm(fb));
      } else {
        // Fallback or handle if it's just a plain object (rare if interceptor/cast works)
        const instance = Object.assign(new AnnualLeaveBalanceModel(), item as any);
        result.push(instance.buildForm(fb));
      }
    });
    return result;
  }

  getLimitedTimesLeavesFormGroups(fb: FormBuilder): FormGroup[] {
    const result: FormGroup[] = [];
    this.limitedTimesLeaves?.forEach((item: LimitedTimesLeaveBalanceModel) => {
      if (item instanceof LimitedTimesLeaveBalanceModel) {
        result.push(item.buildForm(fb));
      } else {
        const instance = Object.assign(new LimitedTimesLeaveBalanceModel(), item as any);
        result.push(instance.buildForm(fb));
      }
    });
    return result;
  }
}
