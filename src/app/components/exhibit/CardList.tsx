import "../components.css";
import { Card } from "@virtual-library/mtg-card-handler";
import { CardShowcase } from "../CardShowcase";

interface CardDisplay {
	id: string;
	occurence: number;
	card_data: Card;
}

function CardList({ cardList, color }: { cardList: Card[]; color?: string }) {
	let uniqueCard: CardDisplay[] = [];
	for (let i = 0; i < cardList.length; i++) {
		const currentCardIndex = uniqueCard.findIndex((u) => u.id == cardList[i].id);
		if (currentCardIndex != -1) {
			uniqueCard[currentCardIndex].occurence++;
		} else {
			uniqueCard.push({
				id: cardList[i].id,
				occurence: 1,
				card_data: cardList[i],
			});
		}
	}
	return (
		<div className="card-container col7">
			{uniqueCard.length > 0 &&
				uniqueCard.map((cardObj) => (
					<CardShowcase
						key={cardObj.id}
						card={cardObj.card_data}
						occurence={cardObj.occurence}
						sleeveColor={color}
					/>
				))}
		</div>
	);
}

export default CardList;
