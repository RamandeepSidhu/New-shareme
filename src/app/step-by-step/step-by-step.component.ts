import { Component, Input } from '@angular/core';
interface StepRow {
  description: string;
  method: string;
  endpoint: string;
  requestQueryParams: any;
  isDisabled: boolean;
  response?: any; // Add response property

}
declare const FB: any;

@Component({
  selector: 'app-step-by-step',
  templateUrl: './step-by-step.component.html',
  styleUrls: ['./step-by-step.component.scss']
})
export class StepByStepComponent {
  @Input() facebookUserAccessToken: string = '';

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

  onResponseReceived(response: any, stepIndex: number): void {
    if (stepIndex === 0) {
      this.stepRows[1].endpoint = `${response[0]?.id}`;
      this.stepRows[1].isDisabled = false;
    } else if (stepIndex === 1) {
      this.stepRows[2].endpoint = `${response.instagram_business_account.id}/media`;
      this.stepRows[2].isDisabled = false;
    } else if (stepIndex === 2) {
      this.stepRows[3].endpoint = `${response.id}/media_publish`;
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
      step.response = response; // Update response property
      step.isDisabled = false;
    });
  }


  toggleStepsVisibility(): void {
    this.shouldShowAllSteps = !this.shouldShowAllSteps;
  }


}