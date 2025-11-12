export class LimitedTimePermissionFilter {
  declare limitedTimePermissionDuration: number;
  declare creationUserId: number;
  declare fkDepartmentId: number;
  declare fkPermissionTypeId: number;
  declare fkStatusId: number;
  declare dateFrom?: Date | string;
  declare dateTo?: Date | string;
}
