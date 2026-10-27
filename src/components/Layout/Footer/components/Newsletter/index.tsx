import { useId } from 'react';
import { Button, Input } from '../../../../../styleguide';
import { useNewsletter } from './useNewsletter';

export function Newsletter() {
  const id = useId();
  const { email, setEmail, submit, isPending, disabled, feedback } = useNewsletter();
  const inputId = `${id}-email`;
  const feedbackId = `${id}-feedback`;
  return (
    <div className="footer-newsletter">
      <h3>Antecipe-se ao próximo lançamento</h3>
      <form aria-label="Inscrição de novidades" onSubmit={submit} noValidate>
        <label className="sr-only" htmlFor={inputId}>
          E-mail da newsletter
        </label>
        <div className="footer-newsletter-controls">
          <Input
            id={inputId}
            type="email"
            autoComplete="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            maxLength={160}
            disabled={disabled}
            aria-describedby={feedback ? feedbackId : undefined}
            aria-invalid={feedback?.invalidEmail || undefined}
          />
          <Button
            type="submit"
            disabled={disabled}
            aria-label="Enviar inscrição na newsletter"
            aria-busy={isPending}
          >
            {isPending ? 'Enviando…' : 'Enviar'}
          </Button>
        </div>
        {feedback && (
          <p
            id={feedbackId}
            className={`footer-newsletter-feedback footer-newsletter-feedback-${feedback.kind}`}
            role={feedback.kind === 'error' ? 'alert' : 'status'}
          >
            {feedback.message}
          </p>
        )}
      </form>
      {!feedback && <p>Novidades das coleções em uma inscrição demonstrativa.</p>}
    </div>
  );
}
