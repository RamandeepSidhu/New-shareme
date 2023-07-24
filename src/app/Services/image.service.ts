import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  constructor() { }

  // Function to add images to Firestore collection
  // addImages(images: string[]): Promise<void> {
  //   return this.firestore.collection('images').add({ urls: images });
  // }
}
