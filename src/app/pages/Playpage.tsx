import "./App.css";
import { useEffect, useState } from "react";
import { Card, ICardData, IDeck } from "@virtual-library/mtg-card-handler";
import { Store } from "../store";
import BattleField from "../components/playpage/BattleField";
import { AddTokenIcon } from "../middleware/SVGLoader";
import Popup from "../components/Popup";
import CardList from "../components/exhibit/CardList";
import PleaseRotate from "../../public/lib/pleaserotate.min.js";
import { createToken } from "../middleware/battlefieldHelper";

function Playpage() {
	const Deck = Store.Local.getObject("currentDeck") as IDeck;
	const [tokenList, setTokenList] = useState<ICardData[]>([]);
	const [showTokenPopup, setShowTokenPopup] = useState(false);

	console.log(Deck);
	const currentDeck = Deck.sections[0];
	const deckRelation = Deck.card_relation;

	// Prevent the user from accidentally refreshing the page
	// (because it will reset the battlefield)
	useEffect(() => {
		window.addEventListener("beforeunload", alertUser);
		return () => {
			window.removeEventListener("beforeunload", alertUser);
		};
	}, []);
	const alertUser = (e: Event) => {
		e.preventDefault();
	};

	// Prevent the user from having the phone in landscape mode
	// (because the battlefield is designed for portrait mode)
	useEffect(() => {
		// /* you can pass in options here*/
		const PleaseRotateOptions = {
			onlyMobile: false,
			subMessage: "",
			allowClickBypass: false,
		};
		PleaseRotate.start(PleaseRotateOptions);

		return () => PleaseRotate.stop();
	}, []);

	const addToken = (card: Card) => {
		const cardData = createToken(card, "token_" + tokenList.length);
		setTokenList([...tokenList, cardData]);
		console.log("Adding token", tokenList);
		setShowTokenPopup(false);
	};

	const playerName = "Player 1";
	return (
		<div className="Main-page">
			<div className="Main-body grid-pattern">
				<div id="life-slot">
					<div className="life-container">
						<div className="action-container">
							<div className="name-slot">{playerName}</div>
							<div className="icon-button" onClick={() => setShowTokenPopup(true)}>
								<AddTokenIcon color="white" size={24} />
							</div>
						</div>
						<div className="life-slot">
							<span>40</span>
						</div>
					</div>
				</div>
				<Popup show={showTokenPopup} onClose={() => setShowTokenPopup(false)} title="Import Token">
					{deckRelation ? (
						<div style={{ width: "120em" }}>
							<CardList
								cardList={deckRelation}
								classColumn={"col2 col-sm-3 col-lg-5 col-xl-4"}
								onCardClick={addToken}
							/>
						</div>
					) : (
						<p>No token found in the deck relation</p>
					)}
				</Popup>
				<BattleField deck={currentDeck} handVisible={false} tokenList={tokenList} setTokenList={setTokenList} />
			</div>
		</div>
	);
}

export default Playpage;
