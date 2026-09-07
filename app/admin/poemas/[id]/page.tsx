import { EditorLoader } from '@/components/admin/editor';
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <EditorLoader id={(await params).id} />;
}
