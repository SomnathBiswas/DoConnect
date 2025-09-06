import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  constructor(private router: Router) {}

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken') || !!localStorage.getItem('adminToken');
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminToken');
    this.router.navigateByUrl('/');
  }
}
