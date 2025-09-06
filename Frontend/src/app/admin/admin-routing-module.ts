import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { ApproveQuestions } from './approval/approve-questions/approve-questions';
import { ApproveAnswers } from './approval/approve-answers/approve-answers';
import { ManageContent } from './approval/manage-content/manage-content';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';


const routes: Routes = [
  {path: 'dashboard', component: AdminDashboard},
  {path: 'auth/login', component: Login},
  {path: 'auth/register', component: Register},
  {path: 'approval/questions', component: ApproveQuestions},
  {path: 'approval/answers', component: ApproveAnswers},
  {path: 'approval/manage', component: ManageContent}
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
