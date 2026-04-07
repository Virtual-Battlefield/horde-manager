import { Card } from "../models/Card";

export enum Zone {
	Graveyard,
	Exile,
	Battlefield,
	Stack,
	Hand,
	Deck,
	Sideboard,
	CommandZone,
}

export type ICardState = {
	[key: string]: any; // let to search for any key when looping with [for ... of] Object loop
	id?: string;
	isFrontFaceSide?: boolean; // Useful only if the current card as multiple face
	isFrontSide?: boolean;
	sleeveColor?: string;
	visibleArrow?: boolean;
	zone?: Zone;
	isTapped?: boolean;
};

export type ICardData = {
	card: Card;
	state: ICardState;
};
