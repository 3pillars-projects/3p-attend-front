import { Directive, ElementRef, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[formControlName]',
  standalone: true,
})
export class RequiredMarkerDirective implements OnInit {
  constructor(
    private el: ElementRef,
    private control: NgControl
  ) {}

  ngOnInit(): void {
    const nativeEl = this.el.nativeElement as HTMLElement;

    // ⛔ Skip if marked with noAsterisk
    if (nativeEl.hasAttribute('noAsterisk')) return;

    // ⛔ Skip if not inside a form
    const form = nativeEl.closest('form');
    if (!form) return;

    const formControl = this.control.control;
    if (!formControl || !formControl.validator) return;

    const validator = formControl.validator({} as any);
    const isRequired = validator && validator['required'] === true;

    if (!isRequired) return;

    // ✅ Special handling for radio buttons
    if (nativeEl.getAttribute('type') === 'radio') {
      const formControlName = nativeEl.getAttribute('formControlName');

      // Only process the first radio button in the group
      const allRadiosInGroup = form.querySelectorAll(
        `input[type="radio"][formControlName="${formControlName}"]`
      );

      if (allRadiosInGroup[0] !== nativeEl) {
        return; // Skip if this is not the first radio
      }

      // Find the question label by data attribute
      const questionLabel = form.querySelector(`[radio-label-for="${formControlName}"]`);

      if (questionLabel) {
        questionLabel.classList.add('required');
      }

      return;
    }

    // ✅ Regular input/select/textarea handling
    let label: Element | null = null;
    const id = nativeEl.getAttribute('id') || nativeEl.getAttribute('inputId');

    // Case 1: Input has an id (or inputId), find label with for="id"
    if (id) {
      label = form.querySelector(`label[for="${id}"]`);
    }

    // Apply the required class
    if (label) {
      label.classList.add('required');
    }
  }
}
