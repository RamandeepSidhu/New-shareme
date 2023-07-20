import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ChatGptService } from '../Services/chat-gpt.service';
declare const FB: any;
export class textResponse {
  sno: number = 1;
  text: string = '';
  response: string = '';
}
interface FacebookPage {
  id: string;
  name: string;
}
@Component({
  selector: 'app-post-management',
  templateUrl: './post-management.component.html',
  styleUrls: ['./post-management.component.scss']
})
export class PostManagementComponent {
  bioText: any
  isSharingPost: boolean = false;
  selectedFile: File | null = null;
  taggedUsername: any = '';
  imageUrl: string = '';
  filteredHashtags: any = [];

  isCopied: boolean = false;
  mydata: { url: string; type: string; name?: string }[] = [];
  newTextList: textResponse[] = [{ sno: 1, text: '', response: '' }];
  hastageCardText: any;
  imagesData: string | undefined;
  creationId: any = 17990461106155950;
  pageId: string = '110499812113968';
  accessToken = 'EAADjr33njLcBABvIXnITjmpd1wgUYrkmgq9XIq6zSZBqpfnoDlAJbNLal83fZBUYRbiStAi7cHOkBRlwprVaEqVuFHO4DcWv7KvvZCZCXoJ2SsvuvhRxoGolyfnln4hg0uur6opRo5SSEZBQV9SAutBtZBGHra9T58BNXE8peFtIS7vEgx65tnjrGUQ1cHA4LHc0ihIJYTMFuJWxUugOGK';
  facebookUserAccessToken: any = 'EAADjr33njLcBAFaUzlkggDSC6eYh8WYcBo72nI6yLz9ZA4om0UERgUUX3uK7x5hvmN5tsZAkuYFYDkfCWIWDoxO0ZBKkgJQubO5CbCHyAHXGXlhZALRTI75qZBwp5mg2PZC8qk4aJYcZCTb042QsSnuRnXNuZCLFAzTdxYMVaLdsN3IsVSjkDjxUa1D52Bk1ZBSTJLMFn80WRTpFK7YSoR2Kx0OInlu36o2mZBoHFZApN9DOfZAt7qjV3rxv';
  textList: textResponse[] = [{ sno: 1, text: '', response: '' }];
  showSpinner = false;
  writeText: any;
  isHashtagDropdownOpen: boolean = false;
  searchTerm: any = "";
  cardText: textResponse = new textResponse();

  hashtags = [
    { id: "spread", value: "#spread", color: 3, twitter: "8", instagram: null },
    { id: "forget", value: "#forget", color: 3, twitter: "8", instagram: null },
  ];
  hashtageStorge: any;
  captionWithText: any;
  instagramUsername: any;
  profilePictureUrl: any;
  instagramProfileId: any;
  constructor(private openaiService: ChatGptService, private http: HttpClient) { }
  addHashtagToBio(hashtag: string) {
    this.cardText.response += `${hashtag} `;

  }
  truncateText(text: string, wordLimit: number): any {
    const words = text.trim().split(/\s+/);
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
  }

  logInToFB(): void {
    FB.login((response: any) => {
      this.facebookUserAccessToken = response.authResponse?.accessToken;
    }, {
      scope: 'instagram_basic,pages_show_list'
    });
  }
  logOutOfFB(): void {
    FB.logout(() => {
      this.facebookUserAccessToken = '';
    });
  }

  // async shareInstagramPost(): Promise<void> {
  //   try {
  //     this.isSharingPost = true;
  //     const facebookPages = await this.getFacebookPages();
  //     if (facebookPages && facebookPages.length > 0) {
  //       const instagramAccountId = await this.getInstagramAccountId(facebookPages[0].id);
  //       const mediaObjectContainerId = await this.createMediaObjectContainer(instagramAccountId, this.creationId);
  //       await this.publishMediaObjectContainer(instagramAccountId);

  //       this.isSharingPost = false;

  //       // Reset the form state
  //       this.imageUrl = '';
  //       this.bioText = '';
  //       this.taggedUsername = '';
  //     } else {
  //       console.log('No Facebook pages found.');
  //     }
  //   } catch (error) {
  //     console.error('An error occurred while sharing the Instagram post:', error);
  //     this.isSharingPost = false;
  //   }
  // }
  async shareInstagramPost(): Promise<void> {
    try {
      this.isSharingPost = true;

      const facebookPages = await this.getFacebookPages();

      if (facebookPages && facebookPages.length > 0) {
        const instagramAccountId = await this.getInstagramAccountId(facebookPages[0].id);
        const mediaObjectContainerId = await this.createMediaObjectContainer(instagramAccountId);
        await this.publishMediaObjectContainer(instagramAccountId, mediaObjectContainerId);

        this.isSharingPost = false;

        // Reset the form state
        this.imageUrl = '';
        this.hashtageStorge = '';
      } else {
        console.log('No Facebook pages found.');
      }
    } catch (error) {
      console.error('An error occurred while sharing the Instagram post:', error);
      this.isSharingPost = false;
    }
  }

  publishMediaObjectContainer(instagramAccountId: string, mediaObjectContainerId: string): Promise<string> {
    return new Promise((resolve) => {
      FB.api(
        `${instagramAccountId}/media_publish`,
        'POST',
        {
          access_token: this.facebookUserAccessToken,
          creation_id: mediaObjectContainerId
        },
        (response: any) => {
          resolve(response.id);
        }
      );
    });
  }

