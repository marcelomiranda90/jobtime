import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { User } from '../../models/user.model';
import { Page } from 'ui/page';
import * as dialogs from 'ui/dialogs';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { RouterExtensions } from 'nativescript-angular/router/router-extensions';
import { ActivityIndicator } from 'ui/activity-indicator';
import { TranslateService } from "@ngx-translate/core";
import * as Platform from 'platform';

@Component({
	selector: 'ns-login',
	moduleId: module.id,
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css', './login.css']
})

export class LoginComponent implements OnInit {
	user: User
	isLoggingIn = true;
	isAuthenticating = false;
	public language: string;

	constructor(private page: Page,
		private router: Router,
		private firebaseService: FirebaseService,
		private routerExtensions: RouterExtensions,
		private translate: TranslateService) {
		this.user = new User();
		this.translate.setDefaultLang("en");
		this.translate.use(Platform.device.language);
	}

	ngOnInit() {
		this.page.actionBarHidden = true;
	}

	submit() {
		if (!this.user.isValidEmail()) {
			dialogs.alert({
				title: 'E-mail inválido!',
				message: 'Por favor digite um e-mail válido.',
				okButtonText: 'Ok'
			}).then(() => {
				console.log('Dialog closed!');
			});
			return;
		}
		this.isAuthenticating = true;
		if (this.isLoggingIn) {
			this.login();
		} else {
			this.signUp();
		}
	}

	login() {
		this.firebaseService.login(this.user)
			.then(() => {
				this.isAuthenticating = false;
				this.routerExtensions.navigate(['/'], {
					clearHistory: true,
					transition: {
						name: 'slide',
						duration: 500,
						curve: 'linear'
					}
				});

			})
			.catch((message: any) => {
				this.isAuthenticating = false;
			});
	}

	loginFB() {
		this.isAuthenticating = true;
		this.firebaseService.loginFacebook()
			.then(() => {
				this.isAuthenticating = false;
				this.routerExtensions.navigate(['/'], {
					clearHistory: true,
					transition: {
						name: 'slide',
						duration: 500,
						curve: 'linear'
					}
				});

			})
			.catch((message: any) => {
				this.isAuthenticating = false;
			});
	}

	signUp() {
		this.firebaseService.register(this.user)
			.then(() => {
				this.isAuthenticating = false;
				this.toggleDisplay();
			})
			.catch((message: any) => {
				alert(message);
				this.isAuthenticating = false;
			});
	}

	recPass() {
		this.firebaseService.resetPassword(this.user.email)
			.then((result) => {
				if (result) {
					dialogs.alert({
						title: 'Verifique seu e-mail',
						message: 'O link para alteração da sua senha foi enviado para o e-mail informado.',
						okButtonText: 'Ok'
					})
				}
			})
			.catch((message: any) => {
				dialogs.alert({
					title: 'Falha ao recuperar senha',
					message: message,
					okButtonText: 'Ok'
				})			
			});

	}

	toggleDisplay() {
		this.isLoggingIn = !this.isLoggingIn;
	}


}