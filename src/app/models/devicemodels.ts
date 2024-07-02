import { NgModule } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';

export interface devicemodels {
  uid: string,
  userId: number,
  deviceName: string,
  simNo:string,
  activateDate: string,
  expireDate: string,
  monthFee: number,
  bkash: string,
  address: string,
  backup_day: string
}
@NgModule({
  imports: [ReactiveFormsModule, FormsModule],
  exports:[]
})
export class devicemodelsform {
  modelForms: FormGroup = this.formBuilder.group({
    uid: ["", Validators.required],
    userId: ["", Validators.required],
    deviceName: ["", Validators.required],
    simNo: ["", Validators.required],
    activateDate: ["", Validators.required],
    expireDate: ["", Validators.required],
    monthFee: [0, Validators.required],
    bkash: ["", Validators.required],
    address: ["", Validators.required],
    device_model: ["", Validators.required],
    backup_day: [0, Validators.required],
    package_type: ["", Validators.required],
    carType: [""],
    fuel_sensor_present: [false]
  });

  constructor(private formBuilder: FormBuilder) {}

}
