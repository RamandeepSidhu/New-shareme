import { Component, Input } from '@angular/core';
import { ChatGptService } from '../Services/chat-gpt.service';
import { Token } from '@angular/compiler';
import { HttpClient, HttpHeaders } from '@angular/common/http';
export class textResponse {
  sno: number = 1;
  text: string = '';
  response: string = '';
}
declare var FB: any;
@Component({
  selector: 'app-media-upload',
  templateUrl: './media-upload.component.html',
  styleUrls: ['./media-upload.component.scss']
})
export class MediaUploadComponent {
  mydata: { url: string; type: string; name?: string }[] = [];
  isButtonDisabled!: false;
  isPostAdded: boolean = false;
  isCopied: boolean = false;
  bioText: string = '';
  remainingWords: number = 350;
  textList: textResponse[] = [{ sno: 1, text: '', response: '' }];
  showSpinner = false;
  cardText: any;
  writeText!: any;
  isAIAssistOpen: boolean = false;
  formData: FormData = new FormData();
  pageId: string = '110499812113968';
  accessToken = 'EAADjr33njLcBAKS62ZCOszkpVptev40Gn5pYDywkBfldut0el0Lf2yJ6NEUBc7a0uUydOAFfnmmcDcAWEsZAVRHBejNQedmIc0GMdOFKz0sYLKRVgjjGNXkMCLJnqJX5g6i8DT9U8Xdoe2vfRsAfAgBCBxBQsazahX9KUyd3u2MQW1BZB5u7ZCaFO5jtF4MrAIOeOBrC7mfZCwOvwExNu';

  hashtags = [
    { id: "spread", value: "#spread", color: 3, twitter: "8", instagram: null },
    { id: "forget", value: "#forget", color: 3, twitter: "8", instagram: null },
  ];
  myNewData: any;
  shareLink: any;
  newTextList: textResponse[] = [{ sno: 1, text: '', response: '' }];
  hastageCardText: any;
  facebookUserAccessToken: any;
  constructor(private openaiService: ChatGptService, private http: HttpClient) { }
  ngOnInit() {
    this.post();
  }
  // onSelectFile(event: any) {
  //   const files = event.target.files;
  //   if (files) {
  //     for (const file of files) {
  //       const reader = new FileReader();
  //       reader.onload = (event: any) => {
  //         const dataUrl = event.target.result;
  //         const type = file.type.indexOf("image") > -1 ? "img" : "video";
  //         const url = URL.createObjectURL(file);

  //         this.mydata.push({ url, type });
  //         console.log(url)

  //       };
  //       reader.readAsDataURL(file);
  //     }
  //   }
  // }.


  hastageText(dataList: textResponse[], searchText: any) {
    this.showSpinner = true;
    const generatedTextPromises = dataList.map((data: textResponse) => {
      const prompt = 'User: ' + searchText + '\nAI:';
      return this.openaiService.generateText(prompt).then((text: any) => {
        console.log(text);
        data.response = text;
        this.newTextList.unshift({ sno: 0, text: data.text, response: text });
        this.hastageCardText = this.newTextList.find(f => f.response);
        this.writeText = this.newTextList.find(f => f.text);
        this.filterHashtags();
        return { text, response: text };
      });
    });

    Promise.all(generatedTextPromises).then((results: any[]) => {
      const hashtagResponses = results.filter((result) => {
        const response = result.response.toLowerCase();
        return response.startsWith('#') || response.includes(' #');
      });

      this.hashtags = hashtagResponses.map((result) => {
        return result.response;
      });

      this.filterHashtags();
    });
  }

