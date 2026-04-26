<template>
  <div class="flex flex-col border-b border-gray-100 last:border-0 relative group/row">
    <div class="flex items-center gap-2 p-2 hover:bg-gray-50 group">
        <!-- Drag Handle -->
        <div class="col-drag-handle cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 shrink-0">
          <GripVertical class="w-4 h-4" />
        </div>
        
        <!-- Column Name Input -->
        <div class="flex-1 min-w-0">
          <input
            v-model="name"
            @blur="handleNameBlur"
            class="w-full bg-transparent border-0 focus:ring-0 text-sm font-medium p-1 cursor-text"
            placeholder="Nama kolom..."
          />
        </div>
        
        <!-- Type Selector Improved -->
        <div class="w-24 relative group/type shrink-0">
            <select 
              v-model="type" 
              class="w-full bg-gray-100 border border-gray-200 rounded px-2 py-1 text-[9px] text-gray-700 uppercase focus:ring-1 focus:ring-indigo-500 cursor-pointer hover:bg-gray-200 transition-colors"
            >
                <option v-for="t in commonTypes" :key="t" :value="t">{{ t }}</option>
            </select>
            
            <div class="absolute bottom-full left-0 mb-2 hidden group-hover/type:block w-48 p-2 bg-gray-800 text-white text-[10px] rounded-lg shadow-2xl z-[9999] pointer-events-none">
              <p class="text-gray-200">{{ typeTooltips[type] || 'Tipe data kolom.' }}</p>
              <div class="absolute top-full left-4 border-4 border-transparent border-t-gray-800"></div>
            </div>
        </div>

        <!-- Essential Actions -->
        <div class="flex items-center gap-0.5 shrink-0 ml-1">
          <button 
            @click="$emit('toggle-pk')" 
            class="p-1 rounded hover:bg-yellow-50 transition-colors cursor-pointer" 
            :class="column.primary ? 'text-yellow-600 bg-yellow-50 border border-yellow-200' : 'text-gray-300 hover:text-yellow-600'"
            title="Primary Key (Kunci Utama)"
          >
            <Key class="w-3.5 h-3.5" />
          </button>
          
          <button 
            @click="isExpanded = !isExpanded" 
            class="p-1 rounded hover:bg-indigo-50 transition-colors cursor-pointer"
            :class="isExpanded ? 'text-indigo-600 bg-indigo-50 border border-indigo-200' : 'text-gray-300'"
            title="Pengaturan Lanjutan"
          >
            <Settings2 class="w-3.5 h-3.5" />
          </button>

          <button 
            @click="$emit('remove')" 
            class="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-600 transition-colors cursor-pointer"
            title="Hapus Kolom"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
    </div>

    <!-- Expanded Options Wrapper -->
    <div v-if="isExpanded" class="px-8 pb-3 pt-1 bg-indigo-50/30 space-y-3 animate-in slide-in-from-top-1 duration-150">
        <div class="flex items-center gap-4">
            <button 
                @click="$emit('update', { unique: !column.unique })" 
                class="flex items-center gap-1.5 text-[10px] font-bold transition-colors cursor-pointer"
                :class="column.unique ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'"
                title="Unique"
            >
                <Fingerprint class="w-3 h-3" />
                UNIQUE
            </button>

            <button 
                @click="$emit('update', { nullable: !column.nullable })" 
                class="flex items-center gap-1.5 text-[10px] font-bold transition-colors cursor-pointer"
                :class="!column.nullable ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'"
                title="Not Null"
            >
                <AlertCircle class="w-3 h-3" />
                NOT NULL
            </button>

            <button 
                @click="showRelationPicker = !showRelationPicker" 
                class="flex items-center gap-1.5 text-[10px] font-bold transition-colors cursor-pointer"
                :class="column.references ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'"
                title="Relasi"
            >
                <LinkIcon class="w-3 h-3" />
                RELASI
            </button>
        </div>

        <div class="flex items-start gap-2">
            <MessageSquare class="w-3 h-3 text-gray-400 mt-1 shrink-0" />
            <textarea 
                v-model="notes"
                rows="1"
                class="w-full text-[10px] text-gray-600 bg-white border border-gray-200 rounded p-1.5 focus:ring-1 focus:ring-indigo-500 placeholder:italic cursor-text"
                placeholder="Tambah catatan..."
            ></textarea>
        </div>
    </div>

    <div v-if="showRelationPicker" class="absolute top-10 right-4 w-52 bg-white border border-gray-200 shadow-2xl rounded-xl z-[10000] p-4 text-[11px] animate-in fade-in zoom-in-95 duration-100">
        <div class="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
            <p class="font-bold text-gray-800">Atur Relasi</p>
            <button @click="showRelationPicker = false" class="cursor-pointer"><X class="w-3 h-3 text-gray-400" /></button>
        </div>
        <div v-if="column.references" class="mb-4 p-2 bg-indigo-50 border border-indigo-100 rounded text-indigo-700">
            Terhubung ke: <span class="font-bold">{{ getTargetTableName(column.references.tableId) }}</span>
            <button @click="handleRemoveRelation" class="block mt-1 text-red-600 hover:underline cursor-pointer">Hapus Relasi</button>
        </div>
        <div v-else>
            <p class="text-gray-500 mb-2">Tabel tujuan:</p>
            <div class="space-y-1 max-h-32 overflow-y-auto">
                <button 
                    v-for="t in validTablesForRelation" 
                    :key="t.id"
                    @click="handleRelationChange(t.id)"
                    class="w-full text-left p-2 rounded hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center justify-between cursor-pointer"
                >
                    {{ t.name }}
                    <ChevronRight class="w-3 h-3" />
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Key, Trash2, GripVertical, Link as LinkIcon, X, ChevronRight, MessageSquare, Fingerprint, AlertCircle, Settings2 } from 'lucide-vue-next'
import { useProjectStore } from '../../stores/useProjectStore'

