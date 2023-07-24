import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StepByStepComponent } from './step-by-step/step-by-step.component';
import { MediaUploadComponent } from './media-upload/media-upload.component';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UrlInstagramComponent } from './url-instagram/url-instagram.component';
import { PostManagementComponent } from './post-management/post-management.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { ToastrModule } from 'ngx-toastr';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
const firebaseConfig = {
  apiKey: "AIzaSyCFrO-vpLOPEuK76GfyVTRXmb7nPBkDAiM",
  authDomain: "sharemeall-c5665.firebaseapp.com",
  projectId: "sharemeall-c5665",
  storageBucket: "sharemeall-c5665.appspot.com",
  messagingSenderId: "1034639914541",
  appId: "1:1034639914541:web:cc84860e4be18ad6746aa4",
  measurementId: "G-162W1C08J6"
}
@NgModule({
  declarations: [
    AppComponent,
    StepByStepComponent,
    MediaUploadComponent,
    UrlInstagramComponent,
    PostManagementComponent,
    SidebarComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    MatCardModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    ToastrModule.forRoot(), // ToastrModule added
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
