import React, { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBars,
  faMagnifyingGlass,
  faStar
} from "@fortawesome/free-solid-svg-icons";
import { destroySession, getCurrentUser } from "./services/AuthService";
import { useNavigate } from "react-router-dom";

export default TopNavigation = (props) => {
  let {
    isSidebarOpen,
    setIsSidebarOpen,
    services,
    favorites,
    onToggleFavorite,
    query,
    setQuery
  } = props;

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const userLabel = currentUser?.name || currentUser?.email || currentUser?.username || "User";

  const filteredServices = useMemo(() => {
    if (!query) {
      return [];
    }
    const lowered = query.toLowerCase();
    return services.filter((service) => {
      return service.label.toLowerCase().includes(lowered);
    });
  }, [query, services]);

  const handleLogout = () => {
    destroySession();
    window.location.href = "/";
  };

  return (
    <div className={`top-navigation ${isSidebarOpen ? "open" : "closed"}`}>
      <div className="container-fluid top-nav-inner">
        <div className="top-nav-left">
          <button
            type="button"
            className="nav-icon-button"
            onClick={() => {
              setIsSidebarOpen(!isSidebarOpen);
            }}
            aria-label="Toggle sidebar"
          >
            <FontAwesomeIcon icon={faBars}/>
          </button>
          <div className="service-search">
            <div className="service-search-input">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon"/>
              <input
                type="text"
                placeholder="Search for a service"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => {
                  setTimeout(() => setIsSearchFocused(false), 120);
                }}
              />
            </div>
            {isSearchFocused && filteredServices.length > 0 && (
              <div className="service-search-results">
                {filteredServices.map((service) => {
                  const isFavorite = favorites.has(service.id);
                  return (
                    <div
                      key={service.id}
                      className="service-result"
                      onClick={() => {
                        navigate(service.path);
                        setQuery("");
                      }}
                    >
                      <span className="service-result-name">
                        {service.label}
                      </span>
                      <button
                        type="button"
                        className={`favorite-toggle ${isFavorite ? "is-favorite" : ""}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onToggleFavorite(service.id);
                        }}
                        aria-label={`Star ${service.label}`}
                      >
                        <FontAwesomeIcon icon={faStar}/>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="top-nav-right">
          <div
            className={`user-menu ${isUserMenuOpen ? "open" : ""}`}
            tabIndex={0}
            onBlur={() => setIsUserMenuOpen(false)}
          >
            <button
              type="button"
              className="user-menu-button"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
            >
              <span className="user-menu-label">{userLabel}</span>
            </button>
            {isUserMenuOpen && (
              <div className="user-menu-dropdown">
                <button
                  type="button"
                  className="user-menu-item"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleLogout();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