const props = defineProps({
  column: Object
})

const emit = defineEmits(['update', 'remove', 'toggle-pk', 'auto-detect'])

const store = useProjectStore()
const showRelationPicker = ref(false)
const isExpanded = ref(false)

const name = computed({
  get: () => props.column.name,
  set: (val) => emit('update', { name: val })
})

const type = computed({
  get: () => props.column.type,
  set: (val) => emit('update', { type: val })
})

const notes = computed({
  get: () => props.column.notes || '',
  set: (val) => emit('update', { notes: val })
})

const validTablesForRelation = computed(() => {
    return store.activeProject.tables.filter(t => {
        const isNotSelf = !t.columns.find(c => c.id === props.column.id)
        const hasPk = t.columns.some(c => c.primary)
        return isNotSelf && hasPk
    })
})

const getTargetTableName = (id) => {
    return store.activeProject.tables.find(t => t.id === id)?.name || 'Unknown'
}

const handleRelationChange = (tableId) => {
    const targetTable = store.activeProject.tables.find(t => t.id === tableId)
    const targetPk = targetTable.columns.find(c => c.primary)
    emit('update', { 
        references: { tableId, columnId: targetPk.id },
        type: targetPk.type 
    })
    showRelationPicker.value = false
}

const handleRemoveRelation = () => {
    emit('update', { references: null })
    showRelationPicker.value = false
}

const handleNameBlur = () => {
    if (name.value && props.column.type === 'VARCHAR(255)' && name.value !== 'id') {
        emit('auto-detect')
    }
}

const commonTypes = [
  'INT', 'BIGINT', 'VARCHAR(255)', 'TEXT', 'BOOLEAN', 'DATE', 'DATETIME', 'TIMESTAMP', 'DECIMAL(10,2)', 'JSON'
]

const typeTooltips = {
  'INT': 'Angka bulat standar.',
  'BIGINT': 'Angka bulat sangat besar.',
  'VARCHAR(255)': 'Teks pendek (Maks 255).',
  'TEXT': 'Teks sangat panjang.',
  'BOOLEAN': 'Status benar/salah.',
  'DATE': 'Data tanggal saja.',
  'DATETIME': 'Tanggal dan waktu.',
  'TIMESTAMP': 'Waktu otomatis sistem.',
  'DECIMAL(10,2)': 'Angka pecahan (Uang).',
  'JSON': 'Format objek kompleks.'
}
</script>
