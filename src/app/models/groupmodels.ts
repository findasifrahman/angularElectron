import { NgModule } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';

export interface groupinterface {
  gr_name: string,
  gr_number: string,
  no_of_membar: string,
  membar_id: string,
  members: string
}
@NgModule({
  imports: [ReactiveFormsModule, FormsModule],
  exports:[]
})
export class groupmodels {
  modelForms: FormGroup = this.formBuilder.group({
    gr_name: ["", Validators.required],
    gr_number:[""],
    no_of_membar: [""],
    membar_id: [""],
    members: [""]
  });

  constructor(private formBuilder: FormBuilder) {}

}
