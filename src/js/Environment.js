import React, { useEffect, useState } from "react";
import AdminContent from "./commons/AdminContent";
import Loader from "./commons/Loader";
import { getCurrentUser } from "./services/AuthService";
import { fetchEnvironment } from "./services/SystemService";

export default Environment = () => {
  const currentUser = getCurrentUser();
  const isAdmin = currentUser && currentUser.user_type === "admin";
  const [envVars, setEnvVars] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isAdmin) return;
    let isMounted = true;
    const loadEnv = async () => {
      setIsLoading(true);
      try {
        const response = await fetchEnvironment();
        if (!isMounted) return;
        setEnvVars(response.data.env || {});
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          error?.response?.data?.message ||
            "Unable to load environment variables."
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadEnv();
    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <AdminContent title="Environment">
        <div className="alert alert-warning mb-0">
          You need admin access to view system environment settings.
        </div>
      </AdminContent>
    );
  }

  return (
    <AdminContent title="Environment">
      {isLoading && <Loader />}
      {errorMessage && (
        <div className="alert alert-danger mb-3">{errorMessage}</div>
      )}
      {!isLoading && !errorMessage && (
        <div className="table-responsive">
          <table className="table table-sm table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>Key</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(envVars).map(([key, value]) => (
                <tr key={key}>
                  <td className="fw-bold">{key}</td>
                  <td className="text-break">{String(value ?? "")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminContent>
  );
};
