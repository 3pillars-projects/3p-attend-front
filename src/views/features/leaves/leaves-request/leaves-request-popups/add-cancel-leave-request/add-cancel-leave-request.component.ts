import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePicker } from 'primeng/datepicker';
import { Textarea } from 'primeng/textarea';
import { TranslateModule } from '@ngx-translate/core';
import { Leave } from '@/models/features/business/leave/leave';
import { CancelationRequestService } from '@/services/features/business/cancelation-request.service';
import { AlertService } from '@/services/shared/alert.service';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import { LanguageService } from '@/services/shared/language.service';
import { DIALOG_ENUM } from '@/enums/dialog-enum';
import { toDateOnly } from '@/utils/general-helper';

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

  model: Leave = new Leave();
  languageEnum = LANGUAGE_ENUM;

  dateFrom?: Date;
  dateTo?: Date;
  note: string = '';

  ngOnInit() {
    if (this.data && this.data.model) {
      this.model = Object.assign(new Leave(), this.data.model);
      // default cancel window to same dates as leave
      this.dateFrom = this.model.dateFrom ? new Date(this.model.dateFrom) : undefined;
      this.dateTo = this.model.dateTo ? new Date(this.model.dateTo) : undefined;
    }
  }

  getLanguage() {
    return this.languageService.getCurrentLanguage();
  }

  submit() {
    if (!this.dateFrom || !this.dateTo) {
      this.alertService.showErrorMessage({
        messages: ['COMMON.FIELD_REQUIRED'],
      });
      return;
    }
    const payload = {
      fkLeaveId: this.model.id!,
      dateFrom: toDateOnly(this.dateFrom),
      dateTo: toDateOnly(this.dateTo),
      note: this.note,
    };
    this.cancelationService.requestLeaveCancelationByManager(payload).subscribe(() => {
      this.dialogRef.close(DIALOG_ENUM.OK);
    });
  }

  close() {
    this.dialogRef.close(DIALOG_ENUM.CANCEL);
  }
}
