import { computed, type Ref } from "vue";
import { makeHull, type Point, type Polygon } from "./hull";
import { useElementBounding } from "@vueuse/core";

export type Edge = 'top' | 'left' | 'right' | 'bottom';

export type Bounding = {
    left: number;
    top: number;
    right: number;
    bottom: number;
    height: number;
    width: number;
}

export function makeBoundingFromEdge(element: HTMLElement, edge: Edge, puffer: number) {
    if (!element) {
        throw new Error('Element not found');
    }

    const { top, left, right, bottom, width, height } = useElementBounding(element);

    return computed(() => {
        const edgeMap: Record<string, Bounding> = {
            top: {
                left: left.value,
                top: top.value - puffer,
                right: right.value,
                bottom: top.value + puffer,
                height: puffer * 2,
                width: width.value,
            },
            left: {
                left: left.value - puffer,
                top: top.value,
                right: left.value + puffer,
                bottom: bottom.value,
                height: height.value,
                width: puffer * 2,
            },
            right: {
                left: right.value - puffer,
                top: top.value - puffer,
                right: right.value + puffer,
                bottom: bottom.value + puffer,
                height: height.value + puffer * 2,
                width: puffer * 2,
            },
            bottom: {
                left: left.value,
                top: bottom.value - puffer,
                right: right.value,
                bottom: bottom.value + puffer,
                height: puffer * 2,
                width: width.value,
            },
        };
        return edgeMap[edge];
    });
}

export function makeHullFromElementBounding(bounding: Ref<Bounding>) {
    const { top, left, right, bottom } = bounding.value;

    return makeHull([
        { x: left, y: top },
        { x: right, y: top },
        { x: right, y: bottom },
        { x: left, y: bottom },
    ]);
}

export function pointInPolygon(point: Point, polygon: Polygon) {
	let inside = false;
	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const xi = polygon[i].x;
		const yi = polygon[i].y;
		const xj = polygon[j].x;
		const yj = polygon[j].y;

		const intersect =
			yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
		if (intersect) inside = !inside;
	}
	return inside;
}

export function isPointerInArea(
	e: Pick<PointerEvent, 'clientX' | 'clientY'>,
	area?: Polygon
): boolean {
	if (!area) return false;
	return pointInPolygon({ x: e.clientX, y: e.clientY }, area);
}