import type { ComponentProps } from 'react';
// Document navigation intentionally gives beforeunload a chance to protect unsaved
// verses on browser Back. Vinext's client router has no supported navigation blocker.
export function AuthorLink({ children, ...props }: ComponentProps<'a'>) {
  return <a {...props}>{children}</a>;
}
