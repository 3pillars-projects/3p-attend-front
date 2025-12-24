import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '@/views/layout/core-layout/header/header.component';
import { FooterComponent } from '@/views/layout/core-layout/footer/footer.component';
import { LanguageService } from '@/services/shared/language.service';
import { Subscription } from 'rxjs';
import { LANGUAGE_ENUM } from '@/enums/language-enum';

@Component({
  selector: 'app-privacy-policy',
  imports: [HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss',
})
export class PrivacyPolicyComponent implements OnInit, OnDestroy {
  languageService = inject(LanguageService);
  currentLang: string = LANGUAGE_ENUM.ENGLISH;
  langSub!: Subscription;
  LANGUAGE_ENUM = LANGUAGE_ENUM;

  ngOnInit() {
    this.currentLang = this.languageService.getCurrentLanguage();
    this.langSub = this.languageService.languageChanged$.subscribe((lang) => {
      this.currentLang = lang;
    });
  }

  ngOnDestroy() {
    if (this.langSub) {
      this.langSub.unsubscribe();
    }
  }
}
