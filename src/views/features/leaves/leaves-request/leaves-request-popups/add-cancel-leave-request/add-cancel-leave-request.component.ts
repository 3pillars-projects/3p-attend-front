import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
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
import { toDateOnly } from '@/utils/general-helper';
import { Subject, of } from 'rxjs';
import { switchMap, filter, exhaustMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-add-cancel-leave-request',
  standalone: true,
  imports: [DatePicker, Textarea, CommonModule, FormsModule, TranslateModule],

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

  dateFrom?: Date;
  dateTo?: Date;
  note: string = '';

  private save$ = new Subject<void>();

  ngOnInit() {
    if (this.data && this.data.model) {
      this.model = Object.assign(new Leave(), this.data.model);
      // default cancel window to same dates as leave
      this.dateFrom = this.model.dateFrom ? new Date(this.model.dateFrom) : undefined;
      this.dateTo = this.model.dateTo ? new Date(this.model.dateTo) : undefined;
    }
    this.buildForm();
    this.listenToSave();
  }

  private buildForm() {
    this.form = this.fb.group(this.cancelationModel.buildForm());
  }

  private prepareModel(): CancelationRequest {
    this.form.patchValue({
      fkLeaveId: this.model.id!,
      dateFrom: toDateOnly(this.dateFrom!),
      dateTo: toDateOnly(this.dateTo!),
      note: this.note,
    });
    return Object.assign(this.cancelationModel, this.form.value) as CancelationRequest;
  }

  private listenToSave() {
    this.save$
      .pipe(
        // Validate before proceeding
        switchMap(() => {
          if (!this.dateFrom || !this.dateTo) {
            this.alertService.showErrorMessage({ messages: ['COMMON.FIELD_REQUIRED'] });
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

  private saveFail(error: unknown) {
    console.error('Cancel leave request failed:', error);
  }

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
