import { BaseLookupModel } from '@/models/features/lookups/base-lookup-model';

export class LeaveTypesLookup {
  declare annualLeaves: BaseLookupModel[];
  declare limitedLeaves: BaseLookupModel[];
}
