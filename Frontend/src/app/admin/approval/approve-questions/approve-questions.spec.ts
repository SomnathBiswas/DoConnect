import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveQuestions } from './approve-questions';

describe('ApproveQuestions', () => {
  let component: ApproveQuestions;
  let fixture: ComponentFixture<ApproveQuestions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApproveQuestions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveQuestions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
