import { BasePopupComponent } from '@/abstracts/base-components/base-popup/base-popup.component';
import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { User } from '@/models/auth/user';
import { Observable } from 'rxjs';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import { Holiday } from '@/models/features/lookups/holiday/holiday';
import { Region } from '@/models/features/lookups/region/region';
import { HolidayService } from '@/services/features/lookups/holiday.service';
import { AlertService } from '@/services/shared/alert.service';
import { ValidationMessagesComponent } from '@/views/shared/validation-messages/validation-messages.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { RequiredMarkerDirective } from '../../../../../directives/required-marker.directive';
import { CustomValidators } from '@/validators/custom-validators';
import { ViewModeEnum } from '@/enums/view-mode-enum';

@Component({
  selector: 'app-holidays-popup',
  imports: [
    InputTextModule,
    ReactiveFormsModule,
    RequiredMarkerDirective,
    TranslatePipe,
    ValidationMessagesComponent,
    DatePickerModule,
  ],

  templateUrl: './holidays-popup.component.html',
  styleUrl: './holidays-popup.component.scss',
})
export class HolidaysPopupComponent extends BasePopupComponent<Holiday> implements OnInit {
  declare model: Holiday;
  declare form: FormGroup;
  alertService = inject(AlertService);
  service = inject(HolidayService);
  fb = inject(FormBuilder);
  minDate: Date | null = null;
  declare viewMode: ViewModeEnum;
  isCreateMode = false;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    super();
  }

  get   nameArControl() {
    return this.form.get('nameAr') as FormControl;
  }

  get nameEnControl() {
    return this.form.get('nameEn') as FormControl;
  }
  get startDateControl(): FormControl {
    return this.form.get('startDate') as FormControl;
  }

  get endDateControl(): FormControl {
    return this.form.get('endDate') as FormControl;
  }
  get notesControl(): FormControl {
    return this.form.get('notes') as FormControl;
  }
  get Control() {
    return this.form.get('nameEn') as FormControl;
  }
  override saveFail(error: Error): void {
    // logic after error if there
  }

  override prepareModel(model: Holiday, form: FormGroup): Holiday | Observable<Holiday> {
    this.model = Object.assign(model, { ...form.value });
    return this.model;
  }

  override initPopup() {
    this.model = this.data.model;
    this.viewMode = this.data.viewMode;
    this.isCreateMode = this.viewMode == ViewModeEnum.CREATE;
  }

  override buildForm() {
    this.form = this.fb.group(this.model.buildForm(), {
      validators: [CustomValidators.startBeforeEnd('startDate', 'endDate')],
    });
  }

  beforeSave(model: Holiday, form: FormGroup) {
    // manipulation before save
    return form.valid;
  }

  afterSave() {
    const successObject = { messages: ['COMMON.SAVED_SUCCESSFULLY'] };
    this.alertService.showSuccessMessage(successObject);
  }

  getRegionOptionName() {
    return this.languageService.getCurrentLanguage() == LANGUAGE_ENUM.ENGLISH ? 'nameEn' : 'nameAr';
  }
}
