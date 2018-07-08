import { router } from 'router';
import { AjaxHelper } from 'Helpers/ajaxHelper';
import { NavigationHelper } from 'Helpers/navigationHelper';

export const MainContainer = {
	el: '.contentRegion',
	router,
	template:
	'<div>' +
	'<div class="btnLogin" v-on:click="_login" v-if="!isLoggedIn">' + Resources.Login + '</div>' +
	'<div class="btnLogin" v-on:click="_logout" v-if="isLoggedIn">' + Resources.Logout + '</div>' +
	'<router-view class="mainComponent" ref="component" v-if="isAppVisible"></router-view>' +
	'</div>',
	data: function () {
		return {
			isLoggedIn: Emitter.isLoggedIn,
			isAppVisible: false
		};
	},
	mounted: function () {
		this.isAppVisible = true;
		// this.isAppVisible = NavigationHelper.isLanding();
		this.isLoggedIn = !NavigationHelper.isLanding();
	},
	methods: {
		_login: function () {
			// TODO: Implement login mechanism
			AjaxHelper.get('/api/authorization/login').then(function (isLoggedIn) {
				// TODO: Remove "|| !isLoggedIn " for stupid login
				if (isLoggedIn || !isLoggedIn) {
					router.push({ path: '/Home' });
					Emitter.isLoggedIn = true;
					self.isAppVisible = true;
				}
			});
		},
		_logout: function () {
			if (this.$refs.component && this.$refs.component.stop) {
				this.$refs.component.stop();
			}
			router.push({ path: '/' });
			Emitter.isLoggedIn = false;
			this.isAppVisible = true;
		}
	},
	watch: {
		$route: function (to) {
			if (to.name === 'Landing') {
				this.isLoggedIn = false;
				this.isAppVisible = true;
			}
			else {
				this.isLoggedIn = Emitter.isLoggedIn;
				this.isAppVisible = Emitter.isLoggedIn;
			}
		}
	}
};