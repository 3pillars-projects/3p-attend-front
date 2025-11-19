import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-permission-request-popup',
  imports: [TableModule],
  templateUrl: './permission-request-popup.component.html',
  styleUrl: './permission-request-popup.component.scss',
})
export class PermissionRequestPopupComponent {
  attendance!: any[];
  ngOnInit() {
    this.attendance = [{}];
  }
}
