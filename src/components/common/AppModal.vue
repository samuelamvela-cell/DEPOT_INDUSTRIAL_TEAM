<script setup lang="ts">
interface Props {
  modelValue: boolean;
  title?: string;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
}>();

const close = () => {
  emit('update:modelValue', false);
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <!-- Backdrop Scrim -->
      <div
        class="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm transition-opacity"
        @click="close"
      ></div>

      <!-- Modal Card -->
      <div
        class="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-xl p-6 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150"
      >
        <div class="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <h3 v-if="title" class="font-headline-sm text-headline-sm text-on-surface">
            {{ title }}
          </h3>
          <button
            type="button"
            class="w-10 h-10 rounded-full hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer"
            @click="close"
          >
            <span class="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div class="py-4">
          <slot></slot>
        </div>

        <div v-if="$slots.footer" class="pt-3 border-t border-outline-variant/30 flex justify-end gap-2">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>
