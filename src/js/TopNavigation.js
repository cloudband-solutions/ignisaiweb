import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBars,
  faGears,
  faBell
} from "@fortawesome/free-solid-svg-icons";

export default TopNavigation = (props) => {

  let {
    isSidebarOpen,
    setIsSidebarOpen
  } = props;

  return (
    <div className="top-navigation">
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <FontAwesomeIcon 
              icon={faBars}
              size="2x"
              className="clickable ms-2"
              onClick={() => {
                setIsSidebarOpen(!isSidebarOpen);
              }}
            />
          </div>
          <div className="col text-end">
            <span className="clickable">
              <FontAwesomeIcon 
                icon={faGears}
                size="2x"
                className="clickable ms-2"
                onClick={() => {
                }}
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
