<script setup lang="ts">
interface Props {
  variant?: 'satellite' | 'primary' | 'secondary' | 'success' | 'warning' | 'neutral';
  icon?: string;
  pulse?: boolean;
}

withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  pulse: false,
});

const variantClasses: Record<string, string> = {
  satellite: 'bg-tertiary-fixed text-on-tertiary-fixed font-medium',
  primary: 'bg-primary-fixed text-on-primary-fixed-variant font-semibold',
  secondary: 'bg-secondary-fixed text-on-secondary-fixed font-semibold',
  success: 'bg-surface-container-high text-primary font-semibold',
  warning: 'bg-error-container text-on-error-container font-semibold',
  neutral: 'bg-surface-container text-on-surface-variant font-medium',
};
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md text-label-md select-none',
      variantClasses[variant],
    ]"
  >
    <span
      v-if="pulse"
      class="w-2 h-2 rounded-full bg-current animate-pulse"
    ></span>
    <span
      v-if="icon"
      class="material-symbols-outlined text-[16px]"
    >
      {{ icon }}
    </span>
    <slot></slot>
  </span>
</template>
