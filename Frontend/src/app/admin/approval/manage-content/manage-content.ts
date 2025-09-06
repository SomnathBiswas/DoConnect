import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { Router } from '@angular/router';

interface QItem {
  questionId: number;
  questionTitle: string;
  questionText: string;
  status: 'Pending'|'Approved'|'Rejected';
  createdAt: string;
  username: string;
  imagePaths?: string[];
}
interface AItem {
  answerId: number;
  questionId: number;
  questionTitle: string;
  answerText: string;
  status: 'Pending'|'Approved'|'Rejected';
  createdAt: string;
  username: string;
  imagePaths?: string[];
}

@Component({
  selector: 'app-manage-content',
  standalone: false,
  templateUrl: './manage-content.html',
  styleUrl: './manage-content.css'
})
export class ManageContent implements OnInit {
  tab: 'questions'|'answers' = 'questions';
  search = '';
  filterStatus: 'All'|'Pending'|'Approved'|'Rejected' = 'All';

  qItems: QItem[] = [];
  aItems: AItem[] = [];
  qFiltered: QItem[] = [];
  aFiltered: AItem[] = [];

  loading = false;
  errorMessage = '';

  private api = axios.create({ baseURL: 'http://localhost:5081/api' });

  constructor(private router: Router) {
    // Attach either adminToken OR authToken (admin first)
    this.api.interceptors.request.use(config => {
      const adminToken = localStorage.getItem('adminToken');
      const authToken = localStorage.getItem('authToken');
      const t = adminToken || authToken;
      if (t && config.headers) {
        config.headers.Authorization = `Bearer ${t}`;
      }
      return config;
    }, err => Promise.reject(err));
  }

  ngOnInit(): void { this.reload(); }

  async reload() {
    this.loading = true;
    this.errorMessage = '';
    try {
      // get questions and answers
      const [qsRes, asRes] = await Promise.all([
        this.api.get<QItem[]>('/QuestionApi'),
        this.api.get<AItem[]>('/AnswerApi')
      ]);

      this.qItems = qsRes.data ?? [];
      this.aItems = asRes.data ?? [];
      this.filter();
    } catch (err: any) {
      console.error('Manage content load error', err);
      // make friendly message
      if (err?.response) {
        this.errorMessage = `Load failed: ${err.response.status} ${err.response.statusText}`;
        // if unauthorized show hint
        if (err.response.status === 401 || err.response.status === 403) {
          this.errorMessage += ' — Authorization failed. Are you logged in as admin?';
        }
      } else {
        this.errorMessage = 'Unknown error while loading content';
      }
    } finally {
      this.loading = false;
    }
  }

  filter() {
    const s = this.search.toLowerCase();

    this.qFiltered = this.qItems.filter(q => {
      const st = this.filterStatus === 'All' || q.status === this.filterStatus;
      const se = q.questionTitle.toLowerCase().includes(s) ||
                q.questionText.toLowerCase().includes(s) ||
                q.username.toLowerCase().includes(s);
      return st && se;
    });

    this.aFiltered = this.aItems.filter(a => {
      const st = this.filterStatus === 'All' || a.status === this.filterStatus;
      const se = a.answerText.toLowerCase().includes(s) ||
                a.username.toLowerCase().includes(s) ||
                a.questionTitle.toLowerCase().includes(s);
      return st && se;
    });
  }

  getFullImagePath(path: string): string {
    if (!path) return '';
    return path.startsWith('http') ? path : '/uploads/' + path;
  }

  async deleteQuestion(id: number) {
    if (!confirm('Delete this question?')) return;
    try {
      await this.api.delete(`/QuestionApi/${id}`);  // Admin-only in backend
      await this.reload();
    } catch (err) {
      console.error(err);
      alert('Delete failed. Check console.');
    }
  }

  async deleteAnswer(id: number) {
    if (!confirm('Delete this answer?')) return;
    try {
      await this.api.delete(`/AnswerApi/${id}`);    // Admin-only in backend
      await this.reload();
    } catch (err) {
      console.error(err);
      alert('Delete failed. Check console.');
    }
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminToken');
    this.router.navigateByUrl('/');
  }
}