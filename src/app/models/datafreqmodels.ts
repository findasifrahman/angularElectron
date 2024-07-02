import { NgModule } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';

export interface alluserinterface {
  uid: string,
  ship: string,
  uname: string
}
@NgModule({
  imports: [ReactiveFormsModule, FormsModule],
  exports:[]
})
export class datafreqmodels {
  modelForms: FormGroup = this.formBuilder.group({
    channel_id: ["", Validators.required],
    frequency:[""],
    other: [""]
  });

  constructor(private formBuilder: FormBuilder) {}

}
