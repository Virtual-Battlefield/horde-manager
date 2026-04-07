import "./components.css";
import { Card } from "../models/Card";

type CardDisplayProps = {
	card: Card;
	occurence: number;
	isFrontSide?: boolean;
	isFrontFaceSide?: boolean;
	sleeveColor?: string;
};

export function CardShowcase({ card, occurence, isFrontSide, isFrontFaceSide, sleeveColor }: CardDisplayProps) {
	let backSide = null;
	if (sleeveColor != undefined) {
		const backgroundCover = { "--background-color": sleeveColor } as React.CSSProperties;
		backSide = <div className="card-back-side" style={backgroundCover}></div>;
	}

	return (
		<div className={"card" + (isFrontSide ? "" : " rotate")}>
			<div className={"card-content" + (isFrontFaceSide ? "" : " rotate")}>
				<div className="front-card">
					<img src={card.front_card.full_image.toString()} alt={card.front_card.name} />
				</div>
				{card.back_card && (
					<div className="back-card">
						<img src={card.back_card.full_image.toString()} alt={card.back_card.name} />
					</div>
				)}
				{occurence > 1 && (
					<div className="onCard occurence">
						<div>x {occurence}</div>
					</div>
				)}
			</div>
			{backSide ?? ""}
		</div>
	);
}
