import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie } from "@fortawesome/free-solid-svg-icons";
import Pagination from "./Pagination";

export default Dashboard = () => {
  const [totalPages, setTotalPages]   = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [args, setArgs] = useState({});

  return (
    <div className="card shadow mb-4">
      <div className="card-header py-3">
        <div className="d-flex justify-content-between align-items-center">
          <div className="fw-bold">
            <FontAwesomeIcon icon={faChartPie} className="me-2"/>
            Dashboard
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="table-responsive" style={{ maxHeight: "1200px", overflowY: "auto" }}>
          <table className="table table-sm table-bordered table-hover">
            <thead className="table-dark sticky-top">
              <tr>
                <th className="text-center"/>
                <th className="fw-bold">
                  Col 1
                </th>
                <th className="fw-bold">
                  Col 2
                </th>
              </tr>
            </thead>
            <tbody>
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePrevious={() => {
            let _currentPage = currentPage - 1;

            setCurrentPage(_currentPage);
            setArgs({...args, page: _currentPage});
          }}
          handlePageClick={(i) => {
            console.log(`Page clicked: ${i}`);
            setCurrentPage(i);
            setArgs({...args, page: i});
          }}
          handleNext={() => {
            let _currentPage = currentPage + 1;
            setCurrentPage(_currentPage);
            setArgs({...args, page: _currentPage});
          }}
        />
      </div>
    </div>
  )
}
