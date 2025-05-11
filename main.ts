import { Plugin } from "obsidian";

module.exports = class QuickDefine extends Plugin {
	async onload() {

		this.registerDomEvent(document, "mouseup", async (event) => {
			const selection = window.getSelection();
			if (!selection) return;

			const selectedText = selection.toString().trim();

			if (selectedText && /^[a-zA-Z\-']+$/.test(selectedText)) {
				const definition = await this.fetchDefinition(selectedText);
				if (definition) {
					this.showPopup(
						event.pageX,
						event.pageY,
						selectedText,
						definition
					);
				}
			}
		});
	}

	async fetchDefinition(word: string): Promise<string | null> {
		try {
			const response = await fetch(
				`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
			);
			if (!response.ok) return null;

			const data = await response.json();
			const firstMeaning = data?.[0]?.meanings?.[0];
			const firstDefinition = firstMeaning?.definitions?.[0]?.definition;
			return firstDefinition || null;
		} catch (err) {
			console.error(err);
			return null;
		}
	}

	showPopup(x: number, y: number, word: string, definition: string): void {
		const existing = document.querySelector(".dictionary-popup");
		if (existing) existing.remove();

		const popup = document.createElement("div");
		popup.className = "dictionary-popup";
		popup.innerHTML = `<strong>${word}</strong>: ${definition}`; // ! Find workaround before release
		popup.style.position = "absolute";
		popup.style.left = `${x + 10}px`;
		popup.style.top = `${y + 10}px`;
		popup.style.background = "#282c34";
		popup.style.color = "#fff";
		popup.style.padding = "8px 12px";
		popup.style.borderRadius = "6px";
		popup.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
		popup.style.zIndex = "1000";
		popup.style.maxWidth = "300px";

		document.body.appendChild(popup);

		const remove = () => {
			popup.remove();
			document.removeEventListener("mousedown", remove);
		};
		document.addEventListener("mousedown", remove);
	}
};
