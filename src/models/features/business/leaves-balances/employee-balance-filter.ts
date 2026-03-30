export class EmployeeBalanceFilter {
  fkDepartmentId?: number;
  fullNameAr?: string;
  fullNameEn?: string;
  fkGenderId?: number;
  religion?: number;
  minYearsOfExperience?: number;
  maxYearsOfExperience?: number;
  year: number = new Date().getFullYear();
}
