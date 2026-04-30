import "./App.css";
import { useEffect, useState } from "react";
import { IDeck } from "@virtual-library/mtg-card-handler";
import { Store } from "../store";
import BattleField from "../components/playpage/BattleField";
import { AddTokenIcon } from "../middleware/SVGLoader";

function Playpage() {
	const Deck = Store.Local.getObject("currentDeck") as IDeck;
	const [fieldToken, setFieldToken] = useState([]);

	const currentDeck = Deck.sections[0];

	useEffect(() => {
		window.addEventListener("beforeunload", alertUser);
		return () => {
			window.removeEventListener("beforeunload", alertUser);
		};
	}, []);
	const alertUser = (e: Event) => {
		e.preventDefault();
	};

	console.log(Deck);
	return (
		<div className="Main-page">
			<div className="Main-body grid-pattern">
				<div id="life-slot">
					<div className="life-container">
						<div className="action-container">
							<div className="name-slot">Player 1</div>
							<div>
								<AddTokenIcon color="white" size={24} />
							</div>
						</div>
						<div className="life-slot">
							<span>40</span>
						</div>
					</div>
				</div>
				<BattleField deck={currentDeck} handVisible={false} additionnalCard={fieldToken} />
			</div>
		</div>
	);
}

export default Playpage;
