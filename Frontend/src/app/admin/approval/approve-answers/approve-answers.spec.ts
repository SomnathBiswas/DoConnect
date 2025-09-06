import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveAnswers } from './approve-answers';

describe('ApproveAnswers', () => {
  let component: ApproveAnswers;
  let fixture: ComponentFixture<ApproveAnswers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApproveAnswers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveAnswers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
