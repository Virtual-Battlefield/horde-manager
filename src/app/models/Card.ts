export class CardFace {
	name: string;
	mana_cost?: string;
	type_line: string;
	oracle_text: string;

	crop_image: URL;
	full_image: URL;

	constructor(fetch: any) {
		this.name = fetch.name;
		this.mana_cost = fetch.mana_cost;
		this.type_line = fetch.type_line;
		this.oracle_text = fetch.oracle_text;
		this.crop_image = new URL(fetch.image_uris.art_crop);
		this.full_image = new URL(fetch.image_uris.normal);
	}

	static new(fetch: any): CardFace {
		if (fetch.type_line.includes("Planeswalker") || fetch.type_line.includes("Battle"))
			return new PointCardFace(fetch);
		else if (
			fetch.type_line.includes("Creature") ||
			fetch.type_line.includes("Vehicle") ||
			(fetch.type_line.includes("SpaceCraft") && fetch.power != "undefined")
		)
			return new CreatureCardFace(fetch);
		else return new CardFace(fetch);
	}
}

export class CreatureCardFace extends CardFace {
	power: string;
	toughness: string;

	constructor(fetch: any) {
		super(fetch);
		this.power = fetch.power;
		this.toughness = fetch.toughness;
	}
}

/**
 * Correspond to Battle and Planeswalker card
 */
export class PointCardFace extends CardFace {
	point: string; // Loyalty or Defense point

	constructor(fetch: any) {
		super(fetch);
		this.point = fetch.loyalty || fetch.defense;
	}
}

export class Card {
	id: string;
	layout: string;

	front_card: CardFace;
	back_card?: CardFace;

	constructor(fetch: any) {
		this.id = fetch.id;

		/**
		 * _Existing layout:
		 * 	_Gameplay Layout:
		 * normal, split, flip, transform, modal_dfc, meld, leveler, class, case, saga, adventure, mutate, prototype,
		 * 	_Gameplay Layout non off:
		 * planar, scheme, vanguard, augment, host
		 * 	_Other:
		 * token, double_faced_token, emblem, art_series, reversible_card,
		 * battle (battle don't seems to be attached to battle supertype cards for now. siege type are a transform layout)
		 */
		this.layout = fetch.layout;

		// Meld card need to be inserted somehow ...
		this.front_card = CardFace.new(fetch.front_card);

		if (fetch.back_card) {
			this.back_card = CardFace.new(fetch.back_card);
		}
	}
}
