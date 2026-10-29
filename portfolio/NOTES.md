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

**Status:** sudah dibuat (29 Okt 2026), berdasarkan sketsa.

### Yang dibuat
- **Game Collection:** dua baris cover game yang bergerak terus-menerus ke arah berlawanan, lebar penuh layar. Cover tampil B&W dan redup; saat di-hover berubah berwarna dengan nama game dan jam main. Kedua baris berhenti saat di-hover.
- **Kalimat dinamis:** "I play **[genre]**, like **[game]**." Genre bergulir vertikal di dalam chip oranye, lalu nama game diketik dengan kursor oranye yang berkedip.
- **Keduanya terhubung:** cover game yang sedang diketik menyala (berwarna penuh dengan ring oranye).
- **Beda dari sketsa (disengaja):** sketsa memilih genre dulu, lalu game. Karena satu baris lebarnya ±3.700px, game yang dipilih acak sering sedang di luar layar, sehingga efek menyalanya tidak terlihat. Jadi urutannya dibalik: pilih acak dari cover yang **sedang terlihat**, lalu ambil salah satu genrenya. Bagi pembaca, kalimatnya tetap sama.

Susunan section: header → label "Game Collection" → marquee → kalimat → grid lama (widget Steam, paragraf, metrics, handles). Paragraf lama belum dipersingkat.

**Tipografi kalimat (revisi 29 Okt 2026):** versi pertama memakai Syne bold untuk seluruh kalimat dengan ukuran sampai 60px, dan terasa terlalu besar. Sekarang kata penghubung ("I play", "like") memakai Inter light dengan warna putih 60%, sementara Syne semibold hanya dipakai di dalam chip. Ukurannya juga turun: 20px (HP) → 36px (desktop). Syne tetap menjadi font identitas tanpa mendominasi.

**Detail teknis yang sudah dibereskan:**
- Mask pudar di tepi marquee memotong semua yang keluar dari kotaknya, sehingga cover yang di-highlight (membesar + ring) terpotong di atas dan bawah. Solusinya: `py-5` pada `.game-marquee`, dengan `space-y` induk dikurangi sebesar padding itu supaya jarak yang terlihat tetap sama.
- Nama game yang panjang di HP: chip nama game memakai inline biasa dengan `box-decoration-clone`, sehingga bisa terpecah ke beberapa baris dengan border yang utuh. `min-height` dalam satuan `em` mencadangkan ruang untuk kasus terpanjang ("Hitman: World of Assassination"), supaya konten di bawahnya tidak melompat. Sudah diuji di lebar 320–1920px.
- Chip genre (`inline-flex`) diselaraskan dengan chip nama game memakai `leading-[1.2]` + `align-baseline`. Selisihnya terukur 0,0–0,2px.
- Kalau nama game atau genre baru jauh lebih panjang dari yang ada sekarang, cek ulang di lebar 320px. Mungkin `min-h` perlu dinaikkan.

### File yang terlibat

| File | Isi |
| --- | --- |
| `data/games.ts` | **Daftar game yang ditampilkan.** Satu-satunya file yang perlu diedit tangan |
| `data/steam-library.json` | Seluruh library Steam (295 game): jam main, terakhir dimainkan, tag genre. Hanya untuk referensi, tidak dipakai halaman |
| `data/game-hours.json` | Jam main per `steamAppId`, untuk tampilan hover. Dibuat otomatis |
| `public/games/*.webp` | Cover 460×215 |
| `scripts/games.mjs` | Script `games:sync`, `games:images`, `games:find` |
| `components/GameCollection.tsx` | Komponen marquee dan kalimat |
| `.env.local` | `STEAM_API_KEY` (diabaikan git, jangan di-commit) |

### Cara mengedit daftar game
Setiap baris di `data/games.ts`:

```ts
{ name: "Subnautica", genres: ["survival games"], image: "/games/subnautica.webp", steamAppId: 264710 },
```

