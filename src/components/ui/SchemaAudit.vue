<template>
  <div 
    v-if="show"
    class="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl border-l border-gray-200 z-[100] flex flex-col animate-in slide-in-from-right duration-300"
  >
    <div class="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between shrink-0">
        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck class="w-3.5 h-3.5" /> Schema Audit
        </h3>
        <button @click="$emit('close')" class="p-1 hover:bg-gray-200 rounded-md transition-colors cursor-pointer text-gray-400">
            <X class="w-4 h-4" />
        </button>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <div v-if="issues.length === 0" class="py-12 text-center">
            <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 class="w-8 h-8" />
            </div>
            <p class="text-sm font-bold text-gray-800">Skema Sempurna!</p>
            <p class="text-xs text-gray-400 mt-2 px-6">Arsitektur database Anda telah memenuhi standar industri.</p>
        </div>

        <div v-else class="space-y-3">
            <div class="flex items-center justify-between px-1">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Daftar Masalah ({{ issues.length }})</span>
                <span :class="statusBg" class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest">{{ statusLabel }}</span>
            </div>

            <div v-for="(issue, idx) in issues" :key="idx" 
                class="p-4 rounded-2xl border transition-all"
                :class="[
                    issue.type === 'error' ? 'bg-red-50 border-red-100' : 
                    issue.type === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'
                ]"
            >
                <div class="flex gap-3">
                    <AlertCircle v-if="issue.type === 'error'" class="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <AlertTriangle v-else-if="issue.type === 'warning'" class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <Info v-else class="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    
                    <div class="flex-1">
                        <p class="text-xs font-bold leading-tight" :class="issue.type === 'error' ? 'text-red-900' : issue.type === 'warning' ? 'text-amber-900' : 'text-blue-900'">
                            {{ issue.message }}
                        </p>
                        <p v-if="issue.tip" class="text-[10px] mt-2 opacity-75 italic leading-relaxed text-gray-700 bg-white/50 p-2 rounded-lg border border-black/5">
                            💡 Tip: {{ issue.tip }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="p-4 bg-gray-50 border-t border-gray-100 shrink-0">
        <BaseButton variant="outline" size="sm" class="w-full" @click="$emit('close')">Lanjutkan Desain</BaseButton>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
    X, ShieldCheck, CheckCircle2, 
    AlertCircle, AlertTriangle, Info 
} from 'lucide-vue-next'
import { auditSchema } from '../../utils/schemaAuditor'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  project: Object,
  show: Boolean
})

defineEmits(['close'])

const issues = computed(() => {
    return auditSchema(props.project)
})

const errorCount = computed(() => {
    return issues.value.filter(i => i.type === 'error').length
})

const statusLabel = computed(() => {
    if (errorCount.value > 0) return 'Kritis'
    if (issues.value.some(i => i.type === 'warning')) return 'Peringatan'
    return 'Sehat'
})

const statusBg = computed(() => {
    if (errorCount.value > 0) return 'bg-red-100 text-red-700'
    if (issues.value.some(i => i.type === 'warning')) return 'bg-amber-100 text-amber-700'
    return 'bg-green-100 text-green-700'
})
</script>
