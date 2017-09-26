import { Component, OnInit, ViewChildren, AfterViewInit, ViewChild } from "@angular/core";
import { BackendService, FirebaseService } from "../../services";
import { Observable, BehaviorSubject, Subject } from "rxjs";
import { RouterExtensions } from 'nativescript-angular/router/router-extensions';
import { Router } from '@angular/router';
import { TabView, SelectedIndexChangedEventData, TabViewItem } from "ui/tab-view";
import { Page } from "ui/page";
import { Color } from "color";
import { registerElement } from "nativescript-angular/element-registry";
import { User, Calendar, MonthYear } from "../../models";
import { prompt, PromptResult, inputType } from "ui/dialogs";
import { setInterval, setTimeout, clearInterval } from "timer";
import { ActivityIndicator } from "ui/activity-indicator";
import { ListPicker } from "ui/list-picker";
import { combineLatest } from 'rxjs/operator/combineLatest';
import { Label } from "ui/label";
import 'rxjs/add/operator/catch'
import {TranslateService} from "@ngx-translate/core";
import { SearchBar } from "ui/search-bar";
import { isAndroid } from "platform";

registerElement("Fab", () => require("nativescript-floatingactionbutton").Fab);

@Component({
	selector: 'menu',
	moduleId: module.id,
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.css', './menu.css']
})

export class MenuComponent implements OnInit {

	public items: Array<any>;
	public itemsCalendar: Array<Calendar>;
	public tabSelectedIndex: number;
	public picked: string;
	public saveToGallery: boolean = true;

	statusBarHeight: number
	calendar: Calendar
	statusOpt
	public calendars$: Observable<any>;
	filter$: BehaviorSubject<string>;
	filterName$: BehaviorSubject<string>;
	characters$: Observable<Calendar[]>;
	filteredCharacters$: Observable<Calendar[]>;
	filteredNames$: Observable<Calendar[]>;	
	filteredCharactersS$: Observable<number>;
	filteredCharactersSInt$: Observable<number>;
	monthsel: string;
	labels:any;
	searchPhrase: string = "";	
	public isLoading = false;

	constructor(
		private routerExtensions: RouterExtensions,
		private firebaseService: FirebaseService,
		private router: Router,
		private page: Page,
		private translate: TranslateService
	) {
		this.tabSelectedIndex = 0;
		translate.get(['STATUS.CONFIRMADO', 'STATUS.CANCELADO', 'STATUS.INTERESSADO', 'CONFIRMAR', 
									 'DIALOGS.NEWCLIENTMSG', 'CANCELAR', 'HOME.TODOS']).subscribe((res) => {
			this.statusOpt = {
				"Confirmado":  res['STATUS.CONFIRMADO'],
				"Cancelado": res['STATUS.CANCELADO'],
				"Interessado": res['STATUS.INTERESSADO']
			}

			this.labels = {
				"confirmar": res['CONFIRMAR'],
				"cancelar": res['CANCELAR'],
				"newclientmsg": res['DIALOGS.NEWCLIENTMSG'],
				"todos": res['HOME.TODOS']
			}
		});
	}

	ngOnInit() {
		this.filter$ = new BehaviorSubject(this.labels.todos);
		this.filterName$ = new BehaviorSubject("");
		
		this.calendars$ = this.firebaseService.getCalendarList();

		this.filteredCharacters$ = this.createFilterCharacters(
			this.filter$,
			this.calendars$
		);

		this.filteredNames$ = this.createFilterName(
			this.filterName$,
			this.calendars$
		);

		this.filteredCharactersS$ = this.getAgeSum()
		this.filteredCharactersSInt$ = this.getAgeSumInt()

	}

	public createFilterCharacters(
		filter$: Observable<string>,
		calendars$: Observable<Calendar[]>) {
		return calendars$.combineLatest(
			filter$, (calendars: Calendar[], filter: string) => {
				if (filter === this.labels.todos) return calendars;
				return calendars.filter(
					(calendars: Calendar) =>
						calendars.monthyear
						=== filter
				);
			});
	}


	public createFilterName(
		filterName$: Observable<string>,
		calendars$: Observable<Calendar[]>) {
		return calendars$.combineLatest(
			filterName$, (calendars: Calendar[], filterName: string) => {
				if (filterName === "") return calendars;
				return calendars.filter(
					(calendars: Calendar) => 
						(calendars.name.toLowerCase().indexOf(filterName.toLowerCase()) != -1)
				);
			});
	}

	logout() {
		this.firebaseService.logout();
	}

	fabTap() {
		let options = {
			title: this.labels.newclientmsg,
			defaultText: "",
			inputType: inputType.text,
			okButtonText: this.labels.confirmar,
			cancelButtonText: this.labels.cancelar
		};

		prompt(options).then((result: PromptResult) => {
			if (result.text !== "") {
				this.isLoading = true;
				this.calendar = new Calendar()
				this.calendar.name = result.text
				this.calendar.monthyear = ""
				this.calendar.value = 0
				this.calendar.calendarid = ""
				this.calendar.address = ""
				this.firebaseService.add(this.calendar).then((key: any) => {
					setTimeout(() => {
						this.isLoading = false;
						this.viewDetail(key);
					}, 1000);

				})
			}
		});
	}

	public viewDetail(id: string) {
		this.isLoading = true;
		this.router.navigate(["/calendar-detail-edit", id]).then(result => {
			this.isLoading = false;
		});
	}

	public onIndexChanged(args) {
		let tabView = <TabView>args.object;
		if (tabView.selectedIndex == 1) {
			this.items = this.firebaseService.monthYears(this.labels.todos)

		}
	}

	getAgeSum(): Observable<number> {
		return this.filteredCharacters$
			.map(arr => arr.reduce((a, b) => a + (b.status === this.statusOpt['Confirmado'] ? parseFloat(b.value.toString()) : 0), 0))
			.catch(Observable.onErrorResumeNext);
	}

	getAgeSumInt(): Observable<number> {
		return this.filteredCharacters$
			.map(arr => arr.reduce((a, b) => a + (b.status === this.statusOpt['Interessado'] ? parseFloat(b.value.toString()) : 0), 0))
			.catch(Observable.onErrorResumeNext);
	}

	getColor(status: string) {
		if (status === this.statusOpt['Confirmado']) return '#388e3c';
		if (status === this.statusOpt['Interessado']) return '#1976d2';
		if (status === this.statusOpt['Cancelado']) return '#d32f2f';
		return '#000';
	}

	getFilterMonth(month: string) {
		this.filter$.next(month);
		this.monthsel = month
	}

	// searchbar
	public searchBarLoaded(args) {
		let searchBar = <SearchBar>args.object;
		searchBar.dismissSoftInput();

		if (isAndroid) {
				searchBar.android.clearFocus();
		}

		searchBar.text = "";
	}

	public onTextChange(args) {
			let searchBar = <SearchBar>args.object;
			this.filterName$.next(searchBar.text);			
	}

	public onSubmit(args) {
			let searchBar = <SearchBar>args.object;
			this.filterName$.next(searchBar.text);
	}

}