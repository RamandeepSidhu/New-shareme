import { Injectable } from '@angular/core';
declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}
@Injectable({
  providedIn: 'root'
})
export class FacebookSDKService {
  private readonly FACEBOOK_APP_ID = '250342871108791';

  initSDK(): Promise<void> {
    return new Promise((resolve) => {
      window.fbAsyncInit = () => {
        window.FB.init({
          appId: this.FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v17.0'
        });

        resolve();
      };

      const d = document;
      const s = 'script';
      const id = 'facebook-jssdk';
      let js: HTMLScriptElement;
      let fjs: HTMLElement = d.getElementsByTagName(s)[0];

      if (d.getElementById(id)) {
        return;
      }

      js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v17.0';
      fjs.parentNode?.insertBefore(js, fjs);
    });
  }
}
