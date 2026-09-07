'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Search, Heart, Menu, X } from 'lucide-react';
const links = [
  ['/poemas', 'poemas'],
  ['/lugares', 'lugares'],
  ['/para-voce', 'para você'],
  ['/livro', 'livro'],
];
export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="navbar">
      <Link
        href="/"
        className="wordmark"
        aria-label="Noctiluz, início"
        onClick={() => setOpen(false)}
      >
        NOCTILUZ
      </Link>
      <nav className="desktop-nav" aria-label="Navegação principal">
        {links.map(([href, name]) => (
          <Link
            href={href}
            key={href}
            aria-current={pathname.startsWith(href) ? 'page' : undefined}
          >
            {name}
          </Link>
        ))}
      </nav>
      <div className="nav-actions">
        <Link href="/busca" className="icon-button" aria-label="Buscar poemas">
          <Search size={18} />
        </Link>
        <Link
          href="/guardados"
          className="icon-button"
          aria-label="Poemas guardados"
        >
          <Heart size={18} />
        </Link>
        <button
          className="icon-button menu-button"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          className="mobile-nav"
          aria-label="Navegação móvel"
        >
          {[
            ...links,
            ['/em-portugues-se-diz', 'em português se diz'],
            ['/sobre', 'sobre'],
          ].map(([href, name]) => (
            <Link href={href} key={href} onClick={() => setOpen(false)}>
              {name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
