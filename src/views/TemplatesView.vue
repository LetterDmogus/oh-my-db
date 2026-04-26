<template>
  <div class="min-h-screen bg-gray-50">
    <AppNavbar />
    
    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Template Starter</h1>
        <p class="text-sm text-gray-500">Mulai database kamu lebih cepat dengan skema yang sudah jadi</p>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="template in templates"
          :key="template.id"
          class="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
        >
          <div class="mb-4">
            <Layout class="h-8 w-8 text-indigo-600 mb-4" />
            <h3 class="text-lg font-semibold text-gray-900">{{ template.name }}</h3>
            <p class="mt-1 text-sm text-gray-500">{{ template.description }}</p>
          </div>
          <div class="mt-auto pt-6 flex flex-col gap-2">
            <span class="text-xs text-gray-400">{{ template.tables.length }} tabel tersedia</span>
            <BaseButton @click="useTemplate(template)">Gunakan Template</BaseButton>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Layout } from 'lucide-vue-next'
import { templates } from '../data/templates'
import { useProjectStore } from '../stores/useProjectStore'
import AppNavbar from '../components/layout/AppNavbar.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import { v4 as uuidv4 } from 'uuid'

const store = useProjectStore()
const router = useRouter()

const useTemplate = (template) => {
  const newProject = store.createProject(`${template.name} Project`)
  
  template.tables.forEach(t => {
      const tableId = uuidv4()
      store.addTable(newProject.id, t.name)
      const p = store.projects.find(proj => proj.id === newProject.id)
      const newTable = p.tables[p.tables.length - 1]
      newTable.id = tableId
      newTable.columns = t.columns.map(c => ({ ...c, id: uuidv4() }))
  })
  
  router.push(`/projects/${newProject.id}`)
}
</script>
