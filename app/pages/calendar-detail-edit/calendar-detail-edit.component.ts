import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { Injectable, NgZone } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { TextField } from 'ui/text-field';
import { Page } from "ui/page";
import { DatePicker } from "ui/date-picker";
import { setTimeout } from "timer";
import { action } from "ui/dialogs";
import { Calendar } from "../../models/calendar.model";
import { RouterExtensions } from 'nativescript-angular/router/router-extensions';
import { FirebaseService, UtilsService } from "../../services";
import * as dialogs from "ui/dialogs";
import { TranslateService } from "@ngx-translate/core";

let timeList = ["00:00", "00:30", "01:00", "01:30", "02:00", "02:30", "03:00", "03:30", "04:00", "04:30", "05:00", "05:30", "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"];

@Component({
	selector: 'calendar-detail-edit',
	moduleId: module.id,
	templateUrl: './calendar-detail-edit.component.html',
	styleUrls: ['./calendar-detail-edit.component.css']
})

export class CalendarDetailEditComponent implements OnInit {
	id: string;
	public isButtonVisible = false;
	public isItemVisible = false;
	public times: Array<string>;
	public picked: string;
	public date;
	private sub: any;
	calendar: Calendar;
	tmpFormData: Calendar
	public ref: Observable<any>;
	statusList: Array<string>;
	labels:any;
	constructor(private page: Page, private firebaseService: FirebaseService, private routerExtensions: RouterExtensions,
		private route: ActivatedRoute,
		private router: Router,
		private ngZone: NgZone,
		private translate: TranslateService) {
		this.calendar = new Calendar();
		translate.get(['STATUS.CONFIRMADO', 'STATUS.CANCELADO', 'STATUS.INTERESSADO', 'CANCELAR', 'DIALOGS.SELSTATUSTITLE',
									'DIALOGS.SELSTATUSMSG', 'DIALOGS.SELTIMETITLE', 'DIALOGS.SELTIMEMESSAGE', 'DIALOGS.SUCCESS',
									'DIALOGS.SUCCESSUPDATE', 'DIALOGS.SUCCESSDELETE', 'FECHAR'])
									.subscribe((res) => {
										this.statusList = [ res['STATUS.CONFIRMADO'], res['STATUS.CANCELADO'], res['STATUS.INTERESSADO'] ];
										this.labels = {
											"cancelar": res['CANCELAR'],
											"fechar": res['FECHAR'],
											"statustitle": res['DIALOGS.SELSTATUSTITLE'],
											"statusmsg": res['DIALOGS.SELSTATUSMSG'],
											"horariotitle": res['DIALOGS.SELTIMETITLE'],
											"horariomsg": res['DIALOGS.SELTIMEMSG'],
											"sucesso":  res['DIALOGS.SUCCESS'],
											"msgatualizado": res['DIALOGS.SUCCESSUPDATE'],
											"msgexcluido": res['DIALOGS.SUCCESSDELETE']
										}
		});
	}

	ngOnInit() {
		let datePicker = this.page.getViewById<DatePicker>("datePicker");
		let today = new Date();
		datePicker.year = today.getFullYear();
		datePicker.month = today.getMonth() + 1;
		datePicker.day = today.getDate();
		datePicker.minDate = new Date(2010, 0, 29);
		datePicker.maxDate = new Date(2045, 4, 12);

		this.sub = this.route.params.subscribe((params: any) => {
			this.id = params['id'];
			this.firebaseService.getCalendar(this.id).subscribe((ref) => {
				this.ngZone.run(() => {
					this.calendar = ref;
					this.date = ref.date;
					this.tmpFormData = Object.assign({}, this.calendar); 
				});
			});
		});
	}

	goBack() {
		this.routerExtensions.backToPreviousPage();
	}

	submit() {
		//deleta o evento
		this.firebaseService.editCalendar(this.tmpFormData)
		.then((message: any) => {		
			dialogs.alert({
				title: this.labels.sucesso,
				message: this.labels.msgatualizado,
				okButtonText: this.labels.fechar
			}).then(() => {
				console.log("Dialog closed!");
			});
			this.goBack();
		})
	}

	delete() {
		this.firebaseService.delete(this.calendar)
			.then((message: any) => {
				dialogs.alert({
					title: this.labels.sucesso,
					message: this.labels.msgexcluido,
					okButtonText: this.labels.fechar
				}).then(() => {
					console.log("Dialog closed!");
				});
				this.goBack();
			})
	}

	enterDate() {
		let datePicker = this.page.getViewById<DatePicker>("datePicker");
		let selectedDate = new Date(datePicker.year, datePicker.month - 1, datePicker.day);
		this.date = selectedDate
		this.tmpFormData.monthyear = datePicker.month + "/" + datePicker.year
		this.tmpFormData.dateinsert = Date.now()
		this.tmpFormData.date = new Date(this.date).getTime();
		this.isButtonVisible = false;
		this.isItemVisible = false;
	}

	showDatePicker() {
		let textFieldDate = this.page.getViewById<TextField>("textFieldDate");
		this.isButtonVisible = true;
		this.isItemVisible = true;

		setTimeout(function () {
			textFieldDate.dismissSoftInput();
		}, 100);
	}

	displayActionDialog() {
		// >> action-dialog-code
		let options = {
			title: this.labels.horariotitle,
			message: this.labels.horariomsg,
			cancelButtonText: this.labels.cancelar,
			actions: timeList
		};

		action(options).then((result) => {
			let textFieldTime = this.page.getViewById<TextField>("textFieldTime");
			if (result !== this.labels.cancelar) this.tmpFormData.time = result;
			setTimeout(function () {
				textFieldTime.dismissSoftInput();
			}, 100);
		});
	}

	displayActionStatus() {
		// >> action-dialog-code
		let options = {
			title: this.labels.statustitle,
			message: this.labels.statusmsg,
			cancelButtonText: this.labels.cancelar,
			actions: this.statusList
		};

		action(options).then((result) => {
			let textFieldStatus = this.page.getViewById<TextField>("textFieldStatus");
			if (result !== this.labels.cancelar) this.tmpFormData.status = result;
			setTimeout(function () {
				textFieldStatus.dismissSoftInput();
			}, 100);
		});
	}

}