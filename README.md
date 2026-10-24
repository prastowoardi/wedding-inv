# Undangan Pernikahan — Arinta & Fajar

Sebuah undangan pernikahan elektronik yang modern, editorial, dan ramah untuk dibagikan lewat tautan. Dibangun murni dengan HTML, CSS, dan JavaScript — tanpa build step, bisa langsung dideploy di hosting gratisan maupun berbayar.

## Fitur
- Cover interaktif dengan tombol "Buka" & personalisasi tamu via `?to=Nama Tamu`
- Halaman undangan penuh: pembuka, mempelai, hitung mundur, acara + peta, cerita, galeri dengan lightbox, RSVP + ucapan, hadiah (rekening & alamat), penutup
- Tema terang/gelap + mengikuti preferensi sistem
- Musik ambien sintetis (opsional, bisa dimatikan)
- Simpan tanggal ke kalender (`.ics`)
- Bagikan undangan / salin tautan
- RSVP tersimpan di `localStorage` untuk demo (bisa terhubung ke endpoint)
- Responsif untuk mobile & desktop
- Efek reveal on-scroll dengan penghormatan `prefers-reduced-motion`

## Struktur
```text
weding-inv/
├── index.html
├── assets/
│   ├── css/style.css
│   ├── js/config.js
│   ├── js/main.js
│   ├── fonts/        # self-hosted Cormorant Garamond & Jost
│   ├── images/       # foto prewedding
│   └── favicon.svg
└── README.md
```

## Pengaturan cepat
1. Buka `assets/js/config.js`
2. Ubah data pasangan, jadwal acara, peta, galeri, rekening, alamat, kontak WA, link RSVP
3. Untuk personalisasi, bagikan `index.html?to=Nama%20Tamu`

## Deploy (gratis)
- **Netlify** — drag & drop folder ini ke [netlify.com/drop](https://app.netlify.com/drop)
- **Vercel** — import repo/folder ke [vercel.com](https://vercel.com)
- **GitHub Pages** — push ke repo, aktifkan Pages dari branch `main` / root
- **Cloudflare Pages** — upload folder atau hubungkan Git

Semua bisa langsung jalan tanpa konfigurasi tambahan.

## Catatan
- Jika ingin menerima RSVP sungguhan, isi `rsvp.endpoint` dengan URL penerima (contoh: Formspree, Apps Script, dll). Format body: JSON berisi `name`, `attendance`, `guests`, `message`, `createdAt`.
- Musik menggunakan Web Audio API (sintetis) jadi tidak butuh file MP3 eksternal.
- Foto berasal dari Unsplash (silakan ganti dengan foto pribadi jika diinginkan).
- Font disajikan via `@font-face` lokal.

**Selamat menikah & semoga undangan ini bermanfaat.**
