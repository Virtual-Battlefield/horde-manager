import "../components.css";
import { CardsSlot } from "./CardContainer";
import { useEffect, useRef, useState } from "react";
import { createToken, getGlobalCardIndex, isToken, isTokenID, newFullDeck } from "../../middleware/battlefieldHelper";
import { patchObject } from "../../middleware/handler";
import { Card, ICardData, ICardState, ISection, Zone } from "@virtual-library/mtg-card-handler";
import { BattlefieldEventHelper, MasterBattlefieldEvent } from "../../middleware/battlefieldEvent";

function BattleField({
	deck,
	handVisible,
	tokenList,
	setTokenList,
}: {
	deck: ISection;
	handVisible: boolean;
	tokenList: ICardData[];
	setTokenList: React.Dispatch<React.SetStateAction<ICardData[]>>;
}) {
	const [cardDataList, setCardDataList] = useState<ICardData[]>(newFullDeck(deck.card_list, deck.color));
	const tokenDataListRef = useRef<ICardData[]>(tokenList);
	tokenDataListRef.current = tokenList;

	const getCurrentCard = (id: string) => {
		const index = getGlobalCardIndex(id);
		return isTokenID(id) ? tokenDataListRef.current[index] : cardDataList[index];
	};

	// Need to be init in a react component (because it calls useRef hook)
	const ZoneRef = BattlefieldEventHelper.defineZoneRef();
	BattlefieldEventHelper.setZoneRef(ZoneRef);

	const changeCardState = (cardId: string, newState: ICardState, resetState = false) => {
		const newList = isTokenID(cardId) ? [...tokenDataListRef.current] : [...cardDataList];
		const currentCard = newList[getGlobalCardIndex(cardId)]; // find element from a new list
		if (!currentCard) return;

		if (resetState) {
			newState.isFrontFaceSide = true;
			newState.isTapped = false;
			currentCard.timestamp = Date.now();
		}

		currentCard.state = patchObject(currentCard.state, newState);

		if (isToken(currentCard)) setTokenList(newList);
		else setCardDataList(newList);
	};

	const toggleCardState = (cardId: string, stateName: string) => {
		const currentState = getCurrentCard(cardId).state[stateName];
		if (typeof currentState != "boolean" && typeof currentState != "undefined") {
			console.error("Can't toggle that kind of statement: " + typeof currentState);
			return;
		}

		const obj = { [stateName]: typeof currentState == "undefined" ? true : !currentState };
		changeCardState(cardId, obj);
	};

	const moveFromStack = (currentCardList: ICardData[]) => {
		if (currentCardList.length < 1) return;

		const tmpIndex = currentCardList.length - 1;
		const currentCard = currentCardList[tmpIndex];

		// If a sorcery or instant card is the top card of the stack,
		// it goes in the graveyard upon resolution
		const destination: Zone =
			currentCard.card.front_card.type_line.includes("Sorcery") ||
			currentCard.card.front_card.type_line.includes("Instant")
				? Zone.Graveyard
				: Zone.Battlefield;
		changeCardState(currentCard.id, { zone: destination, visibleArrow: true }, true);
	};

	useEffect(() => {
		const masterEvent = new MasterBattlefieldEvent(toggleCardState, changeCardState);
		masterEvent.eventSummarize(handVisible);

		return () => masterEvent.removeEvents();
	}, [handVisible]);

	return (
		<div className="playfield">
			<CardsSlot
				ref={BattlefieldEventHelper.ZoneRef.get(Zone.Battlefield)!}
				id="battlefield-slot"
				cardList={cardDataList
					.filter((card) => card.state.zone == Zone.Battlefield)
					.concat(tokenList.filter((card) => card.state.zone == Zone.Battlefield))}
				cardContextMenu={[
					// Add:
					//   - Move to Deck
					//     - Top
					//     - Bottom
					//     - Shuffle
					//     - Fixed position -> open popup
					// - Phase out / in
					// - Toggle Counters
					{
						id: "copy",
						caption: "Create Token Copy",
						onClick: (cardId) => {
							const currentCard = getCurrentCard(cardId);
							const token = createToken(currentCard.card, "token_" + tokenList.length);
							setTokenList([...tokenList, token]);
						},
					},
					{
						id: "face-down",
						caption: "Face Down/Up",
						onClick: (cardId) => toggleCardState(cardId, "isFrontSide"),
					},
					{
						id: "turn",
						caption: "Turn Over",
						onClick: (cardId) => toggleCardState(cardId, "isFrontFaceSide"),
						isHidden: (cardId) => getCurrentCard(cardId).card.back_card == undefined,
					},
				]}
			/>
			<CardsSlot
				ref={BattlefieldEventHelper.ZoneRef.get(Zone.Deck)!}
				id="deck-pile-slot"
				placeholder="Deck"
				cardList={cardDataList.filter((card) => card.state.zone == Zone.Deck)}
				sortedCard={false}
				onClick={(currentCardList) => {
					changeCardState(
						currentCardList[currentCardList.length - 1].id,
						{
							zone: handVisible ? Zone.Hand : Zone.Stack,
							isFrontSide: true,
						},
						true,
					);
				}}
				cardContextMenu={
					[
						// Add:
						// - Shuffle
						// - Manage top -> open popup
						//   - View X
						//   - Reveal X
						//   - Scry X
						//   - Surveil X
						//   - Mill X
						// - Search for... -> open popup
					]
				}
			/>

			<CardsSlot
				ref={BattlefieldEventHelper.ZoneRef.get(Zone.Exile)!}
				id="exile-slot"
				placeholder="Exile"
				cardList={cardDataList.filter((card) => card.state.zone == Zone.Exile)}
				// onClick={[
				// 	// Add:
				// 	// - See Cards
				// ]}
			/>

			<CardsSlot
				ref={BattlefieldEventHelper.ZoneRef.get(Zone.Graveyard)!}
				id="graveyard-slot"
				placeholder="Graveyard"
				cardList={cardDataList.filter((card) => card.state.zone == Zone.Graveyard)}
				// onClick={[
				// 	// Add:
				// 	// - See Cards
				// ]}
			/>

			<CardsSlot
				ref={BattlefieldEventHelper.ZoneRef.get(Zone.Hand)!}
				id="hand-slot"
				sortedCard={false}
				cardList={cardDataList.filter((card) => card.state.zone == Zone.Hand)}
				cardContextMenu={[
					{
						id: "to-stack",
						caption: "Move to Stack",
						onClick: (cardId) => {
							changeCardState(cardId, { zone: Zone.Stack }, true);
						},
					},
					{
						id: "to-graveyard",
						caption: "Discard",
						onClick: (cardId) => {
							changeCardState(cardId, { zone: Zone.Graveyard, visibleArrow: true }, true);
						},
					},
					{
						id: "to-exile",
						caption: "Move to Exile",
						onClick: (cardId) => {
							changeCardState(cardId, { zone: Zone.Exile, visibleArrow: true }, true);
						},
					},
				]}
			/>
			<CardsSlot
				ref={BattlefieldEventHelper.ZoneRef.get(Zone.Stack)!}
				id="stack-slot"
				cardList={cardDataList
					.filter((card) => card.state.zone == Zone.Stack)
					.concat(tokenList.filter((card) => card.state.zone == Zone.Stack))}
				onClick={moveFromStack}
				cardContextMenu={[
					// Add:
					// - Move to Deck
					//   - Top
					//   - Bottom
					//   - Shuffle
					//   - Fixed position -> open popup
					{
						id: "to-graveyard",
						caption: "Move to Graveyard",
						onClick: (cardId) => {
							changeCardState(cardId, { zone: Zone.Graveyard, visibleArrow: true }, true);
						},
					},
					{
						id: "to-exile",
						caption: "Move to Exile",
						onClick: (cardId) => {
							changeCardState(cardId, { zone: Zone.Exile, visibleArrow: true }, true);
						},
					},
					{
						id: "copy",
						caption: "Create Token Copy",
						onClick: (cardId) => {
							const currentCard = getCurrentCard(cardId);
							const token = createToken(currentCard.card, "token_" + tokenList.length, Zone.Stack);
							setTokenList([...tokenList, token]);
						},
					},
				]}
			/>
		</div>
	);
}

export default BattleField;
