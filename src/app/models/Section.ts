import type { Card } from "./Card";

export interface Section {
	id: number;
	name?: string;
	description: string;
	color: string;

	card_list: Array<Card>;
}
