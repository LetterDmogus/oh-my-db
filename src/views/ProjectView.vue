<template>
  <div class="h-screen flex flex-col bg-gray-100 overflow-hidden font-sans text-gray-900">
    <ProjectHeader 
        :project="project" 
        v-model:searchQuery="searchQuery"
        @update-project="updates => store.updateProject(project.id, updates)"
        @trigger-import="$refs.fileInput.click()"
        @export="openExportSelector"
        @add-table="store.addTable(project.id)"
    />

    <div class="flex-1 flex overflow-hidden">
        <ProjectSidebar 
            @trigger-lib-import="$refs.libInput.click()"
            @add-set="addSetToActiveTable"
        />

        <main class="flex-1 overflow-auto p-8 relative bg-slate-50" id="canvas-area">
          <div v-if="project" class="min-h-full">
            <draggable
              :model-value="project.tables"
              @update:model-value="val => store.updateProject(project.id, { tables: val })"
              group="tables"
              item-key="id"
              class="flex flex-wrap gap-8 items-start pb-40"
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
          
          <div v-if="project && project.tables.length === 0" class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="text-center opacity-40">
                <MousePointer2 class="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p class="text-gray-400 text-sm font-medium tracking-wide">Drag kolom atau blok tabel dari kiri.</p>
            </div>
          </div>
        </main>
    </div>

    <!-- Export Selection Modal -->
    <BaseModal :show="showSelectorModal" title="Pilih Tabel" @close="showSelectorModal = false">
        <div class="space-y-2 max-h-60 overflow-y-auto pr-2 text-gray-700">
            <label v-for="t in project.tables" :key="t.id" class="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-white transition-all">
                <input type="checkbox" v-model="selectedTableIds" :value="t.id" class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer" />
                <div class="flex-1">
                    <span class="text-sm font-bold">{{ t.name }}</span>
                    <p class="text-[10px] text-gray-400">{{ t.columns.length }} Kolom, {{ t.data?.length || 0 }} Baris</p>
                </div>
                <div class="w-2 h-2 rounded-full" :class="'bg-' + (t.color || 'gray') + '-400'"></div>
            </label>
        </div>
        <div class="mt-4 flex justify-between">
            <button @click="toggleSelectAll" class="text-xs text-indigo-600 font-medium hover:underline cursor-pointer">
                {{ isAllSelected ? 'Unselect All' : 'Select All' }}
            </button>
            <p class="text-[10px] text-gray-400">{{ selectedTableIds.length }} dari {{ project?.tables?.length || 0 }} tabel terpilih</p>
        </div>
        <template #footer>
            <BaseButton @click="executeExport" :disabled="selectedTableIds.length === 0">Lanjut Export</BaseButton>
            <BaseButton variant="outline" @click="showSelectorModal = false">Batal</BaseButton>
        </template>
    </BaseModal>

    <!-- Code Display Modal Improved with Download -->
    <BaseModal :show="showExportModal" :title="exportModalTitle" @close="showExportModal = false">
      <div class="relative">
          <pre class="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-[11px] leading-relaxed whitespace-pre-wrap max-h-[60vh] border border-gray-800">{{ exportedCode }}</pre>
          <div class="absolute top-2 right-2 px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-[9px] uppercase font-bold tracking-widest">{{ exportLang }}</div>
      </div>
      <template #footer>
        <div class="flex gap-2">
            <BaseButton variant="outline" @click="handleDownloadFile" title="Download sebagai file">
                <Download class="w-4 h-4 mr-2" /> Download .{{ currentExtension }}
            </BaseButton>
            <BaseButton @click="copyExportCode">
                <Copy class="w-4 h-4 mr-2" /> Salin ke Clipboard
            </BaseButton>
        </div>
        <BaseButton variant="ghost" @click="showExportModal = false">Tutup</BaseButton>
      </template>
    </BaseModal>

    <input type="file" ref="fileInput" class="hidden" accept=".json" @change="onFileSelected" />
    <input type="file" ref="libInput" class="hidden" accept=".json" @change="onLibraryImport" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { MousePointer2, Download, Copy } from 'lucide-vue-next'
