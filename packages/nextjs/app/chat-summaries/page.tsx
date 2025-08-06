"use client";

import React, { useRef, useState } from "react";
import { ChatSummary, useChatSummariesLocalOnly } from "../../hooks/useChatSummariesLocalOnly";
import folderAnimation from "../../public/folder-animation.json";
import { AnimatePresence, motion } from "framer-motion";
import Lottie from "lottie-react";
import { ArrowDownTrayIcon, DocumentTextIcon, MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline";

// Add CSS for spin animation
const spinAnimation = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject the CSS
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = spinAnimation;
  document.head.appendChild(style);
}

const ChatSummariesPage = () => {
  const {
    summaries,
    loading,
    error,
    deleteSummary,
    updateSummary,
    exportSummary,
    exportAllSummaries,
    clearAllSummaries,
  } = useChatSummariesLocalOnly();

  const [selectedSummary, setSelectedSummary] = useState<ChatSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const lottieRef = useRef<any>(null);

  // Hardcoded example summaries for demonstration
  const exampleSummaries: ChatSummary[] = [
    {
      id: "1",
      date: "2025-01-15",
      summary:
        "Discussed blockchain development and smart contract implementation. User asked about Solidity best practices and gas optimization techniques. Covered topics like ERC-20 tokens, DeFi protocols, and Web3 integration.",
      messageCount: 12,
      participants: ["User", "System", "Alice"],
      tags: ["blockchain", "solidity", "defi"],
      createdAt: "2025-01-15T10:30:00Z",
    },
    {
      id: "2",
      date: "2025-01-14",
      summary:
        "Chat about React development and Next.js framework. Explored component architecture, state management with hooks, and performance optimization. User was building a dApp frontend.",
      messageCount: 8,
      participants: ["User", "System"],
      tags: ["react", "nextjs", "frontend"],
      createdAt: "2025-01-14T14:20:00Z",
    },
    {
      id: "3",
      date: "2025-01-13",
      summary:
        "Conversation about AI and machine learning applications in crypto. Discussed predictive models for trading, sentiment analysis, and automated trading bots. User interested in ML integration.",
      messageCount: 15,
      participants: ["User", "System", "Bob"],
      tags: ["ai", "machine learning", "trading"],
      createdAt: "2025-01-13T09:15:00Z",
    },
    {
      id: "4",
      date: "2025-01-12",
      summary:
        "NFT marketplace development discussion. Covered metadata standards, IPFS storage, minting processes, and marketplace UI/UX design. User planning to launch NFT collection.",
      messageCount: 10,
      participants: ["User", "System"],
      tags: ["nft", "ipfs", "marketplace"],
      createdAt: "2025-01-12T16:45:00Z",
    },
    {
      id: "5",
      date: "2025-01-11",
      summary:
        "General web3 development chat. Topics included wallet integration, MetaMask connection, transaction signing, and error handling. User building their first dApp.",
      messageCount: 6,
      participants: ["User", "System"],
      tags: ["web3", "metamask", "dapp"],
      createdAt: "2025-01-11T11:30:00Z",
    },
  ];

  // Use example summaries if no real summaries exist
  const displaySummaries = summaries.length > 0 ? summaries : exampleSummaries;

  const handleDeleteSummary = async (id: string) => {
    await deleteSummary(id);
    if (selectedSummary?.id === id) {
      setSelectedSummary(null);
    }
  };

  const filteredSummaries = displaySummaries.filter((summary: ChatSummary) => {
    const matchesSearch =
      summary.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.date.includes(searchTerm) ||
      summary.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTag = !filterTag || summary.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  const allTags: string[] = Array.from(new Set(displaySummaries.flatMap((s: ChatSummary) => s.tags)));

  const handleFolderClick = () => {
    if (isAnimating) return; // Prevent multiple clicks during animation

    setIsAnimating(true);

    if (!isFolderOpen) {
      setIsFolderOpen(true);
      if (lottieRef.current) {
        // Play the opening animation (first half of the animation)
        lottieRef.current.playSegments([0, 50], true);
      }
    } else {
      setIsFolderOpen(false);
      if (lottieRef.current) {
        // Play the closing animation (second half in reverse)
        lottieRef.current.playSegments([50, 0], true);
      }
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"Inter", "system-ui", sans-serif',
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              border: "4px solid #6c757d",
              borderTop: "4px solid transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          ></div>
          <p style={{ color: "#6c757d", fontSize: "18px" }}>Loading summaries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"Inter", "system-ui", sans-serif',
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#dc3545", marginBottom: "16px", fontSize: "18px" }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "8px 16px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%)",
        fontFamily: '"Inter", "system-ui", sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
          borderBottom: "1px solid #90caf9",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#1565c0",
              margin: 0,
            }}
          >
            Chat Summaries
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MagnifyingGlassIcon style={{ width: "20px", height: "20px", color: "#1565c0" }} />
          </button>
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 73px)" }}>
        {/* Main Content - Interactive Folder */}
        <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
          <div
            style={{
              maxWidth: "1000px",
              margin: "0 auto",
              position: "relative",
            }}
          >
            {/* Folder Animation Container */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "24px",
              }}
            >
              {/* Clickable Folder Animation */}
              <div
                style={{
                  cursor: "pointer",
                  transition: "transform 0.2s ease",
                  transform: isFolderOpen ? "scale(1.05)" : "scale(1)",
                }}
                onClick={handleFolderClick}
                onMouseEnter={e => {
                  if (!isFolderOpen) {
                    e.currentTarget.style.transform = "scale(1.02)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isFolderOpen) {
                    e.currentTarget.style.transform = "scale(1)";
                  }
                }}
              >
                <div
                  style={{
                    width: "300px",
                    height: "300px",
                    position: "relative",
                  }}
                >
                  <Lottie
                    lottieRef={lottieRef}
                    animationData={folderAnimation}
                    loop={false}
                    autoplay={false}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                    onComplete={() => {
                      setIsAnimating(false);
                    }}
                  />
                </div>
                <p
                  style={{
                    textAlign: "center",
                    color: isAnimating ? "#007bff" : "#6c757d",
                    fontSize: "16px",
                    fontWeight: "500",
                    marginTop: "12px",
                    transition: "color 0.2s",
                  }}
                >
                  {isAnimating ? "Animating..." : isFolderOpen ? "Click to close folder" : "Click to open folder"}
                </p>
              </div>

              {/* Summaries Container */}
              <AnimatePresence>
                {isFolderOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    style={{
                      width: "100%",
                      maxWidth: "800px",
                      background: "linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%)",
                      borderRadius: "12px",
                      boxShadow: "0 8px 32px rgba(33, 150, 243, 0.15)",
                      border: "1px solid #90caf9",
                      overflow: "hidden",
                    }}
                  >
                    {/* Summaries Header */}
                    <div
                      style={{
                        padding: "20px 24px",
                        borderBottom: "1px solid #90caf9",
                        background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                        borderRadius: "12px 12px 0 0",
                      }}
                    >
                      <h2
                        style={{
                          fontSize: "20px",
                          fontWeight: "600",
                          color: "#1565c0",
                          margin: "0 0 16px 0",
                        }}
                      >
                        Chat Summaries ({filteredSummaries.length})
                      </h2>

                      {/* Search Bar */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                          marginBottom: "16px",
                        }}
                      >
                        {/* Search Input */}
                        <div
                          style={{
                            position: "relative",
                          }}
                        >
                          <input
                            type="text"
                            placeholder="Search summaries..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "12px 16px 12px 40px",
                              border: "1px solid #dee2e6",
                              borderRadius: "8px",
                              fontSize: "14px",
                              fontFamily: "inherit",
                              background: "white",
                              color: "#212529",
                              outline: "none",
                              transition: "border-color 0.2s",
                            }}
                            onFocus={e => {
                              e.target.style.borderColor = "#007bff";
                            }}
                            onBlur={e => {
                              e.target.style.borderColor = "#dee2e6";
                            }}
                          />
                          <MagnifyingGlassIcon
                            style={{
                              position: "absolute",
                              left: "12px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: "16px",
                              height: "16px",
                              color: "#6c757d",
                            }}
                          />
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm("")}
                              style={{
                                position: "absolute",
                                right: "8px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: "4px",
                                borderRadius: "4px",
                                color: "#6c757d",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              onMouseEnter={e => ((e.target as HTMLButtonElement).style.color = "#dc3545")}
                              onMouseLeave={e => ((e.target as HTMLButtonElement).style.color = "#6c757d")}
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Filter Dropdown */}
                        <select
                          value={filterTag}
                          onChange={e => setFilterTag(e.target.value)}
                          style={{
                            padding: "12px 16px",
                            border: "1px solid #dee2e6",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontFamily: "inherit",
                            background: "white",
                            color: "#212529",
                            outline: "none",
                            cursor: "pointer",
                            width: "100%",
                          }}
                        >
                          <option value="">All tags</option>
                          {allTags.map(tag => (
                            <option key={tag} value={tag}>
                              {tag}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "16px",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "14px",
                            color: "#6c757d",
                            margin: 0,
                          }}
                        >
                          Scroll through your saved chat summaries
                        </p>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          {(searchTerm || filterTag) && (
                            <span
                              style={{
                                fontSize: "12px",
                                color: "#007bff",
                                fontWeight: "500",
                                padding: "4px 8px",
                                background: "#e3f2fd",
                                borderRadius: "12px",
                              }}
                            >
                              {filteredSummaries.length} result{filteredSummaries.length !== 1 ? "s" : ""}
                            </span>
                          )}
                          <button
                            onClick={exportAllSummaries}
                            style={{
                              background: "#90caf9",
                              color: "#1565c0",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "600",
                              padding: "6px 12px",
                              cursor: "pointer",
                              fontFamily: "inherit",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <ArrowDownTrayIcon style={{ width: "12px", height: "12px" }} />
                            Export All
                          </button>
                          <button
                            onClick={clearAllSummaries}
                            style={{
                              background: "#ffcdd2",
                              color: "#c62828",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "500",
                              padding: "6px 12px",
                              cursor: "pointer",
                              fontFamily: "inherit",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <TrashIcon style={{ width: "12px", height: "12px" }} />
                            Clear All
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Scrollable Summaries List */}
                    <div
                      style={{
                        maxHeight: "400px",
                        overflowY: "auto",
                        padding: "16px",
                        background: "linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%)",
                      }}
                    >
                      {filteredSummaries.length === 0 ? (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "40px 20px",
                            color: "#6c757d",
                          }}
                        >
                          <DocumentTextIcon
                            style={{
                              width: "48px",
                              height: "48px",
                              color: "#dee2e6",
                              margin: "0 auto 16px",
                            }}
                          />
                          <h3
                            style={{
                              fontSize: "18px",
                              fontWeight: "500",
                              margin: "0 0 8px 0",
                            }}
                          >
                            No summaries found
                          </h3>
                          <p style={{ fontSize: "14px", margin: 0 }}>
                            {searchTerm || filterTag
                              ? "Try adjusting your search or filters"
                              : "Create your first summary to get started"}
                          </p>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          {filteredSummaries.map((summary: ChatSummary, index: number) => (
                            <motion.div
                              key={`folder-${summary.id}-${index}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                              style={{
                                padding: "16px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                background:
                                  selectedSummary?.id === summary.id
                                    ? "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)"
                                    : "linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%)",
                                border: selectedSummary?.id === summary.id ? "1px solid #2196f3" : "1px solid #dee2e6",
                                boxShadow:
                                  selectedSummary?.id === summary.id
                                    ? "0 4px 12px rgba(33, 150, 243, 0.15)"
                                    : "0 2px 4px rgba(0,0,0,0.05)",
                              }}
                              onClick={() => setSelectedSummary(summary)}
                              onMouseEnter={e => {
                                if (selectedSummary?.id !== summary.id) {
                                  e.currentTarget.style.background =
                                    "linear-gradient(135deg, #e8f4fd 0%, #d4e6f7 100%)";
                                }
                              }}
                              onMouseLeave={e => {
                                if (selectedSummary?.id !== summary.id) {
                                  e.currentTarget.style.background =
                                    "linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%)";
                                }
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                                  <DocumentTextIcon
                                    style={{
                                      width: "20px",
                                      height: "20px",
                                      color: selectedSummary?.id === summary.id ? "#2196f3" : "#6c757d",
                                    }}
                                  />
                                  <div style={{ flex: 1 }}>
                                    <h3
                                      style={{
                                        fontSize: "16px",
                                        fontWeight: "600",
                                        color: "#212529",
                                        margin: "0 0 4px 0",
                                      }}
                                    >
                                      {summary.title || `Chat Summary ${index + 1}`}
                                    </h3>
                                    <p
                                      style={{
                                        fontSize: "14px",
                                        color: "#6c757d",
                                        margin: "0 0 8px 0",
                                      }}
                                    >
                                      {summary.date} • {summary.messageCount} messages
                                    </p>
                                    <p
                                      style={{
                                        fontSize: "13px",
                                        color: "#495057",
                                        lineHeight: "1.4",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                      }}
                                    >
                                      {summary.summary}
                                    </p>
                                  </div>
                                </div>

                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      exportSummary(summary);
                                    }}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      padding: "4px",
                                      borderRadius: "4px",
                                      color: "#6c757d",
                                      transition: "color 0.2s",
                                    }}
                                    onMouseEnter={e => ((e.target as HTMLButtonElement).style.color = "#007bff")}
                                    onMouseLeave={e => ((e.target as HTMLButtonElement).style.color = "#6c757d")}
                                  >
                                    <ArrowDownTrayIcon style={{ width: "16px", height: "16px" }} />
                                  </button>
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleDeleteSummary(summary.id);
                                    }}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      padding: "4px",
                                      borderRadius: "4px",
                                      color: "#6c757d",
                                      transition: "color 0.2s",
                                    }}
                                    onMouseEnter={e => ((e.target as HTMLButtonElement).style.color = "#dc3545")}
                                    onMouseLeave={e => ((e.target as HTMLButtonElement).style.color = "#6c757d")}
                                  >
                                    <TrashIcon style={{ width: "16px", height: "16px" }} />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Summary Details Panel */}
        {selectedSummary && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            style={{
              width: "400px",
              background: "white",
              borderLeft: "1px solid #dee2e6",
              padding: "24px",
              overflowY: "auto",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#212529",
                  margin: 0,
                }}
              >
                Summary Details
              </h2>
              <button
                onClick={() => setSelectedSummary(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: "4px",
                  color: "#6c757d",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#495057",
                    marginBottom: "8px",
                  }}
                >
                  Title
                </label>
                <input
                  type="text"
                  value={selectedSummary.title || ""}
                  onChange={e => updateSummary(selectedSummary.id, { title: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #dee2e6",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    background: "#f8f9fa",
                    color: "#212529",
                    outline: "none",
                  }}
                  placeholder="Enter a title for this summary..."
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#495057",
                    marginBottom: "8px",
                  }}
                >
                  Summary
                </label>
                <textarea
                  value={selectedSummary.summary}
                  onChange={e => updateSummary(selectedSummary.id, { summary: e.target.value })}
                  style={{
                    width: "100%",
                    height: "120px",
                    padding: "12px 16px",
                    border: "1px solid #dee2e6",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    background: "#f8f9fa",
                    color: "#212529",
                    outline: "none",
                    resize: "none",
                  }}
                  placeholder="Enter your chat summary..."
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#495057",
                      marginBottom: "8px",
                    }}
                  >
                    Message Count
                  </label>
                  <input
                    type="number"
                    value={selectedSummary.messageCount}
                    onChange={e => updateSummary(selectedSummary.id, { messageCount: parseInt(e.target.value) || 0 })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #dee2e6",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      background: "#f8f9fa",
                      color: "#212529",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#495057",
                      marginBottom: "8px",
                    }}
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedSummary.date}
                    onChange={e => updateSummary(selectedSummary.id, { date: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #dee2e6",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      background: "#f8f9fa",
                      color: "#212529",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#495057",
                    marginBottom: "8px",
                  }}
                >
                  Participants
                </label>
                <input
                  type="text"
                  value={selectedSummary.participants.join(", ")}
                  onChange={e =>
                    updateSummary(selectedSummary.id, {
                      participants: e.target.value
                        .split(",")
                        .map(p => p.trim())
                        .filter(p => p),
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #dee2e6",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    background: "#f8f9fa",
                    color: "#212529",
                    outline: "none",
                  }}
                  placeholder="Enter participants separated by commas"
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#495057",
                    marginBottom: "8px",
                  }}
                >
                  Tags
                </label>
                <input
                  type="text"
                  value={selectedSummary.tags.join(", ")}
                  onChange={e =>
                    updateSummary(selectedSummary.id, {
                      tags: e.target.value
                        .split(",")
                        .map(t => t.trim())
                        .filter(t => t),
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #dee2e6",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    background: "#f8f9fa",
                    color: "#212529",
                    outline: "none",
                  }}
                  placeholder="Enter tags separated by commas"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChatSummariesPage;
