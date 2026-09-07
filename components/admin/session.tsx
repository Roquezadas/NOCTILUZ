'use client';
import { AuthorLink } from './author-link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { requestAuthorLeave } from './leave';
import { authorContentSource, browserSupabase } from '@/lib/supabase/browser';
type Access = {
  state: 'loading' | 'guest' | 'author' | 'error';
  email: string;
  message: string;
  logout: () => Promise<void>;
};
const Context = createContext<Access>({
  state: 'loading',
  email: '',
  message: '',
  logout: async () => {},
});
export const useAuthor = () => useContext(Context);
export function AuthorSession({ children }: { children: React.ReactNode }) {
  const [access, setAccess] = useState<Omit<Access, 'logout'>>({
    state: 'loading',
    email: '',
    message: '',
  });
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    let active = true;
    let revision = 0;
    let unsubscribe = () => {};
    void browserSupabase()
      .then(async (client) => {
        const verify = async () => {
          const current = ++revision;
          if (active) setAccess({ state: 'loading', email: '', message: '' });
          const {
            data: { session },
            error: sessionError,
          } = await client.auth.getSession();
          if (!active || current !== revision) return;
          if (sessionError || !session) {
            setAccess({ state: 'guest', email: '', message: '' });
            return;
          }
          const {
            data: { user },
            error: userError,
          } = await client.auth.getUser();
          if (!active || current !== revision) return;
          if (userError || !user) {
            setAccess({
              state: 'guest',
              email: '',
              message: 'Entre novamente para continuar.',
            });
            return;
          }
          const { data, error } = await client
            .from('admin_users')
            .select('user_id')
            .eq('user_id', user.id)
            .maybeSingle();
          if (!active || current !== revision) return;
          if (error) {
            setAccess({
              state: 'error',
              email: '',
              message:
                'Não foi possível verificar seu acesso. Verifique a conexão e a configuração do banco.',
            });
            return;
          }
          if (!data) {
            await client.auth.signOut({ scope: 'local' });
            if (active)
              setAccess({
                state: 'guest',
                email: '',
                message: 'Esta conta não tem acesso ao Jardim do Autor.',
              });
            return;
          }
          setAccess({ state: 'author', email: user.email ?? '', message: '' });
        };
        const { data } = client.auth.onAuthStateChange((event) => {
          if (event === 'SIGNED_OUT') {
            revision++;
            if (active) setAccess({ state: 'guest', email: '', message: '' });
          } else if (
            event !== 'INITIAL_SESSION' &&
            event !== 'TOKEN_REFRESHED'
          ) {
            setTimeout(() => {
              if (active) void verify();
            }, 0);
          }
        });
        unsubscribe = () => data.subscription.unsubscribe();
        if (!active) {
          unsubscribe();
          return;
        }
        await verify();
      })
      .catch((error: unknown) => {
        if (active)
          setAccess({
            state: 'error',
            email: '',
            message:
              error instanceof Error
                ? error.message
                : 'Não foi possível abrir o Jardim do Autor.',
          });
      });
    return () => {
      active = false;
      revision++;
      unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (access.state === 'guest' && pathname !== '/admin/login')
      router.replace('/admin/login');
    if (access.state === 'author' && pathname === '/admin/login')
      router.replace('/admin');
  }, [access.state, pathname, router]);
  const logout = async () => {
    const client = await browserSupabase();
    const { error } = await client.auth.signOut({ scope: 'local' });
    if (error) {
      setAccess({
        state: 'error',
        email: '',
        message: 'Não foi possível encerrar a sessão. Tente novamente.',
      });
      return;
    }
    setAccess({ state: 'guest', email: '', message: '' });
    router.replace('/admin/login');
  };
  return (
    <Context.Provider value={{ ...access, logout }}>
      <div className="author-shell">
        <header className="author-header">
          <AuthorLink href="/admin" className="author-brand">
            noctiluz<span>jardim do autor</span>
          </AuthorLink>
          <nav aria-label="Área do autor">
            {access.state === 'author' && (
              <>
                <AuthorLink href="/admin">início</AuthorLink>
                <AuthorLink href="/admin/poemas">meus poemas</AuthorLink>
                <button
                  type="button"
                  onClick={() => requestAuthorLeave(() => void logout())}
                >
                  sair
                </button>
              </>
            )}
            <AuthorLink href="/">ver o site ↗</AuthorLink>
          </nav>
        </header>
        <main id="conteudo" className="author-main">
          {access.state === 'author' && authorContentSource() === 'static' && (
            <p className="author-source-notice">
              Você está editando o Supabase, mas o site ainda mostra o acervo
              local. Ative a fonte Supabase após conferir seus poemas.
            </p>
          )}
          {access.state === 'loading' ? (
            <output className="author-notice">Abrindo o jardim…</output>
          ) : access.state === 'error' ? (
            <section className="author-setup">
              <p className="eyebrow">antes de entrar</p>
              <h1>O jardim aguarda sua chave.</h1>
              <p role="alert">{access.message}</p>
              <p>
                A configuração está preparada em{' '}
                <strong>docs/SUPABASE.md</strong>. Depois de conectar seu
                projeto, você poderá entrar com sua conta de autor.
              </p>
              <button
                className="author-button"
                onClick={() => window.location.reload()}
              >
                verificar novamente
              </button>
            </section>
          ) : access.state === 'author' || pathname === '/admin/login' ? (
            children
          ) : (
            <output>Indo para a entrada…</output>
          )}
        </main>
        <footer className="author-footer">
          Um espaço reservado para o que ainda vai florescer.
        </footer>
      </div>
    </Context.Provider>
  );
}
