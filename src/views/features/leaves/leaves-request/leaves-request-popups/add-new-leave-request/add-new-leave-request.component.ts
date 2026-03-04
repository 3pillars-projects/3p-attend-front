import { Component } from '@angular/core';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';

@Component({
  selector: 'app-add-new-leave-request',
  imports: [Select, DatePicker, Textarea],
  templateUrl: './add-new-leave-request.component.html',
  styleUrl: './add-new-leave-request.component.scss',
})
export class AddNewLeaveRequestComponent {}
