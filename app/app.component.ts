import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import * as Platform from 'platform';
import { enableProdMode } from '@angular/core';
import { BackendService } from './services';

enableProdMode();

@Component({
    selector: "ns-app",
    templateUrl: "app.component.html",
})

export class AppComponent {
    constructor(private translate: TranslateService) {
        this.translate.setDefaultLang("en");
        this.translate.use(Platform.device.language);
    }
}
