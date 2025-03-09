import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import React from "react";
import { Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";

createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<Router hook={useHashLocation}>
			<App />
		</Router>
	</React.StrictMode>
);
