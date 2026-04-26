<template>
  <div class="h-screen flex flex-col bg-gray-100">
    <header class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0 gap-4">
      <div class="flex items-center gap-4 flex-1">
        <BaseButton variant="ghost" size="sm" @click="$router.push('/dashboard')" title="Kembali ke Dashboard">
          <ArrowLeft class="w-4 h-4 mr-2" /> Kembali
        </BaseButton>
        
        <div v-if="project" class="hidden lg:flex items-center gap-2">
          <div class="group relative">
              <input 
                v-model="projectName"
                @blur="store.saveToLocalStorage"
                class="text-sm font-bold text-gray-900 bg-transparent border-0 focus:ring-1 focus:ring-indigo-500 rounded px-1 -ml-1 transition-all w-fit min-w-[100px] cursor-text"
                title="Klik untuk ubah nama proyek"
              />
              <span class="absolute left-full top-1/2 -translate-y-1/2 ml-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <Edit3 class="w-3 h-3 text-gray-400" />
              </span>
          </div>
          <div class="h-4 w-px bg-gray-300 mx-1"></div>
          <span class="text-[10px] text-gray-500 uppercase font-medium bg-gray-100 px-1.5 py-0.5 rounded" title="Dialek Database">{{ project.dialect }}</span>
        </div>

        <!-- Search Table -->
        <div class="relative flex-1 max-w-xs ml-4">
          <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari tabel..."
            class="w-full bg-gray-50 border border-gray-200 rounded-md pl-9 pr-4 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-text"
            title="Cari tabel berdasarkan nama"
          />
        </div>

        <!-- Undo / Redo -->
        <div class="flex items-center bg-gray-50 rounded-md p-1 border border-gray-200">
          <button 
            @click="store.undo()" 
            :disabled="store.history.length === 0"
            class="p-1.5 rounded hover:bg-white disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
            title="Undo / Batalkan perubahan (Ctrl+Z)"
          >
            <Undo class="w-4 h-4 text-gray-600" />
          </button>
          <div class="w-px h-4 bg-gray-200 mx-1"></div>
          <button 
            @click="store.redo()" 
            :disabled="store.future.length === 0"
            class="p-1.5 rounded hover:bg-white disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
            title="Redo / Ulangi perubahan (Ctrl+Y)"
          >
            <Redo class="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Import Button -->
        <BaseButton variant="outline" size="sm" @click="$refs.fileInput.click()" title="Import skema dari file JSON">
          <Upload class="w-4 h-4 mr-2" /> Import
        </BaseButton>

        <!-- Grouped Export Dropdown Improved -->
        <div class="relative">
            <BaseButton size="sm" @click.stop="showExportMenu = !showExportMenu" title="Menu Export (Gambar, SQL, Laravel, JSON)">
                <Download class="w-4 h-4 mr-2" /> Export
                <ChevronDown class="w-3 h-3 ml-2 transition-transform" :class="{ 'rotate-180': showExportMenu }" />
            </BaseButton>
            
            <div 
                v-if="showExportMenu" 
                v-click-outside="() => showExportMenu = false"
                class="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 shadow-2xl rounded-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-100 overflow-hidden"
            >
                <button @click="handleExportAction(handleExportImage)" class="w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 flex items-center gap-3 transition-colors cursor-pointer group/item">
                    <ImageIcon class="w-4 h-4 text-indigo-500" />
                    <span class="font-medium">Simpan Gambar (PNG)</span>
                </button>
                <div class="h-px bg-gray-100 mx-4 my-1"></div>
                <button @click="handleExportAction(handleExportSql)" class="w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 flex items-center gap-3 transition-colors cursor-pointer group/item">
                    <FileCode class="w-4 h-4 text-blue-500" />
                    <span class="font-medium">Schema SQL (.sql)</span>
                </button>
                <button @click="handleExportAction(handleExportMigration)" class="w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 flex items-center gap-3 transition-colors cursor-pointer group/item">
                    <Code2 class="w-4 h-4 text-orange-500" />
                    <span class="font-medium">Laravel Migration (PHP)</span>
                </button>
                <button @click="handleExportAction(handleExportSeeder)" class="w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 flex items-center gap-3 transition-colors cursor-pointer group/item">
                    <Sparkles class="w-4 h-4 text-amber-500" />
                    <span class="font-medium">Laravel Seeder (PHP)</span>
                </button>
                <div class="h-px bg-gray-100 mx-4 my-1"></div>
                <button @click="handleExportAction(handleExportJson)" class="w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 flex items-center gap-3 transition-colors cursor-pointer group/item">
                    <Braces class="w-4 h-4 text-gray-500" />
                    <span class="font-medium">JSON Schema (.json)</span>
                </button>
            </div>
        </div>

        <div class="h-6 w-px bg-gray-200 mx-1"></div>
        <BaseButton size="sm" @click="handleAddTable" title="Tambahkan tabel baru ke dalam proyek">
          <Plus class="w-4 h-4 mr-2" /> Tambah Tabel
        </BaseButton>
      </div>

      <input type="file" ref="fileInput" class="hidden" accept=".json" @change="onFileSelected" />
    </header>

    <main class="flex-1 overflow-auto p-8 relative min-h-0 bg-slate-50" id="canvas-area">
      <div v-if="project">
        <draggable
          :model-value="project.tables"
          @update:model-value="val => project.tables = val"
          item-key="id"
          class="flex flex-wrap gap-8 items-start"
          handle=".drag-handle"
          @start="store.recordHistory()"
          @end="saveChanges"
        >
          <template #item="{ element: table }">
            <TableCard
              v-show="isTableMatch(table.name)"
              :table="table"
              @update-table="updates => store.updateTable(project.id, table.id, updates)"
              @remove="store.removeTable(project.id, table.id)"
              @add-column="store.addColumn(project.id, table.id)"
              @add-timestamps="store.addTimestamps(project.id, table.id)"
              @update-column="(colId, updates) => store.updateColumn(project.id, table.id, colId, updates)"
              @remove-column="colId => store.removeColumn(project.id, table.id, colId)"
              @auto-detect="colId => handleAutoDetect(table.id, colId)"
            />
          </template>
        </draggable>
      </div>

      <div v-if="project && project.tables.length === 0" class="absolute inset-0 flex items-center justify-center">
        <div class="text-center">
            <LayoutIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p class="text-gray-400">Belum ada tabel di proyek ini.</p>
            <BaseButton variant="ghost" class="mt-4" @click="handleAddTable" title="Klik untuk membuat tabel pertama">Buat tabel pertama kamu</BaseButton>
        </div>
      </div>
    </main>

    <BaseModal :show="showExportModal" :title="exportModalTitle" @close="showExportModal = false">
      <div class="relative">
          <pre class="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-[11px] leading-relaxed whitespace-pre-wrap max-h-[60vh] border border-gray-800">{{ exportedCode }}</pre>
          <div class="absolute top-2 right-2 flex gap-2">
            <div class="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-[9px] uppercase font-bold">{{ exportLang }}</div>
          </div>
      </div>
      <template #footer>
        <BaseButton @click="copyExportCode" title="Salin kode di atas ke clipboard">Salin ke Clipboard</BaseButton>
        <BaseButton variant="outline" @click="showExportModal = false" title="Tutup jendela modal">Tutup</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Plus, Download, FileCode, Layout as LayoutIcon, Upload, Search, Undo, Redo, Image as ImageIcon, Edit3, ChevronDown, Braces, Code2, Sparkles } from 'lucide-vue-next'
