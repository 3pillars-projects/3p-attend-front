export enum ATTENDANCE_STATUS_ENUM {
  HOLIDAY = 1,
  WEEKEND = 2,
  MISSION = 3,
  PRESENT = 4,
  ABSENT = 5,
  EXEMPTED = 6,
  ONE_FINGER_PRINT = 7,
  LATE_ATTENDANCE = 8,
  EARLY_LEAVE = 9,
  LATE_ATTENDANCE_AND_EARLY_LEAVE = 10,
}

export const ATTENDANCE_STATUS_TRANSLATIONS: Record<ATTENDANCE_STATUS_ENUM, string> = {
  [ATTENDANCE_STATUS_ENUM.HOLIDAY]: 'ATTENDANCE_STATUS.HOLIDAY',
  [ATTENDANCE_STATUS_ENUM.WEEKEND]: 'ATTENDANCE_STATUS.WEEKEND',
  [ATTENDANCE_STATUS_ENUM.EXEMPTED]: 'ATTENDANCE_STATUS.EXEMPTED',
  [ATTENDANCE_STATUS_ENUM.MISSION]: 'ATTENDANCE_STATUS.MISSION',
  [ATTENDANCE_STATUS_ENUM.PRESENT]: 'ATTENDANCE_STATUS.PRESENT',
  [ATTENDANCE_STATUS_ENUM.ABSENT]: 'ATTENDANCE_STATUS.ABSENT',
  [ATTENDANCE_STATUS_ENUM.ONE_FINGER_PRINT]: 'ATTENDANCE_STATUS.ONE_FINGER_PRINT',
  [ATTENDANCE_STATUS_ENUM.LATE_ATTENDANCE]: 'ATTENDANCE_STATUS.LATE_ATTENDANCE',
  [ATTENDANCE_STATUS_ENUM.EARLY_LEAVE]: 'ATTENDANCE_STATUS.EARLY_LEAVE',
  [ATTENDANCE_STATUS_ENUM.LATE_ATTENDANCE_AND_EARLY_LEAVE]:
    'ATTENDANCE_STATUS.LATE_ATTENDANCE_AND_EARLY_LEAVE',
};

export interface AttendanceStatusOption {
  value: ATTENDANCE_STATUS_ENUM;
  labelKey: string;
}

export const ATTENDANCE_STATUS_OPTIONS: AttendanceStatusOption[] = Object.values(
  ATTENDANCE_STATUS_ENUM
)
  .filter((v) => typeof v === 'number')
  .map((v) => ({
    value: v as ATTENDANCE_STATUS_ENUM,
    labelKey: ATTENDANCE_STATUS_TRANSLATIONS[v as ATTENDANCE_STATUS_ENUM],
  }));

export const ATTENDANCE_STATUS_CONFIG: Record<
  ATTENDANCE_STATUS_ENUM,
  { labelKey: string; bgColor: string; textColor: string; dotColor: string }
> = {
  [ATTENDANCE_STATUS_ENUM.HOLIDAY]: {
    labelKey: 'ATTENDANCE_STATUS.HOLIDAY',
    bgColor: '#f9fafb',
    textColor: '#1f2a37',
    dotColor: '#4d5761',
  },
  [ATTENDANCE_STATUS_ENUM.WEEKEND]: {
    labelKey: 'ATTENDANCE_STATUS.WEEKEND',
    bgColor: '#f9fafb',
    textColor: '#1f2a37',
    dotColor: '#4d5761',
  },
  [ATTENDANCE_STATUS_ENUM.EXEMPTED]: {
    labelKey: 'ATTENDANCE_STATUS.EXEMPTED',
    bgColor: '#fffaeb',
    textColor: '#93370d',
    dotColor: '#93370d',
  },
  [ATTENDANCE_STATUS_ENUM.MISSION]: {
    labelKey: 'ATTENDANCE_STATUS.MISSION',
    bgColor: '#eff8ff',
    textColor: '#1849a9',
    dotColor: '#1849a9',
  },
  [ATTENDANCE_STATUS_ENUM.PRESENT]: {
    labelKey: 'ATTENDANCE_STATUS.PRESENT',
    bgColor: '#ecfdf3',
    textColor: '#085d3a',
    dotColor: '#085d3a',
  },
  [ATTENDANCE_STATUS_ENUM.ABSENT]: {
    labelKey: 'ATTENDANCE_STATUS.ABSENT',
    bgColor: '#fef3f2',
    textColor: '#912018',
    dotColor: '#912018',
  },
  // new status
  [ATTENDANCE_STATUS_ENUM.ONE_FINGER_PRINT]: {
    labelKey: 'ATTENDANCE_STATUS.ONE_FINGER_PRINT',
    bgColor: '#ecfdf3',
    textColor: '#085d3a',
    dotColor: '#085d3a',
  },
  [ATTENDANCE_STATUS_ENUM.LATE_ATTENDANCE]: {
    labelKey: 'ATTENDANCE_STATUS.LATE_ATTENDANCE',
    bgColor: '#ecfdf3',
    textColor: '#085d3a',
    dotColor: '#085d3a',
  },
  [ATTENDANCE_STATUS_ENUM.EARLY_LEAVE]: {
    labelKey: 'ATTENDANCE_STATUS.EARLY_LEAVE',
    bgColor: '#ecfdf3',
    textColor: '#085d3a',
    dotColor: '#085d3a',
  },
  [ATTENDANCE_STATUS_ENUM.LATE_ATTENDANCE_AND_EARLY_LEAVE]: {
    labelKey: 'ATTENDANCE_STATUS.LATE_ATTENDANCE_AND_EARLY_LEAVE',
    bgColor: '#ecfdf3',
    textColor: '#085d3a',
    dotColor: '#085d3a',
  },
};
