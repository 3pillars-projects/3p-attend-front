import { Observable } from 'rxjs';

export class SpreadsheetXmlHelper {
  static validateSpreadsheetXmlHeaders(
    file: File,
    requiredHeaders: string[]
  ): Observable<{ validHeaders: boolean; missing: string[]; provided: string[] }> {
    const ns = 'urn:schemas-microsoft-com:office:spreadsheet';
    const norm = (s: string) => s?.trim().toLowerCase() ?? '';

    return new Observable((observer) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const xml = new DOMParser().parseFromString(reader.result as string, 'text/xml');
          const rows = Array.from(xml.getElementsByTagNameNS(ns, 'Row'));
          if (!rows.length) {
            observer.next({ validHeaders: false, missing: requiredHeaders, provided: [] });
            observer.complete();
            return;
          }

          // locate header row (contains all requiredHeaders)
          const headerRow = rows.find((r) => {
            const vals = Array.from(r.getElementsByTagNameNS(ns, 'Data')).map((d) =>
              (d.textContent ?? '').trim()
            );
            const set = new Set(vals.map(norm));
            return requiredHeaders.every((h) => set.has(norm(h)));
          });

          if (!headerRow) {
            observer.next({ validHeaders: false, missing: requiredHeaders, provided: [] });
            observer.complete();
            return;
          }

          const provided = Array.from(headerRow.getElementsByTagNameNS(ns, 'Data'))
            .map((d) => (d.textContent ?? '').trim())
            .filter((v) => v !== '');

          const providedSet = new Set(provided.map(norm));
          const missing = requiredHeaders.filter((h) => !providedSet.has(norm(h)));

          observer.next({ validHeaders: missing.length === 0, missing, provided });
          observer.complete();
        } catch (e) {
          observer.error(e);
        }
      };
      reader.onerror = (err) => observer.error(err);
      reader.readAsText(file);
    });
  }

  static validateSpreadsheetXmlDataValues(
    file: File,
    nonEmptyFields: string[]
  ): Observable<{ validValues: boolean; missing: string[]; rowIndex: number | null }> {
    const ns = 'urn:schemas-microsoft-com:office:spreadsheet';
    const norm = (s: string) => s?.trim().toLowerCase() ?? '';

    return new Observable((observer) => {
      const reader = new FileReader();

      reader.onload = () => {
        try {
          const xml = new DOMParser().parseFromString(reader.result as string, 'text/xml');
          const rows = Array.from(xml.getElementsByTagNameNS(ns, 'Row'));

          // no rows at all
          if (!rows.length) {
            observer.next({
              validValues: false,
              missing: nonEmptyFields,
              rowIndex: null,
            });
            observer.complete();
            return;
          }

          // find header row by matching first required field
          const headerRow = rows.find((r) =>
            Array.from(r.getElementsByTagNameNS(ns, 'Data')).some(
              (d) => norm(d.textContent ?? '') === norm(nonEmptyFields[0])
            )
          );

          if (!headerRow) {
            observer.next({
              validValues: false,
              missing: nonEmptyFields,
              rowIndex: null,
            });
            observer.complete();
            return;
          }

          const provided = Array.from(headerRow.getElementsByTagNameNS(ns, 'Data'))
            .map((d) => (d.textContent ?? '').trim())
            .filter((v) => v !== '');

          const headerIndexMap = new Map<string, number>();
          provided.forEach((name, i) => headerIndexMap.set(norm(name), i));

          // map required fields to their column indices
          const nonEmptyIndices = nonEmptyFields.map(
            (f) => headerIndexMap.get(norm(f) as string) ?? -1
          );

          // if any required header is completely missing, treat all as missing
          if (nonEmptyIndices.some((idx) => idx < 0)) {
            observer.next({
              validValues: false,
              missing: nonEmptyFields,
              rowIndex: null,
            });
            observer.complete();
            return;
          }

          // data rows after header
          const headerIndex = rows.indexOf(headerRow);
          const dataRows = rows.slice(headerIndex + 1);

          if (!dataRows.length) {
            observer.next({
              validValues: false,
              missing: nonEmptyFields,
              rowIndex: null,
            });
            observer.complete();
            return;
          }

          // iterate rows until first completely empty row
          for (let r = 0; r < dataRows.length; r++) {
            const row = dataRows[r];

            const vals = Array.from(row.getElementsByTagNameNS(ns, 'Data')).map((d) =>
              (d.textContent ?? '').trim()
            );

            const allEmpty = vals.every((v) => !v);
            if (allEmpty) {
              break;
            }

            // which required fields are empty in this row?
            const missing = nonEmptyIndices
              .map((idx, pos) => (!vals[idx] ? nonEmptyFields[pos] : null))
              .filter((f): f is string => f !== null);

            if (missing.length) {
              // rowIndex: sheet-wise index, including header (1-based if you prefer)
              const rowIndex = headerIndex + 1 + r;
              observer.next({
                validValues: false,
                missing,
                rowIndex,
              });
              observer.complete();
              return;
            }
          }

          // if we reach here, everything before the first empty row is valid
          observer.next({
            validValues: true,
            missing: [],
            rowIndex: null,
          });
          observer.complete();
        } catch (e) {
          // only unexpected runtime / parsing errors
          observer.error(e);
        }
      };

      reader.onerror = (err) => observer.error(err);
      reader.readAsText(file);
    });
  }
}
