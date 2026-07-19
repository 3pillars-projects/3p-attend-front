import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasePopupComponent } from '@/abstracts/base-components/base-popup/base-popup.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AlertService } from '@/services/shared/alert.service';
import { DIALOG_ENUM } from '@/enums/dialog-enum';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import { Select } from 'primeng/select';
import { Observable, of } from 'rxjs';

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
  leaveTypes: any[] = [];

  override initPopup(): void {
    this.lang = this.translateService.currentLang;
    this.translateService.onLangChange.subscribe((event) => {
      this.lang = event.lang;
    });

    if (this.data && this.data.leavesBalance) {
      const leaves = this.data.leavesBalance;
      this.leaveTypes = [
        ...(leaves.annualLeaves || []),
        ...(leaves.limitedLeaves || []),
      ];
    }
  }

  override buildForm(): void {
    this.form = this.fb.group({
      leaveType: [null]
    });
  }

  getLookupLabelKey() {
    return this.lang === 'en' ? 'nameEn' : 'nameAr';
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
