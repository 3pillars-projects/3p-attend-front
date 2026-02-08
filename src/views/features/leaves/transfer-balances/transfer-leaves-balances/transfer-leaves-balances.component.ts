import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { InputTextModule } from 'primeng/inputtext';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
@Component({
  selector: 'app-transfer-leaves-balances',
  imports: [TableModule, Paginator, Select, BreadcrumbModule, InputTextModule],
  templateUrl: './transfer-leaves-balances.component.html',
  styleUrl: './transfer-leaves-balances.component.scss',
})
export default class TransferLeavesBalancesComponent {
  date2: Date | undefined;
  attendance!: any[];
  items: MenuItem[] | undefined;
  first: number = 0;
  home: MenuItem | undefined;
  rows: number = 10;

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
  }
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
