# Catatan Pengembangan ausfear

Catatan rancangan dan temuan teknis untuk dilanjutkan nanti. Terakhir diperbarui 29 Oktober 2026.

---

## 1. Kartu lagu buatan sendiri (pengganti embed Apple Music di spiderweb)

**Status:** rancangan, belum dikerjakan.

### Masalah yang mau diselesaikan
Kartu lagu di bagian "Ingredients of My Music Library" tampil sebagai kotak abu-abu berikon not musik selama beberapa detik sebelum isinya muncul.

Hasil tes (29 Okt 2026, Edge):
- Iframe Apple Music dengan `loading="eager"` yang diletakkan di luar layar **tetap kosong selama 10 detik** (hanya kerangka, tanpa teks atau gambar).
- Setelah di-scroll ke layar, isinya baru muncul **±3 detik kemudian**.
- Jadi penyebabnya ada di embed Apple atau di browser yang menahan iframe lintas domain yang tidak terlihat, **bukan** `loading="lazy"`. Mengubah ke eager tidak membantu.
- Konten embed Apple dirender di dalam Shadow DOM.

### Solusi: kartu sendiri dengan data dari iTunes Lookup API
API publik, tanpa API key:

```
https://itunes.apple.com/lookup?id=<trackId>&country=id
```

Field yang dipakai dari `results[0]`:

| Field | Isi |
| --- | --- |
| `trackName` | Judul lagu |
| `artistName` | Artis (bisa sangat panjang, misalnya lagu Anime; potong dengan ellipsis) |
| `artworkUrl100` | Cover 100×100. Ganti `100x100` di URL menjadi `600x600` untuk resolusi lebih besar |
| `previewUrl` | Preview audio 30 detik (`.m4a`) |
| `trackViewUrl` | Link ke Apple Music |

`trackId` adalah angka terakhir di URL embed. Kelima lagu sudah dicek dan datanya lengkap:

| Genre | trackId | Lagu |
| --- | --- | --- |
| EDM - Melodic Bass | 1652371778 | Deep Blue (feat. Monika Santucci), William Black |
| Acoustic | 1482863953 | All You Need To Know (feat. Calle Lehmann) [Acoustic], Gryffin & SLANDER |
| Koplo - Dangdut | 1726193449 | Wirang, Guyon Waton |
| Anime | 1813815070 | NEXT FRONTIER, Grass Wonder (CV: Rena Maeda) dkk. |
| Alt Z | 1473421589 | Cold, Boy In Space & unheard |

### Rancangan implementasi
- **Ambil data saat build, bukan di browser pengunjung.** `Interests.tsx` adalah client component, jadi fetch dilakukan di `app/page.tsx` (server component) lalu diteruskan sebagai props. Alternatifnya, simpan hasilnya di file JSON.
- **Komponen `SongCard`:** cover, judul, artis, label genre, tombol play/pause dengan indikator progres, dan link "Open in Apple Music".
- **Hanya satu lagu diputar dalam satu waktu.** Pakai satu pengendali audio bersama (context): memutar lagu lain otomatis menghentikan yang sedang berjalan.
- Kartu tetap memakai posisi spiderweb, `TiltCard`, dan animasi yang sudah ada.
- **Playlist di carousel (`pl.u-…`) tetap memakai embed.** Itu playlist pribadi dan tidak tersedia lewat API publik.

### Keputusan yang belum diambil
Tombol Play sebaiknya:
- **(a) Memutar preview 30 detik langsung lewat `<audio>`**: seketika, ringan, dan **wajib** kalau mau ada visualizer (bagian 2); atau
- **(b) Memuat player Apple asli saat diklik**: lagu penuh untuk pelanggan yang login, tapi ada jeda ±3 detik dan tidak bisa divisualisasikan.

Kombinasi yang masuk akal: (a) sebagai aksi utama, ditambah link "Open in Apple Music" untuk yang ingin lagu penuh. Catatan: pengunjung yang tidak login juga hanya mendapat preview 30 detik di embed Apple.

---

## 2. Visualizer audio yang mengikuti lagu

