<template>
  <div class="h-screen flex flex-col bg-gray-100 overflow-hidden font-sans text-gray-900">
    <ProjectHeader 
        :project="project" 
        v-model:searchQuery="searchQuery"
        @update-project="updates => store.updateProject(project.id, updates)"
        @trigger-import="$refs.fileInput.click()"
        @export="openExportSelector"
        @add-table="store.addTable(project.id)"
        @add-note="store.addNote(project.id)"
        @add-enum="store.addEnum(project.id)"
    />

    <div class="flex-1 flex overflow-hidden">
        <ProjectSidebar 
            @trigger-lib-import="$refs.libInput.click()"
            @add-set="addSetToActiveTable"
        />

        <main class="flex-1 overflow-auto p-8 relative bg-slate-50 select-none" id="canvas-area" @mousemove="handleGlobalMouseMove" @mouseup="handleGlobalMouseUp">
          <div v-if="project" class="relative w-[5000px] h-[5000px] origin-top-left" :style="{ transform: `scale(${zoomLevel})` }">
            <!-- SVG Layer for Relations -->
            <svg class="absolute inset-0 pointer-events-none w-full h-full">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
                </marker>
              </defs>
              <g v-for="line in relationLines" :key="line.id">
                <path 
                  :d="line.path" 
                  fill="none" 
                  :stroke="line.color" 
                  stroke-width="2" 
                  stroke-dasharray="4"
                  marker-end="url(#arrow)"
                  class="transition-all duration-75"
                />
                <!-- Ujung Titik (Connector Dots) -->
                <circle :cx="line.x1" :cy="line.y1" r="3" :fill="line.color" />
                <circle :cx="line.x2" :cy="line.y2" r="3" :fill="line.color" />
              </g>
            </svg>

            <!-- Notes Layer -->
            <NoteCard
              v-for="note in project.notes"
              :key="note.id"
              :note="note"
              :style="{
                position: 'absolute',
                left: (note.position?.x || 0) + 'px',
                top: (note.position?.y || 0) + 'px',
                zIndex: draggingNoteId === note.id ? 50 : 20
              }"
              @mousedown.stop="e => startDraggingNote(e, note)"
              @update="updates => store.updateNote(project.id, note.id, updates)"
              @remove="store.removeNote(project.id, note.id)"
            />

            <!-- Enums Layer -->
            <EnumCard
              v-for="en in project.enums"
              :key="en.id"
              :enum="en"
              :style="{
                position: 'absolute',
                left: (en.position?.x || 0) + 'px',
                top: (en.position?.y || 0) + 'px',
                zIndex: draggingEnumId === en.id ? 50 : 15
              }"
              @mousedown.stop="e => startDraggingEnum(e, en)"
              @update="updates => store.updateEnum(project.id, en.id, updates)"
              @remove="store.removeEnum(project.id, en.id)"
            />

            <!-- Tables Layer -->
            <TableCard
              v-for="table in project.tables"
              :key="table.id"
              v-show="isTableMatch(table.name)"
              :table="table"
              :style="{ 
                position: 'absolute', 
                left: (table.position?.x || 0) + 'px', 
                top: (table.position?.y || 0) + 'px',
                zIndex: draggingTableId === table.id ? 50 : 10
              }"
              @mousedown.stop="e => startDraggingTable(e, table)"
              @update-table="updates => store.updateTable(project.id, table.id, updates)"
              @remove="store.removeTable(project.id, table.id)"
              @add-column="store.addColumn(project.id, table.id)"
              @add-timestamps="store.addTimestamps(project.id, table.id)"
              @update-column="(colId, updates) => store.updateColumn(project.id, table.id, colId, updates)"
              @remove-column="colId => store.removeColumn(project.id, table.id, colId)"
              @auto-detect="colId => handleAutoDetect(table.id, colId)"
            />
          </div>
          
          <!-- Zoom Controls Floating -->
          <div class="absolute bottom-6 right-6 flex flex-col gap-2 z-[60]">
              <div class="bg-white border border-gray-200 shadow-xl rounded-xl p-1 flex flex-col items-center">
                  <button @click="setZoom(zoomLevel + 0.1)" class="p-2 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer" title="Zoom In">
                      <Plus class="w-5 h-5" />
                  </button>
                  <div class="h-px w-6 bg-gray-100 my-1"></div>
                  <button @click="setZoom(1)" class="text-[10px] font-bold text-gray-400 py-1 hover:text-indigo-600 cursor-pointer">
                      {{ Math.round(zoomLevel * 100) }}%
                  </button>
                  <div class="h-px w-6 bg-gray-100 my-1"></div>
                  <button @click="setZoom(zoomLevel - 0.1)" class="p-2 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer" title="Zoom Out">
                      <Minus class="w-5 h-5" />
                  </button>
              </div>
          </div>
          
          <div v-if="project && project.tables.length === 0" class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="text-center opacity-40">
                <MousePointer2 class="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p class="text-gray-400 text-sm font-medium tracking-wide">Pilih "Tambah Tabel" di header.</p>
            </div>
          </div>
        </main>
    </div>

    <!-- Table Selection Modal for Bundles -->
    <BaseModal :show="showBundleModal" :title="'Pilih Tabel untuk ' + pendingSet?.name" @close="showBundleModal = false">
        <div class="space-y-2 max-h-60 overflow-y-auto pr-2 text-gray-700">
            <label v-for="t in project?.tables" :key="t.id" class="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-white transition-all">
                <input type="radio" v-model="selectedBundleTableId" :value="t.id" name="bundleTable" class="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                <div class="flex-1">
                    <span class="text-sm font-bold">{{ t.name }}</span>
                    <p class="text-[10px] text-gray-400">{{ t.columns.length }} Kolom</p>
                </div>
                <div class="w-2 h-2 rounded-full" :class="'bg-' + (t.color || 'gray') + '-400'"></div>
            </label>
        </div>
        <template #footer>
            <BaseButton @click="confirmAddBundle" :disabled="!selectedBundleTableId">Tambahkan ke Tabel</BaseButton>
            <BaseButton variant="outline" @click="showBundleModal = false">Batal</BaseButton>
        </template>
    </BaseModal>

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
import { MousePointer2, Download, Copy, Plus, Minus } from 'lucide-vue-next'
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
import NoteCard from '../components/ui/NoteCard.vue'
import EnumCard from '../components/ui/EnumCard.vue'
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

