import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-add-edit-limited-time-permission-popup',
  imports: [DatePickerModule, FormsModule, TextareaModule, InputTextModule, Select, CommonModule],
  templateUrl: './add-edit-limited-time-permission-popup.component.html',
  styleUrl: './add-edit-limited-time-permission-popup.component.scss',
})
export class AddEditLimitedTimePermissionPopupComponent {

  
}
