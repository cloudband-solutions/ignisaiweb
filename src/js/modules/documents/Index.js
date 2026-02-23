import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminContent from "../../commons/AdminContent";
import Loader from "../../commons/Loader";
import Pagination from "../../Pagination";
import { getCurrentUser } from "../../services/AuthService";
import { listDocuments, listPublicDocuments } from "../../services/DocumentsService";

const formatBytes = (value) => {
  if (value == null || Number.isNaN(value)) return "-";
  if (value === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1
  );
  const size = value / Math.pow(1024, index);
  return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

export default DocumentsIndex = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const isAdmin = currentUser && currentUser.user_type === "admin";

  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadDocuments = async (page = currentPage, search = query) => {
    setIsLoading(true);
    try {
      const listFn = isAdmin ? listDocuments : listPublicDocuments;
      const response = await listFn({
        page,
        query: search || undefined,
      });
      setDocuments(response.data.records || []);
      setTotalPages(response.data.total_pages || 1);
      setCurrentPage(response.data.current_page || page);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Unable to load documents."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments(1, "");
  }, [isAdmin]);

  useEffect(() => {
    loadDocuments(currentPage, query);
  }, [currentPage]);

  const handleSearch = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    loadDocuments(1, query);
  };


  const typeOptions = Array.from(
    new Set(
      documents
        .map((document) => document.document_type)
        .filter((value) => value && value.trim() !== "")
    )
  ).sort();

  const statusOptions = Array.from(
    new Set(
      documents
        .map((document) => document.embedding_status)
        .filter((value) => value && value.trim() !== "")
    )
  ).sort();

  const filteredDocuments = documents.filter((document) => {
    const nameMatch = query
      ? (document.name || "").toLowerCase().includes(query.toLowerCase())
      : true;
    const typeMatch = typeFilter
      ? (document.document_type || "").toLowerCase() === typeFilter.toLowerCase()
      : true;
    const statusMatch = statusFilter
      ? (document.embedding_status || "").toLowerCase() === statusFilter.toLowerCase()
      : true;
    return nameMatch && typeMatch && statusMatch;
  });

  return (
    <AdminContent
      title="Documents"
      headerActions={
        isAdmin
          ? [
              <button
                key="new"
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => navigate("/documents/new")}
              >
                New Document
              </button>,
            ]
          : []
      }
    >
      <form className="mb-3" onSubmit={handleSearch}>
        <div className="row g-2">
          <div className="col-12 col-md-5">
            <input
              className="form-control"
              placeholder="Filter by name"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="col-12 col-md-3">
            <select
              className="form-select"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="">All document types</option>
              {typeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">All statuses</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-1 d-grid">
            <button className="btn btn-outline-secondary" type="submit">
              Search
            </button>
          </div>
        </div>
      </form>

      {isLoading && documents.length === 0 && <Loader />}

      {!isLoading && filteredDocuments.length === 0 && (
        <div className="alert alert-info mb-0">No documents found.</div>
      )}

      {filteredDocuments.length > 0 && (
        <div className="table-responsive" style={{ maxHeight: "1200px" }}>
          <table className="table table-sm table-bordered table-hover">
            <thead className="table-dark sticky-top">
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>File</th>
                <th>Size</th>
                <th>Status</th>
                <th>Download</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((document) => (
                <tr key={document.id}>
                  <td>
                    <div className="fw-bold">{document.name}</div>
                    {document.description && (
                      <div className="small text-muted">
                        {document.description}
                      </div>
                    )}
                  </td>
                  <td>{document.document_type || "-"}</td>
                  <td>{document.original_filename || "-"}</td>
                  <td>{formatBytes(document.size_bytes)}</td>
                  <td>
                    <div className="fw-bold">{document.embedding_status}</div>
                    {document.enqueue_error && (
                      <div className="small text-danger">
                        {document.enqueue_error}
                      </div>
                    )}
                    {document.embedding_error && (
                      <div className="small text-danger">
                        {document.embedding_error}
                      </div>
                    )}
                  </td>
                  <td>
                    {document.download_url ? (
                      <a
                        className="btn btn-sm btn-outline-secondary"
                        href={document.download_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download
                      </a>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="text-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => navigate(`/documents/${document.id}`)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger mt-3 mb-0">{errorMessage}</div>
      )}

      <div className="mt-3">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePrevious={() => {
            if (currentPage > 1) {
              setCurrentPage(currentPage - 1);
            }
          }}
          handlePageClick={(page) => {
            setCurrentPage(page);
          }}
          handleNext={() => {
            if (currentPage < totalPages) {
              setCurrentPage(currentPage + 1);
            }
          }}
        />
      </div>

    </AdminContent>
  );
};
