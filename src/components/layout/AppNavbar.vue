<template>
  <nav class="border-b border-gray-200 bg-white sticky top-0 z-40">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 justify-between">
        <div class="flex">
          <div class="flex flex-shrink-0 items-center">
            <img src="@/assets/logo.svg" alt="Logo" class="h-8 w-auto transition-all" />
            <span class="ml-3 text-lg font-bold text-gray-900 tracking-tight">Oh My DB</span>
          </div>
          <div class="hidden sm:ml-10 sm:flex sm:space-x-8">
            <RouterLink
              to="/dashboard"
              class="inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors"
              :class="[$route.path === '/dashboard' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300']"
            >
              Dashboard
            </RouterLink>
            <RouterLink
              to="/templates"
              class="inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors"
              :class="[$route.path === '/templates' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300']"
            >
              Templates
            </RouterLink>
            <RouterLink
              to="/about"
              class="inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors"
              :class="[$route.path === '/about' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300']"
            >
              Tentang
            </RouterLink>
          </div>
        </div>
        <div class="flex items-center">
            <span class="text-xs font-medium text-gray-400">Fast & Simple DB Builder</span>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
</script>
