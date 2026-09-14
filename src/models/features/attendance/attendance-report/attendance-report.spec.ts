import AttendanceReport from './attendance-report';
import { ATTENDANCE_STATUS_ENUM } from '@/enums/attendance-status-enum';

// Built from the prototype to avoid the constructor's FactoryService lookup
function report(values: Partial<AttendanceReport>): AttendanceReport {
  return Object.assign(Object.create(AttendanceReport.prototype), values) as AttendanceReport;
}

describe('AttendanceReport time difference', () => {
  it('shows extra time and missing time separately when both occur on the same day', () => {
    const day = report({
      totalOvertimeMinutes: 6,
      totalMissingMinutes: 45,
      isFlexibleShift: true,
      attendanceStatus: ATTENDANCE_STATUS_ENUM.PRESENT,
    });

    expect(day.getTimeDifferenceParts()).toEqual([
      { value: '+ 00:06', type: 'overtime' },
      { value: '- 00:45', type: 'missing' },
    ]);
    expect(day.getTimeDifferenceValue()).toBe('+ 00:06 / - 00:45');
  });

  it('keeps the neutral style for missing time on a present fixed-shift day', () => {
    const day = report({
      totalOvertimeMinutes: 6,
      totalMissingMinutes: 45,
      isFlexibleShift: false,
      attendanceStatus: ATTENDANCE_STATUS_ENUM.PRESENT,
    });

    expect(day.getTimeDifferenceParts()).toEqual([
      { value: '+ 00:06', type: 'overtime' },
      { value: '- 00:45', type: 'ignore' },
    ]);
  });

  it('shows only extra time when nothing is missing', () => {
    const day = report({ totalOvertimeMinutes: 90, totalMissingMinutes: 0 });

    expect(day.getTimeDifferenceParts()).toEqual([{ value: '+ 01:30', type: 'overtime' }]);
  });

  it('shows only missing time when there is no extra time', () => {
    const day = report({ totalOvertimeMinutes: 0, totalMissingMinutes: 60, isFlexibleShift: true });

    expect(day.getTimeDifferenceParts()).toEqual([{ value: '- 01:00', type: 'missing' }]);
  });

  it('shows 00:00 when both are zero', () => {
    const day = report({ totalOvertimeMinutes: 0, totalMissingMinutes: 0 });

    expect(day.getTimeDifferenceParts()).toEqual([{ value: '00:00', type: 'ignore' }]);
    expect(day.getTimeDifferenceValue()).toBe('00:00');
  });

  it('shows nothing when the day has no processed values', () => {
    const day = report({});

    expect(day.getTimeDifferenceParts()).toEqual([]);
    expect(day.getTimeDifferenceValue()).toBe('');
  });
});
