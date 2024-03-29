import {
	Component,
	ComponentFactoryResolver,
	ViewChild,
	OnDestroy,
} from '@angular/core'
import { NgForm } from '@angular/forms'
import { AuthService, AuthResponseData } from './auth.service'
import { Observable, Subscription } from 'rxjs'
import { Router } from '@angular/router'
import { AlertComponent } from '../shared/alert/alert.component'
import { PlaceholderDirective } from '../shared/placeholder/placeholder.directive'

@Component({
	selector: 'app-auth',
	templateUrl: './auth.component.html',
	styleUrl: './auth.component.css',
})
export class AuthComponent implements OnDestroy {
	isLoginMode = true
	isLoading = false
	error: string = null
	@ViewChild(PlaceholderDirective, { static: false })
	alertHost: PlaceholderDirective
	private closeSub: Subscription

	constructor(
		private authService: AuthService,
		private router: Router,
		private componentFactoryResolver: ComponentFactoryResolver,
	) {}

	onSwitchMode() {
		this.isLoginMode = !this.isLoginMode
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			return
		}

		console.log(form.value)
		const email = form.value.email
		const password = form.value.password

		let authObs: Observable<AuthResponseData>

		this.isLoading = true

		if (this.isLoginMode) {
			authObs = this.authService.login(email, password)
		} else {
			authObs = this.authService.signup(email, password)
		}

		authObs.subscribe(
			(resData) => {
				console.log(resData)
				this.isLoading = false // stop loading spinner
				this.router.navigate(['/recipes']) // redirect to recipes page
			},
			(errorMessage) => {
				console.log(errorMessage)
				this.error = errorMessage
				this.showErrorAlert(errorMessage)
				this.isLoading = false
			},
		)

		form.reset()
	}

	onHandleError() {
		this.error = null
	}

	private showErrorAlert(errorMessage: string) {
		// const alertCmp = new AlertComponent();
		const alertCmpFactory =
			this.componentFactoryResolver.resolveComponentFactory(AlertComponent)

		const hostViewContainerRef = this.alertHost.viewContainerRef // get access to the viewContainerRef of the directive
		hostViewContainerRef.clear() // clear the viewContainerRef

		const componenetRef = hostViewContainerRef.createComponent(alertCmpFactory) // create the component

		componenetRef.instance.message = errorMessage // pass data into the component
		this.closeSub = componenetRef.instance.close.subscribe(() => {
			// subscribe to the close event
			this.closeSub.unsubscribe() // unsubscribe from the close event
			hostViewContainerRef.clear() // clear the viewContainerRef
		})
	}

	ngOnDestroy(): void {
		if (this.closeSub) {
			this.closeSub.unsubscribe()
		}
	}
}
