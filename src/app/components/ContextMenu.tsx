import { MouseEvent, PropsWithChildren, useEffect, useRef, useState } from "react";
import "./components.css";
import { getLocalPosition } from "../middleware/handler";

type Props = {
	id: string;
	cardId: string;
	items: ContextMenuItem[];
};

export type ContextMenuItem = {
	id: string;
	caption: string;
	onClick: (id: string) => void;
	isHidden?: (id: string) => boolean;
};

function ContextMenu({ items, cardId, children, id }: PropsWithChildren<Props>) {
	const [isVisible, setIsVisible] = useState(false);
	const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

	const ref = useRef<HTMLUListElement>(null);

	const contextMenuHandler = (e: React.MouseEvent) => {
		e.preventDefault();
		const element = e.target as HTMLElement;
		setIsVisible(true);
		const pos = getLocalPosition({ x: e.pageX, y: e.pageY }, element);
		setPosition({ x: pos.x, y: pos.y });
	};

	const keyDownhandler = (e: KeyboardEvent) => {
		if (e.code == "Escape") {
			setIsVisible(false);
		}
	};

	const clickHandler = (e: PointerEvent) => {
		if (!isVisible) return;
		const rect = ref.current?.getBoundingClientRect();
		if (
			rect &&
			(e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom)
		)
			setIsVisible(false);
	};

	const customContextMenuOpenedHandler = (e: Event) => {
		if ((e as CustomEvent<string>).detail != id) {
			setIsVisible(false);
		}
	};

	useEffect(() => {
		document.addEventListener("contextMenuOpened", customContextMenuOpenedHandler);

		return () => {
			document.removeEventListener("contextMenuOpened", customContextMenuOpenedHandler);
		};
	}, [customContextMenuOpenedHandler]);

	useEffect(() => {
		if (!isVisible) return;
		document.dispatchEvent(new CustomEvent<string>("contextMenuOpened", { detail: id }));
	}, [isVisible, id]);

	useEffect(() => {
		window.addEventListener("keydown", keyDownhandler);

		return () => {
			window.removeEventListener("keydown", keyDownhandler);
		};
	}, [keyDownhandler]);

	useEffect(() => {
		window.addEventListener("pointerdown", clickHandler);

		return () => {
			window.removeEventListener("pointerdown", clickHandler);
		};
	}, [clickHandler]);

	return (
		<>
			<div onContextMenu={contextMenuHandler}>{children}</div>
			{isVisible && (
				<ul ref={ref} style={{ left: position.x, top: position.y }} className="context-menu">
					{items.map((item) => {
						if (item.isHidden?.(cardId)) return "";
						return (
							<li
								key={item.id}
								onClick={(e: MouseEvent) => {
									e.stopPropagation();
									setIsVisible(false);
									item.onClick(cardId);
								}}>
								{item.caption}
							</li>
						);
					})}
				</ul>
			)}
		</>
	);
}

export default ContextMenu;
