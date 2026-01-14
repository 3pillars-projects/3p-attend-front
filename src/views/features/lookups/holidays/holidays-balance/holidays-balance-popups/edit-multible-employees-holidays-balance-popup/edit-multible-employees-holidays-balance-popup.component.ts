import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
@Component({
  selector: 'app-edit-multible-employees-holidays-balance-popup',
  imports: [TabsModule, Select, InputNumber, FormsModule],
  templateUrl: './edit-multible-employees-holidays-balance-popup.component.html',
  styleUrl: './edit-multible-employees-holidays-balance-popup.component.scss',
})
export class EditMultibleEmployeesHolidaysBalancePopupComponent {
  value1: number = 50;
}
