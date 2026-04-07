import { Deck } from "./models/Deck";
import axios from "axios";

export namespace Store {
	export async function getAllDecks(): Promise<Array<Deck>> {
		const { data: res } = await axios.get("http://localhost:5000/decks");
		return res.decks;
	}

	export async function getDeck(index: number): Promise<Deck> {
		const { data: res } = await axios.get("http://localhost:5000/decks/" + index);
		return res;
	}

	export namespace Local {
		export function get(key: string) {
			return window.localStorage.getItem(key);
		}
		export function getObject(key: string): Object | null {
			const value = get(key);
			if (value == null) return null;
			return JSON.parse(value);
		}

		export function set(key: string, value: any) {
			window.localStorage.setItem(key, value);
		}
		export function setObject(key: string, value: Object) {
			set(key, JSON.stringify(value));
		}

		export function remove(key: string) {
			window.localStorage.removeItem(key);
		}
	}
}
