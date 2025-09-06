import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AskQuestion } from './ask-question';

describe('AskQuestion', () => {
  let component: AskQuestion;
  let fixture: ComponentFixture<AskQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AskQuestion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AskQuestion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
