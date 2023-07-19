import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepByStepComponent } from './step-by-step.component';

describe('StepByStepComponent', () => {
  let component: StepByStepComponent;
  let fixture: ComponentFixture<StepByStepComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StepByStepComponent]
    });
    fixture = TestBed.createComponent(StepByStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
