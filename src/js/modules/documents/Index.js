import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminContent from "../../commons/AdminContent";
import ConfirmationModal from "../../commons/ConfirmationModal";
import Loader from "../../commons/Loader";
import Pagination from "../../Pagination";
import { getCurrentUser } from "../../services/AuthService";
import { deleteDocument, listDocuments } from "../../services/DocumentsService";

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
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState("");

  const loadDocuments = async (page = currentPage, search = query) => {
    setIsLoading(true);
    try {
      const response = await listDocuments({
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
    if (isAdmin) {
      loadDocuments(1, "");
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      loadDocuments(currentPage, query);
    }
  }, [currentPage]);

  const handleSearch = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    loadDocuments(1, query);
  };

  const confirmDelete = (document) => {
    setConfirmDeleteId(document.id);
    setConfirmDeleteName(document.name || "this document");
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await deleteDocument(confirmDeleteId);
      setSuccessMessage("Document deleted.");
      setConfirmDeleteId(null);
      setConfirmDeleteName("");
      loadDocuments(1, query);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Unable to delete document."
      );
    } finally {
      setIsDeleting(false);
    }
  };

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
        <div className="input-group">
          <input
            className="form-control"
            placeholder="Search by name"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className="btn btn-outline-secondary" type="submit">
            Search
          </button>
        </div>
      </form>

      {isLoading && documents.length === 0 && <Loader />}

      {!isLoading && documents.length === 0 && (
        <div className="alert alert-info mb-0">No documents found.</div>
      )}

      {documents.length > 0 && (
        <div className="table-responsive" style={{ maxHeight: "1200px" }}>
          <table className="table table-sm table-bordered table-hover">
            <thead className="table-dark sticky-top">
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>File</th>
                <th>Size</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
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
                  <td className="text-center">
                    {isAdmin ? (
                      <div className="btn-group">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => navigate(`/documents/${document.id}`)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => confirmDelete(document)}
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span className="text-muted">Restricted</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success mt-3 mb-0">{successMessage}</div>
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

      <ConfirmationModal
        show={!!confirmDeleteId}
        header="Delete Document"
        content={`Delete ${confirmDeleteName}? This cannot be undone.`}
        isLoading={isDeleting}
        onPrimaryClicked={handleDelete}
        onSecondaryClicked={() => {
          if (!isDeleting) {
            setConfirmDeleteId(null);
            setConfirmDeleteName("");
          }
        }}
      />
    </AdminContent>
  );
};
