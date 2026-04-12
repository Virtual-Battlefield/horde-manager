import "./components.css";
import { Link } from "react-router";
import { IDeck } from "@virtual-library/mtg-card-handler";

function ListDeckCard({ deck }: { deck: IDeck }) {
	return (
		<Link
			className="deck-card"
			style={{ backgroundImage: deck?.image ? "url(" + deck.image + ")" : "revert-layer" }}
			to={{ pathname: `/deck/${deck.id}` }}>
			<p className="deck-title">{deck.name}</p>
		</Link>
	);
}

export default ListDeckCard;
