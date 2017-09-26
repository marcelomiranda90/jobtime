import { NgModule, NO_ERRORS_SCHEMA, LOCALE_ID } from '@angular/core';
import { NativeScriptModule } from 'nativescript-angular/nativescript.module';
import { NativeScriptFormsModule } from 'nativescript-angular/forms';
import { AppRoutingModule, authProviders } from '../../app.routing';
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { NativeScriptHttpModule } from 'nativescript-angular/http';
import { BackendService, FirebaseService, UtilsService } from '../../services';
import { Routes } from "@angular/router";
import { LoginComponent } from './login.component';
import {TranslateModule, TranslateLoader} from "@ngx-translate/core";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {Http} from "@angular/http";
import * as Platform from 'platform';

export function translateLoaderFactory(http: Http) {
    return new TranslateHttpLoader(http, "/i18n/", ".json");
};

const ROUTES: Routes = [
  {path: '', component: LoginComponent}
]

@NgModule({ 
    imports: [
        NativeScriptModule,
        NativeScriptFormsModule,
        NativeScriptHttpModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                deps: [Http],
                useFactory: (translateLoaderFactory)
            }
        }),
        NativeScriptRouterModule,
        NativeScriptRouterModule.forChild(ROUTES)
    ],
    declarations: [
        LoginComponent
    ],
    providers: [
        BackendService,
        FirebaseService,
        UtilsService,
        authProviders,
        { provide: LOCALE_ID, useValue: (Platform.device.language + '-'+ Platform.device.region) }
        
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class LoginModule { }
