<template>
  <aside class="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 z-40">
    <div class="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between font-sans">
        <h2 class="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <LibraryIcon class="w-3.5 h-3.5" /> Library
        </h2>
        <button @click="$emit('trigger-lib-import')" class="p-1 hover:bg-indigo-50 rounded-md text-indigo-600 transition-colors cursor-pointer" title="Import Library Bundle (.json)">
            <PlusSquare class="w-4 h-4" />
        </button>
    </div>
    
    <div class="flex-1 overflow-y-auto">
        <div class="p-3 space-y-6">
            <!-- Common Columns -->
            <div>
                <h3 class="text-[10px] font-bold text-gray-400 uppercase mb-3 px-1">Common Columns</h3>
                <draggable
                    :list="commonColumns"
                    :group="{ name: 'columns-group', pull: 'clone', put: false }"
                    :clone="cloneColumn"
                    item-key="name"
                    class="grid grid-cols-2 gap-2"
                >
                    <template #item="{ element: col }">
                        <div class="p-2 bg-white border border-gray-200 rounded-lg text-[10px] font-medium text-gray-700 hover:border-indigo-400 hover:text-indigo-600 transition-all cursor-grab active:cursor-grabbing text-center shadow-sm">
                            {{ col.name }}
                        </div>
                    </template>
                </draggable>
            </div>

            <!-- Column Sets -->
            <div v-if="columnSets.length > 0">
                <h3 class="text-[10px] font-bold text-gray-400 uppercase mb-3 px-1">Column Sets</h3>
                <div class="space-y-2">
                    <div 
                        v-for="set in columnSets" :key="set.name"
                        class="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl cursor-pointer hover:bg-indigo-100 transition-colors group"
                        @click="$emit('add-set', set)"
                        title="Pilih tabel untuk menambahkan set ini"
                    >
                        <div class="flex items-center justify-between mb-1">
                            <span class="text-[10px] font-bold text-indigo-700">{{ set.name }}</span>
                            <PlusCircle class="w-3 h-3 text-indigo-400 group-hover:text-indigo-600" />
                        </div>
                        <div class="flex flex-wrap gap-1">
                            <span v-for="c in set.columns" :key="c.name" class="text-[8px] bg-white/50 text-indigo-600 px-1 rounded">{{ c.name }}</span>
                        </div>
                    </div>
                </div>
            </div>

                    <!-- User Imported Libraries -->
                    <div v-for="lib in store.userLibraries" :key="lib.id" class="space-y-3 p-2 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                        <div class="flex items-center justify-between px-1">
                            <h3 class="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">{{ lib.name }}</h3>
                            <button 
                                @click="store.deleteLibrary(lib.id)" 
                                class="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all cursor-pointer"
                                title="Hapus Library ini secara permanen"
                            >
                                <X class="w-3.5 h-3.5" />
                            </button>
                        </div>
                <draggable
                    :list="lib.blocks"
                    :group="{ name: 'tables', pull: 'clone', put: false }"
                    :clone="cloneTableBlock"
                    item-key="name"
                    class="space-y-2"
                >
                    <template #item="{ element: block }">
                        <div class="p-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-white transition-all cursor-grab active:cursor-grabbing shadow-sm group/block">
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-[10px] font-bold text-gray-700">{{ block.name }}</span>
                                <div class="w-1.5 h-1.5 rounded-full" :class="'bg-' + (block.color || 'gray') + '-400'"></div>
                            </div>
                            <p class="text-[9px] text-gray-400 line-clamp-1 leading-tight">{{ block.description }}</p>
                        </div>
                    </template>
                </draggable>
            </div>
        </div>
    </div>
  </aside>
</template>

<script setup>
import { Library as LibraryIcon, PlusSquare, PlusCircle, X } from 'lucide-vue-next'
import draggable from 'vuedraggable'
import { v4 as uuidv4 } from 'uuid'
import { useProjectStore } from '../../stores/useProjectStore'
import { commonColumns, columnSets } from '../../data/blocks'

const store = useProjectStore()

defineEmits(['trigger-lib-import', 'add-set'])

const cloneColumn = (col) => {
    return {
        ...col,
        id: uuidv4(),
        primary: false,
        nullable: col.nullable ?? true,
        unique: col.unique ?? false,
        references: null
    }
}

const cloneTableBlock = (block) => {
    return {
        id: uuidv4(),
        name: block.name.toLowerCase().replace(/\s+/g, '_'),
        color: block.color || 'gray',
        width: 280,
        columns: block.columns.map(c => ({
            ...c,
            id: uuidv4(),
            primary: c.name === 'id'
        })),
        data: []
    }
}
</script>
