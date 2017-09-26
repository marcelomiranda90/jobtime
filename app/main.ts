import { platformNativeScriptDynamic } from "nativescript-angular/platform";
import { AppModule } from "./app.module";
import { setStatusBarColors } from "./utils";
import { BackendService } from "./services/backend.service";
import firebase = require("nativescript-plugin-firebase");

firebase.init({
  persist: true,
  storageBucket: 'gs://beauty-calendar-729ab.appspot.com',
  onAuthStateChanged: (data: any) => {
    if (data.loggedIn) {
      BackendService.token = data.user.uid;
    }
    else {
      BackendService.token = "";
    }
  }
})
.then(
function (instance) {
  console.log("firebase.init done");
},
function (error) {
  console.log("firebase.init error: " + error);
}
);
platformNativeScriptDynamic().bootstrapModule(AppModule);
