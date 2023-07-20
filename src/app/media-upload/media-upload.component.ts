import { Component, Input } from '@angular/core';
import { ChatGptService } from '../Services/chat-gpt.service';
import { Token } from '@angular/compiler';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  accessToken = 'EAADjr33njLcBABvIXnITjmpd1wgUYrkmgq9XIq6zSZBqpfnoDlAJbNLal83fZBUYRbiStAi7cHOkBRlwprVaEqVuFHO4DcWv7KvvZCZCXoJ2SsvuvhRxoGolyfnln4hg0uur6opRo5SSEZBQV9SAutBtZBGHra9T58BNXE8peFtIS7vEgx65tnjrGUQ1cHA4LHc0ihIJYTMFuJWxUugOGK';

  hashtags = [
    { id: "spread", value: "#spread", color: 3, twitter: "8", instagram: null },
    { id: "forget", value: "#forget", color: 3, twitter: "8", instagram: null },
  ];
  myNewData: any;
  shareLink: any;
  newTextList: textResponse[] = [{ sno: 1, text: '', response: '' }];
  hastageCardText: any;
  imagesData: any;
  taggedUsername: any;
  imageUrl: string = '';
  postCaption: string = '';
  isSharingPost: boolean = false;
  facebookUserAccessToken: any = 'EAADjr33njLcBAHC4Ls3KesxXXZAbfcZBBwSJoIbdImznuND64HJSatAVBXGSWIv6MKmuXuturwzMzgcKq0q57O4NY4eVtKiC80shc4puG98doD26cUFbYZA1NSzJk2j9IJkEZBD4e0WNqUMg7fLlD8BTBZAR09H5aHmwEiGYrFr4mWwva9OEU2LlQfR9NOFM67HotsBLBig6gUQy4ws5s';
  constructor(private openaiService: ChatGptService, private http: HttpClient) { }
  ngOnInit() {
    this.post();
  }
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

  selectedFile: File | null = null;
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

  post() {
    setTimeout(() => {
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

  // instragram

  creationId: any = 17990461106155950;

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
  async createMediaObjectContainer(instagramAccountId: string): Promise<string> {
    return new Promise((resolve) => {
      FB.api(
        `${instagramAccountId}/media`,
        'POST',
        {
          access_token: this.facebookUserAccessToken,
          image_url: this.imageUrl,
          caption: this.bioText,
          creation_id: this.creationId,
          user_tags: JSON.stringify([{ username: this.taggedUsername, x: 0.5, y: 0.5 }])
        },
        (response: any) => {
          console.log(response, ':::::::::::::::')
          resolve(response.id);
        }
      );
    });
  }

  async publishMediaObjectContainer(instagramAccountId: string): Promise<void> {
    return new Promise((resolve) => {
      FB.api(
        `${instagramAccountId}/media_publish`,
        'POST',
        {
          access_token: this.facebookUserAccessToken,
          creation_id: this.creationId
        },
        (response: any) => {
          resolve(response.id);
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
      this.uploadMedia(photoData);

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
  async uploadMedia(photoData: Blob): Promise<void> {
    try {
      const facebookPages = await this.getFacebookPages();
      if (facebookPages && facebookPages.length > 0) {
        const instagramAccountId = await this.getInstagramAccountId(facebookPages[0].id);
        const mediaObjectContainerId = await this.createMediaObjectContainer(instagramAccountId);
        await this.publishMediaObjectContainer(instagramAccountId);

        // Reset the form state
        this.imageUrl = '';
        this.bioText = '';
      } else {
        console.log('No Facebook pages found.');
      }
    } catch (error) {
      console.error('An error occurred while uploading the media:', error);
    }
  }
  async shareInstagramPost(): Promise<void> {
    try {
      this.isSharingPost = true;

      const facebookPages = await this.getFacebookPages();

      if (facebookPages && facebookPages.length > 0) {
        const instagramAccountId = await this.getInstagramAccountId(facebookPages[0].id);
        const mediaObjectContainerId = await this.createMediaObjectContainer(instagramAccountId);
        await this.publishMediaObjectContainer(instagramAccountId);

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
}



