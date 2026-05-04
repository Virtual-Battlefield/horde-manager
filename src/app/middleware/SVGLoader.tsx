import AddTokenSVG from "../../public/icon/add-token.svg";
import CrossSVG from "../../public/icon/close.svg";

interface SVGProperties {
	color: string;
	size?: number;
}

interface BaseSVGProperties extends SVGProperties {
	icon: string;
	name: string;
}

const BaseIcon = ({ icon, name, color, size = 16 }: BaseSVGProperties) => (
	<img src={icon} alt={`${name} icon`} style={{ fill: color, width: size, height: size }} />
);

export const AddTokenIcon = ({ color, size }: SVGProperties) => (
	<BaseIcon icon={AddTokenSVG} name="add-token" color={color} size={size} />
);

export const CrossIcon = ({ color, size }: SVGProperties) => (
	<BaseIcon icon={CrossSVG} name="close" color={color} size={size} />
);
