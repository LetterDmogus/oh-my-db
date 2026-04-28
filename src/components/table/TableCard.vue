<template>
  <div 
    class="bg-white rounded-lg shadow-sm border border-gray-200 w-72 flex-shrink-0 flex flex-col h-fit overflow-visible relative transition-[width] duration-75"
    :style="{ width: (table.width || 280) + 'px' }"
  >
    <!-- Resize Handle -->
    <div 
      class="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-indigo-300 transition-colors z-10"
      @mousedown="startResize"
    ></div>

    <div 
      class="p-3 border-b border-gray-200 flex items-center gap-2 group rounded-t-lg transition-colors"
      :class="[colorClasses[table.color || 'gray'].bg]"
    >
      <div class="drag-handle cursor-grab active:cursor-grabbing text-gray-400">
        <GripVertical class="w-4 h-4" />
      </div>
      <input
        :value="tableName"
        @input="e => tableName = e.target.value"
        class="bg-transparent border-0 focus:ring-0 font-bold w-full p-0 cursor-text"
        :class="[colorClasses[table.color || 'gray'].text]"
        placeholder="Nama tabel..."
        title="Ubah nama tabel"
      />
      
      <div class="flex items-center gap-1">
        <!-- Pivot Suggestion Button -->
        <button 
            v-if="pivotSuggestion" 
            @click="handleApplyPivot"
            class="text-indigo-600 hover:bg-indigo-100 p-1 rounded-md transition-colors cursor-pointer animate-pulse" 
            :title="'Ubah jadi Pivot Table antara ' + pivotSuggestion.t1.name + ' & ' + pivotSuggestion.t2.name"
        >
            <Sparkles class="w-4 h-4" />
        </button>

        <!-- AI Suggestion Column Button -->
        <button 
            @click="handleAiSuggestColumns" 
            :disabled="aiSuggestLoading"
            class="text-amber-500 hover:bg-amber-50 p-1 rounded-md transition-colors cursor-pointer disabled:opacity-30" 
            title="AI Saran Kolom Pintar"
        >
            <Zap v-if="!aiSuggestLoading" class="w-4 h-4" />
            <Loader2 v-else class="w-4 h-4 animate-spin" />
        </button>

        <!-- Color Picker -->
        <div class="relative">
            <button @click.stop="showColorPicker = !showColorPicker" class="p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" :class="{ 'text-indigo-600': showColorPicker }" title="Ganti warna tabel">
                <Palette class="w-4 h-4" />
            </button>
            <div v-if="showColorPicker" v-click-outside="() => showColorPicker = false" class="absolute right-0 top-full mt-2 grid grid-cols-4 gap-2 p-2.5 bg-white border border-gray-200 shadow-2xl rounded-xl z-50 w-32 animate-in fade-in zoom-in-95 duration-100">
                <button v-for="(cls, color) in colorClasses" :key="color" @click="handleColorSelect(color)" class="w-5 h-5 rounded-full border border-gray-200 hover:scale-110 transition-transform shadow-sm cursor-pointer" :class="[cls.dot]" :title="color"></button>
            </div>
        </div>
        <button @click="$emit('manage-data')" class="text-gray-400 hover:text-indigo-600 p-1 cursor-pointer" title="Kelola Data">
          <TableIcon class="w-4 h-4" />
        </button>
        <button @click="$emit('remove')" class="text-gray-400 hover:text-red-600 p-1 cursor-pointer" title="Hapus Tabel">
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>
    
    <div class="relative overflow-visible min-h-[50px] bg-white/50" :class="{ 'ring-2 ring-indigo-200 ring-inset ring-offset-2': isDragOver }">
      <draggable
        :model-value="table.columns"
        @update:model-value="val => $emit('update-table', { columns: val })"
        group="columns-group"
        item-key="id"
        handle=".col-drag-handle"
        @dragover.prevent="isDragOver = true"
        @dragleave="isDragOver = false"
        @drop="isDragOver = false"
      >
        <template #item="{ element: column }">
          <ColumnRow
            :column="column"
            @update="updates => $emit('update-column', column.id, updates)"
            @remove="$emit('remove-column', column.id)"
            @toggle-pk="$emit('update-column', column.id, { primary: !column.primary })"
            @auto-detect="$emit('auto-detect', column.id)"
          />
        </template>
      </draggable>
    </div>

    <div class="flex border-t border-gray-100 divide-x divide-gray-100">
        <button @click="$emit('add-column')" class="flex-1 p-2 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 flex items-center justify-center gap-1 uppercase tracking-wider cursor-pointer">
          <Plus class="w-3 h-3" /> Tambah Kolom
        </button>
        <button @click="$emit('add-timestamps')" class="px-3 text-gray-400 hover:bg-orange-50 hover:text-orange-600 cursor-pointer" title="Tambah Laravel Timestamps">
          <Clock class="w-3.5 h-3.5" />
        </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Plus, X, GripVertical, Palette, Clock, Table as TableIcon, Sparkles, Trash2, Zap, Loader2, Key } from 'lucide-vue-next'
import draggable from 'vuedraggable'
import { v4 as uuidv4 } from 'uuid'
import ColumnRow from './ColumnRow.vue'
import BaseModal from '../ui/BaseModal.vue'
import BaseButton from '../ui/BaseButton.vue'
import { generateDummyValue } from '../../utils/typeDetector'
import { suggestColumnsAI, generateRealisticDataAI } from '../../utils/aiService'
import { useProjectStore } from '../../stores/useProjectStore'

const props = defineProps({
  table: Object
})

const emit = defineEmits(['update-table', 'remove', 'add-column', 'update-column', 'remove-column', 'auto-detect', 'add-timestamps', 'manage-data'])

