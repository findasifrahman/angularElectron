import { NgModule } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';

export interface encinterface {
    key: string
}
@NgModule({
  imports: [ReactiveFormsModule, FormsModule],
  exports:[]
})
export class encmodels {
  modelForms: FormGroup = this.formBuilder.group({
    key: ["", Validators.required]
  });

  constructor(private formBuilder: FormBuilder) {}

}
