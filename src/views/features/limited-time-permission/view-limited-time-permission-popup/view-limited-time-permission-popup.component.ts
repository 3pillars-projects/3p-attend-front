import { DIALOG_ENUM } from '@/enums/dialog-enum';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import { LAYOUT_DIRECTION_ENUM } from '@/enums/layout-direction-enum';
import { LIMITED_TIME_PERMISSION_STATUS_ENUM } from '@/enums/limited-time-permission-status-enum';
import { LimitedTimePermission } from '@/models/features/lookups/limited-time-permission/limited-time-permission';
import { AuthService } from '@/services/auth/auth.service';
import { LimitedTimePermissionService } from '@/services/features/lookups/limited-time-permission.service';
import { AlertService } from '@/services/shared/alert.service';
import { LanguageService } from '@/services/shared/language.service';
import { formatTimeTo12Hour } from '@/utils/general-helper';
import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-view-limited-time-permission-popup',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './view-limited-time-permission-popup.component.html',
  styleUrl: './view-limited-time-permission-popup.component.scss',
})
export class ViewLimitedTimePermissionPopupComponent implements OnInit {
  declare model: LimitedTimePermission;
  declare form: FormGroup;
  alertService = inject(AlertService);
  service = inject(LimitedTimePermissionService);
  fb = inject(FormBuilder);
  languageService = inject(LanguageService);
  dialogRef = inject(MatDialogRef);
  limitedTimePermissionStatusEnum = LIMITED_TIME_PERMISSION_STATUS_ENUM;
  declare direction: LAYOUT_DIRECTION_ENUM;
  authService = inject(AuthService);
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit() {
    this.model = this.data.model;
    this.setLayoutDirection();
  }

  private setLayoutDirection() {
    this.direction =
      this.languageService.getCurrentLanguage() == LANGUAGE_ENUM.ENGLISH
        ? LAYOUT_DIRECTION_ENUM.LTR
        : LAYOUT_DIRECTION_ENUM.RTL;
  }

  getPropertyName() {
    return this.languageService.getCurrentLanguage() == LANGUAGE_ENUM.ENGLISH ? 'nameEn' : 'nameAr';
  }

  acceptPermission() {
    this.service.acceptPermission(this.model.id).subscribe({
      next: (updatedPermission) => {
        this.model = updatedPermission; // optionally update local model
        this.dialogRef.close(DIALOG_ENUM.OK);
      },
      error: (err) => {
        this.dialogRef.close(DIALOG_ENUM.OK);
      },
    });
  }

  rejectPermission() {
    this.service.rejectPermission(this.model.id).subscribe({
      next: (updatedPermission) => {
        this.model = updatedPermission; // optionally update local model
        this.dialogRef.close(DIALOG_ENUM.OK);
      },
      error: (err) => {
        this.dialogRef.close(DIALOG_ENUM.OK);
      },
    });
  }

  requestCancel() {
    this.service.requestCancel(this.model.id).subscribe({
      next: (updatedPermission) => {
        this.model = updatedPermission; // optionally update local model
        this.dialogRef.close(DIALOG_ENUM.OK);
      },
      error: (err) => {
        this.dialogRef.close(DIALOG_ENUM.OK);
      },
    });
  }

  approveCancel() {
    this.service.approveCancel(this.model.id).subscribe({
      next: (updatedPermission) => {
        this.model = updatedPermission; // optionally update local model
        this.dialogRef.close(DIALOG_ENUM.OK);
      },
      error: (err) => {
        this.dialogRef.close(DIALOG_ENUM.OK);
      },
    });
  }

  rejectCancel() {
    this.service.rejectCancel(this.model.id).subscribe({
      next: (updatedPermission) => {
        this.model = updatedPermission; // optionally update local model
        this.dialogRef.close(DIALOG_ENUM.OK);
      },
      error: (err) => {
        this.dialogRef.close(DIALOG_ENUM.OK);
      },
    });
  }

  formatTime12HourFromDate(value?: Date | string): string {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
    return this.formatTime12Hour(timeString);
  }
  formatTime12Hour(timeString: string): string {
    if (!timeString) return '';
    const locale = this.isCurrentLanguageEnglish() ? 'en-US' : 'ar-EG';
    return formatTimeTo12Hour(timeString, locale);
  }

  isCurrentLanguageEnglish() {
    return this.languageService.getCurrentLanguage() == LANGUAGE_ENUM.ENGLISH;
  }
  close() {
    this.dialogRef.close();
  }

  get isAcceptedOrFirstAccepted(): boolean {
    return (
      this.model.fkStatusId === this.limitedTimePermissionStatusEnum.Accepted ||
      this.model.fkStatusId === this.limitedTimePermissionStatusEnum.FirstAccepted
    );
  }

  get canShowCancelApprovalButtons(): boolean {
    return (
      !!this.model.canTakeAction && !!this.model.isCancelRequested && this.isAcceptedOrFirstAccepted
    );
  }

  get canShowNormalApprovalButtons(): boolean {
    return (
      !!this.model.canTakeAction &&
      !this.model.isCancelRequested &&
      (this.model.fkStatusId === this.limitedTimePermissionStatusEnum.New ||
        this.model.fkStatusId === this.limitedTimePermissionStatusEnum.FirstAccepted)
    );
  }

  get canShowRequestCancelButton(): boolean {
    return (
      !!this.model.canRequestCancel &&
      !this.model.isCancelRequested &&
      this.isAcceptedOrFirstAccepted
    );
  }
}