// Zoom State
const zoomLevel = ref(1)
const setZoom = (val) => {
    zoomLevel.value = Math.max(0.2, Math.min(2, val))
}

// Bundle selection state
const showBundleModal = ref(false)
const selectedBundleTableId = ref(null)
const pendingSet = ref(null)

// Dragging State
const draggingTableId = ref(null)
const draggingNoteId = ref(null)
const draggingEnumId = ref(null)
const dragOffset = ref({ x: 0, y: 0 })

const startDraggingTable = (e, table) => {
  // Hanya drag jika klik di header (yang punya class drag-handle)
  if (!e.target.closest('.drag-handle')) return
  
  draggingTableId.value = table.id
  dragOffset.value = {
    x: e.clientX / zoomLevel.value - (table.position?.x || 0),
    y: e.clientY / zoomLevel.value - (table.position?.y || 0)
  }
  store.recordHistory()
}

const startDraggingNote = (e, note) => {
  if (!e.target.closest('.drag-handle')) return
  
  draggingNoteId.value = note.id
  dragOffset.value = {
    x: e.clientX / zoomLevel.value - (note.position?.x || 0),
    y: e.clientY / zoomLevel.value - (note.position?.y || 0)
  }
  store.recordHistory()
}

const startDraggingEnum = (e, en) => {
  if (!e.target.closest('.drag-handle')) return
  
  draggingEnumId.value = en.id
  dragOffset.value = {
    x: e.clientX / zoomLevel.value - (en.position?.x || 0),
    y: e.clientY / zoomLevel.value - (en.position?.y || 0)
  }
  store.recordHistory()
}

const handleGlobalMouseMove = (e) => {
  if (draggingTableId.value) {
    const x = e.clientX / zoomLevel.value - dragOffset.value.x
    const y = e.clientY / zoomLevel.value - dragOffset.value.y
    store.updateTable(project.value.id, draggingTableId.value, { position: { x, y } })
  } else if (draggingNoteId.value) {
    const x = e.clientX / zoomLevel.value - dragOffset.value.x
    const y = e.clientY / zoomLevel.value - dragOffset.value.y
    store.updateNote(project.value.id, draggingNoteId.value, { position: { x, y } })
  } else if (draggingEnumId.value) {
    const x = e.clientX / zoomLevel.value - dragOffset.value.x
    const y = e.clientY / zoomLevel.value - dragOffset.value.y
    store.updateEnum(project.value.id, draggingEnumId.value, { position: { x, y } })
  }
}

const handleGlobalMouseUp = () => {
  if (draggingTableId.value || draggingNoteId.value || draggingEnumId.value) {
    draggingTableId.value = null
    draggingNoteId.value = null
    draggingEnumId.value = null
    saveChanges()
  }
}

