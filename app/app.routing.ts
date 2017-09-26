import { NgModule } from "@angular/core";
import { NativeScriptRouterModule, NSModuleFactoryLoader } from "nativescript-angular/router";
import { Routes } from "@angular/router";

import { MenuComponent } from "./pages/menu/menu.component";
import { CalendarDetailEditComponent } from "./pages/calendar-detail-edit/calendar-detail-edit.component";


import { AuthGuard } from "./services/auth-guard.service";

export const authProviders = [
  AuthGuard
];

const routes: Routes = [
    { path: "", component: MenuComponent, canActivate: [AuthGuard] },
    { path: "login", loadChildren: "./pages/login/login.module#LoginModule" },
    { path: "calendar-detail-edit/:id", component: CalendarDetailEditComponent, canActivate: [AuthGuard]}    
    
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }