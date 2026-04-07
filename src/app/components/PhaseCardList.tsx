import "./components.css";
import { Section } from "../models/Section";
import CardList from "./CardList";

function PhaseCardList({ title, phase }: { title: string; phase: Section }) {
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
