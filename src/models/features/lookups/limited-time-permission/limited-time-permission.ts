import { BaseCrudModel } from '@/abstracts/base-crud-model';
import { CustomValidators } from '@/validators/custom-validators';
import { Validators } from '@angular/forms';
import { InterceptModel } from 'cast-response';
import { Department } from '../department/department';
import { BaseLookupModel } from '../base-lookup-model';
import { LanguageService } from '@/services/shared/language.service';
import { FactoryService } from '@/services/factory-service';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import { LimitedTimePermissionInterceptor } from '@/model-interceptors/features/lookups/limited-time-permission.interceptor';
import { LimitedTimePermissionService } from '@/services/features/lookups/limited-time-permission.service';

const { send, receive } = new LimitedTimePermissionInterceptor();

@InterceptModel({ send, receive })
export class LimitedTimePermission extends BaseCrudModel<
  LimitedTimePermission,
  LimitedTimePermissionService
> {
  override $$__service_name__$$: string = 'LimitedTimePermissionService';
  declare limitedTimePermissionDate?: Date | string;
  declare fkStatusId: number;
  declare fkDepartmentId: number;
  declare fkLimitedTimePermissionTypeId: number;
  declare creationUserId: number;
  declare status: BaseLookupModel;
  // Audit creator; the owner is fkUserId/user
  declare creationUser: BaseLookupModel;
  declare fkUserId?: number | null;
  declare user?: BaseLookupModel;
  declare department: BaseLookupModel;
  declare limitedTimePermissionType: BaseLookupModel;
  declare limitedTimePermissionReason?: string | null;
  declare limitedTimePermissionDuration: number;
  declare limitedTimePermissionRejectionReason?: string;
  declare actionDate?: Date | string;
  declare limitedTimePermissionTimeFrom?: Date | string;
  declare isCancelRequested?: boolean;
  declare canTakeAction?: boolean;
  declare canRequestCancel?: boolean;
  // Server-computed: owner before the permission starts, manager/HR until rejected or canceled
  declare canEdit?: boolean;
  private languageService?: LanguageService;
  constructor() {
    super();
    this.languageService = FactoryService.getService('LanguageService');
  }

  buildForm() {
    const {
      limitedTimePermissionDate,
      fkLimitedTimePermissionTypeId,
      limitedTimePermissionDuration,
      limitedTimePermissionReason,
      limitedTimePermissionTimeFrom,
      fkUserId,
    } = this;
    return {
      fkLimitedTimePermissionTypeId: [fkLimitedTimePermissionTypeId, [Validators.required]],
      limitedTimePermissionDate: [limitedTimePermissionDate, [Validators.required]],
      limitedTimePermissionDuration: [
        limitedTimePermissionDuration,
        [Validators.required, Validators.min(1)],
      ],
      limitedTimePermissionReason: [
        limitedTimePermissionReason,
        [
          Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
          Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        ],
      ],
      limitedTimePermissionTimeFrom: [limitedTimePermissionTimeFrom],
      fkUserId: [fkUserId],
    };
  }

  getStatusName(): string {
    return this.languageService?.getCurrentLanguage() == LANGUAGE_ENUM.ENGLISH
      ? (this.status?.nameEn ?? '')
      : (this.status?.nameAr ?? '');
  }

  getCreationUserName(): string {
    return this.languageService?.getCurrentLanguage() == LANGUAGE_ENUM.ENGLISH
      ? (this.creationUser?.nameEn ?? '')
      : (this.creationUser?.nameAr ?? '');
  }

  // Owner name; falls back to the creator when a response has no owner (e.g. rows read before the owner field)
  getUserName(): string {
    const owner = this.user ?? this.creationUser;
    return this.languageService?.getCurrentLanguage() == LANGUAGE_ENUM.ENGLISH
      ? (owner?.nameEn ?? '')
      : (owner?.nameAr ?? '');
  }

  getPermissionTypeName(): string {
    return this.languageService?.getCurrentLanguage() == LANGUAGE_ENUM.ENGLISH
      ? (this.limitedTimePermissionType?.nameEn ?? '')
      : (this.limitedTimePermissionType?.nameAr ?? '');
  }

  getPermissionDepartmentName(): string {
    return this.languageService?.getCurrentLanguage() == LANGUAGE_ENUM.ENGLISH
      ? (this.department?.nameEn ?? '')
      : (this.department?.nameAr ?? '');
  }
}
