<script setup>
import { RouterView } from 'vue-router'
import { useProjectStore } from './stores/useProjectStore'

const store = useProjectStore()
</script>

<template>
  <div :class="{ 'dark': store.darkMode }" class="min-h-screen">
    <div class="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300">
        <RouterView />
    </div>
  </div>
</template>

<style>
/* Global resets if needed */
</style>
