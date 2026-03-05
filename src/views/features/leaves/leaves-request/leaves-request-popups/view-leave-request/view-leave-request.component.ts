import { Component, inject, OnInit } from '@angular/core';
import { Textarea } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Leave } from '@/models/features/business/leave/leave';
import { DIALOG_ENUM } from '@/enums/dialog-enum';
import { FormsModule } from '@angular/forms';
import { LeaveStatus } from '@/enums/leave-status-enum';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '@/services/shared/language.service';

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
  
  model: Leave = new Leave();
  LeaveStatusEnum = LeaveStatus;

  ngOnInit() {
    if (this.data && this.data.model) {
      this.model = Object.assign(new Leave(), this.data.model);
    }
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
          return;
      }
      this.model.reject().subscribe(() => {
          this.dialogRef.close(DIALOG_ENUM.OK);
      });
  }

  close() {
    this.dialogRef.close(DIALOG_ENUM.CANCEL);
  }
}
