import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BasePopupComponent } from '@/abstracts/base-components/base-popup/base-popup.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AlertService } from '@/services/shared/alert.service';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import { Select } from 'primeng/select';
import { BaseLookupModel } from '@/models/features/lookups/base-lookup-model';
import { markFormGroupTouched } from '@/utils/general-helper';

@Component({
  selector: 'app-select-holiday',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    TranslatePipe,
    Select,
  ],
  templateUrl: './select-holiday.component.html',
  styleUrl: './select-holiday.component.scss'
})
export class SelectHolidayComponent extends BasePopupComponent<any> implements OnInit {
  override model: any = {};
  override form!: FormGroup;
  data = inject(MAT_DIALOG_DATA);
  fb = inject(FormBuilder);
  alertService = inject(AlertService);
  translateService = inject(TranslateService);
  lang!: string;
  leaveTypes: BaseLookupModel[] = [];
  private annualLeaveIds = new Set<number>();

  override initPopup(): void {
    this.lang = this.translateService.currentLang;
    this.translateService.onLangChange.subscribe((event) => {
      this.lang = event.lang;
    });

    if (this.data && this.data.leavesBalance) {
      const leaves = this.data.leavesBalance;
      const annualLeaves: BaseLookupModel[] = leaves.annualLeaves || [];
      const limitedLeaves: BaseLookupModel[] = leaves.limitedLeaves || [];
      this.annualLeaveIds = new Set(
        annualLeaves.map((leave) => leave.id!).filter((id) => id != null)
      );
      this.leaveTypes = [...annualLeaves, ...limitedLeaves];
    }
  }

  override buildForm(): void {
    this.form = this.fb.group({
      leaveType: [null, [Validators.required]],
    });
  }

  // A leave type has been picked in the dropdown: close the dialog and hand the
  // selected leave (and whether it is an annual leave) back to the caller so it
  // can open the bulk-edit balances popup for that leave.
  override listenToSave(): void {
    this.save$.subscribe(() => {
      if (this.form.invalid) {
        markFormGroupTouched(this.form);
        return;
      }

      const leaveType: BaseLookupModel = this.form.value.leaveType;
      const isAnnualLeave = this.annualLeaveIds.has(leaveType.id!);
      this.dialogRef.close({ leaveType, isAnnualLeave });
    });
  }

  getLookupLabelKey() {
    return this.lang === LANGUAGE_ENUM.ENGLISH ? 'nameEn' : 'nameAr';
  }

  override saveFail(error: Error): void {}

  override afterSave(model: any, dialogRef: MatDialogRef<any, any>): void {}

  override beforeSave(model: any, form: FormGroup): boolean {
    return form.valid;
  }

  override prepareModel(model: any, form: FormGroup): any {
    return form.getRawValue();
  }
}
