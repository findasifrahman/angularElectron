
import { BrowserModule } from '@angular/platform-browser';
import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Routes, RouterModule } from '@angular/router';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

//import { LoginComponent } from './AllComponent/login/login.component';
import { LogoutComponent } from './AllComponent/logout/logout.component';

import {  ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedmodulesModule } from './commonModule/sharedModule/sharedmodules.module';

import { SharedComponentmoduleModule  } from './sharedComponentModule/shared-componentmodule.module';
import { ChartsModule } from 'ng2-charts';

import { NgxSpinnerModule } from "ngx-spinner";

import { MainComponent } from './AllComponent/main/main.component';
import { LandingComponent } from './AllComponent/landing/landing.component';
@NgModule({
  declarations: [
    AppComponent, //LoginComponent, 
    LogoutComponent, MainComponent, LandingComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,ReactiveFormsModule, FormsModule,SharedmodulesModule,
    SharedComponentmoduleModule,ChartsModule,NgxSpinnerModule

  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
