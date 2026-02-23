import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminContent from "../../commons/AdminContent";
import Loader from "../../commons/Loader";
import { getCurrentUser } from "../../services/AuthService";
import { showDocument, updateDocument } from "../../services/DocumentsService";
import DocumentsForm from "./Form";

export default DocumentsEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const currentUser = getCurrentUser();
  const isAdmin = currentUser && currentUser.user_type === "admin";

  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
      <AdminContent title="Edit Document">
        <div className="alert alert-warning mb-0">
          You need admin access to manage documents.
        </div>
      </AdminContent>
    );
  }

  if (isLoading && !document) {
    return (
      <AdminContent title="Edit Document">
        <Loader />
      </AdminContent>
    );
  }

  if (!document) {
    return (
      <AdminContent title="Edit Document">
        <div className="alert alert-danger mb-0">{errorMessage}</div>
      </AdminContent>
    );
  }

  const handleUpdate = async (formData) => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await updateDocument(document.id, formData);
      setSuccessMessage("Document updated.");
      await loadDocument();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Something went wrong. Please check your input."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminContent
      title={`Edit Document: ${document.name}`}
      headerActions={[
        <button
          key="back"
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => navigate(`/documents/${document.id}`)}
        >
          Back to Document
        </button>,
      ]}
    >
      <DocumentsForm
        title="Edit Document"
        initialValues={{
          name: document.name || "",
          description: document.description || "",
          document_type: document.document_type || "",
        }}
        isEditing
        onSubmit={handleUpdate}
        onCancel={() => navigate(`/documents/${document.id}`)}
        isLoading={isLoading}
        errorMessage={errorMessage}
        successMessage={successMessage}
      />
    </AdminContent>
  );
};