- **Menghapus game:** hapus barisnya. Gambarnya boleh dibiarkan atau dihapus dari `public/games/`.
- **Mengubah urutan:** marquee mengikuti urutan di file. Game ke-1, 3, 5, … masuk baris atas; ke-2, 4, 6, … masuk baris bawah.
- **Genre:** ditulis supaya enak dibaca dalam "I play ___, like ___." (bentuk jamak, huruf kecil). Satu game boleh punya beberapa genre. Genre dengan satu game tetap jalan.
- **Menambah game Steam:**
  1. `npm run games:find -- "hades"` → menampilkan `steamAppId`, jam main (kalau dimiliki), dan tag genre.
  2. Tambahkan satu baris ke `data/games.ts`.
  3. `npm run games:images` → mengunduh cover yang belum ada.
- **Menambah game non-Steam:** tulis barisnya tanpa `steamAppId`, lalu taruh gambar 460×215 (rasio ±2,14:1) di path `image`. `npm run games:images` akan mendaftar cover yang masih kosong. Jam main tidak tampil untuk game non-Steam.
- **Memperbarui jam main dan library:** `npm run games:sync` (butuh `.env.local`). Perintah ini juga mengunduh cover yang belum ada.
- **Mengganti cover** (misalnya banner event musiman seperti "Halloween Event" di Euro Truck Simulator 2): timpa file `.webp`-nya dengan gambar lain berukuran sama.
- Setelah mengedit, jalankan `npm run lint` dan `npx tsc --noEmit`. Salah ketik nama field akan langsung ketahuan karena file ini bertipe TypeScript.

### Angka asli dari library (29 Okt 2026), untuk referensi Player Metrics
- 295 game dimiliki, total **4.894 jam** (klaim "Hours Wasted 5,000+" hampir tepat).
- **129 game belum pernah dimainkan**, dan 163 dimainkan kurang dari 1 jam. Klaim "Games Owned (Unplayed) 200+" berlebihan.
- Game yang paling lama dimainkan: Counter-Strike 2, 1.832 jam.

### Aksesibilitas & performa
- Marquee: hanya salinan pertama setiap game yang terbaca pembaca layar; salinan untuk efek loop diberi `aria-hidden`.
- Kalimat dinamis: bagian animasinya `aria-hidden`, dan ada satu kalimat `sr-only` yang menyebut semua genre (tanpa `aria-live`).
- `prefers-reduced-motion`: marquee berhenti tapi bisa digeser manual; kalimat berganti tanpa efek ketik.
- Kalimat hanya berjalan saat terlihat di layar. Cover memakai lazy loading (±20 KB per gambar). Marquee berjalan dengan CSS, bukan JavaScript per frame.

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
| **Player Metrics dengan data asli**: angka sudah tersedia di `data/steam-library.json` (lihat bagian 4) | Mengganti angka karangan dengan data nyata | Rendah |
| **Bagian "Things I Made"** | Kekurangan konten terbesar: teks About menyebut suka membuat sesuatu, tapi belum ada karya yang ditampilkan | Tergantung isi |

---

## 7. Keterbatasan yang sudah diketahui

- **Swipe carousel playlist di HP** hanya bekerja di baris label, karena iframe Apple menangkap semua sentuhan. Tombol panah dan titik indikator adalah navigasi utama. Tidak bisa diperbaiki tanpa membuat isi playlist tidak bisa diklik.
- **Iframe Steam** sengaja memakai atribut lama `marginHeight={0}` dan `marginWidth={0}`. Keduanya mengatur margin `<body>` di dalam widget. Kalau dihapus, muncul celah 8px dan efek rounded corner-nya hilang.
- **Error 404 `/_vercel/insights/script.js`** saat dijalankan di lokal itu normal. Vercel Analytics hanya aktif setelah deploy.
- **Dev server kadang tidak membuat class Tailwind baru** (Next 16 + Turbopack di Windows, ditemukan 29 Okt 2026). Gejalanya: class baru sudah ada di HTML, tapi tidak punya efek. Penyebabnya, cache CSS di `.next` tidak diperbarui saat file diedit, dan cache itu tetap terbawa walaupun dev server di-restart. Solusinya: hentikan dev server, hapus folder `.next`, lalu jalankan `npm run dev` lagi. Production build (`npm run build`) tidak terpengaruh.
