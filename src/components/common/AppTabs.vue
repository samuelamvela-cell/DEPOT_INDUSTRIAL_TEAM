<script setup lang="ts">
export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  badge?: string;
}

interface Props {
  tabs: TabItem[];
  modelValue: string;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void;
}>();

const selectTab = (id: string) => {
  emit('update:modelValue', id);
};
</script>

<template>
  <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      :class="[
        'min-h-[44px] px-4 py-2 rounded-xl font-body-bold text-label-lg flex items-center gap-2 transition-all whitespace-nowrap shadow-xs cursor-pointer',
        modelValue === tab.id
          ? 'bg-primary text-on-primary shadow-sm'
          : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
      ]"
      @click="selectTab(tab.id)"
    >
      <span v-if="tab.icon" class="material-symbols-outlined text-[18px]">
        {{ tab.icon }}
      </span>
      <span>{{ tab.label }}</span>
      <span
        v-if="tab.badge"
        :class="[
          'px-1.5 py-0.2 rounded-full font-label-md text-caption',
          modelValue === tab.id
            ? 'bg-primary-container text-on-primary-container'
            : 'bg-surface-container-high text-on-surface-variant',
        ]"
      >
        {{ tab.badge }}
      </span>
    </button>
  </div>
</template>
