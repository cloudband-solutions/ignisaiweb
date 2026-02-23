import React, { useState } from "react";
import AdminContent from "./commons/AdminContent";
import Loader from "./commons/Loader";
import { getCurrentUser } from "./services/AuthService";
import { updateUser } from "./services/UsersService";

export default Settings = () => {
  const currentUser = getCurrentUser();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!currentUser) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!password || !passwordConfirmation) {
      setErrorMessage("Please enter and confirm your new password.");
      return;
    }

    if (password !== passwordConfirmation) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await updateUser(currentUser.id, {
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccessMessage("Password updated.");
      setPassword("");
      setPasswordConfirmation("");
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Unable to update password with current permissions."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminContent title="Settings">
      <form onSubmit={handleSubmit} className="col-12 col-lg-6">
        <div className="mb-3">
          <label className="form-label">New Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            className="form-control"
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div className="d-flex gap-2 align-items-center">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            Update Password
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
    </AdminContent>
  );
};
