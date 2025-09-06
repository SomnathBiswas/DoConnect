import { Component, OnInit } from '@angular/core';
import { Question, QuestionDto } from '../../../service/question';
import { Router } from '@angular/router';

@Component({
  selector: 'app-answer-question',
  standalone: false,
  templateUrl: './answer-question.html',
  styleUrls: ['./answer-question.css']
})
export class AnswerQuestion implements OnInit {
  questions: QuestionDto[] = [];
  filtered: QuestionDto[] = [];
  selected: QuestionDto | null = null;
  search = '';

  // Answer form
  answerText = '';
  selectedFile?: File;
  previewUrl: string | null = null;
  isSubmitting = false;
  message = '';

  // ---- Add this field: backend base URL (use environment if you prefer)
  private apiUrl = 'http://localhost:5081'; 

  private searchTimer: any = null;

  constructor(private router: Router) {}

  async ngOnInit() {
    await this.loadApproved();
  }

  async loadApproved() {
    try {
      const all = await Question.getAllQuestions();
      // filter approved
      this.questions = all.filter(q => q.status?.toLowerCase() === 'approved');
      this.filtered = [...this.questions];
    } catch (err) {
      console.error(err);
    }
  }


  onSearchChange() {
    const q = this.search.trim();
    if (!q) {
      // If empty, reload all approved questions (or keep cached)
      this.loadApproved(); // reuses existing function
      return;
    }
    // debounce 350ms
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(async () => {
      try {
        const results = await Question.searchQuestions(q);
        // filter approved if your search endpoint returns all statuses
        this.questions = (results || []).filter(r => r.status?.toLowerCase() === 'approved');
        this.filtered = [...this.questions];
      } catch (err) {
        console.error('Search failed', err);
      }
    }, 350);
  }


  async selectQuestion(q: QuestionDto) {
    try {
      const full = await Question.getQuestionById(q.questionId);
      this.selected = full || q;
      this.answerText = '';
      this.selectedFile = undefined;
      this.previewUrl = null;
      this.message = '';

      // Debuging if the image is loaded or not
      console.log('selected.imagePaths', this.selected?.imagePaths);
      this.selected?.imagePaths?.forEach(p => console.log('raw:', p, '=>', this.getImageUrl(p)));
    } catch (err) {
      console.error(err);
    }
  }

  onFileChange(event: any) {
    const file = event.target.files?.[0];
    if (!file) {
      this.selectedFile = undefined;
      this.previewUrl = null;
      return;
    }
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result as string);
    reader.readAsDataURL(file);
  }

  async submitAnswer() {
    if (!this.selected) return;

    if (!this.answerText.trim()) {
      this.message = 'Please provide an answer text.';
      return;
    }

    this.isSubmitting = true;
    this.message = '';
    try {
      const created = await Question.createAnswer({
        questionId: this.selected.questionId,
        answerText: this.answerText.trim()
      });
      // backend should return created AnswerDto with answerId
      const answerId = created?.answerId ?? created?.AnswerId;
      if (this.selectedFile && answerId) {
        await Question.uploadAnswerImage(answerId, this.selectedFile);
      }

      // Do not show new answer yet (pending). Notify user
      this.message = 'Answer submitted and is pending admin approval.';
      this.answerText = '';
      this.selectedFile = undefined;
      this.previewUrl = null;

    } catch (err: any) {
      console.error(err);
      this.message = err?.message || 'Failed to submit answer';
    } finally {
      this.isSubmitting = false;
    }
  }

  getImageUrl(path: string | undefined | null): string {
    if (!path) return '';
    const s = path.toString().trim();

    // already absolute or data URI
    if (s.startsWith('data:') || /^https?:\/\//i.test(s)) return s;

    const clean = s.replace(/^\/+/, '');
    return `${this.apiUrl}/${encodeURI (clean)}`;
  }
}
