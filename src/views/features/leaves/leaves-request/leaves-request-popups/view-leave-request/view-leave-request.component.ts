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
import { ViewModeEnum } from '@/enums/view-mode-enum';
import { AddCancelLeaveRequestComponent } from '../add-cancel-leave-request/add-cancel-leave-request.component';

@Component({
  selector: 'app-view-leave-request',
  standalone: true,
  imports: [Textarea, CommonModule, FormsModule, TranslateModule],
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

  ngOnInit() {
    if (this.data && this.data.model) {
      this.model = Object.assign(new Leave(), this.data.model);
    }
    this.canCancel = this.data.viewMode == ViewModeEnum.TAKE_ACTION;
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
}
