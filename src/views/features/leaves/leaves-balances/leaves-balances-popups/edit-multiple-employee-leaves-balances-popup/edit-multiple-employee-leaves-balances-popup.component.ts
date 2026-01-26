import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
@Component({
  selector: 'app-edit-multiple-employee-leaves-balances-popup',
  imports: [TabsModule, InputNumber, FormsModule],
  templateUrl: './edit-multiple-employee-leaves-balances-popup.component.html',
  styleUrl: './edit-multiple-employee-leaves-balances-popup.component.scss',
})
export class EditMultipleEmployeeLeavesBalancesPopupComponent {
  value1: number = 50;
}
