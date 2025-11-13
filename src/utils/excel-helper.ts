import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';

export class ExcelHelper {
  static downloadExcelFromBase64(base64String: string, baseName = 'Report'): void {
    // Handle data URL or raw base64
    const m = base64String.match(/^data:.*;base64,(.*)$/i);
    const cleanB64 = m ? m[1] : base64String;

    // Decode base64 -> bytes
    const binary = atob(cleanB64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    // Build filename from static prefix + timestamp
    const now = new Date();
    const ts = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
      '_',
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0'),
    ].join('');
    const fileName = `${baseName}_${ts}.xlsx`;

    // Create blob and download
    const mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const blob = new Blob([bytes], { type: mime });

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  static validateImportExcelSheetHeaders(
    importRequiredHeaders: string[],
    file: File
  ): Observable<{ validHeaders: boolean; missing: string[]; provided: string[] }> {
    return new Observable((observer) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = new Uint8Array(reader.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });

          const headerRow = rows[0] ?? [];
          const provided = headerRow.map((cell) => String(cell ?? '').trim());
          const providedSet = new Set(provided);
          const missing = importRequiredHeaders.filter((req) => !providedSet.has(req));

          observer.next({ validHeaders: missing.length === 0, missing, provided });
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      };

      reader.onerror = (err) => observer.error(err);
      reader.readAsArrayBuffer(file);
    });
  }

  static validateHasDataRows(file: File): Observable<boolean> {
    return new Observable((observer) => {
      const reader = new FileReader();

      reader.onload = () => {
        try {
          const data = new Uint8Array(reader.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];

          // Read sheet as array of rows
          const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });

          // Check if there’s at least one non-empty row after the header
          const hasData =
            rows.length > 1 &&
            rows.slice(1).some((row) => row.some((cell) => cell !== null && cell !== ''));

          observer.next(hasData);
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      };

      reader.onerror = (err) => observer.error(err);
      reader.readAsArrayBuffer(file);
    });
  }
}
