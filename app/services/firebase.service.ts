import { Injectable, NgZone } from "@angular/core";
import { Router } from "@angular/router";
import * as dialogs from 'ui/dialogs';
import { User, Calendar, MonthYear } from "../models";
import { BackendService } from "./backend.service";
import firebase = require("nativescript-plugin-firebase");
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { UtilsService } from './utils.service';
import 'rxjs/add/operator/share';
import * as CalendarNative from "nativescript-calendar";

@Injectable()
export class FirebaseService {
  constructor(
    private ngZone: NgZone,
    private utils: UtilsService,
    private router: Router
  ) { }

  items: BehaviorSubject<Array<Calendar>> = new BehaviorSubject([]);

  private _allItems: Array<Calendar> = [];
  private _MYItems: Array<any> = [];


  register(user: User) {
    return firebase.createUser({
      email: user.email,
      password: user.password
    }).then(
      function (result: any) {
        return JSON.stringify(result);
      },
      function (errorMessage: any) {
        alert(errorMessage);
      }
      )
  }

  login(user: User) {
    return firebase.login({
      type: firebase.LoginType.PASSWORD,
      // email: user.email,
      // password: user.password
      passwordOptions: {
        email: user.email,
        password: user.password
      }
    }).then((result: any) => {
      BackendService.token = result.uid;
      return JSON.stringify(result);
    }, (errorMessage: any) => {
      alert(errorMessage);
    });
  }

  loginFacebook() {
    return firebase.login({
      type: firebase.LoginType.FACEBOOK,
      // Optional
      facebookOptions: {
        // defaults to ['public_profile', 'email']
        scope: ['public_profile', 'email']
      }
    }).then((result: any) => {
      BackendService.token = result.uid;
      return JSON.stringify(result);
    }, (errorMessage: any) => {
      dialogs.alert({
        title: 'Falha ao entrar com Facebook',
        message: errorMessage,
        okButtonText: 'Ok'
      })
    });
  }

  logout() {
    BackendService.token = "";
    firebase.logout();
    this.router.navigate(["/login"]);
    return true;
  }

  resetPassword(email) {
    return firebase.resetPassword({
      email: email
    }).then((result: any) => {
      return true;
    },
      function (errorMessage: any) {
        dialogs.alert({
          title: 'Falha ao recuperar senha',
          message: errorMessage,
          okButtonText: 'Ok'
        })
      }
      ).catch(this.handleErrors);
  }

  add(calendar: Calendar) {
    calendar.UID = BackendService.token;

    return firebase.push(
      "/Calendar",
      calendar
    )
      .then(
      function (result: any) {
        return result.key;
      },
      function (errorMessage: any) {
      });
  }

  getCalendarList(): Observable<any> {
    return new Observable((observer: any) => {
      let path = 'Calendar';
      let onValueEvent = (snapshot: any) => {
        this.ngZone.run(() => {
          let results = this.handleSnapshot(snapshot.value);
          observer.next(results);
        });
      };
      firebase.addValueEventListener(onValueEvent, `/${path}`);
    }).share();
  }

  getCalendar(id: string): Observable<Calendar> {
    return new Observable<Calendar>((observer: any) => {
      observer.next(this._allItems.filter(s => s.id === id)[0]);
    }).share();
  }

  editCalendar(calendar: Calendar) {
    // deleta evento anterior
    if (calendar.calendarid !== "0" && calendar.calendarid !== undefined) {
      this.calDeleteEvent(calendar.calendarid);
    }

    // seta dados do evento para inserir no calendario
    if (calendar.date !== undefined && calendar.time !== undefined) {
      var oDate = new Date(calendar.date);
      oDate.setHours(
        parseInt(calendar.time.substr(0, 2), 10),
        parseInt(calendar.time.substr(3, 2), 10),
        0,
        0
      );
      var sTimestamp = oDate.getTime();
      var options = {
        title: calendar.name,
        startDate: new Date(oDate.getTime()),
        endDate: new Date(oDate.getTime() + (1 * 60 * 60 * 1000)),
        location: calendar.address,
        reminders: {
          first: 4320,
          second: 1440
        },
        notes: `${calendar.status ? calendar.status : ''} - ${calendar.service ? calendar.service : ''} - ${calendar.infoadd ? calendar.infoadd : ''}`,
        calendar: {
          name: "JobTime",
          color: "#1976d2",
          accountName: "JobTime"
        }
      };

      return CalendarNative.createEvent(options).then(
        (createdId) => {
          calendar.calendarid = createdId;
          this.setCalendar(calendar);
        },
        (error) => {
          // console.log("Error creating an Event: " + error);
          this.setCalendar(calendar);
        }
      );
    }else{
      return this.setCalendar(calendar);      
    }
  }

  setCalendar(calendar: Calendar) {
    this.publishUpdates();
    return firebase.setValue("/Calendar/" + calendar.id,
      calendar
    )
      .then(
      function (result: any) {
        return 'Agenda atualizada!';
      },
      function (errorMessage: any) {
      });
  }

  delete(calendar: Calendar) {
    if (calendar.calendarid !== "0" && calendar.calendarid !== undefined) {
      this.calDeleteEvent(calendar.calendarid);
    }
    return firebase.remove("/Calendar/" + calendar.id)
      .catch(this.handleErrors);
  }

  handleSnapshot(data: any) {
    this._allItems = [];
    if (data) {
      for (let id in data) {
        let result = (<any>Object).assign({ id: id }, data[id]);
        if (BackendService.token === result.UID) {
          this._allItems.push(result);
        }
      }
      this.publishUpdates();
    }
    return this._allItems;
  }

  publishUpdates() {
    this._allItems.sort(function (a, b) {
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      return 0;
    })
    this.items.next([...this._allItems]);
  }

  monthYears(all: string) {
    let months = []
    months.push(all)
    this._allItems.forEach(value => {
      if (value.monthyear != "" && months.indexOf(value.monthyear) === -1) {
        months.push(value.monthyear)
      }
    })
    return months
  }

  handleErrors(error) {
    return Promise.reject(error.message);
  }

  // metodos calendario
  calDeleteEvent(calendarId: string) {
    // Only the `title`, `startDate` and `endDate` are mandatory, so this would suffice:
    var options = {
      startDate: new Date(new Date().getTime() - (10000 * 24 * 60 * 60 * 1000)),
      endDate: new Date(new Date().getTime() + (10000 * 50 * 24 * 60 * 60 * 1000)),
      id: calendarId,
      calendar: {
        name: "JobTime",
        color: "#1976d2",
        accountName: "JobTime"
      }
    };

    CalendarNative.deleteEvents(options).then(
      function (deletedEventIds) {
        console.log(JSON.stringify(deletedEventIds));
      },
      function (error) {
        console.log("Error deleting Events: " + error);
      }
    );
  }
}