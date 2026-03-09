import { DIALOG_ENUM } from '@/enums/dialog-enum';
import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Textarea } from 'primeng/textarea';
import { AddCancelLeaveRequestComponent } from '../add-cancel-leave-request/add-cancel-leave-request.component';

@Component({
  selector: 'app-view-leave-request',
  imports: [Textarea],
  templateUrl: './view-leave-request.component.html',
  styleUrl: './view-leave-request.component.scss',
})
export class ViewLeaveRequestComponent {
  dialogSize = {
    width: '100%',
    maxWidth: '1024px',
  };

  matDialog = inject(MatDialog);
  cancelLeaveRequest(model?: any) {
    let dialogConfig: MatDialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      model: model,
    };
    dialogConfig.width = this.dialogSize.width;
    dialogConfig.maxWidth = this.dialogSize.maxWidth;
    const dialogRef = this.matDialog.open(AddCancelLeaveRequestComponent as any, dialogConfig);

    return dialogRef.afterClosed().subscribe((result: DIALOG_ENUM) => {
      console.log('closed');
    });
  }
}
