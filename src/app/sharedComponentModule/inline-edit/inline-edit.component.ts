import { Component, OnInit, Input, Optional, Host } from '@angular/core';
import { SatPopover } from '@ncstate/sat-popover';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-inline-edit',
  //templateUrl: './inline-edit.component.html',
  styleUrls: ['./inline-edit.component.scss'],

  template: `
    <form (ngSubmit)="onSubmit()">
      <div class="mat-subheading-2">Change Expired Date</div>
      
      <mat-form-field>
        <input matInput type="date" name="comment" [(ngModel)]="comment">
        <mat-hint align="end">{{comment?.length || 0}}/140</mat-hint>
      </mat-form-field>

      <div class="actions">
        <button mat-button type="button" color="primary" (click)="onCancel()">CANCEL</button>
        <button mat-button type="submit" color="primary">SAVE</button>
      </div>
    </form>
  `
})
export class InlineEditComponent implements OnInit {

/** Overrides the comment and provides a reset value when changes are cancelled. */
@Input()
get value(): string { return this._value; }
set value(x: string) {
  this.comment = this._value = x;
}
private _value = '';

/** Form model for the input. */
comment = '';

constructor(@Optional() @Host() public popover: SatPopover) { }

ngOnInit() {
  // subscribe to cancellations and reset form value
  if (this.popover) {
    this.popover.closed.pipe(filter(val => val == null))
      .subscribe(() => this.comment = this.value || '');
  }
}

onSubmit() {
  if (this.popover) {
    this.popover.close(this.comment);
  }
}

onCancel() {
  if (this.popover) {
    this.popover.close();
  }
}



}
