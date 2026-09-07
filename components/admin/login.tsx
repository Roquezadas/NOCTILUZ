'use client';
import { useState } from 'react';
import { browserSupabase } from '@/lib/supabase/browser';
import { useAuthor } from './session';
export function AuthorLogin() {
  const { message } = useAuthor();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <section className="author-login">
      <p className="eyebrow">um espaço só seu</p>
      <h1>Entre no jardim.</h1>
      <p className="muted">Os versos podem esperar. Você chegou.</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (busy) return;
          setBusy(true);
          setError('');
          void browserSupabase()
            .then((client) =>
              client.auth.signInWithPassword({ email: email.trim(), password }),
            )
            .then(({ error: authError }) => {
              setPassword('');
              if (authError)
                setError(
                  'Não foi possível entrar. Confira seu e-mail e senha e tente novamente.',
                );
            })
            .catch(() =>
              setError('Não foi possível conectar. Tente novamente.'),
            )
            .finally(() => setBusy(false));
        }}
      >
        <fieldset disabled={busy}>
          <label className="author-field" htmlFor="email">
            E-mail
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="author-field" htmlFor="password">
            Senha
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button className="author-button" type="submit">
            {busy ? 'entrando…' : 'entrar'}
          </button>
        </fieldset>
        <p role="alert" className="author-error">
          {error || message}
        </p>
      </form>
      <p className="author-help">
        Acesso exclusivo ao autor. Sua conta é criada na configuração do
        projeto.
      </p>
    </section>
  );
}
