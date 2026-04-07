import { useCallback, useEffect, useRef, useState } from "react";

export function useData<T>(callback: (...args: any[]) => Promise<T>, ...args: any[]): T {
	const [data, setData] = useState(null as T);
	useEffect(() => {
		let ignore = false;
		if (ignore) return;
		callback(...args).then((json) => {
			setData(json);
		});
		ignore = true;
	}, [callback]);
	return data;
}

export function patchObject(oldObject: { [key: string]: any }, update: object) {
	for (const [key, value] of Object.entries(update)) {
		if (oldObject[key] !== undefined && oldObject[key] != value) {
			console.log(key, oldObject[key], "=>", value);
			oldObject[key] = value;
		}
	}
	return oldObject;
}

export function toNumber(string: string) {
	return Number(string);
}

export function isOverlapping(a: HTMLElement, b: HTMLElement) {
	const aBound = a.getBoundingClientRect();
	const bBound = b.getBoundingClientRect();

	return !(
		aBound.right < bBound.left ||
		aBound.left > bBound.right ||
		aBound.bottom < bBound.top ||
		aBound.top > bBound.bottom
	);
}

export function getLocalPosition(
	screenClick: { x: number; y: number },
	element: HTMLElement,
): { x: number; y: number } {
	const elementDimension = element.getBoundingClientRect();
	const x = screenClick.x - elementDimension.x;
	const y = screenClick.y - elementDimension.y;

	return { x, y };
}

export function isParent(child: HTMLElement, parent: HTMLElement) {
	const childParent = child.parentElement;

	if (childParent && childParent == parent) return true;
	else if (!childParent || childParent == document.getRootNode()) return false;
	else return isParent(childParent, parent);
}

export function shuffle(array: any[]) {
	return array
		.map((value) => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value);
}

export function clamp(from: number, to: number, value: number) {
	return Math.min(Math.max(from, value), to);
}

export function lerp(min: number, max: number, value: number) {
	return min * (1 - value) + max * value;
}

export function invlerp(min: number, max: number, value: number) {
	return clamp(0, 1, (value - min) / (max - min));
}
