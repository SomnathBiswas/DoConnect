import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { UserDashboard } from './user-dashboard/user-dashboard';
import { QuestionList } from './questions/question-list/question-list';
import { AskQuestion } from './questions/ask-question/ask-question';
import { AnswerQuestion } from './questions/answer-question/answer-question';


const routes: Routes = [
  {path: '', component: Home},
  {path: 'dashboard', component: UserDashboard},
  {path: 'auth/login', component: Login},
  {path: 'auth/register', component: Register},
  {path: 'questions', component: QuestionList},
  {path: 'questions/ask', component: AskQuestion},
  {path: 'questions/answer/:id', component: AnswerQuestion}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
