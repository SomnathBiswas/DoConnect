import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Question } from '../../../service/question';

@Component({
  selector: 'app-ask-question',
  standalone: false,
  templateUrl: './ask-question.html',
  styleUrls: ['./ask-question.css']
})
export class AskQuestion {
  title = '';
  description = '';
  selectedFile?: File;
  previewUrl: string | null = null;
  isSubmitting = false;
  errorMsg = '';

  constructor(private router: Router) {}

  onFileChange(event: any) {
    const file = event.target.files?.[0];
    if (!file) {
      this.selectedFile = undefined;
      this.previewUrl = null;
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => { this.previewUrl = reader.result as string; };
    reader.onerror = () => { this.previewUrl = null; };
    reader.readAsDataURL(file);
  }

  async submit() {
  this.errorMsg = '';
  if (!this.title.trim() || !this.description.trim()) {
    this.errorMsg = 'Please provide both title and description.';
    return;
  }

  this.isSubmitting = true;
  try {
    if (this.selectedFile) {
      await Question.createQuestionWithImage( 
        this.title.trim(),
        this.description.trim(),
        this.selectedFile
      );
    } else {
      await Question.createQuestion({
        questionTitle: this.title.trim(),
        questionText: this.description.trim()
      });
    }

    alert('Question submitted successfully! Wait for admin approval.');
  } catch (err: any) {
    this.errorMsg = typeof err === 'string' ? err : (err?.message || 'Failed to submit question');
  } finally {
    this.isSubmitting = false;
  }
}
}