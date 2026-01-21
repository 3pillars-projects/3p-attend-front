import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-edit-employee-leaves-balances-popup',
  imports: [TabsModule, Select, InputNumber, FormsModule],
  templateUrl: './edit-employee-leaves-balances-popup.component.html',
  styleUrl: './edit-employee-leaves-balances-popup.component.scss',
})
export class EditEmployeeLeavesBalancesPopupComponent {
  value1: number = 50;
}
