import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
@Component({
  selector: 'app-transfer-leaves-balances',
  imports: [TableModule, Select, BreadcrumbModule, InputTextModule, InputNumber],
  templateUrl: './transfer-leaves-balances.component.html',
  styleUrl: './transfer-leaves-balances.component.scss',
})
export default class TransferLeavesBalancesComponent {
  date2: Date | undefined;
  attendance!: any[];
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;


  ngOnInit() {
    this.items = [{ label: 'لوحة المعلومات' }, { label: 'قائمة الفعاليات' }];
    this.attendance = [
      {
        titleAr: 'سياستنا و خصوصيتنا',
        titleEn: 'Our Policy and Privacy',
      },
    ];
  }
}
