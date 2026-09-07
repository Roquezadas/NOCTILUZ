'use client';
import { useSyncExternalStore, useState } from 'react';
import { Heart, Share2 } from 'lucide-react';
const KEY = 'noctiluz:guardados:v1';
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('noctiluz-saved', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('noctiluz-saved', callback);
  };
}
function snapshot() {
  try {
    return localStorage.getItem(KEY) || '[]';
  } catch {
    return '[]';
  }
}
export function useSavedPoems() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => '[]');
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}
export function PoemActions({ id, title }: { id: string; title: string }) {
  const saved = useSavedPoems();
  const isSaved = saved.includes(id);
  const [message, setMessage] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  function toggle() {
    try {
      const next = isSaved
        ? saved.filter((item) => item !== id)
        : [...saved, id];
      localStorage.setItem(KEY, JSON.stringify(next));
      window.dispatchEvent(new Event('noctiluz-saved'));
      setMessage(
        isSaved
          ? 'Poema retirado dos guardados.'
          : 'Este poema ficou com você.',
      );
    } catch {
      setMessage(
        'Seu navegador não permitiu guardar. Libere o armazenamento para tentar novamente.',
      );
    }
  }
  async function share() {
    const url = window.location.href.split('#')[0];
    setManualUrl('');
    try {
      if (navigator.share) {
        await navigator.share({ title: `${title} — Noctiluz`, url });
        setMessage('Poema compartilhado.');
        return;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setMessage('Link copiado. Pode levar este poema com você.');
    } catch {
      setManualUrl(url);
      setMessage('Copie o link abaixo para compartilhar.');
    }
  }
  return (
    <>
      <div className="poem-actions">
        <button
          className="action-button"
          aria-pressed={isSaved}
          onClick={toggle}
        >
          <Heart size={17} fill={isSaved ? 'currentColor' : 'none'} />
          {isSaved ? 'guardado' : 'guardar'}
        </button>
        <button className="action-button" onClick={share}>
          <Share2 size={16} />
          compartilhar
        </button>
      </div>
      <output className="status">{message}</output>
      {manualUrl && (
        <input
          aria-label="Link do poema para copiar"
          className="manual-share"
          readOnly
          value={manualUrl}
          onFocus={(event) => event.target.select()}
        />
      )}
    </>
  );
}
