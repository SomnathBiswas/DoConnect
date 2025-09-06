import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerQuestion } from './answer-question';

describe('AnswerQuestion', () => {
  let component: AnswerQuestion;
  let fixture: ComponentFixture<AnswerQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnswerQuestion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnswerQuestion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
