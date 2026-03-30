import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { CancelationRequest } from '@/models/features/business/leave-cancelation/cancelation-request';
import { CancelationRequestStatus } from '@/enums/cancelation-request-status-enum';
import { LanguageService } from '@/services/shared/language.service';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import { CANCELATION_STATUS_OPTIONS } from '@/models/shared/cancelation-status-option';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { CancelationRequestService } from '@/services/features/business/cancelation-request.service';
import { AlertService } from '@/services/shared/alert.service';
import { ViewModeEnum } from '@/enums/view-mode-enum';
import { AuthService } from '@/services/auth/auth.service';
import { DIALOG_ENUM } from '@/enums/dialog-enum';

@Component({
  selector: 'app-view-cancel-leave-request',
  standalone: true,
  imports: [CommonModule, MatDialogModule, TranslateModule, FormsModule, TextareaModule],
  templateUrl: './view-cancel-leave-request.component.html',
  styleUrl: './view-cancel-leave-request.component.scss',
})
export class ViewCancelLeaveRequestComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<ViewCancelLeaveRequestComponent>);
  langService = inject(LanguageService);
  cancelationRequestService = inject(CancelationRequestService);
  alert = inject(AlertService);
  authService = inject(AuthService);

  model: CancelationRequest = this.data.model;
  viewMode: ViewModeEnum = this.data.viewMode;
  statusOptions = CANCELATION_STATUS_OPTIONS;
  rejectionNote: string = '';
  languageEnum = LANGUAGE_ENUM;
  ngOnInit(): void {}

  get isAr(): boolean {
    return this.langService.getCurrentLanguage() === LANGUAGE_ENUM.ARABIC;
  }

  get optionLabel(): string {
    return this.isAr ? 'nameAr' : 'nameEn';
  }

  close(): void {
    this.dialogRef.close();
  }

  approve(): void {
    this.cancelationRequestService.approveCancelation(this.model.id).subscribe(() => {
      this.alert.showSuccessMessage({});
      this.dialogRef.close(DIALOG_ENUM.OK);
    });
  }

  reject(): void {
    if (!this.rejectionNote) {
      this.alert.showErrorMessage({
        messages: ['COMMON.PLEASE_ENTER_REJECTION_NOTE'],
      });
      return;
    }
    this.cancelationRequestService
      .rejectCancelation({
        cancelationRequestId: this.model.id,
        rejectionNote: this.rejectionNote,
      })
      .subscribe(() => {
        this.alert.showSuccessMessage({});
        this.dialogRef.close(DIALOG_ENUM.OK);
      });
  }

  getStatusName(status: CancelationRequestStatus): string {
    const option = this.statusOptions.find((s) => s.id === status);
    return option ? option[this.optionLabel as keyof typeof option] : '';
  }

  getStatusClass(status: CancelationRequestStatus): string {
    switch (status) {
      case CancelationRequestStatus.New:
        return 'bg-[#eff8ff] text-[#1849a9]';
      case CancelationRequestStatus.Accepted:
        return 'bg-[#ecfdf3] text-[#085d3a]';
      case CancelationRequestStatus.RejectedByEmployee:
      case CancelationRequestStatus.RejectedByHR:
        return 'bg-[#fef3f2] text-[#912018]';
      case CancelationRequestStatus.EmployeeAcceptance:
        return 'bg-[#fffaeb] text-[#93370d]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusDotClass(status: CancelationRequestStatus): string {
    switch (status) {
      case CancelationRequestStatus.New:
        return 'bg-[#1849a9]';
      case CancelationRequestStatus.Accepted:
        return 'bg-[#085d3a]';
      case CancelationRequestStatus.RejectedByEmployee:
      case CancelationRequestStatus.RejectedByHR:
        return 'bg-[#912018]';
      case CancelationRequestStatus.EmployeeAcceptance:
        return 'bg-[#93370d]';
      default:
        return 'bg-gray-400';
    }
  }
}
