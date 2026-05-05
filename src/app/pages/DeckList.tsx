import "./App.css";
import ListDeckCard from "../components/exhibit/ListDeckCard";
import { Store } from "../store";
import { useData } from "../middleware/handler";

function DeckList() {
	const decks = useData(Store.getAllDecks);
	return (
		<div className="Main-page">
			<header className="Main-header">
				<h1>Deck List</h1>
			</header>
			<div className="Main-body">
				<hr />
				<div className="card-container col-lg-3 col-md-2">
					{decks &&
						decks.length > 0 &&
						decks.map((deck) => <ListDeckCard key={deck.id as React.Key} deck={deck} />)}
				</div>
			</div>
		</div>
	);
}

export default DeckList;
