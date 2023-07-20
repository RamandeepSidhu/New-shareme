import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlInstagramComponent } from './url-instagram.component';

describe('UrlInstagramComponent', () => {
  let component: UrlInstagramComponent;
  let fixture: ComponentFixture<UrlInstagramComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UrlInstagramComponent]
    });
    fixture = TestBed.createComponent(UrlInstagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
