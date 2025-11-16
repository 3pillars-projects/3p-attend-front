import { inject, Injectable } from '@angular/core';
import { UrlService } from '@/services/url.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImportService {
  urlService = inject(UrlService);
  getUrlSegment(): string {
    return this.urlService.URLS.IMPORT;
  }
  private baseUrl = this.getUrlSegment(); // adjust as needed

  constructor(private http: HttpClient) {}

  importEmployees(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/employees-excel`, formData, { withCredentials: true });
  }

  importDepartments(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/departments-excel`, formData, { withCredentials: true });
  }

  importAttendanceLogsXml(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/attendance-logs-xml`, formData, {
      withCredentials: true,
    });
  }
}
