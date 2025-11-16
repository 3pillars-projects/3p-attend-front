import { LookupBaseService } from '@/abstracts/lookup-base.service';
import { AccessLocation } from '@/models/features/business/access-location';
import { BaseLookupModel } from '@/models/features/lookups/base-lookup-model';
import { ListResponseData } from '@/models/shared/response/list-response-data';
import { PaginatedList } from '@/models/shared/response/paginated-list';
import { Injectable } from '@angular/core';
import { CastResponse, CastResponseContainer } from 'cast-response';
import { Observable, switchMap, of } from 'rxjs';
import { AccessLocationLookup } from '@/models/features/business/access-location-lookup';

@CastResponseContainer({
  $default: {
    model: () => AccessLocation,
  },
  $pagination: {
    model: () => PaginatedList<AccessLocation>,
    unwrap: 'data',
    shape: { 'list.*': () => AccessLocation },
  },
  $lookup: {
    model: () => BaseLookupModel,
    unwrap: 'data',
    shape: { data: () => BaseLookupModel },
  },
  $statusLookup: {
    model: () => AccessLocationLookup,
    unwrap: 'data',
    shape: { data: () => AccessLocationLookup },
  },
})
@Injectable({
  providedIn: 'root',
})
export class AccessLocationService extends LookupBaseService<AccessLocation, number> {
  serviceName: string = 'AccessLocationService';

  override getUrlSegment(): string {
    return this.urlService.URLS.ACCESS_LOCATIONS;
  }

  @CastResponse(undefined, { fallback: '$lookup' })
  getLocationsConnectedToDevice(): Observable<BaseLookupModel[]> {
    return this.http
      .get<ListResponseData<BaseLookupModel>>(
        this.getUrlSegment() + '/' + 'GetLocationsLinkedWithDevices',
        {
          withCredentials: true,
        }
      )
      .pipe(
        switchMap((response: ListResponseData<BaseLookupModel>) => {
          return of(response.data);
        })
      );
  }

  @CastResponse(undefined, { fallback: '$statusLookup' })
  getConnectedLocationsWithStatus(): Observable<AccessLocationLookup[]> {
    return this.http
      .get<ListResponseData<AccessLocationLookup>>(
        this.getUrlSegment() + '/' + 'GetLocationsWithStatus',
        {
          withCredentials: true,
        }
      )
      .pipe(
        switchMap((response: ListResponseData<AccessLocationLookup>) => {
          return of(response.data);
        })
      );
  }
}
