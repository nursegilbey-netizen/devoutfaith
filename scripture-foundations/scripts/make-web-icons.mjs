// Builds PWA icons from assets/ (run after make-icons.mjs).
import sharp from 'sharp';
await sharp('assets/icon-only.png').resize(192).png().toFile('public/icons/icon-192.png');
await sharp('assets/icon-only.png').resize(512).png().toFile('public/icons/icon-512.png');
await sharp('assets/icon-only.png').resize(180).png().toFile('public/icons/apple-touch-icon.png');
await sharp('assets/icon-only.png').resize(48).png().toFile('public/icons/favicon-48.png');
// Maskable: foreground on full-bleed background with safe-zone padding
const bg = await sharp('assets/icon-background.png').resize(512).toBuffer();
const fg = await sharp('assets/icon-foreground.png').resize(512).toBuffer();
await sharp(bg).composite([{ input: fg }]).png().toFile('public/icons/maskable-512.png');
console.log('web icons ok');
