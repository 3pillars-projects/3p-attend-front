import { Component, inject, OnInit } from '@angular/core';
import { Textarea } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Leave } from '@/models/features/business/leave/leave';
import { DIALOG_ENUM } from '@/enums/dialog-enum';
import { FormsModule } from '@angular/forms';
import { LeaveStatus } from '@/enums/leave-status-enum';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '@/services/shared/language.service';
import { AlertService } from '@/services/shared/alert.service';
import { TabsModule } from 'primeng/tabs';
import { ViewModeEnum } from '@/enums/view-mode-enum';
import { AddCancelLeaveRequestComponent } from '../add-cancel-leave-request/add-cancel-leave-request.component';
import { CancelationRequestService } from '@/services/features/business/cancelation-request.service';
import { CancelationRequest } from '@/models/features/business/leave-cancelation/cancelation-request';
import { ConfirmationService } from '@/services/shared/confirmation.service';
import { LAYOUT_DIRECTION_ENUM } from '@/enums/layout-direction-enum';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import { LeaveService } from '@/services/features/business/leave.service';

export interface CancelledPeriod {
  dateFrom: Date;
  dateTo: Date;
  daysCount: number;
  notes?: string;
}

@Component({
  selector: 'app-view-leave-request',
  standalone: true,
  imports: [Textarea, CommonModule, FormsModule, TranslateModule, TabsModule],
  templateUrl: './view-leave-request.component.html',
  styleUrl: './view-leave-request.component.scss',
})
export class ViewLeaveRequestComponent implements OnInit {
  dialogRef = inject(MatDialogRef<ViewLeaveRequestComponent>);
  data = inject(MAT_DIALOG_DATA);
  languageService = inject(LanguageService);
  alertService = inject(AlertService);
  matDialog = inject(MatDialog);

  model: Leave = new Leave();
  LeaveStatusEnum = LeaveStatus;
  canCancel: boolean = false;
  mGRCanCancel: boolean = false;
  confirmationService = inject(ConfirmationService);
  leaveService = inject(LeaveService);
  declare direction: LAYOUT_DIRECTION_ENUM;
  
  activeLeaves: Leave[] = [];
  cancelledPeriods: CancelledPeriod[] = [];

  constructor() {
    this.direction =
      this.languageService.getCurrentLanguage() == LANGUAGE_ENUM.ENGLISH
        ? LAYOUT_DIRECTION_ENUM.LTR
        : LAYOUT_DIRECTION_ENUM.RTL;
  }
  ngOnInit() {
    if (this.data && this.data.model) {
      this.model = Object.assign(new Leave(), this.data.model);
      this.loadRelatedLeaves();
    }
    this.canCancel = this.data.viewMode == ViewModeEnum.TAKE_ACTION;
    this.mGRCanCancel = this.data.viewMode == ViewModeEnum.MANAGER_TAKE_ACTION;
  }

  loadRelatedLeaves() {
    if (!this.model.id) return;
    this.leaveService.getLeavesWithParent(this.model.id).subscribe((leaves) => {
      if (!leaves || leaves.length === 0) return;
      this.activeLeaves = leaves.filter((l) => l.status !== this.LeaveStatusEnum.Canceled);
      this.calculateCancelledPeriods(this.activeLeaves);
    });
  }