  // ChatGPT
  generateText(dataList: textResponse[], searchText: any) {
    this.showSpinner = true;
    const generatedTextPromises = dataList.map((data: textResponse) => {
      const prompt = 'User: ' + searchText + '\nAI:';

      return this.openaiService.generateText(data.text).then((text: any) => {
        console.log(text)
        data.response = text;
        this.textList.unshift({ sno: 0, text: data.text, response: text });
        this.cardText = this.textList.find(f => f.response);
        this.writeText = this.textList.find(f => f.text);
        this.isCopied = false;
        this.filterHashtags();

        return { text, response: text };
      });
    });

    Promise.all(generatedTextPromises)
      .then((generatedTexts) => {
        // Store generated texts in local storage
        localStorage.setItem('generatedTexts', JSON.stringify(generatedTexts));
        this.showSpinner = false;
      })
      .catch((error) => {
        console.error('Failed to generate text:', error);
        this.showSpinner = false;
      });

  }

  copyResponse(response: string) {
    navigator.clipboard.writeText(response)
      .then(() => {
        console.log('Response copied!');
      })
      .catch((error) => {
        console.error('Failed to copy response:', error);
      });
    this.isCopied = true;
  }
  authorizeInstagram() {
    const authorizationUrl =
      'https://www.instagram.com/accounts/login/?force_authentication=1&enable_fb_login=1&next=%2Foauth%2Fauthorize%2F%3Fredirect_uri%3Dhttps%3A%2F%2Fdevelopers.facebook.com%2Finstagram%2Ftoken_generator%2Foauth%2F%26client_id%3D670732831755066%26response_type%3Dcode%26scope%3Duser_profile%2Cuser_media%26state%3D%257B%2522app_id%2522%3A%2522670732831755066%2522%2C%2522user_id%2522%3A%252217841460905824907%2522%2C%2522nonce%2522%3A%25225WV0RznFRIM1IuMV%2522%257D%26logger_id%3D277dfd7e-3839-4ff9-b48e-248f6c68cd1d';

    window.open(authorizationUrl, '_blank');
  }

  updateCharacterCount() {
    const words = this.bioText.trim().split(/\s+/);
    const wordCount = words.length;
    if (this.bioText.length === 0) {
      this.remainingWords = 350;
    } else {
      this.remainingWords = Math.max(0, 350 - wordCount);
    }
  }

  addPost(response: string) {
    const words = response.trim().split(/\s+/);
    const wordCount = words.length;
    if (wordCount > 350) {
      this.bioText = words.slice(0, 350).join(' ');
    } else {
      this.bioText += response;
    }
    this.isPostAdded = true;
    this.isAIAssistOpen = !this.isAIAssistOpen;
    this.updateCharacterCount();

  }

  toggleAIAssist() {
    this.isAIAssistOpen = !this.isAIAssistOpen;
    this.isPostAdded = !this.isPostAdded;
  }

  addHashtagToBio(hashtag: string) {
    this.bioText += ' ' + hashtag;
  }
  isHashtagDropdownOpen = false;
  searchTerm: any = "";
  filteredHashtags: any = [];

  toggleHashtagDropdown() {
    this.isHashtagDropdownOpen = !this.isHashtagDropdownOpen;
    if (this.isHashtagDropdownOpen) {
      this.filterHashtags();
    }
  }

  filterHashtags() {
    this.filteredHashtags = this.hashtags.filter(
      (hashtag) => hashtag.value.toLowerCase().includes(this.searchTerm.toLowerCase())
        || this.bioText.toLowerCase().includes(hashtag.value.toLowerCase())
    );
  }

  truncateText(text: string, wordLimit: number): string {
    const words = text.trim().split(/\s+/);
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
  }
  selectHashtag(hashtag: { value: string; }) {
    this.bioText += " " + hashtag.value;
  }


  // facebook integration

  // imagesUrlData: any = "http://floral.fox-sandbox.co.uk/media/wysiwyg/valentines-blog.jpg"

