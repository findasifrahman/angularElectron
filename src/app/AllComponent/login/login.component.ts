import { Component, OnInit,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { LoginService } from './login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import * as moment from 'moment';
// Import library module
import { NgxSpinnerService } from "ngx-spinner";
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  simpleSnackBarRef: any;
  Forms: any;
  constructor(private snackBar: MatSnackBar, private logservice: LoginService,
    private formBuilder: FormBuilder,private router:Router,private spinner: NgxSpinnerService) { }

    ngOnInit() {
      this.Forms = this.formBuilder.group({
        username: ["", Validators.required],
        password: ["", Validators.required],
        roleId: [1]
      });
    }

    async FormSubmit() {
      const formValue = this.Forms.value;
      this.spinner.show();
      

      await this.logservice.submit(formValue).subscribe(response => {
        //this.spinner.hide();
        if(<any>response.error){
          this.spinner.hide();
          this.snackBar.open(<any>response.error,"Undo",{
            duration: 6000,
            verticalPosition: 'top',
            panelClass: ['red-snackbar']
          });
          return
        }
       // console.log("<any>response-",<any>response)
        let token = (<any>response).token;
        localStorage.setItem("jwt", token);
        let role = this.logservice.getrolefromtoken(token)
        console.log("is role is--", role)
        if(role == "admin"){
          this.spinner.hide();
          this.router.navigate(["/admin/addgroup"])
        }else if(role == "system_admin"){
          this.spinner.hide();
          this.router.navigate(["/admin/changeallfreq"])
        }
        else{
            localStorage.setItem("userDetails", JSON.stringify((<any>response).userdata))
            //console.log(token);
            /////////
            //console.log("responsedata.devobj--",response.devobject)
            let count = 0
            let arrlist = []
            let myexp = 0
            let alldevobj = []
            let newrespdata = response.devobject.map((val,index)=>{
                console.log("val.expireDate -- ", val.expireDate)
                if(moment().isAfter(moment(val.expireDate), 'date')){
                  myexp = myexp + 1
                }else{
                  alldevobj.push(val)
                }
                arrlist.push(val.uid)
                if(index == response.devobject.length -1){
                  if(response.devobject.length == myexp){
                    this.spinner.hide();
                    this.snackBar.open('আপনার ডিভাইসটির মেয়াদ শেষ হয়ে গেছে। পরিষেবা সরবরাহকারীর সাথে যোগাযোগ করুন ',"Undo",{
                      duration: 6000,
                      verticalPosition: 'top',
                      panelClass: ['red-snackbar']
                    });
                  }else{
                    console.log(this.logservice.getrole());
                    this.snackBar.open('Congratulations. Logged In Succesdfully', "Remove", {
                      duration: 6000,
                      verticalPosition: 'top',
                      panelClass: ['blue-snackbar']
                    });
                    localStorage.setItem("alluser",JSON.stringify( alldevobj))//JSON.stringify(response.devobject.map(({ uid }) => uid)));
            
                    this.router.navigate(["/viewlocation"])//,{devobj: JSON.stringify(response.devobject.map(({ uid }) => uid))  }]);
                  }
                  console.log("final uid arr-", val.uid)
                }
                return val
            })
        }

        //this.props.devicedataPropAdd(newrespdata)//responseData.devobject)
        //////////////

      }, err => {
        //console.log(err.error.error)
        console.log(err.error)
        this.spinner.hide();
        this.snackBar.open('Wrong -- ' + err.error.error,"Undo",{
          duration: 6000,
          verticalPosition: 'top',
          panelClass: ['red-snackbar']
        });
      });
    }

}
