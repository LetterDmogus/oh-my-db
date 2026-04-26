<template>
  <div class="min-h-screen bg-gray-50">
    <AppNavbar />
    
    <main class="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="space-y-12">
        <section>
          <h1 class="text-3xl font-bold text-gray-900 mb-6">Tentang Oh My DB</h1>
          <p class="text-gray-600 leading-relaxed text-lg">
            Oh My DB adalah alat bantu untuk merancang skema database secara visual dengan cepat dan mudah. 
            Dibuat khusus untuk membantu pengembang dan pelajar dalam memahami struktur database tanpa harus pusing dengan sintaks SQL yang rumit di awal. 
            Aplikasi ini berjalan sepenuhnya di browser kamu, menjaga data kamu tetap pribadi dan aman.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-gray-900 mb-6">Riwayat Versi</h2>
          
          <div class="space-y-8">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <span class="text-sm font-bold text-indigo-600">V0.1.0</span>
                <span class="text-xs text-gray-400">26 April 2026</span>
              </div>
              <p class="text-sm font-bold text-gray-800 mb-3">Initial Release (The Power Pack)</p>
              <ul class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                <li v-for="feature in features" :key="feature" class="text-sm text-gray-600 flex items-start gap-2">
                  <span class="text-indigo-400 mt-1 shrink-0">•</span>
                  {{ feature }}
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold text-gray-900 mb-4">Kontribusi</h2>
          <p class="text-sm text-gray-600 leading-relaxed">
            Punya ide fitur atau menemukan bug? Silakan berkontribusi melalui repositori GitHub resmi kami. 
            Aplikasi ini dibangun menggunakan Vue 3, Pinia, dan Tailwind CSS.
          </p>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import AppNavbar from '../components/layout/AppNavbar.vue'

const features = [
  'Table Builder visual (Tambah/Hapus Tabel & Kolom)',
  'Drag & Drop reorder tabel dan kolom',
  'Undo & Redo sistem (Ctrl+Z / Ctrl+Y)',
  'Export Laravel Migration & Seeder (PHP)',
  'Export Schema SQL (MySQL, PostgreSQL, SQLite)',
  'Export Canvas ke Gambar (PNG)',
  'Import & Export proyek via JSON',
  'Data Manager dengan Smart Dummy Generator',
  'Sistem Relasi (Foreign Key) antar tabel',
  'Pewarnaan Tabel (Table Coloring)',
  'Fitur Pencarian Tabel yang responsif',
  'Catatan / Dokumentasi di setiap kolom',
  'Compact & Detailed mode untuk kolom',
  'Responsive Table Resizing',
  'Starter Templates (Blog & E-commerce)'
]
</script>
