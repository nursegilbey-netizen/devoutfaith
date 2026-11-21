import sharp from 'sharp';
const fg = (size, pad) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
<g transform="translate(${pad} ${pad}) scale(${(100-2*pad)/100})">
 <!-- foundation stones -->
 <rect x="18" y="70" width="30" height="12" rx="1.5" fill="#f5efe3"/>
 <rect x="52" y="70" width="30" height="12" rx="1.5" fill="#f5efe3"/>
 <rect x="33" y="55" width="34" height="12" rx="1.5" fill="#d9a94f"/>
 <!-- open book -->
 <path d="M50 24 C40 18 28 18 20 21 V50 C28 47 40 47 50 53 Z" fill="#f5efe3"/>
 <path d="M50 24 C60 18 72 18 80 21 V50 C72 47 60 47 50 53 Z" fill="#ebe0cc"/>
 <path d="M50 24 V53" stroke="#8a2c20" stroke-width="1.6"/>
</g></svg>`;
const bg = (s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><rect width="100%" height="100%" fill="#8a2c20"/></svg>`;
await sharp(Buffer.from(fg(1024, 20))).png().toFile('assets/icon-foreground.png');
await sharp(Buffer.from(bg(1024))).png().toFile('assets/icon-background.png');
await sharp(Buffer.from(bg(1024))).composite([{ input: Buffer.from(fg(1024, 8)) }]).png().toFile('assets/icon-only.png');
const splash = (s, c) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><rect width="100%" height="100%" fill="${c}"/></svg>`;
await sharp(Buffer.from(splash(2732,'#f5efe3'))).composite([{ input: await sharp(Buffer.from(bg(600))).composite([{input:Buffer.from(fg(600,8))}]).png().toBuffer(), gravity:'center' }]).png().toFile('assets/splash.png');
await sharp(Buffer.from(splash(2732,'#121318'))).composite([{ input: await sharp(Buffer.from(bg(600))).composite([{input:Buffer.from(fg(600,8))}]).png().toBuffer(), gravity:'center' }]).png().toFile('assets/splash-dark.png');
console.log('ok');
