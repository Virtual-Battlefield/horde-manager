import "./App.css";
import { useEffect, useState } from "react";
import { IDeck } from "@virtual-library/mtg-card-handler";
import { Store } from "../store";
import BattleField from "../components/playpage/BattleField";
import { AddTokenIcon } from "../middleware/SVGLoader";
import Popup from "../components/Popup";
import CardList from "../components/exhibit/CardList";

function Playpage() {
	const Deck = Store.Local.getObject("currentDeck") as IDeck;
	const [fieldToken, setFieldToken] = useState([]);
	const [showTokenPopup, setShowTokenPopup] = useState(false);

	console.log(Deck);
	const currentDeck = Deck.sections[0];
	const deckRelation = Deck.card_relation;

	useEffect(() => {
		window.addEventListener("beforeunload", alertUser);
		return () => {
			window.removeEventListener("beforeunload", alertUser);
		};
	}, []);
	const alertUser = (e: Event) => {
		e.preventDefault();
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
				<BattleField deck={currentDeck} handVisible={false} additionnalCard={fieldToken} />
				<Popup show={showTokenPopup} onClose={() => setShowTokenPopup(false)} title="Import Token">
					{deckRelation ? (
						<div style={{ width: "1200px" }}>
							<CardList cardList={deckRelation} nbColumns={"4"} />
						</div>
					) : (
						<p>No token found in the deck relation</p>
					)}
				</Popup>
			</div>
		</div>
	);
}

export default Playpage;
