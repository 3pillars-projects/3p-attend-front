import { ModelInterceptorContract } from 'cast-response';
import EmployeeShift from '@/models/features/lookups/work-shifts/employee-shift';

export class EmployeeShiftInterceptor implements ModelInterceptorContract<EmployeeShift>{
  receive(model: EmployeeShift): EmployeeShift {
    model.shiftDuration = this.getShiftDuration(model.timeFrom, model.timeTo);
    return model;
  }

  send(model: Partial<EmployeeShift>): Partial<EmployeeShift> {
    return model;
  }

  getShiftDuration(timeFrom?: string, timeTo?: string): string {
    if(!timeFrom || !timeTo) {
      return '';
    }
    const fromMinutes = this.timeStringToMinutes(timeFrom);
    const toMinutes = this.timeStringToMinutes(timeTo);

    // If timeTo is earlier, assume it's on the *next* day
    const normalizedTo =
      toMinutes >= fromMinutes ? toMinutes : toMinutes + 24 * 60;

    const diff = normalizedTo - fromMinutes; // minutes
    return this.minutesToTimeString(diff);
  }

  timeStringToMinutes(time: string): number {
    // expects "HH:mm:ss" or "HH:mm"
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  minutesToTimeString(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const hh = hours.toString().padStart(2, '0');
    const mm = minutes.toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }
}
