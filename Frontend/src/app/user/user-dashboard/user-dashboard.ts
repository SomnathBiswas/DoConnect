import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  standalone: false,
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css'
})
export class UserDashboard {
   username = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // If you stored Username in localStorage when logging in:
    this.username = localStorage.getItem('username') || '';

    // Optionally redirect to login if not authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      this.router.navigate(['/user/auth/login']);
    }
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    this.router.navigate(['/']);
  }
}
