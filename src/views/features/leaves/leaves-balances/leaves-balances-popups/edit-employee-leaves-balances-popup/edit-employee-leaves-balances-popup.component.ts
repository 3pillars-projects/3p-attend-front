import { Component } from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { BasePopupComponent } from '@/abstracts/base-components/base-popup/base-popup.component';
import { EmployeeLeaveBalance } from '@/models/features/business/leaves-balances/employee-leave-balance';

@Component({
  selector: 'app-edit-employee-leaves-balances-popup',
  imports: [TabsModule, Select, InputNumber, FormsModule],
  templateUrl: './edit-employee-leaves-balances-popup.component.html',
  styleUrl: './edit-employee-leaves-balances-popup.component.scss',
})
export class EditEmployeeLeavesBalancesPopupComponent extends BasePopupComponent<EmployeeLeaveBalance> {
  override model!: EmployeeLeaveBalance;
  override form!: FormGroup<any>;
  override initPopup(): void {
    throw new Error('Method not implemented.');
  }
  override buildForm(): void {
    throw new Error('Method not implemented.');
  }
  override saveFail(error: Error): void {
    throw new Error('Method not implemented.');
  }
  override afterSave(model: EmployeeLeaveBalance): void {
    throw new Error('Method not implemented.');
  }
  override beforeSave(model: EmployeeLeaveBalance, form: FormGroup):boolean {
    throw new Error('Method not implemented.');
  }
  override prepareModel(
    model: EmployeeLeaveBalance,
    form: FormGroup
  ): EmployeeLeaveBalance  {
    throw new Error('Method not implemented.');
  }
}
