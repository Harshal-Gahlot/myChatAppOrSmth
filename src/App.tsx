import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landingpage";
import SetupPage from "./pages/setuppage";
import Dashboard from "./pages/dashboardpage";
import PublicPage from "./pages/publicpage";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<LandingPage />}></Route>
				<Route path="/setup" element={<SetupPage />}></Route>
				<Route path="/dashboard" element={<Dashboard />}></Route>
				<Route path="/:username/:category" element={<PublicPage />}></Route>
				<Route path="/:username" element={<PublicPage />}></Route>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
