# Catatan Pengembangan ausfear

Catatan rancangan dan temuan teknis untuk dilanjutkan nanti. Terakhir diperbarui 30 Oktober 2026.

---

## 1. Kartu lagu buatan sendiri (pengganti embed Apple Music di spiderweb)

**Status:** sudah dibuat (30 Okt 2026).

### Kenapa
Embed Apple Music baru merender isinya setelah terlihat di layar, lalu butuh ±3 detik lagi (diuji 29 Okt 2026: iframe eager di luar layar tetap kosong selama 10 detik). Masalah itu ada di sisi Apple, bukan karena `loading="lazy"`. Di dark mode, kotak putihnya juga makin terlihat janggal.

### Yang dibuat
- **Kartu lagu** (`components/SongCard.tsx`): cover, judul, artis, tombol play/pause, bar visualizer, sisa waktu, progress, dan link ↗ ke Apple Music. Kartu langsung tampil bersama halaman, mengikuti tema terang/gelap, dan tetap memakai efek tilt. Efek tilt hanya bereaksi pada mouse (di layar sentuh kartu sempat miring tertahan setelah di-tap). Kilau yang mengikuti kursor (`--tilt-glare`) berwarna gelap di mode terang dan terang di mode gelap.
- **Satu pemutar global** (`components/AudioPlayer.tsx`, dipasang di `Providers`): satu elemen `<audio>` untuk seluruh situs, jadi memutar lagu lain otomatis menghentikan yang sebelumnya. Lagu juga bisa dikendalikan dari kontrol media OS dan layar kunci HP (Media Session API).
- **Mini player melayang** (`components/MiniPlayer.tsx`): muncul saat ada lagu aktif tapi kartunya tidak terlihat di layar. Berisi cover, judul, bar visualizer, play/pause, dan tombol tutup (yang menghentikan lagu). Klik judulnya untuk kembali ke kartu. Di HP tampil selebar layar di bawah; di desktop berupa pil di pojok kanan bawah.

### Data
- `data/songs.ts`: daftar lagu (`trackId` + label genre). **Ini yang diedit tangan.**
- `npm run songs:sync`: mengambil judul, artis, URL preview, dan link Apple Music dari iTunes Lookup API ke `data/songs.generated.json`, serta cover ke `public/songs/<trackId>.webp`. Tanpa API key.
- Posisi kartu di desktop ada di `spiderwebLayout` (`components/Interests.tsx`), satu posisi per lagu sesuai urutan. Menambah lagu ke-6 berarti juga menambah posisi ke-6.
- Kalau suatu saat preview tidak bisa diputar (Apple sesekali memindahkan file preview), jalankan ulang `npm run songs:sync`. Kartu akan menampilkan "Preview unavailable" beserta link ke Apple Music.

### Batasan
- Hanya preview 30 detik. Untuk lagu penuh, pengunjung membuka link Apple Music di kartu.
- Belum diuji di Safari iOS (tidak tersedia di lingkungan pengujian). Secara teori didukung (Web Audio dengan audio CORS didukung sejak Safari 14.1), tapi sebaiknya dicek langsung di iPhone.
- Safari iOS membisukan audio yang lewat Web Audio saat tombol silent iPhone aktif. Pemutar menyetel `navigator.audioSession.type = "playback"` (Safari 16.4+) supaya diperlakukan seperti aplikasi musik. Di iOS yang lebih lama, lagu tetap tidak bersuara selama mode silent aktif.

**Menguji di iPhone tanpa push ke GitHub** (laptop dan iPhone di Wi-Fi yang sama):
1. `npm run build`, lalu `npx next start -H 0.0.0.0 -p 3001`.
2. Di iPhone buka `http://<IP Wi-Fi laptop>:3001`. Cek IP-nya dengan `ipconfig` (bagian "Wireless LAN adapter Wi-Fi"); per 30 Okt 2026 alamatnya 192.168.1.42. Alamat "Network" yang ditampilkan `npm run dev` bisa jadi milik Radmin VPN (26.x.x.x), jangan pakai itu.
3. Pakai build produksi, bukan `npm run dev`: Next 16 memblokir aset dev dari alamat selain localhost (`allowedDevOrigins`), sehingga JavaScript-nya bisa tidak berjalan di iPhone.
4. Kalau iPhone tidak bisa membuka halaman, Windows Firewall memblokirnya karena jaringan Wi-Fi terdaftar sebagai "Public". Ubah ke "Private" (Settings → Network & internet → Wi-Fi → nama jaringan → Network profile type → Private), atau izinkan Node.js saat Windows menampilkan dialog firewall.

