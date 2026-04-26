<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 font-sans">
    <AppNavbar />
    
    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Proyek Kamu</h1>
          <p class="text-sm text-gray-500">Kelola dan bangun skema database kamu dengan cepat</p>
        </div>
        <div class="flex gap-2">
            <BaseButton variant="outline" @click="showAiModal = true" title="Gunakan AI untuk merancang database">
              <Sparkles class="w-4 h-4 mr-2 text-amber-500" /> AI Architect
            </BaseButton>
            <BaseButton @click="showCreateModal = true" title="Buat proyek database baru">
              <Plus class="w-4 h-4 mr-2" /> Proyek Baru
            </BaseButton>
        </div>
      </div>

      <!-- Settings Icon for API Key -->
      <div class="flex justify-end mb-4">
          <button @click="showSettingsModal = true" class="text-xs text-gray-400 hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer">
              <Settings class="w-3 h-3" /> Konfigurasi Groq API
          </button>
      </div>

      <div v-if="store.projects.length === 0" class="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
        <Database class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">Belum ada proyek</h3>
        <p class="mt-1 text-sm text-gray-500">Mulai dengan membuat proyek baru atau gunakan AI Architect.</p>
      </div>

      <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="project in store.projects"
          :key="project.id"
          class="relative flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-all cursor-pointer group"
          @click="$router.push(`/projects/${project.id}`)"
        >
          <div>
            <div class="flex items-center justify-between mb-4">
                <span class="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 uppercase">
                    {{ project.dialect }}
                </span>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click.stop="handleExportLibrary(project.id)" class="text-gray-400 hover:text-indigo-600 p-1.5 rounded-md hover:bg-indigo-50 cursor-pointer" title="Export as Library"><Library class="w-4 h-4" /></button>
                    <button @click.stop="store.deleteProject(project.id)" class="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 cursor-pointer" title="Hapus"><Trash2 class="w-4 h-4" /></button>
                </div>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 leading-tight">{{ project.name }}</h3>
            <p class="mt-1 text-sm text-gray-500">{{ project.tables.length }} Tabel</p>
          </div>
          <div class="mt-6 flex items-center text-xs text-gray-400">
            <Clock class="mr-1 h-3 w-3" />
            Dibuat pada {{ new Date(project.createdAt).toLocaleDateString() }}
          </div>
        </div>
      </div>
    </main>

    <!-- Modal AI Architect -->
    <BaseModal :show="showAiModal" title="AI Architect (Powered by Groq)" @close="showAiModal = false">
      <div class="space-y-4">
        <div v-if="!store.groqApiKey" class="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs">
            ⚠️ Anda belum mengatur <strong>Groq API Key</strong>. Silakan atur di menu konfigurasi terlebih dahulu.
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Deskripsikan Database Anda</label>
          <textarea
            v-model="aiPrompt"
            rows="4"
            class="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border cursor-text bg-gray-50"
            placeholder="Contoh: Buatkan skema database untuk aplikasi perpustakaan sekolah yang memiliki tabel buku, peminjaman, denda, dan kategori."
          ></textarea>
        </div>
        <p class="text-[10px] text-gray-400 italic">AI akan merancang tabel, kolom, tipe data, dan relasi secara otomatis.</p>
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showAiModal = false">Batal</BaseButton>
        <BaseButton @click="handleAiGenerate" :loading="aiLoading" :disabled="!aiPrompt || !store.groqApiKey">
            <Sparkles class="w-4 h-4 mr-2" /> Bangun Skema
        </BaseButton>
      </template>
    </BaseModal>

    <!-- Modal Settings (API Key) -->
    <BaseModal :show="showSettingsModal" title="Konfigurasi Groq AI" @close="showSettingsModal = false">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Groq API Key</label>
          <input
            v-model="tempApiKey"
            type="password"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border cursor-text"
            placeholder="gsk_..."
          />
          <p class="mt-2 text-[10px] text-gray-400 leading-relaxed">
              Dapatkan API Key gratis di <a href="https://console.groq.com/keys" target="_blank" class="text-indigo-600 underline">console.groq.com</a>. 
              Key Anda akan disimpan secara aman di browser lokal Anda.
          </p>
        </div>
      </div>
      <template #footer>
        <BaseButton @click="saveApiKey">Simpan Perubahan</BaseButton>
      </template>
    </BaseModal>

    <!-- Standard Create Modal -->
    <BaseModal :show="showCreateModal" title="Buat Proyek Baru" @close="showCreateModal = false">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Nama Proyek</label>
          <input v-model="newProjectName" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border cursor-text" placeholder="Aplikasi Toko Saya" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Database Dialect</label>
          <select v-model="newProjectDialect" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border cursor-pointer">
            <option value="mysql">MySQL</option>
            <option value="postgresql">PostgreSQL</option>
            <option value="sqlite">SQLite</option>
          </select>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showCreateModal = false">Batal</BaseButton>
        <BaseButton @click="handleCreateProject" :disabled="!newProjectName">Buat Proyek</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Database, Clock, Trash2, Library, Sparkles, Settings } from 'lucide-vue-next'
import { v4 as uuidv4 } from 'uuid'
import { useProjectStore } from '../stores/useProjectStore'
import { askAI } from '../utils/aiService'
import AppNavbar from '../components/layout/AppNavbar.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseModal from '../components/ui/BaseModal.vue'

const store = useProjectStore()
const router = useRouter()

const showCreateModal = ref(false)
const showAiModal = ref(false)
const showSettingsModal = ref(false)
const aiLoading = ref(false)
const aiPrompt = ref('')
const tempApiKey = ref(store.groqApiKey)

const newProjectName = ref('')
const newProjectDialect = ref('mysql')

const saveApiKey = () => {
    store.updateApiKey(tempApiKey.value)
    showSettingsModal.value = false
    alert('API Key tersimpan!')
}

const handleCreateProject = () => {
  const project = store.createProject(newProjectName.value, newProjectDialect.value)
  showCreateModal.value = false
  newProjectName.value = ''
  router.push(`/projects/${project.id}`)
}

const handleAiGenerate = async () => {
    aiLoading.value = true
    try {
        const result = await askAI(aiPrompt.value, store.groqApiKey)
        
        // Create new project with AI result
        const project = store.createProject(`AI: ${aiPrompt.value.substring(0, 20)}...`)
        
        // Map AI result to our store structure
        result.tables.forEach(t => {
            store.addTable(project.id, t.name)
            // Access the store projects to update the newly added table
            const p = store.projects.find(proj => proj.id === project.id)
            const newTable = p.tables[p.tables.length - 1]
            newTable.columns = t.columns.map(c => ({
                ...c,
                id: uuidv4(),
                primary: c.primary || false,
                nullable: c.nullable ?? true,
                unique: c.unique ?? false,
                notes: c.notes || ''
            }))
        })
        
        showAiModal.value = false
        aiPrompt.value = ''
        router.push(`/projects/${project.id}`)
    } catch (err) {
        alert('AI Error: ' + err.message)
    } finally {
        aiLoading.value = false
    }
}

const handleExportLibrary = (projectId) => {
    const lib = store.exportProjectAsLibrary(projectId)
    if (!lib) return
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lib, null, 2));
    const link = document.createElement('a');
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `${lib.name.toLowerCase().replace(/\s+/g, '-')}-bundle.json`);
    link.click();
}
</script>
