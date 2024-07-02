import { NgModule } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';

export interface employeemodels {
  username: string,
  roleId: number,
  password: string,

}
@NgModule({
  imports: [ReactiveFormsModule, FormsModule],
  exports:[]
})
export class employeemodelsform {
  modelForms: FormGroup = this.formBuilder.group({
    username: ["", Validators.required],
    password: ["", Validators.required],

  });

  constructor(private formBuilder: FormBuilder) {}

}
