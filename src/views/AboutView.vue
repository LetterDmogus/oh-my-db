<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 font-sans leading-relaxed">
    <AppNavbar />
    
    <main class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="space-y-16">
        <section>
          <h1 class="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">Tentang Oh My DB</h1>
          <p class="text-gray-600 text-lg max-w-3xl">
            Oh My DB adalah alat bantu perancangan database visual yang dirancang untuk kecepatan dan kemudahan. 
            Membantu pengembang membangun skema database standar industri dalam hitungan detik menggunakan kekuatan AI dan sistem blok yang intuitif.
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              Riwayat Versi
              <div class="h-px bg-gray-200 flex-1 ml-2"></div>
          </h2>
          
          <div class="space-y-12">
            <!-- Version 0.2.0 -->
            <div class="relative pl-8 border-l-2 border-amber-400">
              <div class="absolute -left-[9px] top-0 w-4 h-4 bg-amber-400 rounded-full border-4 border-white shadow-sm"></div>
              <div class="flex items-center gap-3 mb-2">
                <span class="text-sm font-bold text-amber-600">V0.2.0</span>
                <span class="text-xs text-gray-400 font-medium tracking-wide">27 April 2026</span>
                <span class="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase tracking-widest">AI & Ecosystem Update</span>
              </div>
              <p class="text-sm font-bold text-gray-800 mb-4">The Intelligent Era</p>
              <ul class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                <li v-for="feature in v020Features" :key="feature" class="text-sm text-gray-600 flex items-start gap-2">
                  <span class="text-amber-500 mt-1 shrink-0">✨</span>
                  {{ feature }}
                </li>
              </ul>
            </div>

            <!-- Version 0.1.0 -->
            <div class="relative pl-8 border-l-2 border-indigo-200">
              <div class="absolute -left-[9px] top-0 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white shadow-sm"></div>
              <div class="flex items-center gap-3 mb-2">
                <span class="text-sm font-bold text-indigo-600">V0.1.0</span>
                <span class="text-xs text-gray-400">26 April 2026</span>
              </div>
              <p class="text-sm font-bold text-gray-800 mb-4">Initial Release (The Power Pack)</p>
              <ul class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                <li v-for="feature in v010Features" :key="feature" class="text-[13px] text-gray-500 flex items-start gap-2">
                  <span class="text-indigo-400 mt-1 shrink-0">•</span>
                  {{ feature }}
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section class="bg-indigo-900 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
          <h2 class="text-xl font-bold mb-4">Open Source & Kontribusi</h2>
          <p class="text-indigo-100 text-sm mb-6 leading-relaxed opacity-80">
            Oh My DB dibangun dengan semangat berbagi. Gunakan alat ini untuk belajar, bekerja, atau membangun proyek impianmu. 
            Ingin berkontribusi? Cek repositori resmi kami di GitHub.
          </p>
          <div class="flex flex-wrap gap-4">
              <div class="px-3 py-1 bg-white/10 rounded-lg text-xs font-mono border border-white/10">Vue 3 (Composition API)</div>
              <div class="px-3 py-1 bg-white/10 rounded-lg text-xs font-mono border border-white/10">Tailwind CSS v4</div>
              <div class="px-3 py-1 bg-white/10 rounded-lg text-xs font-mono border border-white/10">Groq LPU Inference</div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import AppNavbar from '../components/layout/AppNavbar.vue'

const v020Features = [
  'AI Architect: Bangun skema dari teks (Llama 3.3 70B)',
  'AI Column Suggestion: Saran kolom pintar otomatis',
  'AI Realistic Data: Isi data dummy yang masuk akal',
  'User Library: Buat dan simpan blok kustom sendiri',
  'Library Bundle: Import/Export koleksi desain (.json)',
  'Selective Export: Pilih tabel tertentu untuk diekspor',
  'Direct Download: Simpan hasil export langsung ke file',
  'Laravel Seeder Export: Hasilkan file Seeder PHP',
  'Timestamp Shortcut: Tambah created_at & updated_at instan',
  'Refactored UI: Arsitektur komponen yang lebih stabil'
]

const v010Features = [
  'Visual Table Builder (Tambah/Hapus Tabel & Kolom)',
  'Drag & Drop reorder sistem',
  'Undo & Redo (Ctrl+Z / Ctrl+Y)',
  'Export Laravel Migration (PHP)',
  'Export Schema SQL (MySQL, Postgres, SQLite)',
  'Export Canvas ke Gambar (PNG)',
  'Pewarnaan Tabel (Table Coloring)',
  'Data Manager (Manual Insert)',
  'Sistem Relasi (Foreign Key)',
  'Responsive Table Resizing'
]
</script>
