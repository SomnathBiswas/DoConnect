// approve-questions.ts
import { Component, OnInit } from '@angular/core';
import axios, { InternalAxiosRequestConfig } from 'axios';
import { Router } from '@angular/router';

interface QuestionItem {
  questionId: number;
  questionTitle: string;
  questionText: string;
  status: 'Pending'|'Approved'|'Rejected'|string;
  createdAt: string;
  username?: string;
  imagePaths?: string[]; // optional, whatever backend returns
  processing?: boolean;  // UI helper
}

@Component({
  selector: 'app-approve-questions',
  standalone: false,
  templateUrl: './approve-questions.html',
  styleUrls: ['./approve-questions.css']
})
export class ApproveQuestions implements OnInit {
  items: QuestionItem[] = [];
  filtered: QuestionItem[] = [];
  filterStatus: 'Pending'|'Approved'|'Rejected'|'All' = 'Pending';

  private api = axios.create({ baseURL: 'http://localhost:5081/api' });

  constructor(private router: Router) {
    // Attach token to every request (prefer adminToken)
    this.api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const adminToken = localStorage.getItem('adminToken');
      const userToken = localStorage.getItem('authToken');
      const token = adminToken ?? userToken;
      if (token && config.headers) config.headers.Authorization =`Bearer ${token}`;
      return config;
    }, err => Promise.reject(err));
  }

  ngOnInit(): void {
    this.reload();
  }

  async reload() {
    try {
      const res = await this.api.get<QuestionItem[]>('/QuestionApi');
      // Map and ensure processing property exists
      this.items = (res.data || []).map(i => ({ ...i, processing: false }));
      this.filter();
    } catch (err: any) {
      console.error('Failed to load questions', err);
      if (err?.response?.status === 401) {
        // unauthorized -> redirect to admin login
        this.router.navigateByUrl('/admin/auth/login');
      } else {
        alert('Failed to load questions. See console for details.');
      }
    }
  }

  filter() {
    this.filtered = this.items.filter(q =>
      this.filterStatus === 'All' || q.status === this.filterStatus
    );
  }

  async approve(q: QuestionItem) {
    if (!confirm('Approve this question?')) return;
    q.processing = true;
    try {
      await this.api.put(`/QuestionApi/${q.questionId}/approve`);
      q.status = 'Approved';
    } catch (err: any) {
      console.error('Approve failed', err);
      alert(err?.response?.data?.message || 'Failed to approve the question');
      // optionally refresh from server
      await this.reload();
    } finally {
      q.processing = false;
      this.filter();
    }
  }

  async reject(q: QuestionItem) {
    if (!confirm('Reject this question?')) return;
    q.processing = true;
    try {
      await this.api.put(`/QuestionApi/${q.questionId}/reject`);
      q.status = 'Rejected';
    } catch (err: any) {
      console.error('Reject failed', err);
      alert(err?.response?.data?.message || 'Failed to reject the question');
      await this.reload();
    } finally {
      q.processing = false;
      this.filter();
    }
  }

  logout() {
    // Remove admin token
    localStorage.removeItem('adminToken');
    // If you store authToken separately, you might not want to remove it here
    this.router.navigateByUrl('/admin/auth/login');
  }
}