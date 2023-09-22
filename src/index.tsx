import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import embedPath from './generated/surrealist-embed_bg.wasm?url';
import initEmbed, { initialize_embed } from './generated/surrealist-embed';
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { actions, store } from "./store";
import { App } from "./components/App";
import { loader } from "@monaco-editor/react";
import { initializeMonaco } from "./util/editor";
import { runUpdateChecker } from "./util/updater";
import { updateTitle, watchNativeTheme } from "./util/helpers";
import { adapter } from "./adapter";

import "reactflow/dist/style.css";

(async () => {	
	dayjs.extend(relativeTime);
	
	// Load the surrealist embed library
	await initEmbed(embedPath);

	initialize_embed();

	// Load existing config
	const config = await adapter.loadConfig();

	store.dispatch(actions.initialize(config));

	const { lastPromptedVersion, updateChecker } = store.getState().config;

	// Check for updates
	if (adapter.isUpdateCheckSupported && updateChecker) {
		runUpdateChecker(lastPromptedVersion, false);
	}

	// Apply initial title
	updateTitle();

	// Listen for theme changes
	watchNativeTheme();

	// Init monaco
	await document.fonts.ready;

	const monaco = await loader.init();

	await initializeMonaco(monaco);

	// Render the app component
	const root = document.querySelector("#root")!;

	createRoot(root).render(
		<Provider store={store}>
			<App />
		</Provider>
	);
})();