---

## 2. Visualizer audio

**Status:** sudah dibuat (30 Okt 2026) di sekitar "Ingredients of my music library".

### Yang bergerak mengikuti lagu
- **Bar di kartu, di baris playlist, dan di mini player** (`components/FrequencyBars.tsx`): spektrum frekuensi sungguhan di `<canvas>`, dengan sebaran logaritmik supaya bass dan treble sama-sama terlihat.
- **Garis waveform** (`components/WaveformLine.tsx`): garis dari judul ke kartu yang sedang diputar meliuk mengikuti lagu. Bentuknya disusun dari empat gelombang sinus (bass, low-mid, mid, high), masing-masing dengan amplitudo dari pita frekuensinya. Garisnya meruncing di kedua ujung, memudar di dekat judul, dan ditemani satu garis bayangan tipis. Saat di-pause, garisnya merata menjadi lurus dan meredup.
- **Judul "Ingredients…"** membesar sedikit di setiap ketukan kick, dengan cahaya oranye di belakangnya yang mengikuti kerasnya lagu.

### Garis spiderweb selalu tepat ke tengah kartu
Ujung garis tidak lagi memakai koordinat tetap. `useCardCenters` (di `WaveformLine.tsx`) mengukur titik tengah setiap kartu di setiap frame, hanya selama spiderweb terlihat di desktop. Hasilnya tepat walaupun kartu diputar, ditilt, melayang, atau tingginya berbeda. Terukur: selisih 0 px di lebar 1280/1440/1920. Garis abu-abu memudar ke arah tengah lewat mask radial supaya tidak menembus judul.

### Cara kerja dan kalibrasi
- Preview iTunes dikirim dengan `Access-Control-Allow-Origin: *`, jadi `<audio crossOrigin="anonymous">` bisa disambungkan ke `AnalyserNode`. Sudah diverifikasi: 96 dari 128 band frekuensi berisi data sungguhan.
- **Rentang desibel diubah menjadi −85…−10 dB.** Dengan rentang bawaan (−100…−30 dB), lagu yang di-master keras membuat bass mentok di 0,91–1,0 sehingga tidak ada yang terlihat bergerak. Setelah diubah, kerasnya lagu berada di ±0,35–0,50 dan bar menyebar dari 0,2 sampai 0,9 (diukur pada lagu EDM, akustik, dan koplo).
- **Denyut judul memakai "beat"**: seberapa jauh bass melonjak di atas rata-ratanya yang lambat (±0,04–0,05 di setiap kick), bukan level absolut, sehingga tetap berdenyut berapa pun kerasnya master lagu.
- Analisis hanya berjalan saat lagu diputar: satu loop `requestAnimationFrame` untuk seluruh situs, dengan nilai disalurkan lewat MotionValue (tanpa render ulang React per frame).
- `prefers-reduced-motion`: judul tidak berdenyut, cahaya mati, waveform menjadi garis lurus, dan bar tampil sebagai bentuk diam.

### Ide lanjutan
- Bar melingkar di sekeliling judul, atau partikel spiderweb yang bereaksi terhadap bass.

---

## 2b. Playlist (carousel)

**Status:** sudah dibuat (30 Okt 2026). Ketiga embed Apple Music di carousel diganti kartu playlist sendiri.

