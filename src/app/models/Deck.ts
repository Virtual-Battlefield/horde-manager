import { Card } from "./Card";
import type { Section } from "./Section";

export interface Deck {
	id: number;
	name: string;
	description: string;
	image: URL;

	bosses?: Section;
	sections: Array<Section>;
	unsorted?: Array<Card>;
}
