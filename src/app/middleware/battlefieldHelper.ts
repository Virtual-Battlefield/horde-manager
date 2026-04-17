import { useRef } from "react";
import { Card, CardType, ICardData, ICardState, Zone } from "@virtual-library/mtg-card-handler";
import { shuffle, clamp, toNumber } from "./handler";

export const defineZoneRef = () => {
	const ZoneRef: Map<Zone, React.RefObject<HTMLDivElement | null>> = new Map();
	ZoneRef.set(Zone.Deck, useRef<HTMLDivElement>(null));
	ZoneRef.set(Zone.Graveyard, useRef<HTMLDivElement>(null));
	ZoneRef.set(Zone.Exile, useRef<HTMLDivElement>(null));
	ZoneRef.set(Zone.Hand, useRef<HTMLDivElement>(null));
	ZoneRef.set(Zone.Stack, useRef<HTMLDivElement>(null));
	ZoneRef.set(Zone.Battlefield, useRef<HTMLDivElement>(null));
	return ZoneRef;
};

export function newFullDeck(cardList: Card[], sleeveColor: string): ICardData[] {
	return shuffle(cardList).map((card, index) => {
		const state: ICardState = {
			sleeveColor: sleeveColor, // deck.sections[0].color,
			isFrontFaceSide: true,
			isFrontSide: false,
			visibleArrow: false,
			zone: Zone.Deck,
			isTapped: false,
		};
		return {
			id: card.id + "_" + index,
			card: card,
			state,
			type: CardType.Normal,
		};
	});
}

export function getGlobalCardIndex(cardId: string): number {
	return toNumber(cardId.slice(cardId.lastIndexOf("_") + 1));
}

export function canDragCard(clickedTarget: HTMLElement, allowID: string[]) {
	// do not init the drag if user clicked on a element on the card (like a button)
	if (clickedTarget.classList.contains("onCard")) return;

	// if the context menu is clicked, prevent drag
	if (clickedTarget.closest(".context-menu")) return;

	// get the parent element, to drag the whole card and no just an image
	const target = clickedTarget?.closest(".card-holder") as HTMLElement;
	if (!target || !target.classList.contains("card-holder")) return;

	const container = target.closest(".container");
	// If there's is no container or the container parent is not listed on the list
	if (!container || !allowID.includes((container.parentElement as HTMLElement).id)) return;

	return target;
}

export function calculateCoord(container: HTMLElement, dragged: HTMLElement, startingCoord: { x: number; y: number }) {
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

export function createToken(card: Card, identifier: string): ICardData {
	return {
		id: card.id + "_" + identifier,
		card: card,
		state: {
			sleeveColor: "#0f0c05",
			isFrontFaceSide: true,
			isFrontSide: false,
			visibleArrow: false,
			zone: Zone.Battlefield,
			isTapped: false,
		},
		type: CardType.Token,
	};
}

export function isTokenID(id: string) {
	return id.includes("token");
}

export function isToken(card: ICardData): boolean {
	return card.type == CardType.Token;
}