### Yang dibuat
- **Kartu playlist** (`components/PlaylistCard.tsx`): cover, judul, "Playlist by … · N songs", tombol **Play** (memutar dari lagu pertama, atau pause/resume kalau lagu dari playlist ini sedang diputar), tombol **Full playlist ↗**, dan daftar 8 lagu yang masing-masing bisa diputar. Di bawahnya ada link "+N more songs on Apple Music".
- **Setiap lagu memakai pemutar global yang sama** dengan spiderweb, jadi bar visualizer dan mini player otomatis ikut bekerja. Baris yang sedang diputar disorot oranye, dan nomor urutnya berganti menjadi bar mini.
- **Swipe carousel di HP kini berfungsi penuh**, karena tidak ada lagi iframe yang menelan sentuhan. Kartu samping diberi `inert`, sehingga tombolnya tidak bisa dicapai lewat Tab; satu klik pada kartu samping memindahkannya ke tengah.
- Kedelapan lagu muat tanpa scroll di lebar 320–1440px (diuji). Header mobile dibuat bertinggi tetap (judul dan subtitle satu baris, tombol di baris sendiri) supaya tinggi kartu bisa dihitung pasti.

### Cara kerja data
`npm run playlists:sync` (`scripts/playlists.mjs`), untuk setiap playlist di `data/playlists.ts`:
1. Membaca halaman publik `music.apple.com/id/playlist/<slug>/<id>`. Data JSON di dalamnya (`serialized-server-data`) memuat header (judul, kurator, jumlah lagu, template cover) dan daftar lagu berurutan. Bagian-bagian ini dicari berdasarkan jenisnya (`containerDetailHeader…`, `trackLockup`), bukan posisinya.
2. Mencari preview setiap lagu lewat iTunes Lookup API.
3. Menulis `data/playlists.generated.json`, cover playlist ke `public/playlists/`, dan cover lagu ke `public/songs/`.

Lagu yang tidak punya preview atau tidak tersedia di storefront Indonesia dilewati, dan diganti lagu berikutnya di playlist.

### Mengedit
- **Mengganti jumlah lagu:** tambahkan `limit: 10` pada playlist di `data/playlists.ts`. Kalau lebih dari 8, tinggi kartu di `PlaylistCard.tsx` dan tinggi container carousel di `Interests.tsx` juga perlu dinaikkan.
- **Memilih lagu tertentu:** `trackIds: [123, 456, …]` (ID lagu dari link Apple Music-nya, sesuai urutan yang diinginkan).
- **Menambah atau mengganti playlist:** isi `id`, `slug`, dan `label` dari link publik playlist-nya. Playlist harus publik. Carousel saat ini dirancang untuk tepat 3 playlist (kiri, tengah, kanan).
- **Memperbarui isi** (setelah playlist di Apple Music berubah): jalankan ulang `npm run playlists:sync`.

### Risiko
- **Ini membaca halaman yang tidak terdokumentasi.** Kalau Apple mengubah formatnya, script akan berhenti dengan pesan error yang jelas. Situsnya tetap aman, karena memakai data hasil sync terakhir.
- Hanya preview 30 detik per lagu.
- Jalur resmi lewat Apple Music API membutuhkan developer token dari Apple Developer Program (berbayar per tahun).

---

## 3. Dark mode

**Status:** sudah dibuat (30 Okt 2026).

### Cara kerjanya
- **Tema awal mengikuti pengaturan sistem** (`prefers-color-scheme`). Setelah pengunjung memilih lewat tombol bulan/matahari di navbar, pilihannya disimpan di `localStorage` (`ausfear:theme`) dan tidak lagi mengikuti sistem.
- **Tidak ada kedipan putih.** Script kecil di `<head>` (`themeInitScript` di `lib/theme.ts`) memasang `data-theme` di `<html>` sebelum halaman digambar.
- **Transisi:** tema baru menyapu dari bawah ke atas dengan garis scanline oranye, motif yang sama dengan pergantian foto hero (View Transitions API). Browser tanpa dukungan, atau pengunjung dengan reduced-motion, langsung berganti tanpa animasi.
- **Kelas Tailwind `dark:`** mengikuti `data-theme`, bukan pengaturan sistem langsung (`@custom-variant` di `globals.css`).

