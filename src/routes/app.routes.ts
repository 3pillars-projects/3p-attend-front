import { Routes } from '@angular/router';
import { authGuard } from '@/guards/auth-guard';
import { ROLES_ENUM } from '@/enums/roles-enum';
import { nationalitiesResolver } from '@/resolvers/lookups/nationalities.resolver';
import { cityResolver } from '@/resolvers/lookups/city.resolver';
import { userResolver } from '@/resolvers/user.resolver';
import { regionResolver } from '@/resolvers/lookups/region.resolver';
import { notificationSettingResolver } from '@/resolvers/setting/notification-setting.resolver';
import { RouteIdsEnum } from '@/enums/route-ids-enum';
import { departmentResolver } from '@/resolvers/lookups/department.resolver';
import { holidayResolver } from '@/resolvers/lookups/holiday.resolver';
import { workShiftResolver } from '@/resolvers/lookups/work-shift.resolver';
import { attendanceResolver } from '@/resolvers/features/attendance-log.resolver';
import { loginResolver } from '@/resolvers/login.resolver';
import { notificationResolver } from '@/resolvers/setting/notification.resolver';
import { userWorkShiftResolver } from '@/resolvers/lookups/user-work-shift.resolver';
import { userProfileResolver } from '@/resolvers/features/user-profile.resolver';
import { myShiftsResolver } from '@/resolvers/lookups/my-shifts.resolver';
import { presenceInquiryResolver } from '@/resolvers/presence-inquiry.resolver';
import { blacklistedNationalIdResolver } from '@/resolvers/features/visit/blacklisted-national-id.resolver';
import { blacklistResolver } from '@/resolvers/features/blacklist.resolver';
import { WorkMissionResolver } from '@/resolvers/business/work-missions.resolver';
import { visitResolver } from '@/resolvers/features/visit/visit.resolver';
import { accessLocationResolver } from '@/resolvers/business/access-location.resolver';
import { devicesConfigurationResolver } from '@/resolvers/business/devices-configuration.resolver';
import { attendanceReportResolver } from '@/resolvers/business/attendance-report.resolver';
import { limitedTimePermissionResolver } from '@/resolvers/lookups/limited-timepermission.resolver';
import { leaveTypesResolver } from '@/resolvers/business/leave-types.resolver';
import { employeesLeavesBalancesResolver } from '@/resolvers/business/employees-leaves-balances.resolver';
import { employeesLeavesBalancesPagedResolver } from '@/resolvers/business/employees-leaves-balances-paged.resolver';
import { employeesLeavesBalancesYearsResolver } from '@/resolvers/business/employees-leaves-balances-years.resolver';
import { myLeavesResolver } from '@/resolvers/business/my-leaves.resolver';
import { teamLeavesResolver } from '@/resolvers/business/team-leaves.resolver';

