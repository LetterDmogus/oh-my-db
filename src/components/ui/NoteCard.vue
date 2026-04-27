<template>
  <div 
    class="rounded-lg shadow-md border-t-4 p-3 flex flex-col transition-all cursor-default overflow-hidden group/note"
    :class="[colorClasses[note.color || 'yellow'].bg, colorClasses[note.color || 'yellow'].border]"
    :style="{ 
      width: (note.width || 200) + 'px', 
      height: (note.height || 150) + 'px'
    }"
  >
    <!-- Header / Drag Handle -->
    <div class="flex items-center justify-between mb-2 select-none drag-handle cursor-grab active:cursor-grabbing">
      <div class="flex gap-1">
        <button v-for="(cls, color) in colorClasses" :key="color" 
          @click.stop="$emit('update', { color })"
          class="w-2.5 h-2.5 rounded-full border border-black/5 hover:scale-125 transition-transform"
          :class="[cls.dot]"
        ></button>
      </div>
      <button @click.stop="$emit('remove')" class="text-black/20 hover:text-red-600 transition-colors opacity-0 group-hover/note:opacity-100">
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Content -->
    <textarea
      :value="note.content"
      @input="e => $emit('update', { content: e.target.value })"
      class="flex-1 bg-transparent border-0 focus:ring-0 text-xs text-gray-800 placeholder:text-black/10 resize-none font-medium leading-relaxed p-0"
      placeholder="Tulis catatan..."
    ></textarea>

    <!-- Resize Handle (Bottom Right) -->
    <div 
      class="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize opacity-0 group-hover/note:opacity-100 transition-opacity"
      @mousedown.stop.prevent="startResize"
    >
      <svg viewBox="0 0 10 10" class="w-full h-full text-black/20"><path d="M10 0 L10 10 L0 10 Z" fill="currentColor"/></svg>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  note: Object
})

const emit = defineEmits(['update', 'remove'])

const colorClasses = {
  yellow: { bg: 'bg-yellow-100', border: 'border-yellow-400', dot: 'bg-yellow-400' },
  blue: { bg: 'bg-blue-100', border: 'border-blue-400', dot: 'bg-blue-400' },
  green: { bg: 'bg-green-100', border: 'border-green-400', dot: 'bg-green-400' },
  pink: { bg: 'bg-pink-100', border: 'border-pink-400', dot: 'bg-pink-400' },
  purple: { bg: 'bg-purple-100', border: 'border-purple-400', dot: 'bg-purple-400' }
}

const isResizing = ref(false)
const startSize = ref({ w: 0, h: 0 })
const startPos = ref({ x: 0, y: 0 })

const startResize = (e) => {
  isResizing.value = true
  startSize.value = { w: props.note.width || 200, h: props.note.height || 150 }
  startPos.value = { x: e.clientX, y: e.clientY }
  window.addEventListener('mousemove', handleResize)
  window.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'nwse-resize'
}

const handleResize = (e) => {
  if (!isResizing.value) return
  const deltaX = e.clientX - startPos.value.x
  const deltaY = e.clientY - startPos.value.y
  emit('update', { 
    width: Math.max(100, startSize.value.w + deltaX),
    height: Math.max(80, startSize.value.h + deltaY)
  })
}

const stopResize = () => {
  isResizing.value = false
  window.removeEventListener('mousemove', handleResize)
  window.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
}
</script>
