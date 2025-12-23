import { Component } from '@angular/core';
import { HeaderComponent } from '@/views/layout/core-layout/header/header.component';
import { FooterComponent } from '@/views/layout/core-layout/footer/footer.component';

@Component({
  selector: 'app-privacy-policy',
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss',
})
export class PrivacyPolicyComponent {}