export const routes: Routes = [
  // ✅ Protected routes

  // ✅ Redirect root "/" to /auth/login — public
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/login',
  },

  // ✅ Optional legacy redirect
  {
    path: 'login',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('@/views/privacy-policy/privacy-policy.component').then(
        (m) => m.PrivacyPolicyComponent
      ),
  },

  // ✅ Auth layout and login
  {
    path: 'auth',
    loadComponent: () => import('@/views/layout/auth/auth-layout/auth-layout.component'),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
      },
      {
        path: 'login',
        resolve: { notUsed: loginResolver },
        loadComponent: () => import('@/views/auth/login/login.component'),
      },
      {
        path: 'forget-password',
        loadComponent: () => import('../views/auth/forget-password/forget-password.component'),
      },
      {
        path: 'new-password',
        loadComponent: () => import('../views/auth/new-password/new-password.component'),
      },
      {
        path: 'sent-link',
        loadComponent: () => import('../views/auth/sent-link/sent-link.component'),
      },
    ],
  },
  {
    path: '',
    loadComponent: () => import('@/views/layout/main/main-layout/main-layout.component'),
    children: [
      {
        path: 'home',
        canActivate: [authGuard],
        loadComponent: () => import('@/views/home/home.component'),
        data: { roles: [ROLES_ENUM.EMPLOYEE], routeId: RouteIdsEnum.HOME },
      },
      {
        // it will be 403
        canActivate: [authGuard],
        path: '403',
        loadComponent: () => import('@/views/shared/not-authorized/not-authorized.component'),
      },
      {
        path: 'employees',
        resolve: { list: userResolver },
        canActivate: [authGuard],
        loadComponent: () =>
          import('@/views/features/employee/employee-list/employee-list.component'),
        data: { roles: [ROLES_ENUM.HR_OFFICER, ROLES_ENUM.ADMIN], routeId: RouteIdsEnum.EMPLOYEES },
      },
      // {
      //   path: 'blacklist',
      //   canActivate: [authGuard],
      //   resolve: { list: blacklistResolver },
      //   data: {
      //     roles: [ROLES_ENUM.SECURITY_LEADER], // all roles can view the page
      //     routeId: RouteIdsEnum.BLACKLIST,
      //   },
      //   loadComponent: () =>
      //     import(
      //       '@/views/features/visit/blacklist/blacklisted-container/blacklisted-container.component'
      //     ),
      // },
      // {
      //   path: 'visit-request',
      //   canActivate: [authGuard],
      //   resolve: { list: visitResolver },
      //   data: {
      //     roles: [
      //       ROLES_ENUM.SECURITY_LEADER,
      //       ROLES_ENUM.DEPARTMENT_MANAGER,
      //       ROLES_ENUM.SECURITY_MEMBER,
      //     ], // all roles can view the page
      //     routeId: RouteIdsEnum.VISIT_REQUEST,
      //   },
      //   loadComponent: () =>
      //     import(
      //       '@/views/features/visit/visit-request/visit-request-container/visit-request-container.component'
      //     ),
      // },
      {
        path: 'attendance-logs',
        canActivate: [authGuard],
        resolve: { list: attendanceResolver },
        data: {
          roles: [ROLES_ENUM.EMPLOYEE],
          routeId: RouteIdsEnum.ATTENDANCE_LOGS,
        },
        loadComponent: () =>
          import(
            '@/views/features/attendance-log/attendance-log-list/attendance-log-list.component'
          ),
      },
      {
        path: 'reports-processing',
        canActivate: [authGuard],
        data: {
          roles: [ROLES_ENUM.HR_OFFICER, ROLES_ENUM.ADMIN],
          routeId: RouteIdsEnum.ATTENDANCE_REPORT_PROCESSING,
        },
        loadComponent: () =>
          import('@/views/features/reports/reports-processing/reports-processing.component'),
      },
      {
        path: 'attendance-report',
        canActivate: [authGuard],
        resolve: { list: attendanceReportResolver },
        data: {
          roles: [ROLES_ENUM.EMPLOYEE],
          routeId: RouteIdsEnum.ATTENDANCE_REPORT,
        },
        loadComponent: () =>
          import(
            '@/views/features/reports/attendance-report/attendance-report-container/attendance-report-container.component'
          ),
      },
      // {
      //   path: 'nationalities',
      //   canActivate: [authGuard],
      //   data: { roles: [ROLES_ENUM.ADMIN], routeId: RouteIdsEnum.NATIONALITIES },
      //   resolve: { list: nationalitiesResolver },
      //   loadComponent: () =>
      //     import(
      //       '@/views/features/lookups/nationality/nationality-list/nationality-list.component'
      //     ),
      // },
      {
        path: 'cities',
        canActivate: [authGuard],
        data: { roles: [ROLES_ENUM.ADMIN], routeId: RouteIdsEnum.CITIES },
        resolve: { list: cityResolver },
        loadComponent: () => import('@/views/features/lookups/city/city-list/city-list.component'),
      },
      {
        path: 'regions',
        canActivate: [authGuard],
        data: { roles: [ROLES_ENUM.ADMIN], routeId: RouteIdsEnum.REGIONS },
        resolve: { list: regionResolver },
        loadComponent: () =>
          import('@/views/features/lookups/region/region-list/region-list.component').then(
            (m) => m.RegionListComponent
          ),
      },
      {
        path: 'general-settings',
        canActivate: [authGuard],
        data: { roles: [ROLES_ENUM.ADMIN], routeId: RouteIdsEnum.GENERAL_SETTINGS },
        resolve: { channel: notificationSettingResolver },
        loadComponent: () =>
          import('@/views/features/settings/notification-settings/notification-settings.component'),
      },
      // {
      //   path: 'devices-configuration',
      //   canActivate: [authGuard],
      //   data: { roles: [ROLES_ENUM.ADMIN], routeId: RouteIdsEnum.DEVICES_CONFIGURATION },
      //   resolve: { list: devicesConfigurationResolver },
      //   loadComponent: () =>
      //     import('@/views/features/settings/devices-configuration/devices-configuration.component'),
      // },
      // {
      //   path: 'devices-location',
      //   canActivate: [authGuard],
      //   data: { roles: [ROLES_ENUM.ADMIN], routeId: RouteIdsEnum.ACCESS_LOCATIONS },
      //   resolve: { list: accessLocationResolver },
      //   loadComponent: () =>
      //     import('@/views/features/settings/devices-location/devices-location.component'),
      // },
      {
        path: 'holidays',
        canActivate: [authGuard],
        data: { roles: [ROLES_ENUM.EMPLOYEE], routeId: RouteIdsEnum.HOLIDAYS },
        resolve: { list: holidayResolver },
        loadComponent: () =>
          import('@/views/features/lookups/holidays/holidays-list/holidays-list.component'),
      },
      {
        path: 'cancel-leaves-request',
        loadComponent: () =>
          import('@/views/features/leaves/cancel-leaves-request/cancel-leaves-request-list/cancel-leaves-request-list.component'),
      },
      {
        path: 'leaves-list',
        canActivate: [authGuard],
        data: { roles: [ROLES_ENUM.EMPLOYEE], routeId: RouteIdsEnum.LEAVE_TYPES },
        resolve: { list: leaveTypesResolver },
        loadComponent: () =>
          import(
            '@/views/features/leaves/leaves-types/leave-types-list/leave-types-list.component'
          ).then((m) => m.LeavesListComponent),
      },
      {
        path: 'leaves-balances',
        canActivate: [authGuard],
        data: { roles: [ROLES_ENUM.EMPLOYEE], routeId: RouteIdsEnum.LEAVES_BALANCES },
        resolve: {
          leavesBalance: employeesLeavesBalancesResolver,
          list: employeesLeavesBalancesPagedResolver,
          years: employeesLeavesBalancesYearsResolver,
        },
        loadComponent: () =>
          import(
            '@/views/features/leaves/leaves-balances/leaves-balances-list/leaves-balances-list.component'
          ).then((m) => m.LeavesBalancesListComponent),
      },
      {
        path: 'employee-holidays',
        loadComponent: () =>
          import('@/views/features/lookups/holidays/employee-holidays/employee-holidays.component'),
      },
      {
        path: 'departments',
        canActivate: [authGuard],
        data: { roles: [ROLES_ENUM.EMPLOYEE], routeId: RouteIdsEnum.DEPARTMENTS },
        resolve: { list: departmentResolver },
        loadComponent: () =>
          import('@/views/features/department/department-list/department-list.component'),
      },
      {
        path: 'work-shifts',
        canActivate: [authGuard],
        data: { roles: [ROLES_ENUM.HR_OFFICER], routeId: RouteIdsEnum.WORK_SHIFTS },
        resolve: { list: workShiftResolver },
        loadComponent: () =>
          import(
            '@/views/features/lookups/work-shifts/work-shifts-list/work-shifts-list.component'
          ),
      },
      {
        path: 'work-shifts-assignment',
        canActivate: [authGuard],
        data: {
          roles: [ROLES_ENUM.HR_OFFICER],
          routeId: RouteIdsEnum.WORK_SHIFT_ASSIGNMENT,
        },
        resolve: { list: userWorkShiftResolver },
        loadComponent: () =>
          import(
            '@/views/features/lookups/work-shifts/work-shifts-assignment/work-shifts-assignment.component'
          ),
      },
      {
        path: 'my-shifts',
        canActivate: [authGuard],
        data: {
          roles: [ROLES_ENUM.EMPLOYEE],
          routeId: RouteIdsEnum.WORK_SHIFT_TEMP,
        },
        resolve: { list: myShiftsResolver },
        loadComponent: () =>
          import('@/views/features/lookups/work-shifts/my-shifts/my-shifts.component'),
      },
      {
        path: 'work-missions',
        canActivate: [authGuard],
        data: {
          roles: [ROLES_ENUM.EMPLOYEE],
          routeId: RouteIdsEnum.WORK_MISSION,
        },
        resolve: { list: WorkMissionResolver },
        loadComponent: () =>
          import(
            '@/views/features/outside-mission/work-mission-container/work-mission-container.component'
          ),
      },
      {
        path: 'notifications',
        data: { routeId: RouteIdsEnum.NOTIFICATIONS },
        resolve: { list: notificationResolver },
        loadComponent: () =>
          import('@/views/features/lookups/notifiactions/notifiactions.component'),
      },
      // {
      //   path: 'presence-inquiries',
      //   data: { routeId: RouteIdsEnum.PRESENCE_INQUIRIES },
      //   resolve: { list: presenceInquiryResolver },
      //   loadComponent: () =>
      //     import(
      //       '@/views/features/presence-inquiries/presence-inquiries-list/presence-inquiries-list.component'
      //     ),
      // },
      {
        path: 'tasks-list',
        loadComponent: () => import('@/views/features/tasks/tasks-list/tasks-list.component'),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        data: { roles: [ROLES_ENUM.EMPLOYEE] },
        resolve: { list: userProfileResolver },
        loadComponent: () => import('@/views/features/employee/profile/profile/profile.component'),
      },
      {
        path: 'limited-time-permission',
        canActivate: [authGuard],
        data: {
          roles: [ROLES_ENUM.EMPLOYEE],
          routeId: RouteIdsEnum.LIMITED_TIME_PERMISSION,
        },
        resolve: { list: limitedTimePermissionResolver },
        loadComponent: () =>
          import(
            '@/views/features/limited-time-permission/limited-time-permission-container/limited-time-permission-container.component'
          ),
      },
      {
        path: 'transfer-leaves-balances',
        loadComponent: () =>
          import(
            '@/views/features/leaves/transfer-balances/transfer-leaves-balances/transfer-leaves-balances.component'
          ),
      },
      {
        path: 'leaves-request',
        resolve: {
          myLeavesList: myLeavesResolver,
          teamLeavesList: teamLeavesResolver,
          leaveTypes: leaveTypesResolver,
        },
        loadComponent: () =>
          import(
            '@/views/features/leaves/leaves-request/leaves-request-list/leaves-request-list.component'
          ).then((m) => m.LeavesRequestListComponent),
      },
    ],
  },

  // 404 handler
  {
    path: '404',
    loadComponent: () => import('@/views/shared/not-found/not-found.component'),
  },
  {
    path: '**',
    redirectTo: '404',
  },
];
