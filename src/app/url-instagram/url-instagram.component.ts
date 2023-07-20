import { Component } from '@angular/core';
import { FacebookSDKService } from '../Services/facebook-sdk.service';
import { HttpClient } from '@angular/common/http';
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

interface StepRow {
  description: string;
  method: string;
  endpoint: string;
  requestQueryParams: any;
  isDisabled: boolean;
}
@Component({
  selector: 'app-url-instagram',
  templateUrl: './url-instagram.component.html',
  styleUrls: ['./url-instagram.component.scss']
})
export class UrlInstagramComponent {

  isPostAdded: boolean = false;
  remainingWords: number = 350;
  hashtags = [
    { id: "spread", value: "#spread", color: 3, twitter: "8", instagram: null },
    { id: "forget", value: "#forget", color: 3, twitter: "8", instagram: null },
  ];
  myNewData: any;
  isHashtagDropdownOpen = false;
  searchTerm: any = "";
  filteredHashtags: any = [];
  shareLink: any;
  newTextList: textResponse[] = [{ sno: 1, text: '', response: '' }];
  hastageCardText: any;
  imageUrl: string = '';
  postCaption: string = '';
  isSharingPost: boolean = false;
  facebookUserAccessToken: any = 'EAADjr33njLcBAFaUzlkggDSC6eYh8WYcBo72nI6yLz9ZA4om0UERgUUX3uK7x5hvmN5tsZAkuYFYDkfCWIWDoxO0ZBKkgJQubO5CbCHyAHXGXlhZALRTI75qZBwp5mg2PZC8qk4aJYcZCTb042QsSnuRnXNuZCLFAzTdxYMVaLdsN3IsVSjkDjxUa1D52Bk1ZBSTJLMFn80WRTpFK7YSoR2Kx0OInlu36o2mZBoHFZApN9DOfZAt7qjV3rxv';
  bioText: any
  facebookPages: FacebookPage[] = [];
  instagramAccountId: string | undefined;
  showSpinner = false;
  cardText: any;
  writeText!: any;
  isAIAssistOpen: boolean = false;
  formData: FormData = new FormData();
  stepRows: StepRow[] = [
    {
      description: '1. Get Facebook pages of the logged-in user',
      method: 'GET',
      endpoint: 'me/accounts',
      requestQueryParams: {},
      isDisabled: false
    },
    {
      description: '2. Get Instagram business account connected to the Facebook page',
      method: 'GET',
      endpoint: '',
      requestQueryParams: {},
      isDisabled: true
    },
    {
      description: '3. Create a media object container',
      method: 'POST',
      endpoint: '',
      requestQueryParams: {},
      isDisabled: true
    },
    {
      description: '4. Publish the media object container',
      method: 'POST',
      endpoint: '',
      requestQueryParams: {},
      isDisabled: true
    }
  ];
  selectedFile: File | null = null;
  taggedUsername: any = '';
  textList: any;
  isCopied: boolean = false;
  mydata: { url: string; type: string; name?: string }[] = [];
  imagesData: string | undefined;
  constructor(private facebookSDKService: FacebookSDKService, private openaiService: ChatGptService, private http: HttpClient) { }

  ngOnInit(): void {
    // this.initializeFacebookSDK();
    FB.getLoginStatus((response: any) => {
      this.facebookUserAccessToken = response.authResponse?.accessToken;
    });
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

  onResponseReceived(response: any, stepIndex: number): void {
    if (stepIndex === 0) {
      this.facebookPages = response.data;
      this.stepRows[1].endpoint = `${this.facebookPages[0]?.id}`;
      this.stepRows[1].isDisabled = false;
    } else if (stepIndex === 1) {
      this.instagramAccountId = response.instagram_business_account.id;
      this.stepRows[2].endpoint = `${this.instagramAccountId}/media`;
      this.stepRows[2].isDisabled = false;
    } else if (stepIndex === 2) {
      this.stepRows[3].endpoint = `${this.instagramAccountId}/media_publish`;
      this.stepRows[3].requestQueryParams = {
        access_token: this.facebookUserAccessToken,
        creation_id: response.id
      };
      this.stepRows[3].isDisabled = false;
    }
  }

  completeStep(step: StepRow): void {
    step.isDisabled = true;
    step.requestQueryParams.access_token = this.facebookUserAccessToken;

    FB.api(step.endpoint, step.method, step.requestQueryParams, (response: any) => {
      this.onResponseReceived(response, this.stepRows.indexOf(step));
      step.isDisabled = false;
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
          resolve(response.instagram_business_account.id);
        }
      );
    });
  }


  creationId: any = 17990461106155950;

  addHashtagToBio(hashtag: string) {
    this.bioText += ' ' + hashtag;
  }
  truncateText(text: string, wordLimit: number): string {
    const words = text.trim().split(/\s+/);
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
  }


  // ////
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
      FB.api(
        `${instagramAccountId}/media`,
        'POST',
        {
          access_token: this.facebookUserAccessToken,
          image_url: this.imageUrl,
          caption: this.postCaption
        },
        (response: any) => {
          resolve(response.id);
        }
      );
    });
  }
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
        this.postCaption = '';
      } else {
        console.log('No Facebook pages found.');
      }
    } catch (error) {
      console.error('An error occurred while sharing the Instagram post:', error);
      this.isSharingPost = false;
    }
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
}
