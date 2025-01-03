import { nextTick, ref, type Ref, watch, computed } from 'vue';
import { isPointerInArea, makeBoundingFromEdge, makeHullFromElementBounding, type Edge } from './area';
import { animate, transform, type DynamicAnimationOptions } from 'motion';
import { useEventListener } from '@vueuse/core';

type UseElasticEdgeOptions = {
	edge: Edge;
	puffer: number;
	factor: number;
	x: Ref<number>;
	y: Ref<number>;
	reset: { x: number; y: number };
};

export function useElasticEdge(box: HTMLElement, { edge, puffer, factor, x, y, reset }: UseElasticEdgeOptions) {
	const animating = ref(false);
	const stick = ref(false);
	const isMouseInBox = ref(false);
	const stickReleasedInBox = ref(false);

	const bounding = makeBoundingFromEdge(box, edge, puffer);

	const hull = computed(() => makeHullFromElementBounding(bounding));

	function transformY(clientY: number) {
		const relativeY = clientY - bounding.value.top; // range 0 to height
		const normalizedY = relativeY / bounding.value.height; // range 0 to 1
		const scaleAndTransformYByEdge = {
			top: (value: number) => {
				const scaledMin = -factor;
				const scaledMax = factor;
				return value * (scaledMax - scaledMin) + scaledMin; // [0, 1] -> [-0.1, 0.1]
			},
			bottom: (value: number) => {
				const scaledMin = 1 - factor;
				const scaledMax = 1 + factor;
				return value * (scaledMax - scaledMin) + scaledMin; // [0, 1] -> [0.9, 1.1]
			},
			left: (value: number) => {
				return value;
			},
			right: (value: number) => {
				return value;
			}
		} satisfies Record<Edge, ReturnType<typeof transform>>;
		return scaleAndTransformYByEdge[edge](normalizedY);
	}

	function transformX(clientX: number) {
		const relativeX = clientX - bounding.value.left; // range 0 to width
		const normalizedX = relativeX / bounding.value.width; // range 0 to 1
		const scaleAndTransformXByEdge = {
			top: (value: number) => {
				return value;
			},
			bottom: (value: number) => {
				return value;
			},
			left: (value: number) => {
				const scaledMin = -factor;
				const scaledMax = factor;
				return value * (scaledMax - scaledMin) + scaledMin; // [0, 1] -> [-0.1, 0.1]
			},
			right: (value: number) => {
				const scaledMin = 1 - factor;
				const scaledMax = 1 + factor;
				return value * (scaledMax - scaledMin) + scaledMin; // [0, 1] -> [0.9, 1.1]
			}
		} satisfies Record<Edge, ReturnType<typeof transform>>;
		return scaleAndTransformXByEdge[edge](normalizedX);
	}

	function animateResetValues() {
		// TODO: update when motion supports vue
		let animationX: ReturnType<typeof animate> | null = null;
		let animationY: ReturnType<typeof animate> | null = null;
		const options = {
			duration: 0.8,
			type: 'spring',
			bounce: 0.8,
			onPlay() {
				animating.value = true;
			},
			onComplete() {
				animating.value = false;
			}
		} satisfies Partial<DynamicAnimationOptions>;
		animationX = animate(x.value, reset.x, {
			...options,
			onUpdate(v) {
				if (!animating.value) {
					animationX?.stop();
					return;
				}
				x.value = v;
			}
		});
		animationY = animate(y.value, reset.y, {
			...options,
			onUpdate(v) {
				if (!animating.value) {
					animationY?.stop();
					return;
				}
				y.value = v;
			}
		});
	}

    // TODO: mousemove would be better but it breaks something
	useEventListener(window, 'pointermove', async (e) => {
        if (e.pointerType !== 'mouse') return;

		if (isPointerInArea(e, hull.value)) {
			// wait for stick until the mouse has enterd the box
			if (!isMouseInBox.value && !stick.value) return;

			// wait for stick until the mouse has left the box
			if (isMouseInBox.value && stickReleasedInBox.value) return;

			animating.value = false;
			stick.value = true;

			y.value = transformY(e.clientY);
			x.value = transformX(e.clientX);
		} else {
			if (!stick.value) return;
			if (animating.value) return;

			await nextTick();
			stick.value = false;
			animateResetValues();
		}
	});
	useEventListener(box, 'mousemove', () => {
		if (!stick.value) {
			stickReleasedInBox.value = true;
		}
	});
	useEventListener(box, 'mouseleave', () => {
		isMouseInBox.value = false;
		if (stickReleasedInBox.value) {
			stick.value = true;
		}
		stickReleasedInBox.value = false;
	});
	useEventListener(box, 'mouseenter', () => {
		isMouseInBox.value = true;
	});
}
