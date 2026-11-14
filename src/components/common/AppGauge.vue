<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  score: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  strokeWidth: 8,
});

const dimensions = computed(() => {
  switch (props.size) {
    case 'sm':
      return { width: 56, height: 56, radius: 22, textClass: 'text-headline-sm', subTextClass: 'text-[10px]' };
    case 'lg':
      return { width: 96, height: 96, radius: 40, textClass: 'text-display-lg', subTextClass: 'text-caption' };
    default:
      return { width: 72, height: 72, radius: 28, textClass: 'text-headline-md', subTextClass: 'text-[11px]' };
  }
});

const circumference = computed(() => 2 * Math.PI * dimensions.value.radius);

const strokeDashoffset = computed(() => {
  const progress = Math.min(Math.max(props.score, 0), 100);
  return circumference.value - (progress / 100) * circumference.value;
});

const colorClass = computed(() => {
  if (props.score >= 80) return 'text-primary';
  if (props.score >= 65) return 'text-tertiary';
  return 'text-error';
});
</script>

<template>
  <div class="inline-flex items-center gap-3">
    <div
      class="relative flex items-center justify-center shrink-0"
      :style="{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }"
    >
      <svg
        class="w-full h-full -rotate-90 transform"
        :viewBox="`0 0 ${dimensions.width} ${dimensions.height}`"
      >
        <!-- Background Circle -->
        <circle
          class="text-surface-container-highest"
          :cx="dimensions.width / 2"
          :cy="dimensions.height / 2"
          :r="dimensions.radius"
          fill="none"
          stroke="currentColor"
          :stroke-width="strokeWidth"
        />
        <!-- Active Progress Arc -->
        <circle
          :class="[colorClass, 'transition-all duration-700 ease-out']"
          :cx="dimensions.width / 2"
          :cy="dimensions.height / 2"
          :r="dimensions.radius"
          fill="none"
          stroke="currentColor"
          :stroke-width="strokeWidth"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeDashoffset"
          stroke-linecap="round"
        />
      </svg>
      <!-- Centered score value -->
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span :class="['font-display-lg leading-none font-bold', colorClass, dimensions.textClass]">
          {{ score }}
        </span>
        <span :class="['text-on-surface-variant font-label-md leading-none mt-0.5', dimensions.subTextClass]">
          / 100
        </span>
      </div>
    </div>

    <!-- Optional Label / Text side block -->
    <div v-if="label || sublabel" class="flex flex-col">
      <span v-if="label" class="font-body-bold text-label-lg text-on-surface leading-tight">
        {{ label }}
      </span>
      <span v-if="sublabel" class="font-caption text-caption text-on-surface-variant mt-0.5 leading-snug">
        {{ sublabel }}
      </span>
    </div>
  </div>
</template>
