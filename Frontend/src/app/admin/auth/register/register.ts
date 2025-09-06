import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../service/auth'; 

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  username = '';
  password = '';
  error = '';

  constructor(private router: Router) {}

  async onSubmit() {
    try {
      await Auth.registerAdmin(this.username, this.password);
      alert("Admin registered successfully!");
      this.router.navigate(['/admin/auth/login']);
    } catch (err: any) {
      this.error = err;
    }
  }

}
