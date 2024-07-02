import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import {  FormBuilder, Validators, FormGroup,FormControl } from '@angular/forms';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { __await } from 'tslib';
import { MatSnackBar } from '@angular/material/snack-bar';
import { employeemodelsform } from '../../../models/employeemodels';
import * as moment from 'moment';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  Forms: FormGroup;
  roles = []

  constructor(private userService: UserService,private snackBar: MatSnackBar,
    private spinner: NgxSpinnerService,private formBuilder: FormBuilder, private router: Router,
    private devModels: employeemodelsform ) { }

    ngOnInit() {
      this.Forms = this.devModels.modelForms;
      this.Forms.reset();
      /*this.userService.getAllRoles().subscribe((posts) => {
        this.roles = posts as any;
        //console.log(posts);
      });*/
    
  
    }
    async FormSubmit() {
      const formValue = this.Forms.value;
      try {
        await this.userService.Add(formValue).subscribe(
          data => {
            console.log("post req successfull");
            this.snackBar.open('Data Added Successfully', "Remove", {
              duration: 6000,
              verticalPosition: 'top',
              panelClass: ['blue-snackbar']
            });
            this.router.navigate(["/admin/listalluser"]);
          },
          error => {
            console.log("error post", error);
            this.snackBar.open('Unsuccessfull', "Remove", {
              duration: 6000,
              verticalPosition: 'top',
              panelClass: ['red-snackbar']
            });
          }
        );
 
      }
      catch (err) {
      }
    }
}
