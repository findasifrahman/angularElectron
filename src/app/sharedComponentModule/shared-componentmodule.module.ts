import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { SharedmodulesModule } from '../commonModule/sharedModule/sharedmodules.module';
import { SocialcontactcardComponent } from './socialcontactcard/socialcontactcard.component';
import { ThreecolmatgridComponent } from './threecolmatgrid/threecolmatgrid.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { FileUploadComponent } from './file-upload/file-upload.component';

//import { FileSelectDirective } from 'ng2-file-upload';
import { FileUploadModule } from 'ng2-file-upload';

import { ProductviewcardComponent } from './productviewcard/productviewcard.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { MattreeComponent } from './mattree/mattree.component';
import { StatComponent } from './stat/stat.component';
import { CardInfoComponent } from './card-info/card-info.component';
import { UserStatusComponent } from './user-status/user-status.component';


import { SelectSearchComponent } from './select-search/select-search.component';
import { UserStatusAdminComponent } from './user-status-admin/user-status-admin.component';
import { TableforAdminComponent } from './tablefor-admin/tablefor-admin.component';
import { InlineEditComponent } from './inline-edit/inline-edit.component';
import { PassDialogComponent } from './pass-dialog/pass-dialog.component';

@NgModule({
  declarations: [NavbarComponent, FooterComponent, SocialcontactcardComponent,
     ThreecolmatgridComponent, ConfirmationDialogComponent, FileUploadComponent,
     //FileSelectDirective,
     ProductviewcardComponent,
     SidenavComponent,StatComponent,
     MattreeComponent,
     CardInfoComponent,
     UserStatusComponent,

     SelectSearchComponent,
     UserStatusAdminComponent,
     TableforAdminComponent,
     InlineEditComponent,
     PassDialogComponent],
  imports: [
    CommonModule,
    RouterModule,
    SharedmodulesModule,
    FileUploadModule,
    FormsModule, ReactiveFormsModule
  ],
  entryComponents:[ConfirmationDialogComponent,PassDialogComponent],
  exports:[NavbarComponent,FooterComponent,SocialcontactcardComponent,ThreecolmatgridComponent,
    ConfirmationDialogComponent,PassDialogComponent,FileUploadComponent,ProductviewcardComponent,SidenavComponent,
    MattreeComponent, StatComponent, CardInfoComponent, UserStatusComponent,SelectSearchComponent,UserStatusAdminComponent,
    TableforAdminComponent,InlineEditComponent]
})
export class SharedComponentmoduleModule { }
