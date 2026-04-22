import "../components.css";
import { CardShowcase } from "../CardShowcase";
import ContextMenu, { ContextMenuItem } from "../ContextMenu";
import { ICardData } from "@virtual-library/mtg-card-handler";

type CardContainerProps = {
	ref: React.RefObject<HTMLDivElement | null>;
	id: string;
	placeholder?: string;
	cardList: ICardData[];
	sortedCard?: boolean;
	cardContextMenu?: ContextMenuItem[];
	onClick?: (currentCardList: ICardData[]) => void;
};

export function CardsSlot({
	ref,
	id,
	placeholder,
	cardList,
	sortedCard = true,
	cardContextMenu,
	onClick,
}: CardContainerProps) {
	if (sortedCard) {
		cardList.sort((a, b) => {
			return a.timestamp - b.timestamp;
		});
	}
	const currentCardElements = cardList.map((cardData) => {
		const idE = id + "_" + cardData.id;

		const card = (
			<CardShowcase
				card={cardData.card}
				occurence={1}
				isFrontFaceSide={cardData.state.isFrontFaceSide}
				isFrontSide={cardData.state.isFrontSide}
				sleeveColor={cardData.state.sleeveColor}
			/>
		);

		return (
			<div className={"card-holder" + (cardData.state.isTapped ? " tapped" : "")} id={idE} key={idE}>
				{cardContextMenu ? (
					<ContextMenu id={"context-menu-" + id} cardId={cardData.id!} items={cardContextMenu}>
						{card}
					</ContextMenu>
				) : (
					card
				)}
			</div>
		);
	});

	return (
		<div
			ref={ref}
			id={id}
			onClick={() => {
				onClick?.(cardList);
			}}>
			<div className={(placeholder ? "card-slot bg " : "") + "container"}>
				{placeholder && <div className="placeholder">{placeholder}</div>}
				<div className="card-list">{currentCardElements}</div>
			</div>
		</div>
	);
}
