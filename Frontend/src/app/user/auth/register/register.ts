import { Component } from '@angular/core';
import { Auth } from '../../../service/auth';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  username='';
  password='';
  message = '';

  async onRegister() {
    try {
      const res = await Auth.registerUser(this.username, this.password);
      this.message = "User registered successfully!";
      console.log(res);
    } catch (err: any) {
      this.message = " wrong JSON" + JSON.stringify(err);
    }
  }

}
