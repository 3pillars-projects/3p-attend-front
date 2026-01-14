import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-edit-employee-holidays-balance-popup',
  imports: [TabsModule, Select, InputNumber, FormsModule],
  templateUrl: './edit-employee-holidays-balance-popup.component.html',
  styleUrl: './edit-employee-holidays-balance-popup.component.scss',
})
export class EditEmployeeHolidaysBalancePopupComponent {
  value1: number = 50;
}
