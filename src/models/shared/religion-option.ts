import { RELIGION_ENUM } from '@/enums/religion-enum';

export interface ReligionOption {
  id: RELIGION_ENUM;
  nameEn: string;
  nameAr: string;
}

export const RELIGION_OPTIONS: ReligionOption[] = [
  {
    id: RELIGION_ENUM.MUSLIM,
    nameEn: 'Muslim',
    nameAr: 'مسلم',
  },
  {
    id: RELIGION_ENUM.CHRISTIAN,
    nameEn: 'Christian',
    nameAr: 'مسيحي',
  },
];
