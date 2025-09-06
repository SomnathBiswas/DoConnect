import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing-module';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { FormsModule } from '@angular/forms';
import { AskQuestion } from './questions/ask-question/ask-question'; 
import { AnswerQuestion } from './questions/answer-question/answer-question';
import { QuestionList } from './questions/question-list/question-list';
import { Home } from './home/home';
import { UserDashboard } from './user-dashboard/user-dashboard';


@NgModule({
  declarations: [
    Login,
    Register,
    AskQuestion,
    AnswerQuestion,
    QuestionList,
    Home,
    UserDashboard
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    FormsModule
  ]
})
export class UserModule { }
