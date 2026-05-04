import { PropsWithChildren } from "react";
import "./components.css";
import { CrossIcon } from "../middleware/SVGLoader";

type PopupProps = {
	show: boolean;
	onClose: () => void;
	title: string;
};

function Popup({ show, onClose, title, children }: PropsWithChildren<PopupProps>) {
	if (!show) return null;
	return (
		<div className="popup">
			<div className="popup-container">
				<div className="popup-header">
					<h2>{title}</h2>
					<div className="close" onClick={onClose}>
						<CrossIcon color="white" size={32} />
					</div>
				</div>
				<div className="popup-content">{children}</div>
			</div>
		</div>
	);
}

export default Popup;