### Keputusan desain
- **Hero:** foto diberi rim light (drop-shadow tipis putih ditambah glow oranye) dan spotlight samar di belakangnya, supaya baju hitam tidak tenggelam. Nama di dalam siluet berubah oranye (`--hero-name-inside`), karena putih-di-atas-putih akan menghapus efeknya.
- **Gaming section:** tetap gelap di kedua tema. Di mode gelap menjadi permukaan yang sedikit lebih terang (`#141416` vs halaman `#0b0b0c`) dengan cahaya oranye samar dari atas, sehingga tetap terbaca sebagai "panggung". Opsi membaliknya menjadi terang ditolak, karena pita terang di halaman gelap menyilaukan.
- **Embed Apple Music** memakai `?theme=dark` (sudah diuji dan berfungsi). Saat tema diganti, iframe dimuat ulang dan isinya muncul ±3 detik kemudian, perilaku normal embed Apple.
- **Widget Steam** sudah gelap dari sananya, jadi tidak diubah.

### Mengubah warna
Semua warna ada di `app/globals.css`: nilai terang di `:root`, nilai gelap di `[data-theme="dark"]`. Token yang paling sering perlu disetel:

| Token | Terang | Gelap | Dipakai untuk |
| --- | --- | --- | --- |
| `--color-bg` | `#fafafa` | `#0b0b0c` | Background halaman |
| `--color-text-muted` / `--color-text-faint` | `#5e5e5e` / `#737373` | `#a8a8a8` / `#8c8c8c` | Teks sekunder (semua ≥4,5:1) |
| `--gaming-bg` | `#0a0a0a` | `#141416` | Gaming section |
| `--hero-name-inside` | putih | oranye | Nama di dalam siluet foto |
| `--hero-watermark`, `--deco-number` | abu sangat terang | abu sangat gelap | Tulisan "AUSFEAR" raksasa dan angka "01"/"02" |
| `--nav-*` | | | Pill navbar |

Rim light dan spotlight foto ada di blok `[data-theme="dark"] .hero-photo` dan `.hero-photo-mask::before`.

### Yang sudah diuji (30 Okt 2026, build produksi)
- Semua section di 1440px dan 390px, tanpa error di console.
- Tema terpasang sebelum `DOMContentLoaded`, baik dari pengaturan sistem maupun pilihan tersimpan.
- Toggle (desktop dan mobile), pilihan yang bertahan setelah reload, dan pilihan yang menang atas perubahan pengaturan sistem.
- Regresi mode terang: tidak ada perubahan.

### Ikut diperbaiki
- **Kursor ketik di kalimat "I play …" bisa terlempar sendirian ke baris baru** saat nama game sedang diketik di layar sempit, dan padding chip menonjol ±10px melewati batas konten. Sekarang huruf terakhir dan kursor menjadi satu unit, dan paragraf diberi padding kanan. Diuji untuk setiap tahap ketikan dari ke-31 nama game di 7 lebar layar.

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

- ~~Swipe carousel playlist di HP hanya bekerja di baris label~~. Teratasi 30 Okt 2026: embed Apple diganti kartu playlist sendiri (bagian 2b).
- **Iframe Steam** sengaja memakai atribut lama `marginHeight={0}` dan `marginWidth={0}`. Keduanya mengatur margin `<body>` di dalam widget. Kalau dihapus, muncul celah 8px dan efek rounded corner-nya hilang.
- **Error 404 `/_vercel/insights/script.js`** saat dijalankan di lokal itu normal. Vercel Analytics hanya aktif setelah deploy.
- **Dev server kadang tidak membuat class Tailwind baru** (Next 16 + Turbopack di Windows, ditemukan 29 Okt 2026). Gejalanya: class baru sudah ada di HTML, tapi tidak punya efek. Penyebabnya, cache CSS di `.next` tidak diperbarui saat file diedit, dan cache itu tetap terbawa walaupun dev server di-restart. Solusinya: hentikan dev server, hapus folder `.next`, lalu jalankan `npm run dev` lagi. Production build (`npm run build`) tidak terpengaruh.
