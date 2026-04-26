<template>
  <div 
    class="bg-white rounded-lg shadow-sm border border-gray-200 flex-shrink-0 flex flex-col h-fit overflow-visible relative transition-[width] duration-75"
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
        <!-- Color Picker -->
        <div class="relative">
            <button 
                @click.stop="showColorPicker = !showColorPicker" 
                class="p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" 
                :class="{ 'text-indigo-600': showColorPicker }" 
                title="Ganti warna tabel"
            >
                <Palette class="w-4 h-4" />
            </button>
            <div 
                v-if="showColorPicker" 
                v-click-outside="() => showColorPicker = false" 
                class="absolute right-0 top-full mt-2 grid grid-cols-4 gap-2 p-2.5 bg-white border border-gray-200 shadow-2xl rounded-xl z-50 w-32 animate-in fade-in zoom-in-95 duration-100"
            >
                <button 
                    v-for="(cls, color) in colorClasses" 
                    :key="color" 
                    @click="handleColorSelect(color)" 
                    class="w-5 h-5 rounded-full border border-gray-200 hover:scale-110 transition-transform shadow-sm cursor-pointer" 
                    :class="[cls.dot]" 
                    :title="color"
                ></button>
            </div>
        </div>

        <button @click="showDataManager = true" class="text-gray-400 hover:text-indigo-600 p-1 cursor-pointer transition-colors" title="Kelola Data (Insert/Seeder)">
          <TableIcon class="w-4 h-4" />
        </button>

        <button @click="showPreview = !showPreview" class="text-gray-400 hover:text-indigo-600 p-1 cursor-pointer transition-colors" title="Intip Data (Live Preview)">
          <Eye class="w-4 h-4" />
        </button>
        <button @click="$emit('remove')" class="text-gray-400 hover:text-red-600 p-1 cursor-pointer transition-colors" title="Hapus Tabel">
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>
    
    <div v-if="showPreview" class="bg-slate-900 text-white p-3 text-[10px] font-mono animate-in fade-in slide-in-from-top-1">
        <p class="text-indigo-300 mb-1 font-bold uppercase tracking-wider">// Contoh Data:</p>
        <div v-for="col in table.columns" :key="col.id" class="flex justify-between border-b border-slate-800 py-1 last:border-0">
            <span class="text-slate-400">{{ col.name }}:</span>
            <span class="text-white">{{ generateDummyValue(col.type, col.name) }}</span>
        </div>
    </div>

    <div class="relative overflow-visible">
      <draggable
        :model-value="table.columns"
        @update:model-value="val => $emit('update-table', { columns: val })"
        item-key="id"
        handle=".col-drag-handle"
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
        <button
          @click="$emit('add-column')"
          class="flex-1 p-2 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 flex items-center justify-center gap-1 transition-colors rounded-bl-lg uppercase tracking-wider cursor-pointer"
          title="Tambah kolom baru"
        >
          <Plus class="w-3 h-3" /> Tambah Kolom
        </button>
        <button
          @click="$emit('add-timestamps')"
          class="px-3 text-gray-400 hover:bg-orange-50 hover:text-orange-600 transition-colors rounded-br-lg cursor-pointer"
          title="Tambah Laravel Timestamps"
        >
          <Clock class="w-3.5 h-3.5" />
        </button>
    </div>

    <!-- Data Manager Modal Improved -->
    <BaseModal :show="showDataManager" :title="'Kelola Data: ' + table.name" @close="showDataManager = false">
        <div class="overflow-x-auto border border-gray-100 rounded-lg">
            <table class="w-full text-xs text-left border-collapse">
                <thead class="bg-gray-50 text-gray-500 uppercase font-bold tracking-wider">
                    <tr>
                        <th v-for="col in table.columns" :key="col.id" class="p-3 border-b border-gray-200">{{ col.name }}</th>
                        <th class="p-3 border-b border-gray-200 w-10"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, idx) in table.data" :key="idx" class="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                        <td v-for="col in table.columns" :key="col.id" class="p-2">
                            <input 
                                v-model="row[col.name]" 
                                class="w-full p-2 border border-transparent hover:border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded bg-white transition-all text-gray-700 cursor-text"
                                @change="saveData"
                                placeholder="..."
                            />
                        </td>
                        <td class="p-2 text-center">
                            <button @click="removeRow(idx)" class="text-gray-300 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-all cursor-pointer" title="Hapus baris ini">
                                <Trash2 class="w-3.5 h-3.5" />
                            </button>
                        </td>
                    </tr>
                    <tr v-if="!table.data || table.data.length === 0">
                        <td :colspan="table.columns.length + 1" class="p-8 text-center text-gray-400 italic">
                            Belum ada data. Tambah baris baru untuk memulai.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="mt-6 flex justify-between items-center gap-3">
            <BaseButton variant="outline" size="sm" @click="generateRow" class="flex-1 cursor-pointer" title="Generate data dummy otomatis berdasarkan tipe data">
                <Sparkles class="w-3.5 h-3.5 mr-2 text-amber-500" /> Generate Dummy
            </BaseButton>
            <BaseButton size="sm" @click="addRow" class="flex-1 cursor-pointer" title="Tambah baris kosong baru">
                <Plus class="w-3.5 h-3.5 mr-2" /> Tambah Baris
            </BaseButton>
        </div>
        <template #footer>
            <BaseButton @click="showDataManager = false" class="cursor-pointer" title="Selesai dan simpan perubahan">Tutup</BaseButton>
        </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Plus, X, GripVertical, Eye, Palette, Clock, Table as TableIcon, Sparkles, Trash2 } from 'lucide-vue-next'
import draggable from 'vuedraggable'
import ColumnRow from './ColumnRow.vue'
import BaseModal from '../ui/BaseModal.vue'
import BaseButton from '../ui/BaseButton.vue'
import { generateDummyValue } from '../../utils/typeDetector'
import { useProjectStore } from '../../stores/useProjectStore'

const props = defineProps({
  table: Object
})

const emit = defineEmits(['update-table', 'remove', 'add-column', 'update-column', 'remove-column', 'auto-detect', 'add-timestamps'])

const store = useProjectStore()
const showPreview = ref(false)
const showColorPicker = ref(false)
const showDataManager = ref(false)

const tableName = computed({
  get: () => props.table.name,
  set: (val) => emit('update-table', { name: val })
})

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

// Resize Logic
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
