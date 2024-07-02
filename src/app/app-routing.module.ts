import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { JwtModule } from '@auth0/angular-jwt';
//import { allComponentModule } from './AllComponent/allComponent.module'
//import { AdminlayoutComponent } from './commonLayout/adminlayout/adminlayout.component';
import { LoginComponent } from './AllComponent/login/login.component';
import { LogoutComponent } from './AllComponent/logout/logout.component';
import { HomeComponent} from './AllComponent/home/home.component'//'./home/home.component';
import { MainComponent } from './AllComponent/main/main.component';
import { LandingComponent } from './AllComponent/landing/landing.component';

const routes: Routes = [
  /*{
    path: '', component: MainComponent, pathMatch: 'full'
  },*/
  {
    path: '', component: LandingComponent, pathMatch: 'full'
  },
  {
    path: 'logout', component: LogoutComponent
  },
  { path: '',     //component: AdminlayoutComponent,
    children: [
      { path:'', loadChildren: () => import('./AllComponent/allComponent.module').then(m => m.allComponentModule) }
    ]
  },

];
export function mytokenGetter() {
  //return this.logservice.getUserLogStatus();
  return localStorage.getItem('jwt');
}
@NgModule({
  imports: [RouterModule.forRoot(routes),
    JwtModule.forRoot({/* automatically assign bearer token with every http request service*/
      config: {
        tokenGetter: mytokenGetter,
        //whitelistedDomains: ['localhost:5022','18.136.57.177:5022'],
        //blacklistedRoutes: []
      }
    }) ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

