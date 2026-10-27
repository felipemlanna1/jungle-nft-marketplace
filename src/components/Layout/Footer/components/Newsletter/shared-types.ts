export interface NewsletterSubmission {
  ownerId: string;
  epoch: number;
  email: string;
}

export interface NewsletterDraft {
  ownerId: string;
  email: string;
}

export interface NewsletterFeedback {
  ownerId: string;
  kind: 'success' | 'error';
  message: string;
  invalidEmail?: boolean;
}
