import { ICardState, Zone } from "@virtual-library/mtg-card-handler";
import { clamp, invlerp, isParent } from "./handler";
import { useRef } from "react";
import { Buffer } from "./buffer";

type EventDescription = {
	// ev need to be of an Event type but typescript seems to not understand inheritance between event type...
	[key in keyof DocumentEventMap]?: (ev: any) => any;
};

type ZoneEventDescription = {
	// key will be listed as Zone[zoneName]
	[zone: string]: EventDescription;
};

type SetterFunction = {
	toggleCardState: (cardId: string, stateName: string) => void;
	changeCardState: (cardId: string, newState: ICardState, force?: boolean) => void;
};

export namespace BattlefieldEventHelper {
	export var ZoneRef = initZoneRef();

	function initZoneRef(): Map<Zone, React.RefObject<HTMLDivElement | null>> {
		return new Map();
	}

	export function defineZoneRef() {
		const ZoneRef = initZoneRef();
		ZoneRef.set(Zone.Deck, useRef<HTMLDivElement>(null));
		ZoneRef.set(Zone.Graveyard, useRef<HTMLDivElement>(null));
		ZoneRef.set(Zone.Exile, useRef<HTMLDivElement>(null));
		ZoneRef.set(Zone.Hand, useRef<HTMLDivElement>(null));
		ZoneRef.set(Zone.Stack, useRef<HTMLDivElement>(null));
		ZoneRef.set(Zone.Battlefield, useRef<HTMLDivElement>(null));
		return ZoneRef;
	}

	export function setZoneRef(newZoneRef: Map<Zone, React.RefObject<HTMLDivElement | null>>) {
		ZoneRef = newZoneRef;
	}

	export function getContainer(slot: Zone) {
		return ZoneRef.get(slot)?.current?.querySelector<HTMLElement>(".container");
	}

	export function currentContainer(el: HTMLElement): HTMLElement | null {
		return el.closest(".container");
	}

	export function canSelectCard(clickedTarget: HTMLElement, allowContainerID: string[]) {
		// do not init the selection if user clicked on a element on the card (like a button)
		if (clickedTarget.classList.contains("onCard")) return;

		// if the context menu is clicked, prevent selection
		if (clickedTarget.closest(".context-menu")) return;

		// get the parent element, to drag the whole card and no just an image
		const target = clickedTarget?.closest(".card-holder") as HTMLElement;
		if (!target || !target.classList.contains("card-holder")) return;

		const container = currentContainer(target);
		// If there's is no container or the container parent is not listed on the list
		if (!container || !allowContainerID.includes((container.parentElement as HTMLElement).id)) return;

		return target;
	}
}

interface BattlefieldEvent {
	setterFunction: SetterFunction;
	/**
	 * list of Event to apply to whole document
	 */
	listGlobalEvent(): EventDescription | null;
	/**
	 * list of Event Attach to a specific zone/slot on the screen
	 */
	listZoneEvent(): ZoneEventDescription | null;
}

export class MasterBattlefieldEvent {
	setterFunction: SetterFunction;

	callBacksRemoveEvent: (() => void)[];

	constructor(
		toggleCardState: (cardId: string, stateName: string) => void,
		changeCardState: (cardId: string, newState: ICardState, force?: boolean) => void,
	) {
		this.setterFunction = { toggleCardState: toggleCardState, changeCardState: changeCardState };
		this.callBacksRemoveEvent = [];
	}

	eventSummarize(canDropInHand: boolean) {
		const allowGrabZone = [Zone.Battlefield, Zone.Graveyard, Zone.Exile];
		const dropZone = [Zone.Battlefield, Zone.Graveyard, Zone.Exile];
		if (canDropInHand) {
			allowGrabZone.push(Zone.Hand);
			dropZone.push(Zone.Hand);
		}
		this.callBacksRemoveEvent = [];

		const allClassEvent = [
			new DragCardEvent(allowGrabZone, dropZone, this.setterFunction),
			new TappedEvent(this.setterFunction),
		];

		const allEvent = allClassEvent.map((_class) => _class.listGlobalEvent());
		allEvent.forEach((event) => {
			if (!event) return;
			for (const [key, value] of Object.entries(event)) {
				document.addEventListener(key, (e: any) => value(e));
				this.callBacksRemoveEvent.push(() => document.removeEventListener(key, (e: any) => value(e)));
			}
		});

		const allZoneEvent = allClassEvent.map((_class) => _class.listZoneEvent());
		allZoneEvent.forEach((zoneEvents) => {
			if (!zoneEvents) return;
			for (const [key, value] of Object.entries(zoneEvents)) {
				const container = BattlefieldEventHelper.getContainer(Zone[key as keyof typeof Zone]);
				if (!container) continue;

				for (const [eventName, eventFunction] of Object.entries(value)) {
					container.addEventListener(eventName, (e: any) => eventFunction(e));
					this.callBacksRemoveEvent.push(() =>
						container.removeEventListener(eventName, (e: any) => eventFunction(e)),
					);
				}
			}
		});
	}

	removeEvents() {
		this.callBacksRemoveEvent.forEach((callBack) => callBack());
		this.callBacksRemoveEvent = [];
	}
}

class DragCardEvent implements BattlefieldEvent {
	dragging: HTMLElement | null = null;
	nextDropSlot: Zone | null = null;
	allowGrabZone: Zone[];
	dropZone: Zone[];
	setterFunction: SetterFunction;

	constructor(allowGrabZone: Zone[], dropZone: Zone[], setterFunction: SetterFunction) {
		this.allowGrabZone = allowGrabZone;
		this.dropZone = dropZone;
		this.setterFunction = setterFunction;
	}