  // publishToInstagram(imageURL: any) {
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${this.accessToken}`
  //   });
  //   this.http.post(`https://graph.facebook.com/110499812113968/photos?url=${this.imagesUrlData}&access_token=${this.accessToken}`, '')
  //     .subscribe(
  //       (response: any) => {
  //         this.post()
  //         console.log('Post published successfully:', response);
  //       },
  //       (error: any) => {
  //         console.error('Error publishing post:', error);
  //       }
  //     );
  // }
  selectedFile: File | null = null;
  onSelectFile(event: any) {
    const fileReader: FileReader = new FileReader();
    const file = event.target.files[0];
    this.selectedFile = file;

    const pageAccessToken = 'EAADjr33njLcBAKS62ZCOszkpVptev40Gn5pYDywkBfldut0el0Lf2yJ6NEUBc7a0uUydOAFfnmmcDcAWEsZAVRHBejNQedmIc0GMdOFKz0sYLKRVgjjGNXkMCLJnqJX5g6i8DT9U8Xdoe2vfRsAfAgBCBxBQsazahX9KUyd3u2MQW1BZB5u7ZCaFO5jtF4MrAIOeOBrC7mfZCwOvwExNu';

    fileReader.onloadend = () => {
      const photoData = new Blob([fileReader.result as ArrayBuffer], { type: 'image/jpg' });
      const formData = new FormData();
      formData.append('access_token', pageAccessToken);
      formData.append('source', photoData);
      formData.append('message', this.bioText);

      const imageURL = URL.createObjectURL(file);
      const imagePreview = document.createElement('img');
      imagePreview.src = imageURL;
      document.body.appendChild(imagePreview);
      console.log(this.selectedFile);
    };

    fileReader.readAsArrayBuffer(file);
  }

  // publishToFacebook(formData: FormData, pageId: any) {
  //   const publishURL = `https://graph.facebook.com/${pageId}/videos`;
  //   const publisPhotohURL = `https://graph.facebook.com/${pageId}/photos`;

  //   fetch(publishURL, {
  //     body: formData,
  //     method: 'POST'
  //   })
  //     .then((response) => response.json())
  //     .then((responseData) => {
  //       console.log('Post published successfully:', responseData);
  //     })
  //     .catch((error) => {
  //       console.error('Error publishing post:', error);
  //     });
  // }
  // publishToFacebook(formData: FormData, pageId: any, selectedFiles: File[]) {
  //   const publishURL = `https://graph.facebook.com/${pageId}/videos`;
  //   const publishPhotoURL = `https://graph.facebook.com/${pageId}/photos`;
  //   const publishFeedURL = `https://graph.facebook.com/${pageId}/feed`;

  //   const uploadPromises = [];

  //   for (const file of selectedFiles) {
  //     if (file instanceof File) {
  //       const fileType = file.type;
  //       const isImage = fileType.startsWith('image/');
  //       const isVideo = fileType.startsWith('video/');

  //       if (isImage || isVideo) {
  //         const uploadFormData = new FormData();
  //         uploadFormData.append('access_token', formData.get('access_token') as string);
  //         uploadFormData.append('source', file);
  //         uploadFormData.append('message', this.bioText); // Add the bio text

  //         const publishEndpoint = isImage ? publishPhotoURL : publishURL;

  //         uploadPromises.push(
  //           fetch(publishEndpoint, {
  //             body: uploadFormData,
  //             method: 'POST'
  //           })
  //             .then((response) => response.json())
  //             .then((responseData) => {
  //               const fileTypeText = isImage ? 'Photo' : 'Video';
  //               console.log(`${fileTypeText} published successfully:`, responseData);
  //             })
  //             .catch((error) => {
  //               const fileTypeText = isImage ? 'photo' : 'video';
  //               console.error(`Error publishing ${fileTypeText}:`, error);
  //             })
  //         );
  //       } else {
  //         console.error('Unsupported file type:', fileType);
  //       }
  //     } else {
  //       console.error('Invalid file:', file);
  //     }
  //   }

  //   if (uploadPromises.length > 0) {
  //     Promise.all(uploadPromises)
  //       .then(() => {
  //         console.log('All files published successfully.');
  //       })
  //       .catch((error) => {
  //         console.error('Error publishing files:', error);
  //       });
  //   } else {
  //     console.error('No valid files selected.');
  //   }
  // }


