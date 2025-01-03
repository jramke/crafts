<script setup lang="ts">
    import { ref, useTemplateRef, computed, useId, onMounted } from 'vue';
    import { useEventListener } from '@vueuse/core'
    import { useElasticEdge } from './use-elastic-edge';

    const box = ref<HTMLElement| null>(null);
    const maskId = useId();

    const topX = ref(0.5);
    const topY = ref(0);
    const bottomX = ref(0.5);
    const bottomY = ref(1);
    const leftX = ref(0);
    const leftY = ref(0.5);
    const rightX = ref(1);
    const rightY = ref(0.5);

    const pufferPx = 30;
    const factor = 0.125;
    if (factor < 0 || factor > 1) throw new Error('factor must be between 0 and 1');
    
    onMounted(() => {
        if (!box.value) return;

        useElasticEdge(box.value, {
            puffer: pufferPx,
            edge: 'top',
            x: topX,
            y: topY,
            factor,
            reset: { x: 0.5, y: 0 }
        });

        useElasticEdge(box.value, {
            puffer: pufferPx,
            edge: 'bottom',
            x: bottomX,
            y: bottomY,
            factor,
            reset: { x: 0.5, y: 1 }
        });

        useElasticEdge(box.value, {
            puffer: pufferPx,
            edge: 'left',
            x: leftX,
            y: leftY,
            factor,
            reset: { x: 0, y: 0.5 }
        });

        useElasticEdge(box.value, {
            puffer: pufferPx,
            edge: 'right',
            x: rightX,
            y: rightY,
            factor,
            reset: { x: 1, y: 0.5 }
        });

    });

    const path = computed(() => {
        return `M 0 0 Q ${topX.value} ${topY.value} 1 0 Q ${rightX.value} ${rightY.value} 1 1 Q ${bottomX.value} ${bottomY.value} 0 1 Q ${leftX.value} ${leftY.value} 0 0 Z`;
    });
</script>

<template>
    <div 
        class="size-40 relative text-background isolate grid place-items-center" 
        ref="box"
        :style="{ clipPath: `url(#${maskId})` }"
    >
        <div class="absolute bg-foreground top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[200%] h-[200%] z-[-1]"></div>
        <slot />
    </div>

    <svg height="0" width="0" style="position:absolute;">
        <defs>
            <clipPath :id="maskId" clipPathUnits="objectBoundingBox">
                <path :d="path" />
            </clipPath>
        </defs>
    </svg>
</template>