const store = useProjectStore()
const showColorPicker = ref(false)
const isDragOver = ref(false)
const aiSuggestLoading = ref(false)

const tableName = computed({
  get: () => props.table.name,
  set: (val) => emit('update-table', { name: val })
})

// Logic Deteksi Pivot Table
const pivotSuggestion = computed(() => {
    const name = props.table.name.toLowerCase()
    if (!name.includes('_')) return null
    
    const parts = name.split('_')
    if (parts.length !== 2) return null
    
    const [p1, p2] = parts
    
    // Cari tabel yang cocok di project
    const findTable = (prefix) => {
        return store.activeProject.tables.find(t => {
            const tName = t.name.toLowerCase()
            return tName === prefix || tName === prefix + 's' || tName === prefix + 'es' || tName.replace(/s$/, '') === prefix
        })
    }

    const t1 = findTable(p1)
    const t2 = findTable(p2)

    if (t1 && t2 && t1.id !== t2.id) {
        return { t1, t2 }
    }
    return null
})

const handleApplyPivot = () => {
    if (!pivotSuggestion.value) return
    const { t1, t2 } = pivotSuggestion.value
    
    if (confirm(`Ubah ${props.table.name} menjadi pivot table untuk ${t1.name} dan ${t2.name}?`)) {
        store.recordHistory()
        
        // Kosongkan kolom lama (kecuali mungkin ID jika ingin tetap ada)
        // Tapi biasanya pivot Laravel gapake ID atau pake ID. Kita biarkan ID default dan tambah FK.
        
        const fk1Name = `${t1.name.replace(/s$/, '').toLowerCase()}_id`
        const fk2Name = `${t2.name.replace(/s$/, '').toLowerCase()}_id`
        
        // Tambahkan kolom FK pertama
        store.addColumn(store.activeProjectId, props.table.id, {
            name: fk1Name,
            type: t1.columns.find(c => c.primary)?.type || 'INT',
            references: { tableId: t1.id, columnId: t1.columns.find(c => c.primary)?.id },
            nullable: false
        })

        // Tambahkan kolom FK kedua
        store.addColumn(store.activeProjectId, props.table.id, {
            name: fk2Name,
            type: t2.columns.find(c => c.primary)?.type || 'INT',
            references: { tableId: t2.id, columnId: t2.columns.find(c => c.primary)?.id },
            nullable: false
        })

        // Tambahkan timestamps (opsional tapi umum di Laravel)
        store.addTimestamps(store.activeProjectId, props.table.id)
        
        alert(`Berhasil! Kolom ${fk1Name} dan ${fk2Name} telah ditambahkan.`)
    }
}

const handleAiSuggestColumns = async () => {
    if (!store.groqApiKey) return alert('Atur API Key dulu!')
    aiSuggestLoading.value = true
    try {
        const existing = props.table.columns.map(c => c.name)
        const suggestions = await suggestColumnsAI(props.table.name, existing, store.groqApiKey)
        suggestions.forEach(col => {
            store.addColumn(store.activeProjectId, props.table.id, {
                name: col.name,
                type: col.type,
                notes: col.notes
            })
        })
    } catch (err) { alert(err.message) }
    finally { aiSuggestLoading.value = false }
}

const handleAiGenerateData = async () => {
    if (!store.groqApiKey) return alert('Atur API Key dulu!')
    aiDataLoading.value = true
    try {
        const cols = props.table.columns.map(c => ({ name: c.name, type: c.type, notes: c.notes }))
        const rows = await generateRealisticDataAI(props.table.name, cols, store.groqApiKey)
        const updatedData = [...(props.table.data || []), ...rows]
        store.updateTableData(store.activeProjectId, props.table.id, updatedData)
    } catch (err) { alert(err.message) }
    finally { aiDataLoading.value = false }
}

const addRow = () => {
    const newRow = {}
    props.table.columns.forEach(c => newRow[c.name] = '')
    const updatedData = [...(props.table.data || []), newRow]
    store.updateTableData(store.activeProjectId, props.table.id, updatedData)
}

const generateRow = () => {
    const newRow = {}
    props.table.columns.forEach(c => {
        newRow[c.name] = generateDummyValue(c.type, c.name)
    })
    const updatedData = [...(props.table.data || []), newRow]
    store.updateTableData(store.activeProjectId, props.table.id, updatedData)
}

const removeRow = (idx) => {
    const updatedData = props.table.data.filter((_, i) => i !== idx)
    store.updateTableData(store.activeProjectId, props.table.id, updatedData)
}

const saveData = () => {
    store.updateTableData(store.activeProjectId, props.table.id, props.table.data)
}

const colorClasses = {
  gray: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  green: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  red: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-700', dot: 'bg-pink-500' }
}

const handleColorSelect = (color) => {
    emit('update-table', { color })
    showColorPicker.value = false
}

const isResizing = ref(false)
const startWidth = ref(0)
const startX = ref(0)
const startResize = (e) => {
  isResizing.value = true
  startWidth.value = props.table.width || 280
  startX.value = e.clientX
  window.addEventListener('mousemove', handleResize)
  window.addEventListener('mouseup', stopResize)
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'col-resize'
}
const handleResize = (e) => {
  if (!isResizing.value) return
  const delta = e.clientX - startX.value
  const newWidth = Math.max(200, Math.min(600, startWidth.value + delta))
  emit('update-table', { width: newWidth })
}
const stopResize = () => {
  isResizing.value = false
  window.removeEventListener('mousemove', handleResize)
  window.removeEventListener('mouseup', stopResize)
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
}
</script>
