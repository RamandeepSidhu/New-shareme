import { FacebookLoginProvider, SocialAuthService } from '@abacritt/angularx-social-login';
import { Component, OnInit } from '@angular/core';
import { FacebookAuthService } from './Services/auth.service';
declare const FB: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private authService: SocialAuthService, private facebookAuth: FacebookAuthService) { }
  user: any;
  loggedIn: any;
  ngOnInit() {
    this.authService.authState.subscribe((user) => {
      this.user = user;
      console.log(this.user);
      this.loggedIn = (user != null);
    });
  }

  logInToFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).then((res) => {
      const facebookAccessToken = res.authToken;
      console.log(facebookAccessToken, ':FFFFFFF')
      this.facebookAuth.setAccessToken(facebookAccessToken);
      localStorage.setItem('facebookAccessToken', facebookAccessToken);

    }).catch((error) => {
      console.log(error, 'Error')
    });
  }
  logOutOfFB(): void {
    FB.logout(() => {
      this.loggedIn = '';
    });
  }
}