import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminContent from "../../commons/AdminContent";
import Loader from "../../commons/Loader";
import { getCurrentUser } from "../../services/AuthService";
import ConfirmationModal from "../../commons/ConfirmationModal";
import {
  deleteDocument,
  retryDocumentEnqueue,
  showDocument,
} from "../../services/DocumentsService";

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

export default DocumentsShow = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const currentUser = getCurrentUser();
  const isAdmin = currentUser && currentUser.user_type === "admin";

  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadDocument = async () => {
    setIsLoading(true);
    try {
      const response = await showDocument(id);
      setDocument(response.data);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Unable to load document."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadDocument();
    }
  }, [isAdmin, id]);

  if (!isAdmin) {
    return (
      <AdminContent title="Document">
        <div className="alert alert-warning mb-0">
          You need admin access to manage documents.
        </div>
      </AdminContent>
    );
  }

  if (isLoading && !document) {
    return (
      <AdminContent title="Document">
        <Loader />
      </AdminContent>
    );
  }

  if (!document) {
    return (
      <AdminContent title="Document">
        <div className="alert alert-danger mb-0">{errorMessage}</div>
      </AdminContent>
    );
  }

  const handleRetry = async () => {
    setIsRetrying(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await retryDocumentEnqueue(document.id);
      setSuccessMessage("Document re-enqueued for embedding.");
      await loadDocument();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Unable to re-enqueue document."
      );
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await deleteDocument(document.id);
      navigate("/documents");
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Unable to delete document."
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <AdminContent
      title={`Document: ${document.name}`}
      headerActions={[
        <button
          key="back"
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => navigate("/documents")}
        >
          Back to Documents
        </button>,
        <button
          key="edit"
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => navigate(`/documents/${document.id}/edit`)}
        >
          Edit
        </button>,
        <button
          key="retry"
          type="button"
          className="btn btn-sm btn-outline-warning"
          disabled={document.embedding_status !== "failed" || isRetrying}
          onClick={handleRetry}
        >
          {isRetrying ? "Retrying..." : "Re-enqueue"}
        </button>,
        <button
          key="delete"
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => setShowDeleteModal(true)}
        >
          Delete
        </button>,
      ]}
    >
      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-6">
          <div className="fw-bold">File Details</div>
          <div className="mt-2">
            <div className="small text-muted">Original Filename</div>
            <div>{document.original_filename || "-"}</div>
          </div>
          <div className="mt-2">
            <div className="small text-muted">Content Type</div>
            <div>{document.content_type || "-"}</div>
          </div>
          <div className="mt-2">
            <div className="small text-muted">Size</div>
            <div>{formatBytes(document.size_bytes)}</div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="fw-bold">Embedding Status</div>
          <div className="mt-2">{document.embedding_status}</div>
          {document.enqueue_error && (
            <div className="mt-2 text-danger small">
              {document.enqueue_error}
            </div>
          )}
          {document.embedding_error && (
            <div className="mt-2 text-danger small">
              {document.embedding_error}
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        show={showDeleteModal}
        header="Delete Document"
        content="Delete this document? This cannot be undone."
        isLoading={isDeleting}
        onPrimaryClicked={handleDelete}
        onSecondaryClicked={() => {
          if (!isDeleting) {
            setShowDeleteModal(false);
          }
        }}
      />
    </AdminContent>
  );
};