  createMediaObjectContainer(instagramAccountId: string): Promise<string> {
    return new Promise((resolve) => {
      const captionWithText = `${this.hastageCardText.response} ${this.cardText.response} `;

      FB.api(
        `${instagramAccountId}/media`,
        'POST',
        {
          access_token: this.facebookUserAccessToken,
          image_url: this.imageUrl,
          caption: captionWithText, // Use the variable directly here
          user_tags: JSON.stringify([{ username: this.taggedUsername, x: 0.5, y: 0.5 }])
        },
        (response: any) => {
          console.log(captionWithText);
          resolve(response.id);
        }
      );
    });
  }





  getFacebookPages(): Promise<FacebookPage[]> {
    return new Promise((resolve) => {
      FB.api('me/accounts', { access_token: this.facebookUserAccessToken }, (response: any) => {
        resolve(response.data);
      });
    });
  }

  getInstagramAccountId(facebookPageId: string): Promise<string> {
    return new Promise((resolve) => {
      FB.api(
        facebookPageId,
        {
          access_token: this.facebookUserAccessToken,
          fields: 'instagram_business_account'
        },
        (response: any) => {
          console.log(response.id.username)
          resolve(response.instagram_business_account.id);
        }
      );
    });
  }

  onSelectFile(event: any) {
    const fileReader: FileReader = new FileReader();
    const file = event.target.files[0];
    this.selectedFile = file;

    const pageAccessToken = this.facebookUserAccessToken

    fileReader.onloadend = () => {
      const photoData = new Blob([fileReader.result as ArrayBuffer], { type: 'image/jpg' });

      const formData = new FormData();
      formData.append('access_token', pageAccessToken);
      formData.append('image_url', photoData);
      formData.append('message', this.bioText);

      const imageURL = URL.createObjectURL(file);
      const imagePreview = document.createElement('img');
      imagePreview.src = imageURL;
      document.body.appendChild(imagePreview);
      this.imagesData = this.selectedFile?.name

      console.log(this.imagesData);
    };

    fileReader.readAsArrayBuffer(file);
  }

  // Facebook
  onPublishClick() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('access_token', this.accessToken);
      formData.append('message', this.bioText);
      formData.append('story_tags', this.taggedUsername);

      const selectedFiles = Array.isArray(this.selectedFile) ? this.selectedFile : [this.selectedFile];

      for (const file of selectedFiles) {
        formData.append('file', file);
      }

      this.publishToFacebook(formData, this.pageId, selectedFiles);
    } else {
      console.error('No file selected.');
    }
  }
  onSelectFacebook(event: any) {
    const fileReader: FileReader = new FileReader();
    const file = event.target.files[0];
    this.selectedFile = file;

    const pageAccessToken = 'EAADjr33njLcBABvIXnITjmpd1wgUYrkmgq9XIq6zSZBqpfnoDlAJbNLal83fZBUYRbiStAi7cHOkBRlwprVaEqVuFHO4DcWv7KvvZCZCXoJ2SsvuvhRxoGolyfnln4hg0uur6opRo5SSEZBQV9SAutBtZBGHra9T58BNXE8peFtIS7vEgx65tnjrGUQ1cHA4LHc0ihIJYTMFuJWxUugOGK';

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
          uploadFormData.append('user_tags', this.taggedUsername); // Add the bio text

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
    feedFormData.append('description', this.bioText);
    feedFormData.append('user_tags', this.taggedUsername); // Add the bio text

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

    Promise.all([...uploadPromises, ...publishFeedURL])
      .then(() => {
        console.log('All files and feed post published successfully.');
      })
      .catch((error) => {
        console.error('Error publishing files and feed post:', error);
      });
  }
  // ChatGPT

  hastageText(dataList: textResponse[], searchText: any) {
    this.showSpinner = true;
    const generatedTextPromises = dataList.map((data: textResponse) => {
      const prompt = 'User: ' + searchText + '\nAI:';
      return this.openaiService.generateText(prompt).then((text: any) => {
        data.response = text;
        this.newTextList.unshift({ sno: 0, text: data.text, response: text });
        this.hastageCardText = this.newTextList.find(f => f.response);
        this.hashtageStorge = this.hastageCardText.response

        console.log(this.hastageCardText.response, 'hastage')
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
  generateText(dataList: textResponse[], userInput: any) {
    this.showSpinner = true;
    const generatedTextPromises = dataList.map((data: textResponse) => {
      const prompt = 'User: ' + userInput + '\nAI:';

      return this.openaiService.generateText(prompt).then((text: any) => {
        data.response = text;
        this.textList.unshift({ sno: 0, text: data.text, response: text });
        this.cardText = this.textList.find(f => f.response) ?? new textResponse();
        this.writeText = this.textList.find(f => f.text);
        this.hashtageStorge = this.cardText.response
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

  selectHashtag(hashtag: { value: string; }) {
    this.bioText += " " + hashtag.value;
  }
  filterHashtags() {
    if (!this.hashtags || !this.searchTerm || !this.bioText) {
      return;
    }

    this.filteredHashtags = this.hashtags.filter(
      (hashtag) =>
        hashtag.value.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.bioText.toLowerCase().includes(hashtag.value.toLowerCase())
    );
  }
  // GET
  getInstagramProfileData(): void {
    const instagramBusinessAccountId = '17841460905824907'; // Replace with the actual ID
    const fields = 'username,profile_picture_url';

    this.http.get<any>(`https://graph.facebook.com/${instagramBusinessAccountId}?fields=${fields}&access_token=${this.facebookUserAccessToken}`)
      .toPromise()
      .then((response) => {
        this.instagramUsername = response.username;
        this.profilePictureUrl = response.profile_picture_url;
        console.log('Instagram Username:', this.instagramUsername);
        console.log('Profile Picture URL:', this.profilePictureUrl);
      })
      .catch((error) => {
        console.error('Error fetching Instagram profile data:', error);
      });
  }
  ngOnInit(): void {
    this.getInstagramProfileData();
  }
}
