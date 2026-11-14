<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'recommendation' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconRight?: string;
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  fullWidth: false,
});

defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const variantClasses: Record<string, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-container shadow-sm active:scale-[0.98]',
  secondary: 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest active:scale-[0.98]',
  recommendation: 'bg-secondary-container text-on-secondary-container hover:bg-secondary font-body-bold shadow-md active:scale-[0.98]',
  outline: 'bg-transparent border border-outline text-on-surface hover:bg-surface-container-low active:scale-[0.98]',
  ghost: 'bg-transparent text-primary hover:bg-surface-container-low active:scale-[0.98]',
};

const sizeClasses: Record<string, string> = {
  sm: 'min-h-[40px] px-3 text-label-md rounded-lg gap-1.5',
  md: 'min-h-[48px] px-4 text-label-lg rounded-xl gap-2',
  lg: 'min-h-[52px] px-6 text-label-lg rounded-xl gap-2.5',
};
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center font-body-bold transition-all select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
      variantClasses[variant],
      sizeClasses[size],
      fullWidth ? 'w-full' : '',
    ]"
    @click="$emit('click', $event)"
  >
    <!-- Loading spinner -->
    <span
      v-if="loading"
      class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5"
    ></span>

    <!-- Optional left icon -->
    <span
      v-if="icon && !loading"
      class="material-symbols-outlined text-[20px]"
    >
      {{ icon }}
    </span>

    <slot></slot>

    <!-- Optional right icon -->
    <span
      v-if="iconRight"
      class="material-symbols-outlined text-[20px]"
    >
      {{ iconRight }}
    </span>
  </button>
</template>
