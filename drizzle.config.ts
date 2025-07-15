import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema.ts", // Lokasi schema kamu
  out: "./drizzle", // Folder output untuk migrasi
  dialect: "postgresql", // Dialek yang digunakan
  dbCredentials: {
    url: process.env.DATABASE_URL, // Menggunakan URL yang ada di .env
  },
  verbose: true, // Menampilkan log lebih detail
} as Config; // Menggunakan 'as' untuk casting ke tipe Config
