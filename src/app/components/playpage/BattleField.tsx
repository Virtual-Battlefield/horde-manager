import "../components.css";
import { CardsSlot } from "./CardContainer";
import { useEffect, useState } from "react";
import {
	calculateCoord,
	canDragCard,
	defineZoneRef,
	getGlobalCardIndex,
	newFullDeck,
} from "../../middleware/battlefieldHelper";
import { invlerp, isParent, patchObject } from "../../middleware/handler";
import { Buffer } from "../../middleware/buffer";
import { ICardData, ICardState, IDeck, Zone } from "@virtual-library/mtg-card-handler";

function BattleField({ deck, handVisible }: { deck: IDeck; handVisible: boolean }) {
	const Deck = deck.sections[0];
	const [cardDataList, setCardDataList] = useState<ICardData[]>(newFullDeck(Deck.card_list, Deck.color));

	const ZoneRef = defineZoneRef();

	const allowGrabZone = [Zone.Battlefield, Zone.Graveyard, Zone.Exile];
	const dropZone = [Zone.Battlefield, Zone.Graveyard, Zone.Exile];
	if (handVisible) {
		allowGrabZone.push(Zone.Hand);
		dropZone.push(Zone.Hand);
	}

	const getContainer = (slot: Zone) => ZoneRef.get(slot)?.current?.querySelector<HTMLElement>(".container");

	const setupEvent = (allowGrabZone: Zone[], dropZone: Zone[]): void => {
		let dragging: HTMLElement | null = null;
		const currentContainer = (): HTMLElement | null | undefined => dragging?.closest(".container");
		let nextDropSlot: Zone | null = null;
		let buffer = new Buffer(300);
		let isSimpleClick: boolean = false;

		const setOverlapped = (slot: Zone, isOverlapped: boolean) => {
			// slot.overlapped(isOverlapped);
			if (isOverlapped) {
				getContainer(slot)?.classList.add("overlapping");
				nextDropSlot = slot;
			} else if (nextDropSlot == slot) {
				getContainer(slot)?.classList.remove("overlapping");
				nextDropSlot = null;
			}
		};

		document.addEventListener("pointerdown", (e: PointerEvent) => {
			const target = canDragCard(
				e.target as HTMLElement,
				allowGrabZone.map((el) => ZoneRef.get(el)!.current!.id ?? ""),
			);
			// prevent drag if a other click than e.button == 0 (left click) was pressed
			if (!target || e.button != 0) return;

			isSimpleClick = true;
			buffer.start(() => (isSimpleClick = false));

			dragging = target;
			target.classList.add("dragging");
			// IMPORTANT
			// On mobile, if not present, prevent event "pointerenter" and "pointerleave" to fire on other element
			(e.target as HTMLElement).releasePointerCapture(e.pointerId);
		});

		document.addEventListener("pointermove", (ev: PointerEvent) => {
			if (!dragging) return;
			const container = currentContainer();
			if (container == undefined) return;
			const newCoordinates = calculateCoord(container, dragging, { x: ev.pageX, y: ev.pageY });
			if (!newCoordinates) return;

			if (container == getContainer(Zone.Hand)) {
				const limit = container.offsetWidth - container.offsetLeft * 2 - dragging.offsetWidth;
				//to preserve the rotation effect when holding the card in hand, we can't modify the 'left' property
				//and '--calc' css variable is a percentage
				dragging.style.setProperty("--calc", (invlerp(0, limit, newCoordinates.x) * 100).toString());
			} else {
				if (newCoordinates.x > 0) dragging.style.left = `${newCoordinates.x}px`;
				if (newCoordinates.y > 0) dragging.style.top = `${newCoordinates.y}px`;
			}
		});

		dropZone.forEach((el) => {
			const dropContainer = getContainer(el);
			if (!dropContainer) return;

			dropContainer.addEventListener("pointerenter", () => {
				if (!dragging) return;
				if (isParent(dragging, dropContainer)) return;

				setOverlapped(el, true);
			});
			dropContainer.addEventListener("pointerleave", () => setOverlapped(el, false));
		});

		document.addEventListener("pointerup", () => {
			if (dragging) {
				dragging.classList.remove("dragging");
				// get index of the card in the container internal list
				const index = getGlobalCardIndex(dragging);

				if (nextDropSlot !== null) {
					changeCardState(index, { zone: nextDropSlot }, true);
					setOverlapped(nextDropSlot, false);
				} else if (isSimpleClick) {
					buffer.cancel();
					// to do: set onClick event depending of the zone it was applied
					// for the moment will try to tapped the card in each zone
					// (will have a visual effect only on the battlefield because of css)
					togleCardState(index, "isTapped");
				}
			}

			dragging = null;
		});
	};

	let hasSetupEvent = false;
	useEffect(() => {
		if (hasSetupEvent) return;

		setupEvent(allowGrabZone, dropZone);
		hasSetupEvent = true;
	}, [hasSetupEvent]);

	const changeCardState = (cardIndex: number, newState: ICardState, resetState = false) => {
		const newList = [...cardDataList];
		const currentCard = newList[cardIndex]; // find element from a new list
		if (!currentCard) return;

		if (resetState) {
			newState.isFrontFaceSide = true;
			newState.isTapped = false;
		}

		currentCard.state = patchObject(currentCard.state, newState);

		setCardDataList(newList);
	};

	const togleCardState = (cardIndex: number, stateName: string) => {
		const currentState = cardDataList[cardIndex].state[stateName];
		if (typeof currentState != "boolean" && typeof currentState != "undefined") {
			console.error("Can't toggle that kind of statement: " + typeof currentState);
			return;
		}

		const obj = { [stateName]: typeof currentState == "undefined" ? true : !currentState };
		changeCardState(cardIndex, obj);
	};

	const moveFromStack = (currentCardList: ICardData[]) => {
		if (currentCardList.length < 1) return;

		const tmpIndex = currentCardList.length - 1;
		const currentCard = currentCardList[tmpIndex];
		const globalIndex = getGlobalCardIndex(currentCard);

		// If a sorcery or instant card is the top card of the stack,
		// it goes in the graveyard upon resolution
		const destination: Zone =
			currentCard.card.front_card.type_line.includes("Sorcery") ||
			currentCard.card.front_card.type_line.includes("Instant")
				? Zone.Graveyard
				: Zone.Battlefield;
		changeCardState(globalIndex, { zone: destination, visibleArrow: true }, true);
	};

	return (
		<div className="playfield">
			<CardsSlot
				ref={ZoneRef.get(Zone.Battlefield)!}
				id="battlefield-slot"
				cardList={cardDataList.filter((card) => card.state.zone == Zone.Battlefield)}
				cardContextMenu={[
					{
						id: "to-graveyard",
						caption: "Move to Graveyard",
						onClick: (cardIndex) => changeCardState(cardIndex, { zone: Zone.Graveyard }),
					},
					{
						id: "to-exile",
						caption: "Move to Exile",
						onClick: (cardIndex) => changeCardState(cardIndex, { zone: Zone.Exile }),
					},
					{
						id: "face-down",
						caption: "Face Down/Up",
						onClick: (cardIndex) => {
							changeCardState(cardIndex, { isFrontSide: !cardDataList[cardIndex].state.isFrontSide });
						},
					},
					{
						id: "turn",
						caption: "Turn Over",
						onClick: (cardIndex) => {
							changeCardState(cardIndex, {
								isFrontFaceSide: !cardDataList[cardIndex].state.isFrontFaceSide,
							});
						},
						isHidden: (cardIndex) => cardDataList[cardIndex].card.back_card == undefined,
					},
				]}
			/>
			<CardsSlot
				ref={ZoneRef.get(Zone.Deck)!}
				id="deck-pile-slot"
				placeholder="Deck"
				cardList={cardDataList.filter((card) => card.state.zone == Zone.Deck)}
				onClick={(currentCardList) => {
					changeCardState(
						getGlobalCardIndex(currentCardList[currentCardList.length - 1]),
						{
							zone: handVisible ? Zone.Hand : Zone.Stack,
							isFrontSide: true,
						},
						true,
					);
				}}
			/>

			<CardsSlot
				ref={ZoneRef.get(Zone.Exile)!}
				id="exile-slot"
				placeholder="Exile"
				cardList={cardDataList.filter((card) => card.state.zone == Zone.Exile)}
			/>

			<CardsSlot
				ref={ZoneRef.get(Zone.Graveyard)!}
				id="graveyard-slot"
				placeholder="Graveyard"
				cardList={cardDataList.filter((card) => card.state.zone == Zone.Graveyard)}
			/>

			<CardsSlot
				ref={ZoneRef.get(Zone.Hand)!}
				id="hand-slot"
				cardList={cardDataList.filter((card) => card.state.zone == Zone.Hand)}
				cardContextMenu={[
					{
						id: "to-stack",
						caption: "Move to Stack",
						onClick: (cardIndex) => {
							changeCardState(cardIndex, { zone: Zone.Stack }, true);
						},
					},
					{
						id: "to-graveyard",
						caption: "Discard",
						onClick: (cardIndex) => {
							changeCardState(cardIndex, { zone: Zone.Graveyard, visibleArrow: true }, true);
						},
					},
					{
						id: "to-exile",
						caption: "Move to Exile",
						onClick: (cardIndex) => {
							changeCardState(cardIndex, { zone: Zone.Exile, visibleArrow: true }, true);
						},
					},
				]}
			/>
			<CardsSlot
				ref={ZoneRef.get(Zone.Stack)!}
				id="stack-slot"
				cardList={cardDataList.filter((card) => card.state.zone == Zone.Stack)}
				onClick={moveFromStack}
				cardContextMenu={[
					{
						id: "to-graveyard",
						caption: "Move to Graveyard",
						onClick: (cardIndex) => {
							changeCardState(cardIndex, { zone: Zone.Graveyard, visibleArrow: true }, true);
						},
					},
					{
						id: "to-exile",
						caption: "Move to Exile",
						onClick: (cardIndex) => {
							changeCardState(cardIndex, { zone: Zone.Exile, visibleArrow: true }, true);
						},
					},
				]}
			/>
		</div>
	);
}

export default BattleField;
