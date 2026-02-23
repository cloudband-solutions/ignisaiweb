import React, { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faRobot, faUser } from "@fortawesome/free-solid-svg-icons";
import AdminContent from "./commons/AdminContent";
import Loader from "./commons/Loader";
import { inquire } from "./services/InquiriesService";
import { listPublicDocumentTypes } from "./services/DocumentsService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default Dashboard = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [documentTypes, setDocumentTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [topK, setTopK] = useState(5);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const bottomRef = useRef(null);

  const hasTypes = documentTypes.length > 0;

  const canSend = useMemo(() => {
    return input.trim().length > 0 && selectedTypes.length > 0 && !isLoading;
  }, [input, selectedTypes, isLoading]);

  useEffect(() => {
    let isMounted = true;
    const loadTypes = async () => {
      try {
        const response = await listPublicDocumentTypes();
        if (!isMounted) return;
        const types = response.data.document_types || [];
        setDocumentTypes(types);
        setSelectedTypes(types);
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          error?.response?.data?.message || "Unable to load document types."
        );
      }
    };
    loadTypes();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const formatLabel = (value) => {
    return value
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const toggleType = (type) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((item) => item !== type);
      }
      return [...prev, type];
    });
  };

  const handleSend = async () => {
    if (!canSend) return;
    const query = input.trim();
    const userMessage = { role: "user", content: query };
    const assistantMessage = { role: "assistant", content: "" };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await inquire({
        query,
        document_types: selectedTypes,
        k: Number(topK) || 5,
      });

      const reader = response.body?.getReader();
      if (!reader) {
        const fallback = await response.text();
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: fallback };
          return next;
        });
        return;
      }

      const decoder = new TextDecoder();
      let fullText = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: fullText };
          return next;
        });
      }
    } catch (error) {
      setMessages((prev) => prev.slice(0, -1));
      setErrorMessage(error.message || "Unable to complete inquiry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminContent title="Ask IgnisAI">
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div
            className="card border-0 shadow-sm d-flex flex-column"
            style={{ height: "calc(100vh - 220px)" }}
          >
            <div
              className="card-body d-flex flex-column"
              style={{ overflowY: "auto" }}
            >
              {messages.length === 0 && (
                <div className="text-center text-muted py-5">
                  <div className="mb-2 fw-bold">Start a conversation</div>
                  <div>
                    Ask about policies, procedures, or any document already
                    uploaded.
                  </div>
                </div>
              )}
              <div className="d-flex flex-column gap-3">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`d-flex ${
                      message.role === "user"
                        ? "justify-content-end"
                        : "justify-content-start"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-3 ${
                        message.role === "user"
                          ? "bg-primary text-white"
                          : "bg-light"
                      }`}
                      style={{ maxWidth: "80%" }}
                    >
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <FontAwesomeIcon
                          icon={message.role === "user" ? faUser : faRobot}
                        />
                        <span className="fw-bold text-uppercase small">
                          {message.role === "user" ? "You" : "Assistant"}
                        </span>
                      </div>
                      <div>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content ||
                            (message.role === "assistant" ? "..." : "")}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            </div>
            <div className="card-footer bg-white border-0">
              <div className="input-group">
                <input
                  className="form-control"
                  placeholder="Ask about the documents..."
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button
                  className="btn btn-primary"
                  type="button"
                  disabled={!canSend}
                  onClick={handleSend}
                >
                  <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                  Send
                </button>
              </div>
              {isLoading && (
                <div className="mt-2">
                  <Loader />
                </div>
              )}
              {errorMessage && (
                <div className="alert alert-danger mt-3 mb-0">
                  {errorMessage}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div
            className="card border-0 shadow-sm d-flex flex-column"
            style={{ height: "calc(100vh - 220px)" }}
          >
            <div className="card-body" style={{ overflowY: "auto" }}>
              <div className="fw-bold mb-2">Document Types</div>
              {!hasTypes && (
                <div className="text-muted small">
                  No document types configured.
                </div>
              )}
              {hasTypes && (
                <div className="d-flex flex-column gap-2">
                  {documentTypes.map((type) => (
                    <label className="form-check form-switch" key={type}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        checked={selectedTypes.includes(type)}
                        onChange={() => toggleType(type)}
                      />
                      <span className="form-check-label">{formatLabel(type)}</span>
                    </label>
                  ))}
                </div>
              )}
              <hr />
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary w-100 d-flex justify-content-between align-items-center"
                onClick={() => setIsAdvancedOpen((prev) => !prev)}
              >
                <span>Advanced Settings</span>
                <span>{isAdvancedOpen ? "−" : "+"}</span>
              </button>
              {isAdvancedOpen && (
                <div className="mt-3">
                  <label className="form-label">Top K</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={topK}
                    onChange={(event) => setTopK(event.target.value)}
                  />
                  <div className="form-text">
                    Controls how many document chunks to search.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminContent>
  );
}
