import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'
import { CommonModule } from '@angular/common';
import {  ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { HomeComponent} from './home/home.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { RoleGuard } from '../auth/role.guard';
import { AuthGuard } from '../auth/auth.guard';

import { SharedmodulesModule } from '../commonModule/sharedModule/sharedmodules.module';
//import { SharedComponentmoduleModule } from '../sharedComponentModule/shared-componentmodule.module';
import { SharedComponentmoduleModule  } from '../sharedComponentModule/shared-componentmodule.module';


import { AdminlayoutComponent } from '../commonLayout/adminlayout/adminlayout.component';

import { WithoutSidebarlayoutComponent } from '../commonLayout/withoutSidebarlayout/without-sidebarlayout/without-sidebarlayout.component';

// Import library module
import { NgxSpinnerModule } from "ngx-spinner";
//import { MapComponent } from './map/map.component';
import { SetUserComponent } from './set-user/set-user.component';
//import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { AddShipComponent } from './add-ship/add-ship.component';

import { allusermodels } from '../models/allusermodels';
import { models } from '../models/my_idmodels';
import { encmodels } from '../models/encmodels'
import { voicesetmodels } from '../models/voicesetmodels'
import { groupmodels } from '../models/groupmodels'
import { employeemodelsform } from '../models/employeemodels'
import { datafreqmodels } from '../models/datafreqmodels'

import { ChatComponent } from './chat/chat.component';
import { OffmapComponent } from './offmap/offmap.component';
import { MyIdComponent } from './my-id/my-id.component';
import { ListShipComponent } from './list-ship/list-ship.component';
import { EditMyIdComponent } from './edit-my-id/edit-my-id.component';
import { VoiceSettingsComponent } from './voice-settings/voice-settings.component';
import { AdvVoiceSetComponent } from './adv-voice-set/adv-voice-set.component';
import { EditEncComponent } from './edit-enc/edit-enc.component';
import { EditFreqComponent } from './edit-freq/edit-freq.component';
import { LongMsgComponent } from './long-msg/long-msg.component';
import { AddGroupComponent } from './add-group/add-group.component';
import { ListGroupComponent } from './list-group/list-group.component';
import { EditGroupComponent } from './edit-group/edit-group.component';
import { EditUserSetComponent } from './edit-user-set/edit-user-set.component';
import { VoiceenceditComponent } from './voiceencedit/voiceencedit.component';
import { SinglerouteComponent } from './singleroute/singleroute.component';
import { EditsfComponent } from './editsf/editsf.component'

import { LoginComponent } from './login/login.component';
import { AddUserComponent } from './newUser/add-user/add-user.component';
import { EditUserComponent } from './newUser/edit-user/edit-user.component';
import { ListUserComponent } from './newUser/list-user/list-user.component';
import { DataSettingsComponent } from './data-settings/data-settings.component';
import { ChangeAllFreqComponent } from './change-all-freq/change-all-freq.component';
import { BncgEncryptComponent } from './bncg-encrypt/bncg-encrypt.component';
import { DeleteOlderChatComponent } from './delete-older-chat/delete-older-chat.component';
import { ChangeAllDataFreqComponent } from './change-all-data-freq/change-all-data-freq.component';
import { EditDataFreqComponent } from './edit-data-freq/edit-data-freq.component';
import { ChangeStatusMsgStateComponent } from './change-status-msg-state/change-status-msg-state.component';
import { SystemResetComponent } from './system-reset/system-reset.component';
import { ChangeMeshMsgStateComponent } from './change-mesh-msg-state/change-mesh-msg-state.component'
//import { LogoutComponent } from './logout/logout.component'
const routes: Routes = [

  { 
    path: 'login', component: LoginComponent
  },
  {
    path: 'map', component: OffmapComponent
  },
  { 
    path: 'freqedit/:id/:all', component: EditFreqComponent
  },
  { 
    path: 'longmessage', component: LongMsgComponent
  },
  { 
    path: 'home/:user/:id', component: HomeComponent,
  },
  { 
    path: 'setUser', component: SetUserComponent ,
  },

  {
    path: 'voiceset', component: VoiceSettingsComponent
  },
  {
    path: 'dataset', component:DataSettingsComponent
  },
  {
    path: 'chat', component: ChatComponent
  },
  {
    path: 'advvoiceset', component: AdvVoiceSetComponent
  },
  {
    path: 'singleroute/:id', component: SinglerouteComponent
  },
  { path: '',component: AdminlayoutComponent ,children:[
    { path: '', //loadChildren: './settingsComponents/settingsComponents.module#settingsComponentModule'
    children:[
        { path: 'admin/changeallfreq', component: ChangeAllFreqComponent,
          canActivate: [RoleGuard],
          data: {
            expectedRole: ['system_admin']
          }
        },
        { path: 'admin/alluser', component: AddShipComponent,
          canActivate: [RoleGuard],
          data: {
            expectedRole: ['admin','system_admin']
          }
        },

        { path: 'admin/setuser', component: SetUserComponent,
          canActivate: [RoleGuard],
          data: {
            expectedRole: ['admin','system_admin']
          }
        },
        { path: 'admin/addgroup', component: AddGroupComponent,
          canActivate: [RoleGuard],
          data: {
            expectedRole: ['admin','system_admin']
        }},
        ////////////////////////////////////////////
        { 
          path: 'admin/listgroup', component: ListGroupComponent,
          canActivate: [RoleGuard],
          data: {
            expectedRole: ['admin','system_admin']
          }
        },
        { 
          path: 'admin/editgroup/:id', component: EditGroupComponent,
          canActivate: [RoleGuard],
          data: {
            expectedRole: ['admin','system_admin']
          }
        },
        {
          path: 'admin/edituserset', component: EditUserSetComponent,
          canActivate: [RoleGuard],
          data: {
            expectedRole: ['admin','system_admin']
          }
        },
        {
          path: 'admin/voiceencedit', component: VoiceenceditComponent,
          canActivate: [RoleGuard],
          data: {
            expectedRole: ['admin','system_admin']
          }
        },

        {
          path: 'admin/editspreadfactor', component: EditsfComponent,
          canActivate: [RoleGuard],
          data: {
            expectedRole: ['admin','system_admin']
          }
        },
        {
          path: 'admin/listuser', component: ListShipComponent,
          canActivate: [RoleGuard],
          data: {
            expectedRole: ['admin','system_admin']
          }
        },
        {
          path: 'admin/addmyid', component: MyIdComponent,
          canActivate: [RoleGuard],
          data: {
            expectedRole: ['system_admin']
          }
        },
        {
          path: 'admin/editmyid', component: EditMyIdComponent,
          canActivate: [RoleGuard],
          data: {
            expectedRole: ['system_admin']
          }
        },
        {
          path: 'admin/dataencedit', component: EditEncComponent,
          canActivate: [RoleGuard],
          data: {
            expectedRole: ['admin','system_admin']
          }
        },
        {
          path: 'admin/bncgencedit', component: BncgEncryptComponent,
          canActivate: [RoleGuard],
          data: {
            expectedRole: ['admin','system_admin']
          }
        },
        {
          path: 'admin/addalluser', component: AddUserComponent,
          canActivate: [RoleGuard],
          data: {
            expectedRole: ['admin','system_admin']
          }
        },
        {
          path: 'admin/editalluser/:id', component: EditUserComponent,
          canActivate: [RoleGuard],
          data: {
            expectedRole: ['admin','system_admin']
          }
        },
        {
          path: 'admin/listalluser', component: ListUserComponent,
          canActivate: [RoleGuard],
          data: {
            expectedRole: ['admin','system_admin']
          }
        },
        {
          path: 'admin/deletechat', component: DeleteOlderChatComponent,
          canActivate: [RoleGuard],
          data: {
            expectedRole: ['admin','system_admin']
          }
        },
        {
          path: 'admin/alldatafreq', component:ChangeAllDataFreqComponent,
          canActivate: [RoleGuard],
          data: {
            expectedRole: ['admin','system_admin']
          }
        },
        {
          path: 'admin/editdatafreq/:id/:all', component:EditDataFreqComponent,
          canActivate: [RoleGuard],
          data: {
            expectedRole: ['admin','system_admin']
          }
        },
        {
          path: 'admin/editstatusmsg', component:ChangeStatusMsgStateComponent,
          canActivate: [RoleGuard],
          data: {
            expectedRole: ['admin','system_admin']
          }
        },
        {
          path: 'admin/editmeshstate', component: ChangeMeshMsgStateComponent,
          canActivate: [RoleGuard],
          data: {
            expectedRole: ['admin','system_admin']
          }
        },
        {
          path: 'admin/systemreset', component:SystemResetComponent,
          canActivate: [RoleGuard],
          data: {
            expectedRole: ['admin','system_admin']
          }
        }
        
        ///////////////////////////////////////////////

      ]
    },
    ]
  }
]

@NgModule({
 declarations:[AdminlayoutComponent,WithoutSidebarlayoutComponent,
  HomeComponent,
  LoginComponent,
      //MapComponent,
      SetUserComponent,
      AddShipComponent,
      ChatComponent,
      OffmapComponent,
      MyIdComponent,
      ListShipComponent,
      EditMyIdComponent,
      VoiceSettingsComponent,
      AdvVoiceSetComponent,
      DataSettingsComponent,
      EditEncComponent,
      EditFreqComponent,
      LongMsgComponent,
      AddGroupComponent,
      ListGroupComponent,
      EditGroupComponent,
      EditUserSetComponent,
      VoiceenceditComponent,
      SinglerouteComponent,
      EditsfComponent,
      AddUserComponent,
      EditUserComponent,
      ListUserComponent,
      ChangeAllFreqComponent,
      BncgEncryptComponent,
      DeleteOlderChatComponent,
      ChangeAllDataFreqComponent,
      EditDataFreqComponent,
      ChangeStatusMsgStateComponent,
      SystemResetComponent,
      ChangeMeshMsgStateComponent
    ],

  imports: [CommonModule,FormsModule,RouterModule.forChild(routes),SharedComponentmoduleModule,
    ReactiveFormsModule,HttpClientModule,CKEditorModule,SharedmodulesModule,
    NgxSpinnerModule,allusermodels,models,encmodels,voicesetmodels,groupmodels,
    employeemodelsform,datafreqmodels
    /*NgxMapboxGLModule.withConfig({
      accessToken: 'pk.eyJ1IjoiYXNpZjEwMDE4IiwiYSI6ImNrbmNqY2M2bjIyNnkycHA5OHR2eHg1bnAifQ.Ptk-4lJTQB0NOb3gZOHT7w', // Optional, can also be set per map (accessToken input of mgl-map)
      geocoderAccessToken: 'TOKEN' // Optional, specify if different from the map access token, can also be set per mgl-geocoder (accessToken input of mgl-geocoder)
    }) */],

  exports: [AdminlayoutComponent,WithoutSidebarlayoutComponent,HomeComponent, LoginComponent,//LogoutComponent,
    //MapComponent,
    SetUserComponent
 ],
 providers: [AuthGuard,RoleGuard],
 schemas: [CUSTOM_ELEMENTS_SCHEMA]

})

export class allComponentModule{}
