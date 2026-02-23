import React, { useState } from "react";
import Login from "./Login";
import { isLoggedIn } from "./services/AuthService";
import Sidebar from "./Sidebar";
import {
  Routes,
  Route
} from "react-router-dom";

import Dashboard from "./Dashboard";
import Home from "./Home";

export default App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isLoggedIn()) {
    return (
      <Routes>
        <Route
          path="/"
          element={<Home/>}
        />
        <Route
          path="/login"
          element={<Login/>}
        />
      </Routes>
    );
  }

  return (
    <React.Fragment>
      <div className="app-container">
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
        <div className={`app-main-section ${isSidebarOpen ? 'open' : ''}`}>
          <main className="container-fluid p-3">
            <Routes>
              <Route
                path="/"
                element={<Dashboard/>}
              />
            </Routes>
          </main>
        </div>
      </div>
    </React.Fragment>
  );
}
