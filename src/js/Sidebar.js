import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faDashboard, 
  faGears,
  faBars,
  faFileLines,
  faStar
} from "@fortawesome/free-solid-svg-icons";
import profile from "../styles/images/profile.png";
import { useNavigate, useLocation } from "react-router-dom";

export default Sidebar = (props) => {
  const {
    isOpen,
    setIsOpen,
    services,
    favorites,
    onToggleFavorite
  } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const iconMap = {
    dashboard: faDashboard,
    settings: faGears,
    documents: faFileLines
  };

  return (
    <div className={`sidebar ${isOpen ? 'active' : 'close'}`}>
      <a
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <div className="logo-details">
          <i className="clickable">
            <FontAwesomeIcon icon={faBars}/>
          </i>
          <span className="logo-name">
            IgnisAI
          </span>
        </div>
      </a>
      <ul className="nav-links">
        {services.map((service) => {
          const isFavorite = favorites.has(service.id);
          return (
            <li
              key={service.id}
              className={location.pathname == service.path ? "active" : ""}
            >
              <div className="service-link">
                <a
                  onClick={() => {
                    navigate(service.path)
                  }}
                >
                  <i>
                    <FontAwesomeIcon icon={iconMap[service.icon]}/>
                  </i>
                  <span className="link-name">
                    {service.label}
                  </span>
                </a>
                <button
                  type="button"
                  className={`favorite-toggle ${isFavorite ? "is-favorite" : ""}`}
                  onClick={() => onToggleFavorite(service.id)}
                  aria-label={`Star ${service.label}`}
                >
                  <FontAwesomeIcon icon={faStar}/>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
