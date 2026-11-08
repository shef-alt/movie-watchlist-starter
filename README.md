# FilmLog — GDGoC Backend Recruitment Task

Dalam penugasan pembuatan backend service ini bahasa pemrograman yang digunakan adalah Javascript dan teknologi yang dipakai yaitu Node.js ES Module, Express.js, PostgreSQL, Sequelize ORM, JWT, Bcrypt dan Google Gemini API, yang dirun menggunakan npm. User dapat melihat katalog film, membuat akun, menyimpan watchlist, mencatat film yang sudah ditonton, serta meminta rekomendasi film dengan Google Gemini.


Link deployment:

## ERD Model

Tabel-tabel yang digunakan adalah movies, users, watchlist, dan watched dengan tipe data dan constraint yang sesuai. 

### Relasi tabel:
* users ke watchlist (1-to-Many), 1 user bisa memiliki banyak watchlist dan tiap watchlist pasti memiliki tepat 1 user
* users ke watched (1-to-Many), 1 user bisa memiliki banyak watched/reviews dan tiap watched/reviews pasti memiliki tepat 1 user
* movies ke watchlist (1-to-Many), 1 movie dapat dimasukkan ke dalam banyak watchlist dan tiap watchlist memiliki tepat 1 movie
* movies ke watched (1-to-Many), 1 movie dapat dimasukkan ke dalam banyak watched/reviews dan tiap watched/reviews memiliki tepat 1 movie

Foreign key menggunakan aksi ON DELETE CASCADE dikarenakan jika induknya (users atau movies) dihapus maka anaknya (watchlist atau watched)juga ikut terhapus

## 📁 Struktur Repositori 

```text
movie-watchlist-starter/
├── backend/
│   ├── config/
│   ├   ├── db.js       # Berisi konfigurasi database postgresql
│   ├── controllers/    # Logika autentikasi, film, watchlist, dan watched
│   ├── middlewares/    # Middleware verifikasi JWT
│   ├── models/         # Model Sequelize dan relasi tabel
│   └── routes/         # Definisi endpoint API
│   ├── app.js          # Inisialisasi Express, route, dan sinkronisasi Sequelize
├── data/
│   ├── movies.json     # Data 20 film awal (format JSON) untuk database seeder
│   └── seed.sql        # Skrip SQL INSERT kompatibel dengan PostgreSQL & MySQL
├── frontend/
│   ├── index.html      # Frontend Letterboxd-style SPA (Zero-build Tailwind)
│   ├── app.js          # Client logic & API caller
│   └── README.md       # Panduan menjalankan frontend
└── README.md           # Panduan penugasan & spesifikasi API
├── .env.example        # Template konfigurasi environment
└── package.json        # Dependency dan perintah npm
```

## Prerequisites
- Node.js v18+
- PostgreSQL terpasang dan berjalan
- npm

## Cara install dan run program (jalankan server)

```bash
npm install
npm start
```

## Environment variables

Daftar environment variable yang dibutuhkan adalah: 
PostgreSQL database config
DATABASE_URL=postgresql://username:password@hostname:port/db_name

Express.js port
PORT=8000

JWT secret key
JWT_SECRET=secret_key

Google Gemini API key
GEMINI_API_KEY=gemini_api_key   

yang dapat dilihat di .env.example dengan mengcopy lalu rename menjadi .env kemudian mengisi variables yang dibutuhkan

## Cara migrasi dan seed database

Buat database di PostgreSQL dengan query CREATE DATABASE db-name. Nyalakan database server postgre dan konfigurasi connection di .env. Setelah terkoneksi dan menjalankan server backend, maka secara otomatis Sequelize akan membuatkan struktur tabel beserta constraintnya dengan sequelize.sync(). Setelah itu seed database movies bisa dilakukan dengan mengcopy paste query di data/seed.sql dan menjalankan query nya di database yang sama.

## 📑 Spesifikasi Kontrak API (API Contract)

API sudah mengimplementasikan spesifikasi antarmuka berikut:

### 1. Autentikasi
* `POST /api/auth/register`
  * **Body:** `{ "username": "string", "email": "string", "password": "string" }`
  * **Response:** Status `201 Created`
* `POST /api/auth/login`
  * **Body:** `{ "email": "string", "password": "string" }`
  * **Response:** Status `200 OK`, JSON berisi `{ "token": "JWT_STRING", "user": { ... } }`

### 2. Movies
* `GET /api/movies`
  * **Query Params (Opsional):** `?genre=Sci-Fi&search=Inception`
  * **Response:** Status `200 OK`, array daftar film dari database.
* `GET /api/movies/:id`
  * **Response:** Status `200 OK`, detail lengkap satu film.

### 3. Watchlist (Protected - Membutuhkan `Authorization: Bearer <token>`)
* `GET /api/watchlist`
  * **Response:** Status `200 OK`, daftar film di watchlist user yang sedang login.
* `POST /api/watchlist`
  * **Body:** `{ "movieId": 1 }`
  * **Response:** Status `201 Created`
* `DELETE /api/watchlist/:movieId`
  * **Response:** Status `200 OK` (atau `204 No Content`)

### 4. Watched & Review (Protected - Membutuhkan `Authorization: Bearer <token>`)
* `GET /api/watched`
  * **Response:** Status `200 OK`, riwayat film yang sudah ditonton oleh user beserta ulasan dan ratingnya.
* `POST /api/watched`
  * **Body:** `{ "movieId": 1, "rating": 5, "review": "Filmnya luar biasa..." }`
  * **Response:** Status `201 Created`.

### 5. AI Recommendation (Gemini API Integration ⭐)
* `POST /api/movies/recommend`
  * **Body:** `{ "prompt": "Saya mau film misteri dengan alur lambat dan atmosfer mendalam" }`
  * **Aturan Khusus:** Film yang direkomendasikan **harus berasal dari 20 film di database awal**.
  * **Response:** Status `200 OK` dengan JSON terstruktur:
    ```json
    {
      "movie_id": 14,
      "reasoning": "Memento sangat cocok dengan preferensi misteri Anda karena..."
    }
    ```

## Contoh Alur Request/Response
* `POST /api/movies/recommend`
  Client/frontend meminta request dengan api /api/movies/recommend dengan method post -> Server/backend menerima request dan mengirimkannya ke GOogle Gemini API dengan menggunakan data prompt dan list film yang akan mengembalikan is_movie_request, movie_id, reasoning dan dilakukan pengecekan untuk movie yang sesuai dengan movie_id sehingga response dapat dikirim dengan data movie_id, reasoning, dan movie. -> Frontend menerima response data tersebut dan menampilkan atau merendernya di UI web. 

## Access Control & Security

Password di-hash menggunakan Bcrypt di proses autentikasi registrasi dan login menggunakan salt round 10, rute privat terlindungi token JWT yang diterapkan di watchlistRoute dan watchedRoute, dan user tidak dapat memodifikasi data user lain dengan query WHERE user_id = req.user.id dari token.

---
## Video Walkthrough

Link: 
