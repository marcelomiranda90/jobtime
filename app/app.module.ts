import { NgModule, NO_ERRORS_SCHEMA, LOCALE_ID, NgModuleFactoryLoader } from '@angular/core';
import { NativeScriptModule } from 'nativescript-angular/nativescript.module';
import { NativeScriptFormsModule } from 'nativescript-angular/forms';
import { NativeScriptRouterModule, NSModuleFactoryLoader } from "nativescript-angular/router";

import { AppRoutingModule, authProviders } from './app.routing';
import { AppComponent } from './app.component';

import { NativeScriptHttpModule } from 'nativescript-angular/http';
import { BackendService, FirebaseService, UtilsService } from './services';

import { MenuComponent } from './pages/menu/menu.component';
import { CalendarDetailEditComponent } from './pages/calendar-detail-edit/calendar-detail-edit.component';
import {TranslateModule, TranslateLoader} from "@ngx-translate/core";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {Http} from "@angular/http";
import * as Platform from 'platform';

// for AoT compilation
export function translateLoaderFactory(http: Http) {
    return new TranslateHttpLoader(http, "/i18n/", ".json");
};

@NgModule({ 
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        NativeScriptFormsModule,
        AppRoutingModule,
        NativeScriptHttpModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                deps: [Http],
                useFactory: (translateLoaderFactory)
            }
        })
    ],
    declarations: [
        AppComponent,
        MenuComponent,
        CalendarDetailEditComponent
    ],
    providers: [
        BackendService,
        FirebaseService,
        UtilsService,
        authProviders,
        { provide: LOCALE_ID, useValue: (Platform.device.language + '-'+ Platform.device.region) },
        { provide: NgModuleFactoryLoader, useClass: NSModuleFactoryLoader }
        
        
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
/*
Pass your application module to the bootstrapModule function located in main.ts to start your app
*/
export class AppModule { }
