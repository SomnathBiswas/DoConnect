import { Notification, NotificationDto } from './../../service/notification';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
// adjust path if needed

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit, OnDestroy {
  pendingCount = 0;
  recent: NotificationDto[] = [];
  loading = false;
  error = '';
  dropdownOpen = false;

  private pollIntervalMs = 8000; // poll every 8 seconds
  private timerId: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("adminToken");
    this.router.navigate(['/']);
  }

  // toggle dropdown. stop event propagation handled in template
  toggleDropdown(event?: MouseEvent) {
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) {
      this.fetchNotifications();
    }
    if (event) event.stopPropagation();
  }

  async fetchNotifications() {
    this.loading = true;
    this.error = '';
    try {
      const data = await Notification.getPendingSummary(8);
      this.pendingCount = data.pendingCount ?? 0;
      // Ensure createdAt is Date object for pipe formatting
      this.recent = (data.recent ?? []).map(r => ({
        ...r,
        createdAt: new Date(r.createdAt).toISOString()
      }));
    } catch (err: any) {
      console.error('Notification fetch error', err);
      this.error = err?.response?.data?.message || err?.message || 'Failed to load notifications';
    } finally {
      this.loading = false;
    }
  }

  startPolling() {
    // immediate fetch, then set interval
    this.fetchNotifications();
    this.timerId = setInterval(() => this.fetchNotifications(), this.pollIntervalMs);
  }

  stopPolling() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  openNotification(n: NotificationDto) {
    // navigate to the correct admin approve page
    if (n.type === 'Question') {
      this.router.navigate(['/admin/approval/questions']);
    } else {
      this.router.navigate(['/admin/approval/answers']);
    }
    this.dropdownOpen = false;
  }
}