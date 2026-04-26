<template>
  <div class="min-h-screen bg-gray-50">
    <AppNavbar />
    
    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Proyek Kamu</h1>
          <p class="text-sm text-gray-500">Kelola dan bangun skema database kamu dengan cepat</p>
        </div>
        <BaseButton @click="showCreateModal = true" title="Buat proyek database baru">
          <Plus class="w-4 h-4 mr-2" /> Proyek Baru
        </BaseButton>
      </div>

      <div v-if="store.projects.length === 0" class="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
        <Database class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">Belum ada proyek</h3>
        <p class="mt-1 text-sm text-gray-500">Mulai dengan membuat proyek database baru.</p>
        <div class="mt-6">
          <BaseButton @click="showCreateModal = true" title="Klik untuk mulai membuat proyek">
            <Plus class="w-4 h-4 mr-2" /> Buat Proyek Baru
          </BaseButton>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="project in store.projects"
          :key="project.id"
          class="relative flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow cursor-pointer"
          @click="$router.push(`/projects/${project.id}`)"
          title="Klik untuk membuka proyek"
        >
          <div>
            <div class="flex items-center justify-between mb-4">
                <span class="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 uppercase">
                    {{ project.dialect }}
                </span>
                <button 
                  @click.stop="store.deleteProject(project.id)" 
                  class="text-gray-400 hover:text-red-600 transition-colors p-1"
                  title="Hapus Proyek"
                >
                    <Trash2 class="w-4 h-4" />
                </button>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">{{ project.name }}</h3>
            <p class="mt-1 text-sm text-gray-500">{{ project.tables.length }} Tabel</p>
          </div>
          <div class="mt-6 flex items-center text-xs text-gray-400">
            <Clock class="mr-1 h-3 w-3" />
            Dibuat pada {{ new Date(project.createdAt).toLocaleDateString() }}
          </div>
        </div>
      </div>
    </main>

    <BaseModal :show="showCreateModal" title="Buat Proyek Baru" @close="showCreateModal = false">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Nama Proyek</label>
          <input
            v-model="newProjectName"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            placeholder="Contoh: Aplikasi Sekolah"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Dialek Database</label>
          <select
            v-model="newProjectDialect"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          >
            <option value="mysql">MySQL</option>
            <option value="postgresql">PostgreSQL</option>
            <option value="sqlite">SQLite</option>
          </select>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showCreateModal = false" title="Batalkan pembuatan proyek">Batal</BaseButton>
        <BaseButton @click="handleCreateProject" :disabled="!newProjectName" title="Konfirmasi buat proyek">Buat Proyek</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Database, Clock, Trash2 } from 'lucide-vue-next'
import { useProjectStore } from '../stores/useProjectStore'
import AppNavbar from '../components/layout/AppNavbar.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseModal from '../components/ui/BaseModal.vue'

const store = useProjectStore()
const router = useRouter()

const showCreateModal = ref(false)
const newProjectName = ref('')
const newProjectDialect = ref('mysql')

const handleCreateProject = () => {
  const project = store.createProject(newProjectName.value, newProjectDialect.value)
  showCreateModal.value = false
  newProjectName.value = ''
  router.push(`/projects/${project.id}`)
}
</script>
