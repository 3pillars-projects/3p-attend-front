import { BaseLookupModel } from '@/models/features/lookups/base-lookup-model';
import { City } from '@/models/features/lookups/city/city';
import { PaginationParams } from '@/models/shared/pagination-params';
import { PaginatedList } from '@/models/shared/response/paginated-list';
import { AccessLocationService } from '@/services/features/business/access-location.service';
import { CityService } from '@/services/features/lookups/city.service';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AccessLocation } from '@/models/features/business/access-location';

export const accessLocationResolver: ResolveFn<PaginatedList<AccessLocation> | null> = () => {
  const accessLocationService = inject(AccessLocationService);
  return accessLocationService.loadPaginated(new PaginationParams()).pipe(
    catchError((error) => {
      return of(null); // Prevent throwing to allow route activation
    })
  );
};
