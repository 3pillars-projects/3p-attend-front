import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { WeekDaysEnum } from '@/enums/week-days-enum';
import { BasePopupComponent } from '@/abstracts/base-components/base-popup/base-popup.component';
import EmployeeShift from '@/models/features/lookups/work-shifts/employee-shift';
import { formatTimeTo12Hour, weekDays } from '@/utils/general-helper';
import { WorkDaysSetting } from '@/models/features/setting/work-days-setting';
import { LANGUAGE_ENUM } from '@/enums/language-enum';

@Component({
  selector: 'app-work-days-popup',
  imports: [TranslatePipe],
  templateUrl: './work-days-popup.component.html',
})
export class WorkDaysPopupComponent extends BasePopupComponent<EmployeeShift> implements OnInit {
  model!: EmployeeShift;
  form!: FormGroup;
  translateService = inject(TranslateService);
  workDays: WorkDaysSetting = new WorkDaysSetting();
  displayDays: { labelKey: string; value: WeekDaysEnum; isSelected: boolean }[] = [];

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA)
    public data: { model: EmployeeShift; lookups: { defaultWorkDays: WorkDaysSetting[] } }
  ) {
    super();
    this.model = data.model;
  }

  initPopup(): void {
    this.workDays = this.data.lookups?.defaultWorkDays[0]!;
    this.prepareDisplayDays();
  }

  buildForm(): void {}

  beforeSave(model: EmployeeShift, form: FormGroup): boolean {
    return true;
  }

  prepareModel(model: EmployeeShift, form: FormGroup): EmployeeShift {
    return model;
  }

  saveFail(error: Error): void {}

  afterSave(model: EmployeeShift, dialogRef: any): void {}

  isCurrentLanguageEnglish() {
    return this.languageService.getCurrentLanguage() === LANGUAGE_ENUM.ENGLISH;
  }

  formatTime(timestamp?: string) {
    if (!timestamp) return '-';
    const locale = this.isCurrentLanguageEnglish() ? 'en-US' : 'ar-EG';
    return formatTimeTo12Hour(timestamp, locale);
  }

  private prepareDisplayDays(): void {
    let workingDayValues: number[] = [];

    if (this.model.employeeWorkingDays) {
      // case 1: from model
      workingDayValues = this.model.employeeWorkingDays
        .split(',')
        .map((day) => parseInt(day.trim(), 10))
        .filter((day) => !isNaN(day));
    } else {
      // case 2: fallback to workDays settings
      workingDayValues = weekDays
        .filter((day) => {
          switch (day.value) {
            case WeekDaysEnum.SUNDAY:
              return this.workDays.sunday;
            case WeekDaysEnum.MONDAY:
              return this.workDays.monday;
            case WeekDaysEnum.TUESDAY:
              return this.workDays.tuesday;
            case WeekDaysEnum.WEDNESDAY:
              return this.workDays.wednesday;
            case WeekDaysEnum.THURSDAY:
              return this.workDays.thursday;
            case WeekDaysEnum.FRIDAY:
              return this.workDays.friday;
            case WeekDaysEnum.SATURDAY:
              return this.workDays.saturday;
            default:
              return false;
          }
        })
        .map((day) => day.value);
    }

    // build display list
    this.displayDays = weekDays
      .filter((day) => workingDayValues.includes(day.value))
      .map((day) => ({
        ...day,
        isSelected: true,
      }));
  }
  getDayLabel(labelKey: string): string {
    return this.translateService.instant(labelKey);
  }
}