**Status:** ide, bergantung pada bagian 1 opsi (a).

### Yang tidak bisa (sudah diselidiki)
- **Audio di dalam iframe Apple Music** tidak bisa dibaca oleh halaman, karena same-origin policy membuat iframe lintas domain terisolasi total. Embed Apple juga tidak mengirim data audio lewat `postMessage`.
- **MusicKit JS** (SDK resmi Apple): lagu penuh diputar dengan DRM, dan browser hanya memberi keheningan kalau audio terenkripsi disambungkan ke Web Audio.
- **Merekam audio tab** (`getDisplayMedia`): memunculkan dialog izin berbagi layar setiap kali dan dukungan browser-nya terbatas. Tidak cocok untuk portofolio.

### Yang bisa: menganalisis preview dari kartu sendiri
CDN preview iTunes (`audio-ssl.itunes.apple.com`) mengirim `Access-Control-Allow-Origin: *` (dicek 29 Okt 2026). Jadi:

```ts
const audio = new Audio();
audio.crossOrigin = "anonymous"; // wajib diset SEBELUM src
audio.src = previewUrl;

const ctx = new AudioContext(); // buat/resume di dalam klik pengguna (autoplay policy)
const source = ctx.createMediaElementSource(audio); // hanya boleh sekali per elemen audio
const analyser = ctx.createAnalyser();
analyser.fftSize = 256; // 128 bin frekuensi
source.connect(analyser);
analyser.connect(ctx.destination); // jangan lupa, kalau tidak suaranya hilang

const bins = new Uint8Array(analyser.frequencyBinCount);
// tiap requestAnimationFrame: analyser.getByteFrequencyData(bins)
```

Catatan teknis:
- Simpan satu `AudioContext` dan satu `MediaElementSource` per elemen audio di pengendali bersama, jangan dibuat ulang setiap kali play.
- Kalau `prefers-reduced-motion`, tampilkan bar statis atau level sederhana tanpa animasi.
- Hentikan loop `requestAnimationFrame` saat audio di-pause supaya tidak membebani CPU.
- Uji di Safari (iOS): `AudioContext` harus di-resume dari gesture pengguna.

### Ide tampilan
- Bar visualizer kecil di kartu yang sedang diputar.
- Garis-garis spiderweb berdenyut mengikuti energi bass (ketebalan atau opacity garis).
- Judul "INGREDIENTS OF MY MUSIC LIBRARY" sedikit membesar dan mengecil mengikuti beat.

---

## 3. Dark mode

**Status:** sudah disimulasikan (CSS disuntikkan ke halaman), belum diimplementasikan.

Temuan dari simulasi hero di background `#0b0b0c`:
- **Foto tidak tenggelam total.** Wajah, tangan, dan garis kerah tetap terang. Tapi bahu, rambut, dan bagian bawah baju hitam menyatu dengan background.
- **Efek khas hero hilang.** Nama AUDINTA/SAKTI yang berubah warna saat melintasi siluet jadi putih semua, karena teks di luar dan di dalam siluet sama-sama putih.

Resep yang terbukti bekerja di simulasi:

```css
/* Rim light mengikuti tepi alpha foto cutout */
filter: grayscale(1) contrast(1.12) brightness(1.08)
  drop-shadow(0 0 1px rgba(255,255,255,.55))
  drop-shadow(0 0 18px rgba(255,107,43,.28));
```

- Tambahkan spotlight samar di belakang foto: `radial-gradient` putih dengan opacity ±10%.
- **Teks nama di dalam siluet diubah menjadi oranye (`--color-pop`)**, sementara yang di luar tetap putih. Efek perpindahan warnanya kembali, dan hasilnya terlihat lebih dramatis daripada versi terang.

