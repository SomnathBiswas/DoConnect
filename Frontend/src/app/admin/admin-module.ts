import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing-module';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { FormsModule } from '@angular/forms';
import { ApproveQuestions } from './approval/approve-questions/approve-questions';
import { ApproveAnswers } from './approval/approve-answers/approve-answers';
import { ManageContent } from './approval/manage-content/manage-content';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';




@NgModule({
  declarations: [
    Login,
    Register,
    ApproveQuestions,
    ApproveAnswers,
    ManageContent,
    AdminDashboard,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule
  ]
})
export class AdminModule { }
