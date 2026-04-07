import { Store } from "../store";
import "./App.css";
import { Link, useNavigate, useParams } from "react-router";
import PhaseCardList from "../components/PhaseCardList";
import { useData } from "../middleware/handler";
import { Deck } from "../models/Deck";

/**
 * Save the deck in local storage when clicked to use it to play
 * @param deck
 */
const saveDeck = (deck: Deck) => {
	Store.Local.setObject("currentDeck", deck);
};

function DeckList() {
	const navigate = useNavigate();

	const params = useParams();
	const idDeck: number = parseInt(params.id || "0");
	if (idDeck == 0) {
		navigate("/", { replace: true });
		return;
	}
	const currentDeck = useData(Store.getDeck, idDeck);

	return (
		<div className="Main-page">
			<header className="Main-header deck-page">
				<h1>{currentDeck?.name ?? "No Deck Found"}</h1>
				<div
					className="header-cover left"
					style={{
						backgroundImage: currentDeck?.image ? "url(" + currentDeck.image + ")" : "revert-layer",
					}}></div>
			</header>
			<div className="Main-body">
				{currentDeck?.bosses && currentDeck?.bosses?.card_list?.length > 0 && (
					<PhaseCardList title="Boss" phase={currentDeck.bosses} />
				)}
				{currentDeck?.sections &&
					currentDeck?.sections.map((sectionObj) => (
						<PhaseCardList
							key={sectionObj.id as React.Key}
							title={`${sectionObj.name ?? `Phase ${sectionObj.id}`}`}
							phase={sectionObj}
						/>
					))}
				<div className="sticky-bottom">
					<div className="Play-button">
						<Link to={{ pathname: `/deck/${currentDeck?.id}/play` }}>
							<div className="button" onClick={() => saveDeck(currentDeck)}>
								PLAY
							</div>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

export default DeckList;
