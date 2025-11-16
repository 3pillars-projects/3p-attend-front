import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';
import { MatDialogModule } from '@angular/material/dialog';
import { NotificationSetting } from '@/models/features/setting/notification-setting';
import { NotificationSettingService } from '@/services/features/setting/notification-setting.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { WorkDaysSetting } from '@/models/features/setting/work-days-setting';
import { weekDays } from '@/utils/general-helper';
import { WorkDaysSettingService } from '@/services/features/setting/work-days-setting.service';
import { WeekDaysEnum } from '@/enums/week-days-enum';
import { AlertService } from '@/services/shared/alert.service';
import { NOTIFICATIONS_SETTINGS_TABS_ENUM } from '@/enums/notifications-settings-tabs-enum';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-notification-channels',
  standalone: true,
  imports: [
    MatDialogModule,
    Breadcrumb,
    ReactiveFormsModule,
    TranslatePipe,
    TabsModule,
    RouterModule,
    Select
  ],
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss'],
})
export default class NotificationSettingsComponent implements OnInit, OnDestroy {
  $destroy: Subject<void> = new Subject<void>();
  fb: FormBuilder = inject(FormBuilder);
  service: NotificationSettingService = inject(NotificationSettingService);
  workDaysSettingService: WorkDaysSettingService = inject(WorkDaysSettingService);
  translateService: TranslateService = inject(TranslateService);
  route = inject(ActivatedRoute);
  alertService = inject(AlertService);
  breadcrumbs: MenuItem[] = [];
  home: MenuItem = this.setHomeItem();

  notificationSettingModel = new NotificationSetting();
  workDaysSettingModel = new WorkDaysSetting();
  notificationForm!: FormGroup;
  workDaysForm!: FormGroup;

  activeTab: NOTIFICATIONS_SETTINGS_TABS_ENUM = NOTIFICATIONS_SETTINGS_TABS_ENUM.NOTIFICATIONS_TAB;
  NOTIFICATIONS_SETTINGS_TABS_ENUM = NOTIFICATIONS_SETTINGS_TABS_ENUM;
  weekDays = weekDays;

  ngOnInit(): void {
    const data = this.route.snapshot.data['channel'];
    this.notificationSettingModel = data.notificationSetting;
    this.workDaysSettingModel = data.workDays;

    this.notificationForm = this.fb.group({
      ...this.notificationSettingModel.buildForm(),
    });

    this.workDaysForm = this.fb.group({
      ...this.workDaysSettingModel.buildForm(),
    });

    this.translateService.onLangChange.pipe(takeUntil(this.$destroy)).subscribe(() => {
      this.home = this.setHomeItem();
      this.breadcrumbs = [
        { label: this.translateService.instant('NOTIFICATION.GENERAL_SETTINGS') },
      ];
    });

    this.breadcrumbs = [{ label: this.translateService.instant('NOTIFICATION.GENERAL_SETTINGS') }];
  }

  setHomeItem(): MenuItem {
    return {
      label: this.translateService.instant('COMMON.HOME'),
      icon: 'pi pi-home',
      routerLink: '/home',
    };
  }

  getFormControlName(dayValue: WeekDaysEnum): string {
    return WeekDaysEnum[dayValue].toLowerCase();
  }
  afterSave() {
    const successObject = { messages: ['COMMON.SAVED_SUCCESSFULLY'] };
    this.alertService.showSuccessMessage(successObject);
  }
  save(): void {
    if (this.activeTab === NOTIFICATIONS_SETTINGS_TABS_ENUM.NOTIFICATIONS_TAB) {
      this.saveNotifications();
    } else if (this.activeTab === NOTIFICATIONS_SETTINGS_TABS_ENUM.WORK_DAYS_TAB) {
      this.saveWorkDays();
    }
  }

  saveNotifications(): void {
    if (this.notificationForm.valid) {
      const notificationData = {
        ...this.notificationSettingModel,
        ...this.notificationForm.value,
      };
      this.service.update(notificationData).subscribe({
        next: (result) => {
          this.notificationSettingModel = Object.assign(new NotificationSetting(), result);
          this.notificationForm.patchValue(result);
          this.afterSave();
        },
      });
    }
  }

  saveWorkDays(): void {
    if (this.workDaysForm.valid) {
      const workDaysData = {
        ...this.workDaysSettingModel,
        ...this.workDaysForm.value,
      };
      this.workDaysSettingService.updateWorkDays(workDaysData).subscribe({
        next: (result) => {
          this.workDaysSettingModel = Object.assign(new WorkDaysSetting(), result);
          this.workDaysForm.patchValue(result);
          this.afterSave();
        },
      });
    }
  }

  resetNotifications(): void {
    this.notificationForm.reset();
    this.notificationForm.patchValue({
      isSms: this.notificationSettingModel.isSms,
      isEmail: this.notificationSettingModel.isEmail,
      isWeb: this.notificationSettingModel.isWeb,
    });
  }

  resetWorkDays(): void {
    this.workDaysForm.reset();
    this.workDaysForm.patchValue({
      sunday: this.workDaysSettingModel.sunday,
      monday: this.workDaysSettingModel.monday,
      tuesday: this.workDaysSettingModel.tuesday,
      wednesday: this.workDaysSettingModel.wednesday,
      thursday: this.workDaysSettingModel.thursday,
      friday: this.workDaysSettingModel.friday,
      saturday: this.workDaysSettingModel.saturday,
    });
  }
  notificationChannels = [
    { key: 'isSms', labelKey: 'NOTIFICATION.SMS' },
    { key: 'isEmail', labelKey: 'NOTIFICATION.EMAIL' },
    { key: 'isWeb', labelKey: 'NOTIFICATION.WEB' },
  ];
  ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
