import LandingPage from "./pages/landingPage";
import SetupPage from "./pages/setupPage";
import Dashboard from "./pages/dashboardPage";
import PublicPage from "./pages/publicPage";
import SinglePostPage from "./pages/singlePostPage";
import {
	BrowserRouter,
	Routes,
	Route,
	Outlet,
	ScrollRestoration,
	createBrowserRouter,
	RouterProvider,
} from "react-router-dom";

function RootLayout() {
	return (
		<div>
			<Outlet />
			<ScrollRestoration />
		</div>
	);
}

const router = createBrowserRouter([
	{
		path: "/",
		element: <RootLayout />,
		children: [
			{ path: "/", element: <LandingPage /> },
			{ path: "/setup", element: <SetupPage /> },
			{ path: "/dashboard", element: <Dashboard /> },
			{ path: "/:username/scroll/:post_id", element: <SinglePostPage /> },
			{ path: "/:username/:category", element: <PublicPage /> },
			{ path: "/:username", element: <PublicPage /> },
		],
	},
]);

function App() {
	return <RouterProvider router={router} />;
}

export default App;

// <BrowserRouter>
// 	<Routes>
// 		<Route path="/" element={<LandingPage />}></Route>
// 		<Route path="/setup" element={<SetupPage />}></Route>
// 		<Route path="/dashboard" element={<Dashboard />}></Route>
// 		<Route path="/:username/scroll/:post_id" element={<SinglePostPage />}></Route>
// 		<Route path="/:username/:category" element={<PublicPage />}></Route>
// 		<Route path="/:username" element={<PublicPage />}></Route>
// 	</Routes>
// </BrowserRouter>
