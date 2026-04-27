<template>
  <header class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0 gap-4 z-50">
    <div class="flex items-center gap-4 flex-1">
      <BaseButton variant="ghost" size="sm" @click="$router.push('/dashboard')" title="Kembali ke Dashboard">
        <ArrowLeft class="w-4 h-4 mr-2" /> Kembali
      </BaseButton>
      
      <div v-if="project" class="hidden lg:flex items-center gap-2">
        <div class="group relative">
            <input 
              :value="project.name" 
              @input="e => $emit('update-project', { name: e.target.value })"
              @blur="store.saveToLocalStorage"
              class="text-sm font-bold text-gray-900 bg-transparent border-0 focus:ring-1 focus:ring-indigo-500 rounded px-1 -ml-1 transition-all w-fit min-w-[100px] cursor-text" 
            />
        </div>
        <div class="h-4 w-px bg-gray-300 mx-1"></div>
        <span class="text-[10px] text-gray-500 uppercase font-medium bg-gray-100 px-1.5 py-0.5 rounded">{{ project.dialect }}</span>
      </div>

      <div class="relative flex-1 max-w-xs ml-4">
        <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        <input 
          :value="searchQuery" 
          @input="e => $emit('update:searchQuery', e.target.value)"
          type="text" 
          placeholder="Cari tabel..." 
          class="w-full bg-gray-50 border border-gray-200 rounded-md pl-9 pr-4 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-text" 
        />
      </div>

      <div class="flex items-center bg-gray-50 rounded-md p-1 border border-gray-200">
        <button @click="store.undo()" :disabled="store.history.length === 0" class="p-1.5 rounded hover:bg-white disabled:opacity-30 cursor-pointer transition-all">
          <Undo class="w-4 h-4 text-gray-600" />
        </button>
        <div class="w-px h-4 bg-gray-200 mx-1"></div>
        <button @click="store.redo()" :disabled="store.future.length === 0" class="p-1.5 rounded hover:bg-white disabled:opacity-30 cursor-pointer transition-all">
          <Redo class="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <BaseButton variant="outline" size="sm" @click="$emit('trigger-import')" title="Import skema JSON">
        <Upload class="w-4 h-4 mr-2" /> Import
      </BaseButton>

      <!-- Test Schema Button -->
      <BaseButton variant="outline" size="sm" @click="$emit('test-schema')" title="Cek kesehatan skema database">
        <Activity class="w-4 h-4 mr-2 text-indigo-500" /> Test
      </BaseButton>

      <!-- Export Dropdown -->
      <div class="relative">
          <BaseButton size="sm" @click.stop="showExportMenu = !showExportMenu">
              <Download class="w-4 h-4 mr-2" /> Export
              <ChevronDown class="w-3 h-3 ml-2 transition-transform" :class="{ 'rotate-180': showExportMenu }" />
          </BaseButton>
          
          <div v-if="showExportMenu" v-click-outside="() => showExportMenu = false" class="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 shadow-2xl rounded-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-100 overflow-hidden text-gray-700">
              <button @click="handleExport('image')" class="w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 flex items-center gap-3 cursor-pointer group/item">
                  <ImageIcon class="w-4 h-4 text-indigo-500" /> <span class="font-medium">Simpan Gambar (PNG)</span>
              </button>
              <div class="h-px bg-gray-100 mx-4 my-1"></div>
              <button @click="handleExport('sql')" class="w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 flex items-center gap-3 cursor-pointer group/item">
                  <FileCode class="w-4 h-4 text-blue-500" /> <span class="font-medium">Schema SQL (.sql)</span>
              </button>
              <button @click="handleExport('migration')" class="w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 flex items-center gap-3 cursor-pointer group/item">
                  <Code2 class="w-4 h-4 text-orange-500" /> <span class="font-medium">Laravel Migration (PHP)</span>
              </button>
              <button @click="handleExport('seeder')" class="w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 flex items-center gap-3 cursor-pointer group/item">
                  <Sparkles class="w-4 h-4 text-amber-500" /> <span class="font-medium">Laravel Seeder (PHP)</span>
              </button>
              <div class="h-px bg-gray-100 mx-4 my-1"></div>
              <button @click="handleExport('ai')" class="w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 flex items-center gap-3 cursor-pointer group/item">
                  <Zap class="w-4 h-4 text-purple-500" /> <span class="font-medium">AI Context (.md)</span>
              </button>
              <div class="h-px bg-gray-100 mx-4 my-1"></div>
              <button @click="handleExport('library')" class="w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 flex items-center gap-3 cursor-pointer group/item">
                  <LibraryIcon class="w-4 h-4 text-indigo-600" /> <span class="font-medium">Library Bundle (.json)</span>
              </button>
              <button @click="handleExport('json')" class="w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 flex items-center gap-3 cursor-pointer group/item">
                  <Braces class="w-4 h-4 text-gray-500" /> <span class="font-medium">JSON Schema (.json)</span>
              </button>
          </div>
      </div>

      <div class="h-6 w-px bg-gray-200 mx-1"></div>
      
      <!-- Add Menu Dropdown -->
      <div class="relative">
          <BaseButton size="sm" @click.stop="showAddMenu = !showAddMenu">
              <Plus class="w-4 h-4 mr-2" /> Tambah
              <ChevronDown class="w-3 h-3 ml-2 transition-transform" :class="{ 'rotate-180': showAddMenu }" />
          </BaseButton>
          
          <div v-if="showAddMenu" v-click-outside="() => showAddMenu = false" class="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-2xl rounded-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-100 overflow-hidden text-gray-700">
              <button @click="$emit('add-table'); showAddMenu = false" class="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 flex items-center gap-3 cursor-pointer group/item">
                  <TableIcon class="w-4 h-4 text-gray-400" /> <span class="font-medium">Tabel Baru</span>
              </button>
              <button @click="$emit('add-enum'); showAddMenu = false" class="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 flex items-center gap-3 cursor-pointer group/item">
                  <Layers class="w-4 h-4 text-purple-400" /> <span class="font-medium">Tipe Enum</span>
              </button>
              <button @click="$emit('add-note'); showAddMenu = false" class="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 flex items-center gap-3 cursor-pointer group/item">
                  <StickyNote class="w-4 h-4 text-amber-400" /> <span class="font-medium">Catatan Tempel</span>
              </button>
          </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { 
    ArrowLeft, Download, FileCode, Upload, Search, Undo, Redo, 
    Image as ImageIcon, ChevronDown, Braces, Code2, Sparkles, Plus, Library as LibraryIcon, 
    StickyNote, Layers, Zap, Activity, Table as TableIcon
} from 'lucide-vue-next'
import { useProjectStore } from '../../stores/useProjectStore'
import BaseButton from '../ui/BaseButton.vue'

const props = defineProps({
    project: Object,
    searchQuery: String
})

const emit = defineEmits(['update-project', 'update:searchQuery', 'trigger-import', 'export', 'add-table', 'add-note', 'add-enum', 'test-schema'])

const store = useProjectStore()
const showExportMenu = ref(false)
const showAddMenu = ref(false)

const handleExport = (type) => {
    emit('export', type)
    showExportMenu.value = false
}
</script>
