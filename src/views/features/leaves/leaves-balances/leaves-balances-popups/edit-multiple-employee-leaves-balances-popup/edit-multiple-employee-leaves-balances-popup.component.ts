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
import { MultiSelect } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { BasePopupComponent } from '@/abstracts/base-components/base-popup/base-popup.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
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
    TranslatePipe,
    ValidationMessagesComponent,
    TableModule,
    RadioButtonModule,
    ChipModule,
    MultiSelect,
    InputTextModule,
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
  searchTerm = '';
  employeeToRestoreIds: number[] = [];
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

  // Employees that were removed from the update: everyone loaded minus the ones
  // still selected.
  get excludedEmployees(): EmployeeWithBalanceDetailModel[] {
    const selectedIds = new Set(this.selectedEmployees.map((e) => e.employee.id));
    return this.allEmployees.filter((e) => !selectedIds.has(e.employee.id));
  }

  // Lightweight options for the "restore employee" dropdown.
  get excludedEmployeeOptions(): { id?: number; name?: string }[] {
    return this.excludedEmployees.map((e) => ({
      id: e.employee.id,
      name: this.getUserName(e),
    }));
  }

  // Employees shown in the table: the selected ones, narrowed by the search box.
  get displayedEmployees(): EmployeeWithBalanceDetailModel[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.selectedEmployees;
    return this.selectedEmployees.filter((e) => this.getUserName(e)?.toLowerCase().includes(term));
  }

  // Put the picked employees back into the update, keeping the original list order.
  restoreEmployees() {
    if (!this.employeeToRestoreIds.length) return;
    const idsToRestore = new Set(this.employeeToRestoreIds);
    const alreadySelected = new Set(this.selectedEmployees.map((e) => e.employee.id));
    this.selectedEmployees = this.allEmployees.filter(
      (e) => alreadySelected.has(e.employee.id) || idsToRestore.has(e.employee.id!)
    );
    this.employeeToRestoreIds = [];
  }

  getAvailableBalance(emp: EmployeeWithBalanceDetailModel) {
    return this.isAnnualLeave ? emp.remainingBalance : emp.remainingTimes;
  }

  getUsedBalance(emp: EmployeeWithBalanceDetailModel) {
    return this.isAnnualLeave ? emp.usedBalance : emp.timesUsed;
  }

  getTotalBalance(emp: EmployeeWithBalanceDetailModel) {
    return this.isAnnualLeave ? emp.totalBalance : emp.totalTimesAvailable;
  }

  getLanguage() {
    return this.languageService.getCurrentLanguage();
  }
}
