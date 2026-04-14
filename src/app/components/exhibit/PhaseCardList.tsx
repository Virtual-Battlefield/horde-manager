import "../components.css";
import CardList from "./CardList";
import { ISection } from "@virtual-library/mtg-card-handler";

function PhaseCardList({ title, phase }: { title: string; phase: ISection }) {
	return (
		<div>
			<h3>
				{title} <span>({phase.card_list.length} cards)</span>
			</h3>
			{phase?.description && <p>{phase?.description}</p>}
			<hr />
			<CardList cardList={phase?.card_list} />
		</div>
	);
}

export default PhaseCardList;
