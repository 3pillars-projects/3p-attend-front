import { Component, inject, OnInit } from '@angular/core';
import {
  catchError,
  exhaustMap,
  filter,
  isObservable,
  of,
  distinctUntilChanged,
  switchMap,
} from 'rxjs';
import { DIALOG_ENUM } from '@/enums/dialog-enum';
import { markFormGroupTouched } from '@/utils/general-helper';
import { EmployeeBalanceService } from '@/services/features/business/employee-balance.service';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { BasePopupComponent } from '@/abstracts/base-components/base-popup/base-popup.component';
import { EmployeeLeaveBalance } from '@/models/features/business/leaves-balances/employee-leave-balance';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlertService } from '@/services/shared/alert.service';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ViewModeEnum } from '@/enums/view-mode-enum';
import { ValidationMessagesComponent } from '@/views/shared/validation-messages/validation-messages.component';
import { BulkUpdateBalancesRequest } from '@/models/features/business/leaves-balances/bulk-update-balances-request';

@Component({
  selector: 'app-edit-employee-leaves-balances-popup',
  imports: [
    TabsModule,
    SelectModule,
    InputNumberModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    TranslatePipe,
    ValidationMessagesComponent,
  ],
  templateUrl: './edit-employee-leaves-balances-popup.component.html',
  styleUrl: './edit-employee-leaves-balances-popup.component.scss',
})
export class EditEmployeeLeavesBalancesPopupComponent
  extends BasePopupComponent<EmployeeLeaveBalance>
  implements OnInit
{
  override model!: EmployeeLeaveBalance;
  override form!: FormGroup;
  data = inject(MAT_DIALOG_DATA);
  fb = inject(FormBuilder);
  alertService = inject(AlertService);
  translateService = inject(TranslateService);
  employeeBalanceService = inject(EmployeeBalanceService);
  viewMode!: ViewModeEnum;
  lang!: string;

  override initPopup(): void {
    if (this.data.model instanceof EmployeeLeaveBalance) {
      this.model = this.data.model;
    } else {
      this.model = Object.assign(new EmployeeLeaveBalance(), this.data.model);
    }
    this.viewMode = this.data.viewMode;
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
          const payload: BulkUpdateBalancesRequest = {
            fkUserId: model.employeeId,
            annualLeaves: model.annualLeaves,
            limitedTimesLeaves: model.limitedTimesLeaves,
          };
          // Use the specific service method for bulk update
          return this.employeeBalanceService.bulkUpdateUserBalances(payload).pipe(
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
      .subscribe((model: EmployeeLeaveBalance) => {
        this.afterSave(model);
        this.dialogRef.close(DIALOG_ENUM.OK);
      });
  }

  override buildForm(): void {
    this.form = this.model.buildForm(this.fb);
    this.listenToBalanceChanges();
  }

  listenToBalanceChanges() {
    this.getAnnualLeavesArray().controls.forEach((control) => {
      const totalControl = control.get('totalBalance');
      const usedControl = control.get('usedBalance');
      const remainingControl = control.get('remainingBalance');

      if (totalControl && usedControl && remainingControl) {
        totalControl.valueChanges.pipe(distinctUntilChanged()).subscribe((total) => {
          const used = usedControl.value || 0;
          const remaining = (total || 0) - used;
          remainingControl.setValue(remaining < 0 ? 0 : remaining, { emitEvent: false });
        });
      }
    });

    this.getLimitedTimesLeavesArray().controls.forEach((control) => {
      const totalControl = control.get('totalTimesAvailable');
      const usedControl = control.get('timesUsed');
      const remainingControl = control.get('remainingTimes');

      if (totalControl && usedControl && remainingControl) {
        totalControl.valueChanges.pipe(distinctUntilChanged()).subscribe((total) => {
          const used = usedControl.value || 0;
          const remaining = (total || 0) - used;
          remainingControl.setValue(remaining < 0 ? 0 : remaining, { emitEvent: false });
        });
      }
    });
  }

  getAnnualLeavesArray() {
    return this.form.get('annualLeaves') as FormArray;
  }

  getLimitedTimesLeavesArray() {
    return this.form.get('limitedTimesLeaves') as FormArray;
  }

  getControl(control: any, name: string) {
    return control.get(name) as FormControl;
  }

  override saveFail(error: Error): void {}

  override afterSave(model: EmployeeLeaveBalance): void {
    const successObject = { messages: ['COMMON.DID_UPDATE_SUCCESSFULLY'] };
    // or use translated 'UPDATED_SUCCESSFULLY' if available directly,
    // usually AlertService takes a key or object. BasePopup uses translation key array.
    // 'COMMON.UPDATED_SUCCESSFULLY' exists in ar.json.
    this.alertService.showSuccessMessage({ messages: ['COMMON.UPDATED_SUCCESSFULLY'] });
  }

  override beforeSave(model: EmployeeLeaveBalance, form: FormGroup): boolean {
    return form.valid;
  }

  override prepareModel(model: EmployeeLeaveBalance, form: FormGroup): EmployeeLeaveBalance {
    // We need to map the form values back to the model structure
    const formValue = form.getRawValue();
    const updatedModel = new EmployeeLeaveBalance();
    Object.assign(updatedModel, model);

    // Update inner lists
    // Note: The backend likely expects the full object or specific DTOs.
    // BaseCrudService usually sends what prepareModel returns.
    // For nested arrays, we should make sure we merge correctly if needed.
    // Here we just replace the arrays with form values as they map 1:1.
    updatedModel.annualLeaves = formValue.annualLeaves;
    updatedModel.limitedTimesLeaves = formValue.limitedTimesLeaves;

    return updatedModel;
  }

  override close() {
    this.dialogRef.close();
  }
}