  publishToFacebook(formData: FormData, pageId: any, selectedFiles: File[]) {
    const publishURL = `https://graph.facebook.com/${pageId}/videos`;
    const publishPhotoURL = `https://graph.facebook.com/${pageId}/photos`;
    const publishFeedURL = `https://graph.facebook.com/${pageId}/feed`;

    const uploadPromises = [];
    const feedPromises = [];

    for (const file of selectedFiles) {
      if (file instanceof File) {
        const fileType = file.type;
        const isImage = fileType.startsWith('image/');
        const isVideo = fileType.startsWith('video/');

        if (isImage || isVideo) {
          const uploadFormData = new FormData();
          uploadFormData.append('access_token', formData.get('access_token') as string);
          uploadFormData.append('source', file);
          uploadFormData.append('description', this.bioText);
          uploadFormData.append('message', this.bioText); // Add the bio text

          if (isImage) {
            uploadPromises.push(
              fetch(publishPhotoURL, {
                body: uploadFormData,
                method: 'POST'
              })
                .then((response) => response.json())
                .then((responseData) => {
                  console.log('Photo published successfully:', responseData);
                })
                .catch((error) => {
                  console.error('Error publishing photo:', error);
                })
            );
          } else if (isVideo) {
            uploadPromises.push(
              fetch(publishURL, {
                body: uploadFormData,
                method: 'POST'
              })
                .then((response) => response.json())
                .then((responseData) => {
                  console.log('Video published successfully:', responseData);
                })
                .catch((error) => {
                  console.error('Error publishing video:', error);
                })
            );
          }
        } else {
          console.error('Unsupported file type:', fileType);
        }
      } else {
        console.error('Invalid file:', file);
      }
    }

    const feedFormData = new FormData();
    feedFormData.append('access_token', formData.get('access_token') as string);
    feedFormData.append('message', this.bioText);

    feedPromises.push(
      fetch(publishFeedURL, {
        body: feedFormData,
        method: 'POST'
      })
        .then((response) => response.json())
        .then((responseData) => {
          console.log('Feed post published successfully:', responseData);
        })
        .catch((error) => {
          console.error('Error publishing feed post:', error);
        })
    );

    Promise.all([...uploadPromises, ...feedPromises])
      .then(() => {
        console.log('All files and feed post published successfully.');
      })
      .catch((error) => {
        console.error('Error publishing files and feed post:', error);
      });
  }



  onPublishClick() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('access_token', this.accessToken);
      formData.append('message', this.bioText);
      const selectedFiles = Array.isArray(this.selectedFile) ? this.selectedFile : [this.selectedFile];

      for (const file of selectedFiles) {
        formData.append('file', file);
      }

      this.publishToFacebook(formData, this.pageId, selectedFiles);
    } else {
      console.error('No file selected.');
    }
  }


  // onPublishClick() {
  //   if (this.selectedFile) {
  //     const formData = new FormData();
  //     formData.append('access_token', this.accessToken);
  //     formData.append('source', this.selectedFile);
  //     formData.append('message', this.bioText);

  //     this.publishToFacebook(formData, this.pageId, this.selectedFile);
  //   } else {
  //     console.error('No file selected.');
  //   }
  // 

  // }
  post() {
    setTimeout(() => {
      // this.authorizeInstagram();
      localStorage.setItem('mydata', JSON.stringify(this.mydata));
      const dataList: textResponse[] = [];
      const generatedTextPromises = dataList.map((data: textResponse) => {
        return this.openaiService.generateText(data.text).then((text: any) => {
          data.response = text;
          return data;
        });
      });
      localStorage.setItem('mydata', JSON.stringify(this.mydata.map(item => ({ url: item.url ?? '', type: item.type }))));
      Promise.all(generatedTextPromises)
        .then((generatedTexts) => {
          localStorage.setItem('generatedTexts', JSON.stringify(generatedTexts));
          this.mydata = [];
        })
        .catch((error) => {
          console.error('Failed to generate text:', error);
          this.mydata = [];
        });
    }, 2000);
    const dataStore = {
      text: this.bioText,
      bio: this.mydata
    };
  }
}