	setOverlapped = (slot: Zone, isOverlapped: boolean) => {
		if (isOverlapped) {
			BattlefieldEventHelper.getContainer(slot)?.classList.add("overlapping");
			this.nextDropSlot = slot;
		} else if (this.nextDropSlot == slot) {
			BattlefieldEventHelper.getContainer(slot)?.classList.remove("overlapping");
			this.nextDropSlot = null;
		}
	};

	//#region pointerDown

	pointerDown(e: PointerEvent) {
		const target = BattlefieldEventHelper.canSelectCard(
			e.target as HTMLElement,
			this.allowGrabZone.map((el) => BattlefieldEventHelper.ZoneRef.get(el)!.current!.id ?? ""),
		);
		// prevent drag if a other click than e.button == 0 (left click) was pressed
		if (!target || e.button != 0) return;

		this.dragging = target;
		target.classList.add("dragging");
		// IMPORTANT
		// On mobile, if not present, prevent event "pointerenter" and "pointerleave" to fire on other element
		(e.target as HTMLElement).releasePointerCapture(e.pointerId);
	}

	//#endregion

	//#region pointerMove
	calculateCoord(container: HTMLElement, dragged: HTMLElement, startingCoord: { x: number; y: number }) {
		const rect = container.getBoundingClientRect();
		const maxCoordinates = [
			rect.width - dragged.offsetWidth - rect.left * 2,
			rect.height - dragged.offsetHeight - rect.top * 2,
		];
		return {
			x: clamp(0, maxCoordinates[0], startingCoord.x - rect.left - dragged.offsetWidth / 2),
			y: clamp(0, maxCoordinates[1], startingCoord.y - rect.top - dragged.offsetHeight / 2),
		};
	}

	pointerMove(ev: PointerEvent) {
		if (!this.dragging) return;
		const container = BattlefieldEventHelper.currentContainer(this.dragging);
		if (container == undefined) return;
		const newCoordinates = this.calculateCoord(container, this.dragging, { x: ev.pageX, y: ev.pageY });
		if (!newCoordinates) return;
		if (container == BattlefieldEventHelper.getContainer(Zone.Hand)) {
			const limit = container.offsetWidth - container.offsetLeft * 2 - this.dragging.offsetWidth;
			//to preserve the rotation effect when holding the card in hand, we can't modify the 'left' property
			//and '--calc' css variable is a percentage
			this.dragging.style.setProperty("--calc", (invlerp(0, limit, newCoordinates.x) * 100).toString());
		} else {
			if (newCoordinates.x > 0) this.dragging.style.left = `${newCoordinates.x}px`;
			if (newCoordinates.y > 0) this.dragging.style.top = `${newCoordinates.y}px`;
		}
	}
	//#endregion

	pointerUp() {
		if (this.dragging) {
			this.dragging.classList.remove("dragging");

			if (this.nextDropSlot !== null) {
				this.setterFunction.changeCardState(this.dragging.id, { zone: this.nextDropSlot }, true);
				this.setOverlapped(this.nextDropSlot, false);
			}
		}

		this.dragging = null;
	}

	listGlobalEvent() {
		return {
			pointerdown: (e: PointerEvent) => this.pointerDown(e),
			pointermove: (e: PointerEvent) => this.pointerMove(e),
			pointerup: () => this.pointerUp(),
		};
	}

	listZoneEvent(): ZoneEventDescription | null {
		const zoneEvent: ZoneEventDescription = {};
		this.dropZone.forEach((zone) => {
			const dropContainer = BattlefieldEventHelper.getContainer(zone);
			if (!dropContainer) return;

			zoneEvent[Zone[zone]] = {
				pointerenter: () => {
					if (!this.dragging) return;
					if (isParent(this.dragging, dropContainer)) return;

					this.setOverlapped(zone, true);
				},
				pointerleave: () => this.setOverlapped(zone, false),
			};
		});
		return zoneEvent;
	}
}

class TappedEvent implements BattlefieldEvent {
	clickedCard: HTMLElement | null = null;
	allowTapZone: Zone[];
	isSimpleClick: boolean = false;
	buffer: Buffer;
	setterFunction: SetterFunction;

	constructor(setterFunction: SetterFunction) {
		this.buffer = new Buffer(300);
		this.allowTapZone = [Zone.Battlefield];
		this.setterFunction = setterFunction;
	}

	pointerDown(e: PointerEvent) {
		const target = BattlefieldEventHelper.canSelectCard(
			e.target as HTMLElement,
			this.allowTapZone.map((el) => BattlefieldEventHelper.ZoneRef.get(el)!.current!.id ?? ""),
		);
		// prevent drag if a other click than e.button == 0 (left click) was pressed
		if (!target || e.button != 0) return;

		this.isSimpleClick = true;
		this.buffer.start(() => (this.isSimpleClick = false));

		this.clickedCard = target;
		target.classList.add("dragging");
		// IMPORTANT
		// On mobile, if not present, prevent event "pointerenter" and "pointerleave" to fire on other element
		(e.target as HTMLElement).releasePointerCapture(e.pointerId);
	}

	pointerMove() {
		// @todo set threshold when moving
		// this.isSimpleClick = false;
	}

	pointerUp() {
		if (this.clickedCard && this.isSimpleClick) {
			this.buffer.cancel();
			this.setterFunction.toggleCardState(this.clickedCard.id, "isTapped");
		}

		this.clickedCard = null;
	}

	listGlobalEvent(): EventDescription {
		return {
			pointerdown: (e: PointerEvent) => this.pointerDown(e),
			pointermove: () => this.pointerMove(),
			pointerup: () => this.pointerUp(),
		};
	}

	listZoneEvent() {
		return null;
	}
}
