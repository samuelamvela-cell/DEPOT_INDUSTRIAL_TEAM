<script setup lang="ts">
import { useRoute } from 'vue-router';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import AppBottomNav from '@/components/layout/AppBottomNav.vue';

const route = useRoute();
</script>

<template>
  <div class="min-h-screen bg-surface font-body-md text-on-surface antialiased flex flex-col">
    <!-- Main Shell Layout (Shown unless explicitly hidden like Onboarding) -->
    <template v-if="!route.meta.hideLayout">
      <AppSidebar />
      <div class="lg:pl-72 flex flex-col min-h-screen">
        <AppHeader />
        <main class="flex-1 w-full pt-16 pb-24 lg:pb-8 bg-surface">
          <RouterView />
        </main>
      </div>
      <AppBottomNav />
    </template>

    <!-- Fullscreen / Standalone Views (e.g. Onboarding) -->
    <template v-else>
      <main class="w-full min-h-screen bg-surface">
        <RouterView />
      </main>
    </template>
  </div>
</template>
