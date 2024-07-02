import { NgModule } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';

export interface vendormodels {
  vendorId: number,
  vendorName: string,
  address:string,
  role: string,
  mobNo: string,
  info: number
}
@NgModule({
  imports: [ReactiveFormsModule, FormsModule],
  exports:[]
})
export class vendormodelsform {
  modelForms: FormGroup = this.formBuilder.group({
    vendorId: ["", Validators.required],
    vendorName: ["", Validators.required],
    address: [""],
    role: [""],
    mobNo: ["", Validators.required],
    info: [""]
  });

  constructor(private formBuilder: FormBuilder) {}

}
