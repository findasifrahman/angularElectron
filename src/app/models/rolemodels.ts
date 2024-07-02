import { NgModule } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';

export interface roleinterface {
  rolename: string,
}
@NgModule({
  imports: [ReactiveFormsModule, FormsModule],
  exports:[]
})
export class rolemodels {
  modelForms: FormGroup = this.formBuilder.group({
    rolename: ["", Validators.required],
  });

  constructor(private formBuilder: FormBuilder) {}

}
