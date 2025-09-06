import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Question, QuestionDto } from '../../../service/question';

@Component({
  selector: 'app-question-list',
  standalone: false,
  templateUrl: './question-list.html',
  styleUrls: ['./question-list.css']
})
export class QuestionList implements OnInit {
  allQuestions: QuestionDto[] = [];
  filteredQuestions: QuestionDto[] = [];
  selected: QuestionDto | null = null;
  search = '';

  // answers of the selected question (only approved)
  approvedAnswers: { answerId: number, answerText: string, username: string, createdAt: string, imagePaths?: string[] }[] = [];

  // backend base url (used by getImageUrl fallback). Keep consistent with service API_HOST
  private backendOrigin = 'http://localhost:5081';

  private searchTimer: any = null;

  constructor(private router: Router) {}

  async ngOnInit() {
    await this.loadApprovedQuestions();
  }

  // load all questions from backend and keep only approved ones
  async loadApprovedQuestions() {
    try {
      const all = await Question.getAllQuestions(); // expects DTOs with status, imagePaths etc.
      this.allQuestions = (all || []).filter(q => q.status?.toLowerCase() === 'approved');
      // sort newest first
      this.allQuestions.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      this.filteredQuestions = [...this.allQuestions];

      // auto-select first if any
      if (this.filteredQuestions.length) {
        await this.selectQuestion(this.filteredQuestions[0]);
      }
    } catch (err) {
      console.error('Failed to load questions', err);
    }
  }

  
  onSearchChange() {
    const q = this.search.trim();
    if (!q) {
      // reset to original list or reload:
      this.loadApprovedQuestions();
      return;
    }

    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(async () => {
      try {
        const results = await Question.searchQuestions(q);
        // keep only approved if desired:
        this.filteredQuestions = (results || []).filter(r => r.status?.toLowerCase() === 'approved');
      } catch (err) {
        console.error('Search failed', err);
      }
    }, 350);
  }


  // when user selects a question, fetch full DTO (including answers & images)
  async selectQuestion(q: QuestionDto) {
    try {
      const full = await Question.getQuestionById(q.questionId);
      this.selected = full || q;

      // derive approved answers only (backend AnswerDto should include imagePaths)
      const answers = (this.selected?.answers ?? []).filter((a: any) => (a.status || '').toLowerCase() === 'approved');
      this.approvedAnswers = answers.map((a: any) => ({
        answerId: a.answerId ?? a.AnswerId,
        answerText: a.answerText ?? a.AnswerText,
        username: a.username ?? a.Username ?? 'Unknown',
        createdAt: a.createdAt ?? a.CreatedAt,
        imagePaths: a.imagePaths ?? a.ImagePaths ?? []
      }));
    } catch (err) {
      console.error('Failed to load question details', err);
    }
  }

  // helper: convert backend path to absolute url (uses Question.getImageUrl if present)
  getImageUrl(path?: string | null): string {
    // use service helper if available
    try {
      // @ts-ignore
      if (Question && typeof Question.getImageUrl === 'function') {
        // Some implementations used API_HOST + path. Ensure we return an absolute URL.
        const fromService = Question.getImageUrl(path);
        if (fromService) return fromService;
      }
    } catch (e) {
      // fallthrough
    }

    if (!path) return '';
    const trimmed = (path as string).trim();
    if (/^data:|^https?:\/\//i.test(trimmed)) return trimmed;
    const clean = trimmed.replace(/^\/+/, '');
    return `${this.backendOrigin}/${encodeURI(clean)}`;
  }
}