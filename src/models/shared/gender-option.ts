import { GENDER_ENUM } from '@/enums/gender-enum';

export interface GenderOption {
  id: GENDER_ENUM;
  nameEn: string;
  nameAr: string;
}

export const GENDER_OPTIONS: GenderOption[] = [
  {
    id: GENDER_ENUM.MALE,
    nameEn: 'Male',
    nameAr: 'ذكر',
  },
  {
    id: GENDER_ENUM.FEMALE,
    nameEn: 'Female',
    nameAr: 'أنثى',
  },
];
