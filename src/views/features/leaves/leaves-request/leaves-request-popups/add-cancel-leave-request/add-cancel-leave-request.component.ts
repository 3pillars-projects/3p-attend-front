import { Component } from '@angular/core';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';

@Component({
  selector: 'app-add-cancel-leave-request',
  imports: [Select, DatePicker, Textarea],

  templateUrl: './add-cancel-leave-request.component.html',
  styleUrl: './add-cancel-leave-request.component.scss',
})
export class AddCancelLeaveRequestComponent {}