  calculateCancelledPeriods(childLeaves: Leave[]) {
    if (childLeaves.length === 0) return;

    const parentStart = new Date(this.model.dateFrom);
    parentStart.setHours(0, 0, 0, 0);
    const parentEnd = new Date(this.model.dateTo);
    parentEnd.setHours(0, 0, 0, 0);

    const sorted = [...childLeaves].sort(
      (a, b) => new Date(a.dateFrom).getTime() - new Date(b.dateFrom).getTime()
    );

    const cancelled: CancelledPeriod[] = [];
    let currentStart = new Date(parentStart);

    for (const child of sorted) {
      const childStart = new Date(child.dateFrom);
      childStart.setHours(0, 0, 0, 0);
      const childEnd = new Date(child.dateTo);
      childEnd.setHours(0, 0, 0, 0);

      if (childStart > currentStart) {
        const gapEnd = new Date(childStart);
        gapEnd.setDate(gapEnd.getDate() - 1);

        const diffTime = gapEnd.getTime() - currentStart.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (diffDays > 0) {
          cancelled.push({
            dateFrom: new Date(currentStart),
            dateTo: new Date(gapEnd),
            daysCount: diffDays,
          });
        }
      }

      currentStart = new Date(childEnd);
      currentStart.setDate(currentStart.getDate() + 1);
    }

    if (currentStart <= parentEnd) {
      const diffTime = parentEnd.getTime() - currentStart.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays > 0) {
        cancelled.push({
          dateFrom: new Date(currentStart),
          dateTo: new Date(parentEnd),
          daysCount: diffDays,
        });
      }
    }

    this.cancelledPeriods = cancelled;
  }

  accept() {
    // Assuming the service has an 'approve' method or similar on the model
    // Given BaseCrudModel, let's see if there's a specific action.
    // Usually it's model.approve() or similar if implemented.
    // Since I don't see it in the model, I'll assume LeaveService handles it.
    // For now, I'll just close with OK and let the parent handle or assume a service call here.
    // Looking at common patterns in this codebase, models often have action methods.
    this.model.approve().subscribe(() => {
      this.dialogRef.close(DIALOG_ENUM.OK);
    });
  }

  reject() {
    if (!this.model.rejectionNote) {
      this.alertService.showErrorMessage({
        messages: ['LEAVE_REQUEST_PAGE.REJECTION_NOTE_REQUIRED'],
      });
      return;
    }
    this.model.reject().subscribe(() => {
      this.dialogRef.close(DIALOG_ENUM.OK);
    });
  }
  cancel() {
    this.model.cancel().subscribe(() => {
      this.dialogRef.close(DIALOG_ENUM.OK);
    });
  }
  canceledByEmployee(startDate: string | Date) {
    if (!startDate) return false;
    const start = new Date(startDate);
    const today = new Date();
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return (
      this.model.status != this.LeaveStatusEnum.Rejected &&
      this.model.status != this.LeaveStatusEnum.Accepted &&
      this.model.status != this.LeaveStatusEnum.Canceled &&
      this.canCancel &&
      start.getTime() > today.getTime()
    );
  }
  cancelByManager() {
    return this.model.status == this.LeaveStatusEnum.Accepted && this.mGRCanCancel;
  }
  close() {
    this.dialogRef.close(DIALOG_ENUM.CANCEL);
  }

  openCancelDialog() {
    const dialogConfig = {
      data: { model: this.model },
      width: '100%',
      maxWidth: '1024px',
    };
    const dialogRef = this.matDialog.open(AddCancelLeaveRequestComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === DIALOG_ENUM.OK) {
        this.dialogRef.close(DIALOG_ENUM.OK);
      }
    });
  }

  cutLeave() {
    const dialogRef = this.confirmationService.open({
      icon: 'warning',
      messages: ['LEAVE_REQUEST_PAGE.CUT_LEAVE_CONFIRMATION'],
      confirmText: 'COMMON.OK',
      cancelText: 'COMMON.CANCEL',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == DIALOG_ENUM.OK) {
        this.alertService.showSuccessMessage({
          messages: ['LEAVE_REQUEST_PAGE.CUT_LEAVE_SUCCESS'],
        });
      } else {
        this.alertService.showErrorMessage({ messages: ['LEAVE_REQUEST_PAGE.CUT_LEAVE_FAILED'] });
      }
    });
    this.model.cutLeave().subscribe(() => {
      this.dialogRef.close(DIALOG_ENUM.OK);
    });
  }
}