// Relation Lines Calculation with Precision
const relationLines = computed(() => {
    if (!project.value) return []
    const lines = []
    
    // Konstanta dimensi UI
    const HEADER_H = 48
    const COL_H = 37

    // 1. Foreign Key Relations (Indigo)
    project.value.tables.forEach(sourceTable => {
        sourceTable.columns.forEach((column, colIdx) => {
            // Relasi Tabel ke Tabel (FK)
            if (column.references && column.references.tableId) {
                const targetTable = project.value.tables.find(t => t.id === column.references.tableId)
                if (targetTable) {
                    const targetPkIdx = targetTable.columns.findIndex(c => c.primary) || 0
                    const line = calculateLinePath(sourceTable, targetTable, colIdx, targetPkIdx, '#6366f1', HEADER_H, COL_H)
                    if (line) lines.push({ ...line, id: `fk-${column.id}` })
                }
            }
            
            // 2. Relasi Tabel ke Enum (Purple)
            if (column.type && column.type.startsWith('ENUM:')) {
                const enumName = column.type.replace('ENUM:', '').toLowerCase()
                const targetEnum = project.value.enums?.find(e => e.name.toLowerCase() === enumName)
                if (targetEnum) {
                    const line = calculateLinePath(sourceTable, targetEnum, colIdx, 0, '#a855f7', HEADER_H, COL_H, true)
                    if (line) lines.push({ ...line, id: `enum-${column.id}-${targetEnum.id}` })
                }
            }
        })
    })
    return lines
})

/**
 * Helper untuk menghitung path garis antara dua blok (Table/Enum)
 */
const calculateLinePath = (source, target, sColIdx, tRowIdx, color, headerH, colH, targetIsEnum = false) => {
    const sPos = source.position || { x: 0, y: 0 }
    const tPos = target.position || { x: 0, y: 0 }
    const sWidth = source.width || 280
    const tWidth = targetIsEnum ? 208 : (target.width || 280) // Enum width is w-52 (208px)

    const sourceIsLeft = sPos.x + sWidth < tPos.x
    const sourceIsRight = sPos.x > tPos.x + tWidth

    let x1, x2
    if (sourceIsLeft) {
        x1 = sPos.x + sWidth
        x2 = tPos.x
    } else if (sourceIsRight) {
        x1 = sPos.x
        x2 = tPos.x + tWidth
    } else {
        x1 = sPos.x + sWidth
        x2 = tPos.x
    }

    const y1 = sPos.y + headerH + (sColIdx * colH) + (colH / 2)
    const y2 = tPos.y + (targetIsEnum ? 20 : headerH) + (tRowIdx * (targetIsEnum ? 25 : colH)) + 15

    const curvature = Math.abs(x2 - x1) * 0.5
    const cp1x = sourceIsLeft ? x1 + curvature : x1 - curvature
    const cp2x = sourceIsLeft ? x2 - curvature : x2 + curvature
    
    const path = `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`
    
    return { path, x1, y1, x2, y2, color }
}

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
    pendingSet.value = set
    selectedBundleTableId.value = project.value.tables[0].id // Default ke tabel pertama
    showBundleModal.value = true
}

const confirmAddBundle = () => {
    if (!pendingSet.value || !selectedBundleTableId.value) return
    
    store.recordHistory()
    pendingSet.value.columns.forEach(c => {
        store.addColumn(project.value.id, selectedBundleTableId.value, c)
    })
    
    showBundleModal.value = false
    pendingSet.value = null
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
    if (!table) return
    
    const col = table.columns.find(c => c.id === colId)
    if (!col) return

    // 1. Deteksi Tipe Data Dasar
    const suggested = detectType(col.name, project.value.dialect)
    
    // 2. Deteksi Auto Enum (Cek apakah ada blok Enum dengan nama yang sama)
    const enumMatch = project.value.enums?.find(e => {
        const eName = e.name.toLowerCase()
        const cName = col.name.toLowerCase()
        return eName === cName || eName === cName + '_type' || cName === eName + '_type'
    })

    if (enumMatch) {
        suggested.type = `ENUM:${enumMatch.name.toUpperCase()}`
    } 
    // 3. Deteksi Auto Foreign Key (Jika bukan Enum, cek potensi FK)
    else if (col.name.endsWith('_id') && col.name !== 'id') {
        const prefix = col.name.replace('_id', '').toLowerCase()
        
        // Cari tabel yang cocok (singular atau plural)
        const targetTable = project.value.tables.find(t => {
            const tName = t.name.toLowerCase()
            return tName === prefix || 
                   tName === prefix + 's' || 
                   tName === prefix + 'es' ||
                   tName.replace(/s$/, '') === prefix
        })
        
        if (targetTable) {
            const targetPk = targetTable.columns.find(c => c.primary) || targetTable.columns[0]
            
            // Set relasi otomatis
            suggested.references = { 
                tableId: targetTable.id, 
                columnId: targetPk.id 
            }
            
            // Samakan tipe data dengan PK target
            suggested.type = targetPk.type
            suggested.nullable = false
        }
    }
    
    store.updateColumn(project.value.id, tableId, colId, suggested)
}
</script>