Yang perlu dibereskan kalau jadi dibuat (warna yang masih hardcoded):
- Angka dekoratif "01"/"02" (`text-[#f5f5f5]`) di `About.tsx` dan `Interests.tsx`.
- `.hero-giant-text` (`#eeeeee`) dan `.nav-pill` (background putih transparan) di `globals.css`.
- Quote desktop di `Hero.tsx` (`text-black`) dan inline style `color: "#ffffff"` di teks dalam siluet.
- Bagian Gaming sudah gelap (`bg-[#0a0a0a]`), jadi di dark mode perlu dibedakan, misalnya dengan warna surface yang sedikit lebih terang atau garis batas.
- Toggle-nya bisa memakai transisi scanline wipe yang sama dengan pergantian foto hero.

---

## 4. Gaming section: Game Collection + kalimat dinamis

**Status:** rancangan dari sketsa (29 Okt 2026), belum dikerjakan.

### Konsep
1. **Game Collection:** dua baris cover game yang bergerak terus-menerus ke arah berlawanan (baris atas ke kiri, baris bawah ke kanan).
2. **Kalimat dinamis:** "I play **[GENRE]**, like **[GAME]**."
   - Genre berganti berkala dengan animasi gulir vertikal ala slot machine, di dalam chip yang di-highlight.
   - Game dipilih acak dari genre tersebut dan muncul dengan efek mengetik.

### Usulan susunan

```
┌──────────────────────────────────────────────┐
│ WHAT I PLAY                                  │
│ Gaming                                       │  header (tetap)
├──────────────────────────────────────────────┤
│ ← [cover][cover][cover][cover][cover] ←      │  full-bleed, tembus batas
│ → [cover][cover][cover][cover][cover] →      │  container max-w-7xl
├──────────────────────────────────────────────┤
│  I play ⟦ roguelikes ⟧, like ⟦ Hades_ ⟧.     │  kalimat besar (font Syne)
├──────────────────────────────────────────────┤
│ [Steam widget]  │ paragraf (dipersingkat)    │  grid lama
│                 │ metrics + handles          │
└──────────────────────────────────────────────┘
```

- Marquee dan kalimat harus muat dalam satu layar, karena keduanya saling terhubung (lihat poin interaksi di bawah).
- Paragraf deskripsi lama bisa dipersingkat, karena pesannya sudah dibawa oleh kalimat dinamis.

### Detail yang membuatnya terasa "satu sistem"
- **Satu sumber data** untuk marquee dan kalimat:
  ```ts
  type Game = { name: string; genres: string[]; image: string; steamAppId?: number };
  ```
- **Interaksi:** saat kalimat mengetik nama sebuah game, cover game itu di marquee menyala (misalnya berwarna penuh atau ber-border oranye) sementara cover lain tetap redup atau B&W. Marquee boleh melambat sebentar di momen itu.
- **Cover B&W, berwarna saat di-hover atau di-highlight**, supaya selaras dengan foto hero. Hover juga menampilkan nama game, dan opsional jam main.
- **Sumber gambar:** CDN Steam, `https://cdn.cloudflare.steamstatic.com/steam/apps/{appid}/header.jpg` (landscape 460×215, sesuai sketsa) atau `library_600x900.jpg` (poster vertikal). Game non-Steam (misalnya gacha HoYoverse) butuh gambar manual di `public/`. Tambahkan domain Steam ke `images.remotePatterns` di `next.config.ts`.
- **Urutan animasi kalimat:** genre bergulir → nama game diketik → tahan ±2,5 detik → teks dihapus → ulang. Hindari game yang sama muncul dua kali berturut-turut.
- **Lebar chip berubah-ubah** mengikuti panjang teks, jadi animasikan lebarnya supaya kalimat tidak "melompat". Di HP, kalimat dipecah dua baris.

### Aksesibilitas & performa
- Marquee: baris duplikat (untuk efek loop) diberi `aria-hidden`; berhenti saat hover dan saat `prefers-reduced-motion`.
- Kalimat dinamis: bagian animasinya `aria-hidden`, lalu sediakan satu kalimat statis `sr-only` yang menyebut semua genre. Jangan pakai `aria-live`, karena pembaca layar akan membacakannya setiap beberapa detik.
- Reduced motion: tanpa efek mengetik, cukup ganti teks setiap beberapa detik.
- Gambar cover lazy-load; marquee memakai CSS transform (seperti marquee "ausfear" di footer), bukan JavaScript per frame.

