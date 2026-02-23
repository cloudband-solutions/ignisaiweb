import React, { useMemo, useState } from "react";
import Login from "./Login";
import { getCurrentUser, isLoggedIn } from "./services/AuthService";
import Sidebar from "./Sidebar";
import TopNavigation from "./TopNavigation";
import {
  Routes,
  Route
} from "react-router-dom";

import Dashboard from "./Dashboard";
import Home from "./Home";
import DocumentsIndex from "./modules/documents/Index";
import DocumentsNew from "./modules/documents/New";
import DocumentsShow from "./modules/documents/Show";
import Settings from "./Settings";
import Environment from "./Environment";

export default App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [serviceQuery, setServiceQuery] = useState("");
  const [favoriteServices, setFavoriteServices] = useState(() => {
    try {
      const stored = localStorage.getItem("favoriteServices");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (error) {
      return new Set();
    }
  });

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

  const currentUser = getCurrentUser();
  const isAdmin = currentUser && currentUser.user_type === "admin";

  const services = useMemo(() => {
    return [
      {
        id: "dashboard",
        label: "Dashboard",
        path: "/",
        icon: "dashboard",
        adminOnly: false
      },
      {
        id: "settings",
        label: "Settings",
        path: "/settings",
        icon: "settings",
        adminOnly: false
      },
      {
        id: "documents",
        label: "Documents",
        path: "/documents",
        icon: "documents",
        adminOnly: false
      },
      {
        id: "environment",
        label: "Environment",
        path: "/environment",
        icon: "settings",
        adminOnly: true
      }
    ];
  }, []);

  const allowedServices = services.filter((service) => {
    if (service.adminOnly && !isAdmin) {
      return false;
    }
    return true;
  });

  const toggleFavorite = (serviceId) => {
    setFavoriteServices((prev) => {
      const next = new Set(prev);
      if (next.has(serviceId)) {
        next.delete(serviceId);
      } else {
        next.add(serviceId);
      }
      localStorage.setItem("favoriteServices", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  return (
    <React.Fragment>
      <div className="app-container">
        <TopNavigation
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          services={allowedServices}
          favorites={favoriteServices}
          onToggleFavorite={toggleFavorite}
          query={serviceQuery}
          setQuery={setServiceQuery}
        />
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          services={allowedServices}
          favorites={favoriteServices}
          onToggleFavorite={toggleFavorite}
        />
        <div className={`app-main-section ${isSidebarOpen ? 'open' : ''}`}>
          <div className={`favorites-bar ${isSidebarOpen ? "open" : "closed"}`}>
            <div className="favorites-bar-label">Bookmarked services</div>
            <div className="favorites-bar-items">
              {allowedServices.filter((service) => favoriteServices.has(service.id)).map((service) => (
                <button
                  key={service.id}
                  type="button"
                  className="favorite-chip"
                  onClick={() => {
                    window.location.href = service.path;
                  }}
                >
                  {service.label}
                </button>
              ))}
              {allowedServices.filter((service) => favoriteServices.has(service.id)).length === 0 && (
                <span className="favorites-empty">No bookmarked services yet.</span>
              )}
            </div>
          </div>
          <main className="container-fluid p-3">
            <Routes>
              <Route
                path="/"
                element={<Dashboard/>}
              />
              <Route
                path="/documents"
                element={<DocumentsIndex/>}
              />
              <Route
                path="/documents/new"
                element={<DocumentsNew/>}
              />
              <Route
                path="/documents/:id"
                element={<DocumentsShow/>}
              />
              <Route
                path="/settings"
                element={<Settings/>}
              />
              <Route
                path="/environment"
                element={<Environment/>}
              />
            </Routes>
          </main>
        </div>
      </div>
    </React.Fragment>
  );
}
