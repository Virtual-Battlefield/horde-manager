import { Card, CardType, ICardData, ICardState, Zone } from "@virtual-library/mtg-card-handler";
import { shuffle, toNumber } from "./handler";

export function newFullDeck(cardList: Card[], sleeveColor: string): ICardData[] {
	return shuffle(cardList).map((card, index) => {
		const state: ICardState = {
			sleeveColor: sleeveColor,
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
			timestamp: Date.now(),
		};
	});
}

export function getGlobalCardIndex(cardId: string): number {
	return toNumber(cardId.slice(cardId.lastIndexOf("_") + 1));
}

//#region token related

export function createToken(card: Card, identifier: string): ICardData {
	return {
		id: card.id + "_" + identifier,
		card: card,
		state: {
			sleeveColor: "#0f0c05",
			isFrontFaceSide: true,
			isFrontSide: true,
			visibleArrow: false,
			zone: Zone.Battlefield,
			isTapped: false,
		},
		type: CardType.Token,
		timestamp: Date.now(),
	};
}

export function isTokenID(id: string) {
	return id.includes("token");
}

export function isToken(card: ICardData): boolean {
	return card.type == CardType.Token;
}

//#endregion