---

## 5. Konten "karya": bahan pertimbangan

Belum ada proyek GitHub yang selesai, dan media sosial juga tidak berisi karya. Situs ini adalah situs pribadi, bukan portofolio kerja, jadi "karya" tidak harus berupa aplikasi. Kemungkinan isi:
- **Situs ini sendiri sebagai karya**: catatan singkat di balik layar (preloader liquid, scanline wipe, efek teks yang menembus siluet).
- Rekaman singkat bermain gitar, keyboard, atau flute.
- Kurasi playlist dan "Ingredients" yang sudah ada, atau screenshot dan momen dari game.
- Bagian "Now" atau "Currently" (sedang main apa, dengar apa, belajar apa) sebagai pengganti "Things I Made" sampai ada karya yang ingin dipamerkan.

---

## 6. Backlog ide fitur

Diurutkan kira-kira dari yang paling khas "ausfear".

| Ide | Kenapa cocok | Usaha |
| --- | --- | --- |
| **Achievement ala Steam**: toast "Achievement Unlocked" untuk eksplorasi (scroll sampai bawah, menemukan easter egg, memutar semua lagu, membuka situs di atas jam 3 pagi). Tersimpan di `localStorage`, dengan penghitung kecil di footer | Persona gamer, dan menjadi "lem" untuk semua easter egg lain | Sedang |
| **Gacha pull**: banner berisi fakta atau foto, dengan rate 0,6% dan soft pity yang benar secara matematis, plus penghitung pity | Menggabungkan lelucon gacha dengan gelar matematika | Sedang |
| **Tanda tangan dengan Fourier epicycle** di bagian Math: logo "a" atau tulisan "ausfear" digambar oleh lingkaran-lingkaran berputar (DFT dari path SVG) | Visual "wow" ala Awwwards yang benar-benar matematis. Butuh versi SVG path dari logo | Sedang |
| **Shader dither/halftone pada foto hero** (WebGL): foto B&W jadi titik-titik yang membentuk wajah di sekitar kursor; pergantian foto memakai pixel-dissolve | Tren kuat di Awwwards dan cocok dengan estetika B&W | Tinggi |
| **Konami code → "ausfear mode"**: overlay CRT dengan scanline dan aksen oranye penuh | Easter egg klasik gamer, memakai ulang motif scanline | Rendah |
| **Pesan rahasia di DevTools console** | Easter egg murah untuk sesama developer | Rendah |
| **Tipografi kinetik**: kecepatan dan kemiringan marquee mengikuti kecepatan scroll; heading "di-decode" dengan efek text scramble saat muncul | Polesan gerak yang terasa premium | Rendah |
| **Status live lewat Lanyard** (Discord): "currently playing …" di hero | Membuat situs terasa hidup. Perlu bergabung ke server Discord Lanyard | Rendah–sedang |
| **Player Metrics dengan data asli** dari Steam Web API (jam main, jumlah game) lewat route handler | Mengganti angka karangan ("5,000+") dengan data nyata | Sedang |
| **Bagian "Things I Made"** | Kekurangan konten terbesar: teks About menyebut suka membuat sesuatu, tapi belum ada karya yang ditampilkan | Tergantung isi |

---

## 7. Keterbatasan yang sudah diketahui

- **Swipe carousel playlist di HP** hanya bekerja di baris label, karena iframe Apple menangkap semua sentuhan. Tombol panah dan titik indikator adalah navigasi utama. Tidak bisa diperbaiki tanpa membuat isi playlist tidak bisa diklik.
- **Iframe Steam** sengaja memakai atribut lama `marginHeight={0}` dan `marginWidth={0}`. Keduanya mengatur margin `<body>` di dalam widget. Kalau dihapus, muncul celah 8px dan efek rounded corner-nya hilang.
- **Error 404 `/_vercel/insights/script.js`** saat dijalankan di lokal itu normal. Vercel Analytics hanya aktif setelah deploy.