import draggable from 'vuedraggable'
import * as htmlToImage from 'html-to-image'
import { useProjectStore } from '../stores/useProjectStore'
import { generateSQL } from '../utils/sqlGenerator'
import { generateLaravelMigration } from '../utils/laravelMigrationGenerator'
import { generateLaravelSeeder } from '../utils/laravelSeederGenerator'
import { detectType } from '../utils/typeDetector'
import TableCard from '../components/table/TableCard.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseModal from '../components/ui/BaseModal.vue'

const route = useRoute()
const store = useProjectStore()

const project = computed(() => store.activeProject)
const showExportMenu = ref(false)

const projectName = computed({
    get: () => project.value?.name || '',
    set: (val) => store.updateProject(project.value.id, { name: val })
})

const showExportModal = ref(false)
const exportedCode = ref('')
const exportModalTitle = ref('')
const exportLang = ref('')
const fileInput = ref(null)
const searchQuery = ref('')

// Simple Click Outside Directive
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener("click", el.clickOutsideEvent);
  },
};

onMounted(() => {
  store.activeProjectId = route.params.id
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') { e.preventDefault(); store.undo(); }
    if (e.ctrlKey && e.key === 'y') { e.preventDefault(); store.redo(); }
  })
})

watch(() => route.params.id, (newId) => {
  store.activeProjectId = newId
})

const isTableMatch = (name) => {
    if (!searchQuery.value) return true
    return name.toLowerCase().includes(searchQuery.value.toLowerCase())
}

const saveChanges = () => {
    localStorage.setItem('projects', JSON.stringify(store.projects))
}

const handleAddTable = () => {
  store.addTable(project.value.id)
}

const handleExportAction = (actionFn) => {
    actionFn()
    showExportMenu.value = false
}

const handleExportImage = () => {
    const node = document.getElementById('canvas-area');
    htmlToImage.toPng(node, { backgroundColor: '#f8fafc' })
        .then((dataUrl) => {
            const link = document.createElement('a');
            link.download = `${project.value.name}-schema.png`;
            link.href = dataUrl;
            link.click();
        });
}

const handleExportSql = () => {
  exportedCode.value = generateSQL(project.value)
  exportModalTitle.value = 'Schema SQL'
  exportLang.value = 'SQL'
  showExportModal.value = true
}

const handleExportMigration = () => {
    exportedCode.value = generateLaravelMigration(project.value)
    exportModalTitle.value = 'Laravel Migration'
    exportLang.value = 'PHP'
    showExportModal.value = true
}

const handleExportSeeder = () => {
    exportedCode.value = generateLaravelSeeder(project.value)
    exportModalTitle.value = 'Laravel Seeder'
    exportLang.value = 'PHP'
    showExportModal.value = true
}

const handleExportJson = () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project.value, null, 2));
  const link = document.createElement('a');
  link.setAttribute("href", dataStr);
  link.setAttribute("download", `${project.value.name.toLowerCase().replace(/\s+/g, '-')}-schema.json`);
  link.click();
}

const onFileSelected = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target.result);
      if (!importedData.tables || !Array.isArray(importedData.tables)) return;
      if (confirm('Import JSON akan menimpa semua tabel yang ada saat ini. Lanjutkan?')) {
          store.recordHistory()
          project.value.tables = importedData.tables;
          saveChanges();
      }
    } catch (err) { alert('Gagal: ' + err.message); }
    event.target.value = '';
  };
  reader.readAsText(file);
}

const copyExportCode = () => {
  navigator.clipboard.writeText(exportedCode.value)
  alert('Kode berhasil disalin!')
}

const handleAutoDetect = (tableId, colId) => {
    const table = project.value.tables.find(t => t.id === tableId)
    const col = table.columns.find(c => c.id === colId)
    const suggested = detectType(col.name)
    store.updateColumn(project.value.id, tableId, colId, suggested)
}
</script>
