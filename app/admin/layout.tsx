import type { Metadata } from 'next';
import { AuthorSession } from '@/components/admin/session';
import './author.css';
export const metadata: Metadata = {
  title: 'Jardim do Autor',
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};
export const dynamic = 'force-dynamic';
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthorSession>{children}</AuthorSession>;
}
