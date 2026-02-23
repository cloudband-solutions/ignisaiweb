import React, { useEffect, useRef, useState } from "react";
import Loader from "../../commons/Loader";
import { listDocumentTypes } from "../../services/DocumentsService";

const emptyForm = {
  name: "",
  description: "",
  document_type: "",
  file: null,
};

export default DocumentsForm = ({
  title,
  initialValues = emptyForm,
  isEditing = false,
  onSubmit,
  onCancel,
  isLoading,
  errorMessage,
  successMessage,
}) => {
  const fileInputRef = useRef(null);
  const [formState, setFormState] = useState({
    ...emptyForm,
    ...initialValues,
    file: null,
  });
  const [documentTypes, setDocumentTypes] = useState([]);
  const [typesError, setTypesError] = useState("");

  useEffect(() => {
    setFormState({
      ...emptyForm,
      ...initialValues,
      file: null,
    });
  }, [initialValues]);

  useEffect(() => {
    let isMounted = true;
    const loadTypes = async () => {
      try {
        const response = await listDocumentTypes();
        if (!isMounted) return;
        setDocumentTypes(response.data.document_types || []);
      } catch (error) {
        if (!isMounted) return;
        setTypesError(
          error?.response?.data?.message || "Unable to load document types."
        );
      }
    };
    loadTypes();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0];
    setFormState((prev) => ({
      ...prev,
      file: file || null,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = new FormData();
    payload.append("name", formState.name);
    payload.append("description", formState.description);
    payload.append("document_type", formState.document_type);
    if (formState.file) {
      payload.append("file", formState.file);
    }
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="fw-bold">{title}</div>
        {onCancel && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
      <div className="row g-3">
        <div className="col-12 col-lg-4">
          <label className="form-label">Name</label>
          <input
            className="form-control"
            name="name"
            value={formState.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-12 col-lg-4">
          <label className="form-label">Document Type</label>
          <select
            className="form-select"
            name="document_type"
            value={formState.document_type}
            onChange={handleChange}
          >
            <option value="">Select a type</option>
            {documentTypes.map((type) => (
              <option value={type} key={type}>
                {type}
              </option>
            ))}
          </select>
          {typesError && (
            <div className="form-text text-danger">{typesError}</div>
          )}
        </div>
        <div className="col-12 col-lg-4">
          <label className="form-label">Upload File</label>
          <input
            ref={fileInputRef}
            type="file"
            className="form-control"
            onChange={handleFileChange}
            required={!isEditing}
          />
          <div className="form-text">Allowed: pdf, txt, xlsx, pptx.</div>
        </div>
        <div className="col-12">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            name="description"
            value={formState.description}
            onChange={handleChange}
            rows={3}
          />
        </div>
      </div>
      <div className="mt-3 d-flex gap-2 align-items-center">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isEditing ? "Save Changes" : "Create Document"}
        </button>
        {isLoading && <Loader />}
      </div>
      {errorMessage && (
        <div className="alert alert-danger mt-3 mb-0">{errorMessage}</div>
      )}
      {successMessage && (
        <div className="alert alert-success mt-3 mb-0">{successMessage}</div>
      )}
    </form>
  );
};
