<script setup lang="ts">
interface Props {
  variant?: 'default' | 'surface' | 'recommended' | 'warning' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  interactive: false,
});

const variantClasses: Record<string, string> = {
  default: 'bg-surface-container-lowest border border-outline-variant/30 shadow-[0_2px_8px_rgba(27,42,34,0.04)]',
  surface: 'bg-surface-container-low border border-transparent shadow-none',
  recommended: 'bg-surface-container-lowest border-2 border-secondary-container shadow-md ring-2 ring-secondary-container/20',
  warning: 'bg-error-container/20 border border-error-container',
  flat: 'bg-surface-container border border-outline-variant/20',
};

const paddingClasses: Record<string, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-7',
};
</script>

<template>
  <div
    :class="[
      'rounded-2xl transition-all relative overflow-hidden',
      variantClasses[variant],
      paddingClasses[padding],
      interactive ? 'hover:shadow-md cursor-pointer active:scale-[0.99]' : '',
    ]"
  >
    <slot></slot>
  </div>
</template>
