import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminContent from "../../commons/AdminContent";
import { getCurrentUser } from "../../services/AuthService";
import { createDocument } from "../../services/DocumentsService";
import DocumentsForm from "./Form";

export default DocumentsNew = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const isAdmin = currentUser && currentUser.user_type === "admin";

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isAdmin) {
    return (
      <AdminContent title="New Document">
        <div className="alert alert-warning mb-0">
          You need admin access to manage documents.
        </div>
      </AdminContent>
    );
  }

  const handleCreate = async (formData) => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const response = await createDocument(formData);
      setSuccessMessage("Document created.");
      navigate(`/documents/${response.data.id}`);
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
    <AdminContent title="New Document">
      <DocumentsForm
        title="Create Document"
        onSubmit={handleCreate}
        onCancel={() => navigate("/documents")}
        isLoading={isLoading}
        errorMessage={errorMessage}
        successMessage={successMessage}
      />
    </AdminContent>
  );
};
