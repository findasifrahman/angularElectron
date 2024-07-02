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
export class allusermodels {
  modelForms: FormGroup = this.formBuilder.group({
    uid: ["", Validators.required],
    ship:[""],
    uname: [""]
  });

  constructor(private formBuilder: FormBuilder) {}

}
