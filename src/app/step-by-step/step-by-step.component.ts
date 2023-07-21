import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
interface StepRow {
  description: string;
  method: string;
  endpoint: string;
  requestQueryParams: any;
  isDisabled: boolean;
  response?: any;


}
declare const FB: any;

@Component({
  selector: 'app-step-by-step',
  templateUrl: './step-by-step.component.html',
  styleUrls: ['./step-by-step.component.scss']
})
export class StepByStepComponent {
  @Input() facebookUserAccessToken: string = '';
  constructor(private http: HttpClient) {
  }
  shouldShowAllSteps: boolean = false;
  facebookPages: any[] = [];
  instagramAccountId: string | undefined;
  containerId: string | undefined;

  response: any = {}; // Define the response property

  stepRows: StepRow[] = [
    {
      description: '1. Get Facebook pages of the logged-in user',
      method: 'GET',
      endpoint: 'me/accounts',
      requestQueryParams: { access_token: this.facebookUserAccessToken },
      isDisabled: false
    },
    {
      description: '2. Get Instagram business account connected to the Facebook page',
      method: 'GET',
      endpoint: '',
      requestQueryParams: {
        access_token: this.facebookUserAccessToken,
        fields: 'instagram_business_account'
      },
      isDisabled: true,
    },
    {
      description: '3. Create a media object container',
      method: 'POST',
      endpoint: '17841460905824907/media',
      requestQueryParams: {
        access_token: this.facebookUserAccessToken,
        image_url: 'https://lh3.googleusercontent.com/p/AF1QipNSqECSAjJSw0lji2UEe9a4S-ZslsMwrVzumd9a=s1360-w1360-h1020',
        caption: 'Look at this awesome '
      },
      isDisabled: true
    },
    {
      description: '4. Publish the media object container',
      method: 'POST',
      endpoint: '17841460905824907/media_publish',
      requestQueryParams: {
        access_token: this.facebookUserAccessToken,
        creation_id: '18026770027568477'
      },
      isDisabled: true
    }
  ];

  // onResponseReceived(response: any, stepIndex: number): void {
  //   if (stepIndex === 0) {
  //     this.stepRows[1].endpoint = `${response[0]?.id}`;
  //     this.stepRows[1].isDisabled = false;
  //   } else if (stepIndex === 1) {
  //     this.stepRows[2].endpoint = `${response.instagram_business_account.id}/media`;
  //     this.stepRows[2].isDisabled = false;
  //   } else if (stepIndex === 2) {
  //     this.stepRows[3].endpoint = `${response.id}/media_publish`;
  //     this.stepRows[3].requestQueryParams = {
  //       access_token: this.facebookUserAccessToken,
  //       creation_id: response.id
  //     };
  //     this.stepRows[3].isDisabled = false;
  //   }
  // }
  onResponseReceived(response: any, stepIndex: number): void {
    if (stepIndex === 0) {
      this.facebookPages = response.data;
      this.stepRows[1].endpoint = `${this.facebookPages[0]?.id}`;
      this.stepRows[1].isDisabled = false;
    } else if (stepIndex === 1) {
      this.instagramAccountId = response?.instagram_business_account?.id;
      if (!this.instagramAccountId) {
        console.error('Instagram account ID is missing.');
        return;
      }
      this.stepRows[2].endpoint = `${this.instagramAccountId}/media`;
      this.stepRows[2].isDisabled = false;
    } else if (stepIndex === 2) {
      this.containerId = response?.id;
      if (!this.containerId) {
        console.error('Container ID is missing.');
        return;
      }
      this.stepRows[3].endpoint = `${this.instagramAccountId}/media_publish`;
      this.stepRows[3].requestQueryParams = {
        access_token: this.facebookUserAccessToken,
        creation_id: this.containerId
      };
      this.stepRows[3].isDisabled = false;
    }
  }
  toggleStepsVisibility(): void {
    this.shouldShowAllSteps = !this.shouldShowAllSteps;
  }

  // completeStep(step: StepRow): void {
  //   step.isDisabled = true;
  //   step.requestQueryParams.access_token = this.facebookUserAccessToken;

  //   FB.api(step.endpoint, step.method, step.requestQueryParams, (response: any) => {
  //     this.onResponseReceived(response, this.stepRows.indexOf(step));
  //     step.response = response; // Update response property
  //     step.isDisabled = false;
  //   });
  // }
  async completeStep(step: StepRow): Promise<void> {
    if (step.isDisabled) return;

    step.isDisabled = true;
    step.requestQueryParams.access_token = this.facebookUserAccessToken;

    try {
      const response = await this.http
        .request<any>(step.method, `https://graph.facebook.com/v10.0/${step.endpoint}`, {
          params: step.requestQueryParams
        })
        .toPromise();

      this.onResponseReceived(response, this.stepRows.indexOf(step));
      step.response = response; // Update response property
    } catch (error) {
      console.error('Error making API request:', error);
    } finally {
      step.isDisabled = false;
    }
  }


}