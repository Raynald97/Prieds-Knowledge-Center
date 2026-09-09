# PRIEDS Knowledge Center — v2.1 Loading Fix

## Perbaikan
- Memperbaiki error `Cannot access 'activeModule' before initialization` yang menghentikan index.html sebelum sidebar dan daftar guide ditampilkan.
- Flowchart List pada header sekarang menampilkan semua Main Menu saat pertama dibuka; filter Main Menu tetap tersedia.
- Pembacaan metadata flowchartArrangement bersifat opsional. Jika endpoint metadata tambahan gagal, data guide utama tetap dimuat dan metadata arrangement dari cache browser dipertahankan bila tersedia.
- Mempertahankan Guide Arrangement, Flowchart Arrangement v2, Add/Edit/Delete, graph editor, penyimpanan cloud, dan direct link yang sudah ada. Tidak ada perubahan schema, reset, atau migrasi database.

## Cara menggunakan
1. Backup folder aplikasi dan data sesuai prosedur Anda. Jangan reset Firebase, IndexedDB, atau browser storage.
2. Ekstrak ZIP. Untuk deployment, unggah semua file di dalam folder Prieds-Knowledge-Center ke root aplikasi yang sama. Jangan unggah folder pembungkusnya jika hosting mengharapkan index.html di root.
3. Pastikan index.html, master.html, knowledge-data.js, knowledge-store.js, dan knowledge-flowcharts.js berada pada direktori yang sama. Ganti file versi lama bersama-sama agar tidak ada JS lama yang tertinggal di cache.
4. Buka index.html pada domain deployment yang sama dengan master.html, lalu lakukan hard refresh bila masih melihat file lama. Untuk pengujian lokal file://, ekstrak seluruh ZIP dan buka index.html; koneksi cloud tetap membutuhkan jaringan dan izin CORS yang sesuai.
5. Pastikan sidebar dan guide tampil. Buka Flowchart List, pilih grup Page Menu, lalu buka flowchart pada tab baru. Coba refresh URL direct link tersebut.

Format direct link: index.html?flowchart=<flowId>&module=<mainMenuId>&page=<pageMenuId>.
Format lama index.html?view=flowchart&flow=<flowId>&module=<mainMenuId> tetap didukung.

## Verifikasi
Tujuh skenario browser Chromium menggunakan backend simulasi lulus: loading guide dan artikel, direct link kanonis, direct link lama, pembukaan langsung Flowchart List, kegagalan endpoint metadata arrangement, format graph lama, serta klik node ke artikel dan Page Menu. Semua request database pada pengujian bersifat read-only dan diarahkan ke fixture, bukan database produksi. Pemeriksaan sintaks JavaScript juga lulus. Deployment Vercel/PRIOR dan data cloud produksi pengguna belum diuji secara langsung.

Paket ini tidak berisi data simulasi, ekspor database, kredensial tambahan, atau metadata Git. File knowledge-data.js, knowledge-store.js, master.html, dan knowledge-flowcharts.js identik dengan v2 sebelumnya. Tidak ada data pengguna yang dihapus.
