import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePicker } from 'primeng/datepicker';
import { Textarea } from 'primeng/textarea';
import { TranslateModule } from '@ngx-translate/core';
import { Leave } from '@/models/features/business/leave/leave';
import { CancelationRequest } from '@/models/features/business/leave-cancelation/cancelation-request';
import { CancelationRequestService } from '@/services/features/business/cancelation-request.service';
import { AlertService } from '@/services/shared/alert.service';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import { LanguageService } from '@/services/shared/language.service';
import { DIALOG_ENUM } from '@/enums/dialog-enum';
import { toDateOnly, markFormGroupTouched } from '@/utils/general-helper';
import { Subject, of } from 'rxjs';
import { ValidationMessagesComponent } from '@/views/shared/validation-messages/validation-messages.component';
import { switchMap, filter, exhaustMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-add-cancel-leave-request',
  standalone: true,
  imports: [
    DatePicker,
    Textarea,
    CommonModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    ValidationMessagesComponent,
  ],
  templateUrl: './add-cancel-leave-request.component.html',
  styleUrl: './add-cancel-leave-request.component.scss',
})
export class AddCancelLeaveRequestComponent implements OnInit {
  dialogRef = inject(MatDialogRef<AddCancelLeaveRequestComponent>);
  data = inject(MAT_DIALOG_DATA);

  cancelationService = inject(CancelationRequestService);
  alertService = inject(AlertService);
  languageService = inject(LanguageService);
  fb = inject(FormBuilder);

  form!: FormGroup;

  model: Leave = new Leave();
  cancelationModel: CancelationRequest = new CancelationRequest();
  languageEnum = LANGUAGE_ENUM;

  private save$ = new Subject<void>();

  get dateFromControl(): AbstractControl {
    return this.form.get('dateFrom')!;
  }

  get dateToControl(): AbstractControl {
    return this.form.get('dateTo')!;
  }

  get noteControl(): AbstractControl {
    return this.form.get('note')!;
  }

  ngOnInit() {
    if (this.data && this.data.model) {
      this.model = Object.assign(new Leave(), this.data.model);
    }
    this.buildForm();
    this.listenToSave();
  }

  private buildForm() {
    this.form = this.fb.group(this.cancelationModel.buildForm());
    // Default cancel window to same dates as leave
    this.form.patchValue({
      dateFrom: this.model.dateFrom ? new Date(this.model.dateFrom) : null,
      dateTo: this.model.dateTo ? new Date(this.model.dateTo) : null,
      fkLeaveId: this.model.id,
    });
  }

  private prepareModel(): CancelationRequest {
    const value = { ...this.form.value };
    if (value.dateFrom) value.dateFrom = toDateOnly(value.dateFrom);
    if (value.dateTo) value.dateTo = toDateOnly(value.dateTo);

    const prepared = Object.assign(this.cancelationModel, value) as CancelationRequest;
    delete (prepared as any).$$__service_name__$$;
    delete (prepared as any).status;
    delete (prepared as any).requireHRAction;
    return prepared;
  }

  private listenToSave() {
    this.save$
      .pipe(
        // Validate before proceeding
        switchMap(() => {
          if (this.form.invalid) {
            markFormGroupTouched(this.form);
            return of(null);
          }
          return of(this.prepareModel());
        })
      )
      .pipe(filter((model) => model !== null))
      .pipe(
        exhaustMap((model) =>
          this.cancelationService.requestLeaveCancelationByManager(model!).pipe(
            catchError((error) => {
              this.saveFail(error);
              return of(null);
            })
          )
        )
      )
      .pipe(filter((result) => result !== null))
      .subscribe(() => {
        this.dialogRef.close(DIALOG_ENUM.OK);
      });
  }

  private saveFail(error: unknown) {}

  getLanguage() {
    return this.languageService.getCurrentLanguage();
  }

  submit() {
    this.save$.next();
  }

  close() {
    this.dialogRef.close(DIALOG_ENUM.CANCEL);
  }
}
