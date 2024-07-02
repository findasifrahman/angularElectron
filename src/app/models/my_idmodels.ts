import { NgModule } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';

export interface alluserinterface {
  uid: string,
  ship: string
}
@NgModule({
  imports: [ReactiveFormsModule, FormsModule],
  exports:[]
})
export class models {
  modelForms: FormGroup = this.formBuilder.group({
    uid: ["", Validators.required],
    ship:[""]
  });

  constructor(private formBuilder: FormBuilder) {}

}
