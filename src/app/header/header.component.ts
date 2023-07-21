import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  openFacebookLoginPopup() {
    // Logic to open the Facebook login pop-up
    // You can use the Facebook SDK or custom login implementation here
  }

  openInstagramLoginPopup() {
    // Logic to open the Instagram login pop-up
    // You can use the Instagram API or custom login implementation here
  }
}
