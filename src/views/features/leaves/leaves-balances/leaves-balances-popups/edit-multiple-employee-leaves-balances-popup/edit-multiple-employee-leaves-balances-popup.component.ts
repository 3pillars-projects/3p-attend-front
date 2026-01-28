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
import { DIALOG_ENUM } from '@/enums/dialog-enum';

@Component({
  selector: 'app-edit-multiple-employee-leaves-balances-popup',
  imports: [
    InputNumberModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    TranslatePipe,
    ValidationMessagesComponent,
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
  employees: any[] = [];
  lang!: string;

  override initPopup(): void {
    if (this.data) {
      this.employees = this.data.employees || [];
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
      operation: ['ADD', [Validators.required]], // ADD or DEDUCT
      value: [null, [Validators.required, Validators.min(1)]],
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
      employeeIds: this.employees.map((e) => e.id),
    };
  }

  override close() {
    this.dialogRef.close();
  }
}
