import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ChipModule } from 'primeng/chip';
import { BasePopupComponent } from '@/abstracts/base-components/base-popup/base-popup.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AlertService } from '@/services/shared/alert.service';
import { EmployeeLeaveBalance } from '@/models/features/business/leaves-balances/employee-leave-balance';
import { ValidationMessagesComponent } from '@/views/shared/validation-messages/validation-messages.component';
import { catchError, exhaustMap, filter, isObservable, of, switchMap } from 'rxjs';
import { markFormGroupTouched } from '@/utils/general-helper';
import { EmployeeBalanceService } from '@/services/features/business/employee-balance.service';
import { BaseLookupModel } from '@/models/features/lookups/base-lookup-model';
import {
  LeaveTypeEmployeeBalancesModel,
  EmployeeWithBalanceDetailModel,
} from '@/models/features/business/leaves-balances/LeaveTypeEmployeeBalancesModel';
import { BalanceOperationType } from '@/enums/balance-operation-type-enum';
import { DIALOG_ENUM } from '@/enums/dialog-enum';
import { LANGUAGE_ENUM } from '@/enums/language-enum';

@Component({
  selector: 'app-edit-multiple-employee-leaves-balances-popup',
  imports: [
    InputNumberModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    TranslatePipe,
    ValidationMessagesComponent,
    TableModule,
    RadioButtonModule,
    ChipModule,
  ],
  templateUrl: './edit-multiple-employee-leaves-balances-popup.component.html',
  styleUrl: './edit-multiple-employee-leaves-balances-popup.component.scss',
})
export class EditMultipleEmployeeLeavesBalancesPopupComponent
  extends BasePopupComponent<any>
  implements OnInit
{
  override model: any = {};
  override form!: FormGroup;
  data = inject(MAT_DIALOG_DATA);
  fb = inject(FormBuilder);
  alertService = inject(AlertService);
  translateService = inject(TranslateService);
  employeeBalanceService = inject(EmployeeBalanceService);
  allEmployees: EmployeeWithBalanceDetailModel[] = [];
  selectedEmployees: EmployeeWithBalanceDetailModel[] = [];
  lang!: string;
  leaveType!: BaseLookupModel;
  operationTypes = BalanceOperationType;
  languageEnum = LANGUAGE_ENUM;
  isAnnualLeave!: boolean;
  override initPopup(): void {
    if (this.data) {
      this.leaveType = this.data.leaveType;
      this.isAnnualLeave = this.data.isAnnualLeave;
      const filter = this.data.filter || {};

      this.employeeBalanceService
        .getEmployeeBalancesByLeaveType(this.leaveType.id!, filter)
        .subscribe((res: LeaveTypeEmployeeBalancesModel) => {
          this.allEmployees = res.employees;
          this.selectedEmployees = [...this.allEmployees];
          if (res.year) {
            this.form.patchValue({ year: res.year });
          }
        });
    }
    this.lang = this.translateService.currentLang;
    this.translateService.onLangChange.subscribe((event) => {
      this.lang = event.lang;
    });
  }

  override listenToSave() {
    this.save$
      .pipe(
        switchMap(() => {
          const result = this.beforeSave(this.model, this.form);
          !result && markFormGroupTouched(this.form);
          return isObservable(result) ? result : of(result);
        })
      )
      .pipe(filter((value) => !!value))
      .pipe(
        switchMap((_) => {
          const result = this.prepareModel(this.model, this.form);
          return isObservable(result) ? result : of(result);
        })
      )
      .pipe(
        exhaustMap((model: any) => {
          return this.employeeBalanceService.bulkUpdateBalancesByLeaveType(model).pipe(
            catchError((error) => {
              this.saveFail(error);
              return of({
                error: error,
                model,
              });
            })
          );
        })
      )
      .pipe(
        filter((value: any) => {
          return (
            !value.hasOwnProperty('error') || (value.hasOwnProperty('error') && value.error == null)
          );
        })
      )
      .subscribe((model: any) => {
        this.afterSave(model);
        this.dialogRef.close(DIALOG_ENUM.OK);
      });
  }

  override buildForm(): void {
    this.form = this.fb.group({
      operationType: [BalanceOperationType.ADD, [Validators.required]], // ADD or DEDUCT
      amount: [null, [Validators.required, Validators.min(1)]],
      year: [new Date().getFullYear(), [Validators.required]],
    });
  }

  getControl(controlName: string) {
    return this.form.get(controlName) as FormControl;
  }

  override saveFail(error: Error): void {}

  override afterSave(model: any): void {
    this.alertService.showSuccessMessage({ messages: ['COMMON.UPDATED_SUCCESSFULLY'] });
  }

  override beforeSave(model: any, form: FormGroup): boolean {
    return form.valid;
  }

  override prepareModel(model: any, form: FormGroup): any {
    return {
      ...form.getRawValue(),
      fkLeaveTypeId: this.leaveType.id,
      userIds: this.selectedEmployees.map((e) => e.employee.id),
    };
  }

  override close() {
    this.dialogRef.close();
  }

  getUserName(empDetail: EmployeeWithBalanceDetailModel) {
    return this.lang === 'ar' ? empDetail.employee.nameAr : empDetail.employee.nameEn;
  }

  toggleEmployeeSelection(employeeId: number | undefined) {
    if (employeeId === undefined) return;
    const index = this.selectedEmployees.findIndex((e) => e.employee.id === employeeId);
    if (index > -1) {
      this.selectedEmployees.splice(index, 1);
    } else {
      const emp = this.allEmployees.find((e) => e.employee.id === employeeId);
      if (emp) {
        this.selectedEmployees.push(emp);
      }
    }
  }

  isEmployeeSelected(employeeId: number | undefined): boolean {
    if (employeeId === undefined) return false;
    return this.selectedEmployees.some((e) => e.employee.id === employeeId);
  }

  toggleAll(checked: boolean): void {
    if (checked) {
      this.selectedEmployees = [...this.allEmployees];
    } else {
      this.selectedEmployees = [];
    }
  }

  returnCheckAllStatus() {
    return (
      this.allEmployees.length > 0 && this.selectedEmployees.length === this.allEmployees.length
    );
  }

  getLanguage() {
    return this.languageService.getCurrentLanguage();
  }
}
