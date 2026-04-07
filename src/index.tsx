import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import DeckList from "./app/pages/DeckList";
import DeckPage from "./app/pages/Deckpage";
import Playpage from "./app/pages/Playpage";

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
	<React.StrictMode>
		<title>Horde Manager MTG</title>

		<BrowserRouter>
			<Routes>
				<Route path="/" element={<DeckList />} />
				<Route path="/deck/:id" element={<DeckPage />} />
				<Route path="/deck/:id/play" element={<Playpage />} />
				<Route path="*" element={<Navigate replace to="/" />} />
			</Routes>
		</BrowserRouter>
	</React.StrictMode>,
);
