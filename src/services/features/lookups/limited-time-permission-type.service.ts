import { LookupBaseService } from '@/abstracts/lookup-base.service';
import { BaseLookupModel } from '@/models/features/lookups/base-lookup-model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LimitedTimePermissionTypeService extends LookupBaseService<BaseLookupModel, number> {
  serviceName: string = 'LimitedTimePermissionTypeService';

  override getUrlSegment(): string {
    return this.urlService.URLS.LIMITED_TIME_PERMISSIONS_TYPES;
  }
}
