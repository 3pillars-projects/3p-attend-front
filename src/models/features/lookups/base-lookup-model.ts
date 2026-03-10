import { LANGUAGE_ENUM } from '@/enums/language-enum';

export class BaseLookupModel {
  id?: number;
  nameAr?: string;
  nameEn?: string;
  [key: string]: any;

  getNameBasedOnLanguage(currentLang: string) {
    return currentLang == LANGUAGE_ENUM.ARABIC ? this.nameAr : this.nameEn;
  }
}
