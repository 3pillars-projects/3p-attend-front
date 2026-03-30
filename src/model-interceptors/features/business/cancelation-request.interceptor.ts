import { CancelationRequest } from '@/models/features/business/leave-cancelation/cancelation-request';
import { toDateOnly, toDateTime } from '@/utils/general-helper';
import { ModelInterceptorContract } from 'cast-response';

export class CancelationRequestInterceptor implements ModelInterceptorContract<CancelationRequest> {
  receive(model: CancelationRequest): CancelationRequest {
    if (model.dateFrom) model.dateFrom = toDateTime(model.dateFrom)!;
    if (model.dateTo) model.dateTo = toDateTime(model.dateTo)!;
    if (model.actionDate) model.actionDate = toDateTime(model.actionDate)!;
    return model;
  }

  send(model: Partial<CancelationRequest>): Partial<CancelationRequest> {
    if (model.dateFrom) model.dateFrom = toDateOnly(model.dateFrom);
    if (model.dateTo) model.dateTo = toDateOnly(model.dateTo);
    if (model.actionDate) delete model.actionDate; // Typically set by server
    return model;
  }
}
