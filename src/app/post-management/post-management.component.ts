import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ChatGptService } from '../Services/chat-gpt.service';
import { ToastrService } from 'ngx-toastr';
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
  taggedUsername: any = [];
  imageUrl: string = '';
  filteredHashtags: any = [];

  isCopied: boolean = false;
  mydata: { url: string; type: string; name?: string }[] = [];
  newTextList: textResponse[] = [{ sno: 1, text: '', response: '' }];
  hastageCardText: any;
  imagesData: string | undefined;
  creationId: any = 17990461106155950;
  pageId: string = '110499812113968';
  accessToken = 'EAADjr33njLcBAId395mkyZBGwUzmK70a3ZCgZCUTnZB6IFv1OV1asjtptXbpO3HX4QZCayZBZBB0ldSKfjcOd7I44xWejxQroXpOb8vWZBYZB1dYTSPY9j8M07A5fZC8OleKTlVNkrxLPwKOs3uCL5tQTnaZBl0qjte2JZAlWweNCDrz4ojx0z8eNl2rZAxuaXsWgIqI3SQ4NGVHe5Dws6pxZAa1Q2TFgmHyamrfY5oShA43XeDTdowgNxGnzA';
  facebookUserAccessToken: any = 'EAADjr33njLcBAGpOI6YFnWkXZCdSGFYMehOpsQPZBTZCU43u958heW9LwysXVWQo5bsUbVpttr1HpH36O9FIiJeQ2JUkSj8BEFZCpFLat4HysgOyyrbwqPJLvaO9NOw9UuppzdS4B30m3GqB9qN7g0AOh4p6xXy3QjuO1r80Dkdt3g5ydH2TfFUMcCHrmysQMxatHXDyvxJrcPANAJshgUvxRhPAInRZBVEJ1PeEZCZCtR1p2jivrPK';
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
  imagePreview: any;
  constructor(private openaiService: ChatGptService, private http: HttpClient,
    private toaster: ToastrService,
  ) { }
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
      scope: 'instagram_basic,pages_show_list,token'
    });
  }
  logOutOfFB(): void {
    FB.logout(() => {
      this.facebookUserAccessToken = '';
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
        this.toaster.success('Post shared successfully!', 'Success');

        this.isSharingPost = false;
        this.toaster.success('Post shared successfully!', 'Success');
        // Reset the form state
        this.imageUrl = '';
        this.hashtageStorge = '';
      } else {
        console.log('No Facebook pages found.');
      }
    } catch (error) {
      this.toaster.error('Error sharing the Instagram post. Please try again later.', 'Error');
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
          caption: captionWithText,
          // user_tags: JSON.stringify([{ username: this.taggedUsername, x: 0.5, y: 0.5 }])
          user_tags: JSON.stringify(
            this.taggedUsername.map((username: any) => ({ username, x: 0.5, y: 0.5 }))
          )
        },
        (response: any) => {
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
          resolve(response.instagram_business_account.id);
        }
      );
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
        this.writeText = this.newTextList.find(f => f.text);
        this.filterHashtags();
        this.captionWithText = text;

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
        this.captionWithText = text;
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
        this.toaster.error(error, 'Please check Api key Token !');
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
  onSelect(event: any) {
    const fileReader: FileReader = new FileReader();
    const file = event.target.files[0];
    this.selectedFile = file;
    fileReader.onloadend = () => {
      const photoData = new Blob([fileReader.result as ArrayBuffer], { type: 'image/jpg' });
      const formData = new FormData();
      formData.append('access_token', this.facebookUserAccessToken);
      formData.append('source', photoData);
      this.imageUrl = URL.createObjectURL(file);
      document.body.appendChild(this.imagePreview);
    };

    fileReader.readAsArrayBuffer(file);
  }
}