import draggable from 'vuedraggable'
import * as htmlToImage from 'html-to-image'
import { v4 as uuidv4 } from 'uuid'
import { useProjectStore } from '../stores/useProjectStore'
import { generateSQL } from '../utils/sqlGenerator'
import { generateLaravelMigration } from '../utils/laravelMigrationGenerator'
import { generateLaravelSeeder } from '../utils/laravelSeederGenerator'
import { detectType } from '../utils/typeDetector'

import ProjectHeader from '../components/layout/ProjectHeader.vue'
import ProjectSidebar from '../components/layout/ProjectSidebar.vue'
import TableCard from '../components/table/TableCard.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseModal from '../components/ui/BaseModal.vue'

const route = useRoute()
const store = useProjectStore()

const project = computed(() => store.activeProject)
const searchQuery = ref('')
const showExportModal = ref(false)
const exportedCode = ref('')
const exportModalTitle = ref('')
const exportLang = ref('')
const currentExtension = ref('')
const fileInput = ref(null)
const libInput = ref(null)

const showSelectorModal = ref(false)
const pendingExportType = ref('')
const selectedTableIds = ref([])

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

const openExportSelector = (type) => {
    if (type === 'image') return handleExportImage()
    if (type === 'json') return handleExportJson()
    if (type === 'library') return handleExportLibrary()
    
    pendingExportType.value = type
    selectedTableIds.value = project.value.tables.map(t => t.id)
    showSelectorModal.value = true
}

const isAllSelected = computed(() => selectedTableIds.value.length === (project.value?.tables?.length || 0))
const toggleSelectAll = () => {
    if (isAllSelected.value) selectedTableIds.value = []
    else selectedTableIds.value = project.value.tables.map(t => t.id)
}

const executeExport = () => {
    const type = pendingExportType.value
    if (type === 'sql') {
        exportedCode.value = generateSQL(project.value, selectedTableIds.value)
        exportModalTitle.value = 'Schema SQL'
        exportLang.value = 'SQL'
        currentExtension.value = 'sql'
    } else if (type === 'migration') {
        exportedCode.value = generateLaravelMigration(project.value, selectedTableIds.value)
        exportModalTitle.value = 'Laravel Migration'
        exportLang.value = 'PHP'
        currentExtension.value = 'php'
    } else if (type === 'seeder') {
        exportedCode.value = generateLaravelSeeder(project.value, selectedTableIds.value)
        exportModalTitle.value = 'Laravel Seeder'
        exportLang.value = 'PHP'
        currentExtension.value = 'php'
    }
    showSelectorModal.value = false
    showExportModal.value = true
}

const handleDownloadFile = () => {
    const blob = new Blob([exportedCode.value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const fileName = project.value.name.toLowerCase().replace(/\s+/g, '_')
    link.href = url
    link.download = `${fileName}_${exportModalTitle.value.toLowerCase().replace(/\s+/g, '_')}.${currentExtension.value}`
    link.click()
    URL.revokeObjectURL(url)
}

const handleExportLibrary = () => {
    const lib = store.exportProjectAsLibrary(project.value.id)
    if (!lib) return
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lib, null, 2));
    const link = document.createElement('a');
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `${lib.name.toLowerCase().replace(/\s+/g, '-')}-bundle.json`);
    link.click();
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

const onLibraryImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const libData = JSON.parse(e.target.result);
            if (store.importLibrary(libData)) {
                alert('Library berhasil di-import!');
            }
        } catch (err) { alert('Gagal import: ' + err.message); }
        event.target.value = '';
    };
    reader.readAsText(file);
}

const addSetToActiveTable = (set) => {
    if (!project.value || !project.value.tables.length) {
        alert('Buat tabel terlebih dahulu!')
        return
    }
    const firstTable = project.value.tables[0]
    set.columns.forEach(c => {
        store.addColumn(project.value.id, firstTable.id, c)
    })
}

const isTableMatch = (name) => {
    if (!searchQuery.value) return true
    return name.toLowerCase().includes(searchQuery.value.toLowerCase())
}

const saveChanges = () => {
    localStorage.setItem('projects', JSON.stringify(store.projects))
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
