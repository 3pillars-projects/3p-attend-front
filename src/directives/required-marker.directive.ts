import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, NgControl, Validators } from '@angular/forms';
import { merge, Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[formControlName]',
  standalone: true,
})
export class RequiredMarkerDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private el: ElementRef<HTMLElement>,
    private controlDir: NgControl
  ) {}

  ngOnInit(): void {
    const nativeEl = this.el.nativeElement;

    // ⛔ Skip if marked with noAsterisk
    if (nativeEl.hasAttribute('noAsterisk')) return;

    // ⛔ Skip if not inside a form
    const form = nativeEl.closest('form');
    if (!form) return;

    const ctrl = this.controlDir.control;
    if (!ctrl) return;

    // Re-evaluate on init + whenever control state changes
    merge(ctrl.statusChanges ?? [], ctrl.valueChanges ?? [])
      .pipe(startWith(null), takeUntil(this.destroy$))
      .subscribe(() => this.applyRequiredClass(form, nativeEl, ctrl));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private applyRequiredClass(form: Element, nativeEl: HTMLElement, ctrl: AbstractControl) {
    const isRequired = this.isControlRequired(ctrl);

    // ✅ Special handling for radio buttons
    if (nativeEl.getAttribute('type') === 'radio') {
      const formControlName = nativeEl.getAttribute('formControlName');
      if (!formControlName) return;

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
        questionLabel.classList.toggle('required', isRequired);
      }

      return;
    }

    // ✅ Regular input/select/textarea handling
    const id = nativeEl.getAttribute('id') || nativeEl.getAttribute('inputId');
    if (!id) return;

    const label = form.querySelector(`label[for="${id}"]`);
    if (!label) return;

    label.classList.toggle('required', isRequired);
  }

  private isControlRequired(ctrl: AbstractControl): boolean {
    // If it's disabled, treat as not required for UI marker
    if (ctrl.disabled) return false;

    // Angular 14+ has hasValidator
    const anyCtrl = ctrl as any;
    if (typeof anyCtrl.hasValidator === 'function') {
      return anyCtrl.hasValidator(Validators.required);
    }

    // Fallback for older versions: probe by setting empty value
    // (still not perfect with complex composed validators, but workable)
    const v = ctrl.validator ? ctrl.validator({ ...ctrl, value: null } as any) : null;
    return !!v?.['required'];
  }
}
