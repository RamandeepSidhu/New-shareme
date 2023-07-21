import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MediaUploadComponent } from './media-upload/media-upload.component';
import { PostManagementComponent } from './post-management/post-management.component';

const routes: Routes = [
  { path: 'facebook', component: MediaUploadComponent },
  { path: 'instagram', component: PostManagementComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
