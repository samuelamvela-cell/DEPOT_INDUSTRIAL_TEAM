<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import AppBottomNav from '@/components/layout/AppBottomNav.vue';
import { useAuthStore } from '@/stores/authStore';
import { useFarmStore } from '@/stores/farmStore';

const route = useRoute();
const auth = useAuthStore();
const farmStore = useFarmStore();

onMounted(() => {
  if (auth.isAuthenticated) void farmStore.loadAll();
});

watch(
  () => auth.isAuthenticated,
  (isAuth) => {
    if (isAuth) void farmStore.loadAll();
    else farmStore.reset();
  },
);
</script>

<template>
  <div class="min-h-screen bg-surface font-body-md text-on-surface antialiased flex flex-col">
    <!-- Main Shell Layout (shown unless a route opts out, e.g. auth screens) -->
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

    <!-- Fullscreen / standalone views (sign in, register, onboarding) -->
    <template v-else>
      <main class="w-full min-h-screen bg-surface">
        <RouterView />
      </main>
    </template>
  </div>
</template>
