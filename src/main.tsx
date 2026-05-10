import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.js";
import { ThemeProvider } from "./components/themeProvider.js";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ThemeProvider defaultTheme="dark" storageKey="app-ui-theme">
			<App />
		</ThemeProvider>
	</StrictMode>,
);
