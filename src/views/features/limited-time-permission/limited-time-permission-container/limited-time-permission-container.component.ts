import { Component, inject } from '@angular/core';
import { Breadcrumb } from 'primeng/breadcrumb';
import { TabsModule } from 'primeng/tabs';
import { MyLimitedTimePermissionListComponent } from '../my-limited-time-permission-list/my-limited-time-permission-list.component';
import { AllLimitedTimePermissionListComponent } from '../all-limited-time-permission-list/all-limited-time-permission-list.component';
import { MenuItem } from '@/models/shared/menu-item';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-limited-time-permission-container',
  imports: [
    Breadcrumb,
    TabsModule,
    MyLimitedTimePermissionListComponent,
    AllLimitedTimePermissionListComponent,
    TranslatePipe,
  ],
  templateUrl: './limited-time-permission-container.component.html',
  styleUrl: './limited-time-permission-container.component.scss',
})
export default class LimitedTimePermissionContainerComponent {
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  ngOnInit() {
    this.items = [{ label: 'لوحة المعلومات' }, { label: 'الاستئذانات' }];
    // Updated dummy data to match your Arabic table structure
  }
}
