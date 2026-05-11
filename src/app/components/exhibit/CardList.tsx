import "../components.css";
import { Card } from "@virtual-library/mtg-card-handler";
import { CardShowcase } from "../CardShowcase";
import { useState } from "react";

interface CardDisplay {
	id: string;
	occurence: number;
	card_data: Card;
}

function CardList({
	cardList,
	color,
	classColumn = "col-xl-7 col-md-5 col-sm-3 col2",
	onCardClick,
}: {
	cardList: Card[];
	color?: string;
	classColumn?: string;
	onCardClick?: (card: Card) => void;
}) {
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
		<div className={`card-container ${classColumn}`}>
			{uniqueCard.length > 0 &&
				uniqueCard.map((cardObj) => {
					const [front, setFront] = useState(true);
					return (
						<div onClick={() => onCardClick && onCardClick(cardObj.card_data)} key={cardObj.id}>
							<CardShowcase
								card={cardObj.card_data}
								occurence={cardObj.occurence}
								isFrontFaceSide={front}
								sleeveColor={color}>
								{cardObj.card_data.back_card && (
									<div className="revertCard onCard" onClick={() => setFront(!front)}>
										<button>↩</button>
									</div>
								)}
							</CardShowcase>
						</div>
					);
				})}
		</div>
	);
}

export default CardList;
