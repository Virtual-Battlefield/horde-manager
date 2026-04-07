import "./App.css";
import { useEffect } from "react";
import BattleField from "../components/BattleField";
import { Deck } from "../models/Deck";
import { Store } from "../store";

function Playpage() {
	const currentDeck = Store.Local.getObject("currentDeck") as Deck;

	useEffect(() => {
		window.addEventListener("beforeunload", alertUser);
		return () => {
			window.removeEventListener("beforeunload", alertUser);
		};
	}, []);
	const alertUser = (e: Event) => {
		e.preventDefault();
	};

	console.log(currentDeck);
	return (
		<div className="Main-page">
			<div className="Main-body grid-pattern">
				<div id="life-slot">
					<div className="life-container">life</div>
				</div>
				<BattleField deck={currentDeck} handVisible={true} />
			</div>
		</div>
	);
}

export default Playpage;
