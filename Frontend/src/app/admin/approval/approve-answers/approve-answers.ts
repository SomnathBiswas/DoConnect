import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { Router } from '@angular/router';

interface AnswerItem {
  answerId: number;
  questionId: number;
  questionTitle?: string;
  answerText: string;
  status: 'Pending'|'Approved'|'Rejected';
  createdAt: string;
  username: string;
  imagePaths?: string[];
}

@Component({
  selector: 'app-approve-answers',
  standalone: false,
  templateUrl: './approve-answers.html',
  styleUrls: ['./approve-answers.css']
})
export class ApproveAnswers implements OnInit {
  items: AnswerItem[] = [];
  filtered: AnswerItem[] = [];
  search = '';
  filterStatus: 'Pending'|'Approved'|'Rejected'|'All' = 'Pending';

  // axios instance
  private api = axios.create({ baseURL: 'http://localhost:5081/api' });

  // backend origin for building full image URLs
  private backendOrigin = 'http://localhost:5081';

  constructor(private router: Router) {
    // include admin token fallback
    this.api.interceptors.request.use(c => {
      const t = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
      if (t && c.headers) {
        c.headers.Authorization = `Bearer ${t}`;
      }
      return c;
    });
  }

  ngOnInit(): void { this.reload(); }

  async reload() {
    try {
      const res = await this.api.get<AnswerItem[]>('/AnswerApi'); // server: [HttpGet] GetAllAnswers
      // server already ordered if you want; keep it.
      this.items = res.data.map(a => ({
        ...a,
        // ensure imagePaths is an array not null
        imagePaths: a.imagePaths ?? []
      }));
      this.filter();
    } catch (err: any) {
      console.error('Failed to load answers:', err);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        // not authorized -> redirect to admin login if desired
        // this.router.navigateByUrl('/admin/auth/login');
      }
    }
  }

  filter() {
    const s = this.search.toLowerCase();
    this.filtered = this.items.filter(a => {
      const st = this.filterStatus === 'All' || a.status === this.filterStatus;
      const se = a.answerText?.toLowerCase().includes(s) ||
                 a.username?.toLowerCase().includes(s) ||
                 (a.questionTitle || '').toLowerCase().includes(s);
      return st && se;
    });
  }

  // show getImageUrl helper to resolve relative paths
  getImageUrl(path?: string | null) {
    if (!path) return '';
    const p = path.toString().trim();
    if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('data:')) return p;
    // remove leading slash
    const clean = p.replace(/^\/+/, '');
    return `${this.backendOrigin}/${encodeURI(clean)}`;
  }

  async approve(id: number) {
    try {
      await this.api.put(`/AnswerApi/${id}/approve`);
      await this.reload();
    } catch (err) {
      console.error(err);
    }
  }
  async reject(id: number) {
    try {
      await this.api.put(`/AnswerApi/${id}/reject`);
      await this.reload();
    } catch (err) {
      console.error(err);
    }
  }

  logout() {
    localStorage.removeItem('adminToken'); // or 'authToken' depending on what you use
    this.router.navigateByUrl('/');
  }
}