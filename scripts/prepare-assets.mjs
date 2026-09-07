import sharp from 'sharp';
import { mkdir, readFile, readdir } from 'node:fs/promises';
const source = process.argv[2];
await mkdir('public/images', { recursive: true });
await mkdir('public/og', { recursive: true });
if (source)
  await sharp(source)
    .resize({ width: 1536, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile('public/images/night-garden.webp');
const accents = {
  pink: '#ff70b7',
  violet: '#9b7bff',
  cyan: '#55dde0',
  gold: '#d7b76d',
  stone: '#a4a5ad',
  green: '#a8ffb0',
};
const escape = (text) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const poems = await Promise.all(
  (await readdir('content/poems'))
    .filter((name) => name.endsWith('.json'))
    .map(async (name) =>
      JSON.parse(await readFile(`content/poems/${name}`, 'utf8')),
    ),
);
for (const poem of [
  {
    slug: 'default',
    excerpt: 'um jardim para\ncoisas não ditas.',
    accent: 'violet',
    demo: false,
  },
  ...poems,
]) {
  const lines = poem.excerpt.split('\n').slice(0, 3);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#08090d"/><text x="90" y="105" fill="#f2eee8" font-family="Georgia" font-size="28" letter-spacing="9">NOCTILUZ</text><circle cx="1100" cy="100" r="4" fill="${accents[poem.accent]}"/>${lines.map((line, i) => `<text x="90" y="${255 + i * 68}" fill="#f2eee8" font-family="Georgia" font-size="${line.length > 40 ? 36 : 46}">${escape(line)}</text>`).join('')}<path d="M90 492h75" stroke="${accents[poem.accent]}"/><text x="90" y="550" fill="#aaa6ae" font-family="Arial" font-size="19">${poem.demo ? 'Texto de demonstração · Noctiluz' : 'Marcelo Roque'}</text></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(`public/og/${poem.slug}.png`);
}
console.log(`${poems.length + 1} previews Open Graph preparados.`);
