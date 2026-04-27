<template>
  <div 
    class="bg-white rounded-lg shadow-sm border border-purple-200 w-52 flex flex-col h-fit overflow-visible group/enum"
  >
    <div class="p-2 border-b border-purple-100 bg-purple-50 flex items-center gap-2 drag-handle cursor-grab active:cursor-grabbing rounded-t-lg">
      <div class="text-purple-400"><Layers class="w-3.5 h-3.5" /></div>
      <input
        :value="enumName"
        @input="e => enumName = e.target.value"
        class="bg-transparent border-0 focus:ring-0 font-bold text-[11px] w-full p-0 text-purple-900 uppercase tracking-wider cursor-text"
        placeholder="Nama ENUM..."
      />
      <button @click="$emit('remove')" class="text-purple-300 hover:text-red-600 transition-colors opacity-0 group-hover/enum:opacity-100">
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <div class="p-2 space-y-1">
        <div v-for="(val, idx) in props.enum.values" :key="idx" class="flex items-center gap-1 group/val">
            <div class="w-1 h-1 rounded-full bg-purple-300"></div>
            <input 
                v-model="props.enum.values[idx]" 
                class="flex-1 bg-transparent border-0 focus:ring-0 text-[10px] p-1 text-gray-700 hover:bg-purple-50 rounded transition-colors cursor-text"
                @change="saveEnum"
            />
            <button @click="removeValue(idx)" class="text-gray-300 hover:text-red-500 opacity-0 group-hover/val:opacity-100 transition-opacity">
                <Minus class="w-3 h-3" />
            </button>
        </div>
        <button @click="addValue" class="w-full py-1 text-[9px] font-bold text-purple-600 hover:bg-purple-50 rounded flex items-center justify-center gap-1 mt-1 cursor-pointer">
            <Plus class="w-3 h-3" /> TAMBAH NILAI
        </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Layers, X, Plus, Minus } from 'lucide-vue-next'

const props = defineProps({
  enum: Object
})

const emit = defineEmits(['update', 'remove'])

const enumName = computed({
  get: () => props.enum.name,
  set: (val) => emit('update', { name: val })
})

const addValue = () => {
    const newValues = [...props.enum.values, 'new_value']
    emit('update', { values: newValues })
}

const removeValue = (idx) => {
    const newValues = props.enum.values.filter((_, i) => i !== idx)
    emit('update', { values: newValues })
}

const saveEnum = () => {
    emit('update', { values: props.enum.values })
}
</script>
