import { Component } from '@angular/core';
import { Auth } from '../../../service/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username='';
  password=''
  error = '';

  constructor(private router: Router) {}

  async onLogin() {
    try {
      const res = await Auth.login(this.username, this.password);
      localStorage.setItem('token', res.token); 
      alert("User logged in successfully!");
      this.router.navigate(['/user/dashboard']);
    } catch (err: any) {
      this.error = err;
    }
  }

}
