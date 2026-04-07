import "./components.css";
import { CardShowcase } from "./CardShowcase";
import { ICardData } from "../middleware/IType";
import ContextMenu, { ContextMenuItem } from "./ContextMenu";
import { getGlobalCardIndex } from "../middleware/battlefieldHelper";

type CardContainerProps = {
	ref: React.RefObject<HTMLDivElement | null>;
	id: string;
	placeholder?: string;
	cardList: ICardData[];
	cardContextMenu?: ContextMenuItem[];
	onClick?: (currentCardList: ICardData[]) => void;
};

export function CardsSlot({ ref, id, placeholder, cardList, cardContextMenu, onClick }: CardContainerProps) {
	let currentCardElements = cardList.map((cardData) => {
		const idE = id + "_" + cardData.state.id;

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
					<ContextMenu
						id={"context-menu-" + id}
						cardIndex={getGlobalCardIndex(cardData)}
						items={cardContextMenu}>
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
