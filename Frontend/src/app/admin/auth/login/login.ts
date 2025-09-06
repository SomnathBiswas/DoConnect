import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../service/auth';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username = '';
  password = '';
  error = '';

  constructor(private router: Router) {}

  async onSubmit() {
    try {
      const res = await Auth.login(this.username, this.password, true);
      alert("Admin logged in successfully!");
      this.router.navigate(['/admin/dashboard']); 
    } catch (err: any) {
      this.error = err;
    }
  }
}
