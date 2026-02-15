import { LeaveTransferEligibleEmployee } from './leave-transfer-eligible-employee';

export class LeaveTransferEligibleEmployeesResponse {
  declare year: number;
  declare employees: LeaveTransferEligibleEmployee[];
}
