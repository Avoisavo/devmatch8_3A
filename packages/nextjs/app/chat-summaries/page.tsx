"use client";

import React, { useRef, useState } from "react";
import SkyBackground from "../../components/livingroom/SkyBackground";
import { useChatSummariesLocalOnly } from "../../hooks/useChatSummariesLocalOnly";
import folderAnimation from "../../public/folder-animation.json";
import { AnimatePresence, motion } from "framer-motion";
import Lottie from "lottie-react";
import { ArrowDownTrayIcon, CalendarIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

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

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  summary: string;
  messageCount: number;
  participants: string[];
  tags: string[];
  createdAt: string;
}

const ChatSummariesPage = () => {
  const { summaries, loading, error, deleteSummary, exportSummary } = useChatSummariesLocalOnly();

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [julyFolderOpen, setJulyFolderOpen] = useState(false);
  const [augustFolderOpen, setAugustFolderOpen] = useState(false);
  const [julyAnimating, setJulyAnimating] = useState(false);
  const [augustAnimating, setAugustAnimating] = useState(false);
  const julyLottieRef = useRef<any>(null);
  const augustLottieRef = useRef<any>(null);

  // Hardcoded example events for demonstration
  const exampleEvents: CalendarEvent[] = [
    {
      id: "1",
      date: "2025-07-15",
      title: "Blockchain Development Chat",
      summary:
        "Discussed blockchain development and smart contract implementation. User asked about Solidity best practices and gas optimization techniques.",
      messageCount: 12,
      participants: ["User", "System", "Alice"],
      tags: ["blockchain", "solidity", "defi"],
      createdAt: "2025-07-15T10:30:00Z",
    },
    {
      id: "2",
      date: "2025-07-14",
      title: "React Development Session",
      summary:
        "Chat about React development and Next.js framework. Explored component architecture, state management with hooks, and performance optimization.",
      messageCount: 8,
      participants: ["User", "System"],
      tags: ["react", "nextjs", "frontend"],
      createdAt: "2025-07-14T14:20:00Z",
    },
    {
      id: "3",
      date: "2025-08-13",
      title: "AI and ML in Crypto",
      summary:
        "Conversation about AI and machine learning applications in crypto. Discussed predictive models for trading, sentiment analysis, and automated trading bots.",
      messageCount: 15,
      participants: ["User", "System", "Bob"],
      tags: ["ai", "machine learning", "trading"],
      createdAt: "2025-08-13T09:15:00Z",
    },
    {
      id: "4",
      date: "2025-08-12",
      title: "NFT Marketplace Development",
      summary:
        "NFT marketplace development discussion. Covered metadata standards, IPFS storage, minting processes, and marketplace UI/UX design.",
      messageCount: 10,
      participants: ["User", "System"],
      tags: ["nft", "ipfs", "marketplace"],
      createdAt: "2025-08-12T16:45:00Z",
    },
    {
      id: "5",
      date: "2025-08-11",
      title: "Web3 Development Chat",
      summary:
        "General web3 development chat. Topics included wallet integration, MetaMask connection, transaction signing, and error handling.",
      messageCount: 6,
      participants: ["User", "System"],
      tags: ["web3", "metamask", "dapp"],
      createdAt: "2025-08-11T11:30:00Z",
    },
  ];

  // Use example events if no real summaries exist
  const displayEvents =
    summaries.length > 0
      ? summaries.map(s => ({
          id: s.id,
          date: s.date,
          title: s.title || `Chat Summary ${s.id}`,
          summary: s.summary,
          messageCount: s.messageCount,
          participants: s.participants,
          tags: s.tags,
          createdAt: s.createdAt,
        }))
      : exampleEvents;

  const julyEvents = displayEvents
    .filter(event => new Date(event.date).getMonth() === 6) // July is month 6
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Latest first
  const augustEvents = displayEvents
    .filter(event => new Date(event.date).getMonth() === 7) // August is month 7
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Latest first

  const handleJulyFolderClick = () => {
    if (julyAnimating) return;

    setJulyAnimating(true);

    if (!julyFolderOpen) {
      setJulyFolderOpen(true);
      if (julyLottieRef.current) {
        julyLottieRef.current.playSegments([0, 50], true);
      }
    } else {
      setJulyFolderOpen(false);
      if (julyLottieRef.current) {
        julyLottieRef.current.playSegments([50, 0], true);
      }
    }
  };

  const handleAugustFolderClick = () => {
    console.log("August folder clicked, current state:", { augustAnimating, augustFolderOpen });
    if (augustAnimating) return;

    setAugustAnimating(true);

    if (!augustFolderOpen) {
      console.log("Opening August folder");
      setAugustFolderOpen(true);
      if (augustLottieRef.current) {
        augustLottieRef.current.playSegments([0, 50], true);
      } else {
        console.log("August Lottie ref not available");
      }
    } else {
      console.log("Closing August folder");
      setAugustFolderOpen(false);
      if (augustLottieRef.current) {
        augustLottieRef.current.playSegments([50, 0], true);
      } else {
        console.log("August Lottie ref not available");
      }
    }
  };

  const handleJulyCalendarClose = () => {
    setJulyFolderOpen(false);
    if (julyLottieRef.current) {
      julyLottieRef.current.playSegments([50, 0], true);
    }
  };

  const handleAugustCalendarClose = () => {
    console.log("Closing August calendar");
    setAugustFolderOpen(false);
    if (augustLottieRef.current) {
      augustLottieRef.current.playSegments([50, 0], true);
    } else {
      console.log("August Lottie ref not available for closing");
    }
  };

  const handleFileClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowCalendar(true);
  };

  const closeCalendar = () => {
    setShowCalendar(false);
    setSelectedEvent(null);
  };

  const generateCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    while (currentDate <= lastDay || days.length < 42) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
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
        fontFamily: '"Inter", "system-ui", sans-serif',
        position: "relative",
      }}
    >
      {/* Sky Background */}
      <div className="absolute inset-0 z-0">
        <SkyBackground />
      </div>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
          borderBottom: "1px solid #90caf9",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 10,
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
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 73px)", position: "relative", zIndex: 10 }}>
        {/* Main Content - Monthly Folders */}
        <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
          <div
            style={{
              maxWidth: "1000px",
              margin: "0 auto",
              position: "relative",
            }}
          >
            {/* Monthly Folders Container */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "24px",
              }}
            >
              {/* Header */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "32px",
                }}
              >
                <h2
                  style={{
                    fontSize: "28px",
                    fontWeight: "600",
                    color: "#1565c0",
                    margin: "0 0 12px 0",
                  }}
                >
                  Monthly Folders
                </h2>
                <p
                  style={{
                    fontSize: "16px",
                    color: "#6c757d",
                    margin: 0,
                  }}
                >
                  Click on a folder to view the calendar for that month
                </p>
              </div>

              {/* Monthly Folders */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                  gap: "48px",
                  width: "100%",
                  maxWidth: "900px",
                }}
              >
                {/* July Folder */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      cursor: "pointer",
                      transition: "transform 0.2s ease",
                      transform: julyFolderOpen ? "scale(1.05)" : "scale(1)",
                    }}
                    onClick={handleJulyFolderClick}
                    onMouseEnter={e => {
                      if (!julyFolderOpen) {
                        e.currentTarget.style.transform = "scale(1.02)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!julyFolderOpen) {
                        e.currentTarget.style.transform = "scale(1)";
                      }
                    }}
                  >
                    <div
                      style={{
                        width: "200px",
                        height: "200px",
                        position: "relative",
                      }}
                    >
                      <Lottie
                        lottieRef={julyLottieRef}
                        animationData={folderAnimation}
                        loop={false}
                        autoplay={false}
                        style={{
                          width: "100%",
                          height: "100%",
                        }}
                        onComplete={() => {
                          setJulyAnimating(false);
                        }}
                      />
                    </div>
                    <p
                      style={{
                        textAlign: "center",
                        color: julyAnimating ? "#ff9800" : "#e65100",
                        fontSize: "16px",
                        fontWeight: "500",
                        marginTop: "12px",
                        transition: "color 0.2s",
                      }}
                    >
                      {julyFolderOpen ? "Click to close folder" : "Click to open folder"}
                    </p>
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "24px",
                        fontWeight: "600",
                        color: "#e65100",
                        margin: "0 0 8px 0",
                      }}
                    >
                      July 2025
                    </h3>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#f57c00",
                        margin: 0,
                      }}
                    >
                      {julyEvents.length} chat summaries
                    </p>
                  </div>
                </motion.div>

                {/* August Folder */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      cursor: "pointer",
                      transition: "transform 0.2s ease",
                      transform: augustFolderOpen ? "scale(1.05)" : "scale(1)",
                    }}
                    onClick={handleAugustFolderClick}
                    onMouseEnter={e => {
                      if (!augustFolderOpen) {
                        e.currentTarget.style.transform = "scale(1.02)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!augustFolderOpen) {
                        e.currentTarget.style.transform = "scale(1)";
                      }
                    }}
                  >
                    <div
                      style={{
                        width: "200px",
                        height: "200px",
                        position: "relative",
                      }}
                    >
                      <Lottie
                        lottieRef={augustLottieRef}
                        animationData={folderAnimation}
                        loop={false}
                        autoplay={false}
                        style={{
                          width: "100%",
                          height: "100%",
                        }}
                        onComplete={() => {
                          setAugustAnimating(false);
                        }}
                      />
                    </div>
                    <p
                      style={{
                        textAlign: "center",
                        color: augustAnimating ? "#4caf50" : "#2e7d32",
                        fontSize: "16px",
                        fontWeight: "500",
                        marginTop: "12px",
                        transition: "color 0.2s",
                      }}
                    >
                      {augustFolderOpen ? "Click to close folder" : "Click to open folder"}
                    </p>
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "24px",
                        fontWeight: "600",
                        color: "#2e7d32",
                        margin: "0 0 8px 0",
                      }}
                    >
                      August 2025
                    </h3>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#388e3c",
                        margin: 0,
                      }}
                    >
                      {augustEvents.length} chat summaries
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Calendar Popup for July */}
              <AnimatePresence>
                {julyFolderOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "rgba(0, 0, 0, 0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 1000,
                    }}
                    onClick={handleJulyCalendarClose}
                  >
                    <motion.div
                      style={{
                        background: "rgba(255, 255, 255, 0.7)",
                        backdropFilter: "blur(20px)",
                        borderRadius: "12px",
                        padding: "24px",
                        maxWidth: "800px",
                        width: "90%",
                        maxHeight: "80vh",
                        overflowY: "auto",
                        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "20px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <CalendarIcon style={{ width: "24px", height: "24px", color: "#ff9800" }} />
                          <h2
                            style={{
                              fontSize: "20px",
                              fontWeight: "600",
                              color: "#212529",
                              margin: 0,
                            }}
                          >
                            July 2025 Calendar
                          </h2>
                        </div>
                        <button
                          onClick={handleJulyCalendarClose}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "8px",
                            borderRadius: "4px",
                            color: "#6c757d",
                          }}
                        >
                          <XMarkIcon style={{ width: "20px", height: "20px" }} />
                        </button>
                      </div>

                      {/* Calendar Grid */}
                      <div style={{ marginBottom: "24px" }}>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(7, 1fr)",
                            gap: "4px",
                            marginBottom: "16px",
                          }}
                        >
                          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                            <div
                              key={day}
                              style={{
                                textAlign: "center",
                                fontSize: "14px",
                                fontWeight: "700",
                                color: "#212529",
                                padding: "8px",
                              }}
                            >
                              {day}
                            </div>
                          ))}
                          {generateCalendarDays(2025, 6).map((date, index) => {
                            const isCurrentMonth = date.getMonth() === 6;
                            const dayEvents = julyEvents.filter(
                              event => date.toISOString().split("T")[0] === event.date,
                            );
                            const isEventDate = dayEvents.length > 0;
                            const isToday = date.toDateString() === new Date().toDateString();
                            const eventCount = dayEvents.length;

                            return (
                              <div
                                key={index}
                                style={{
                                  aspectRatio: "1",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "12px",
                                  fontWeight: isEventDate ? "600" : "400",
                                  color: isCurrentMonth ? (isEventDate ? "white" : "#212529") : "#6c757d",
                                  background: isEventDate
                                    ? "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)"
                                    : isToday
                                      ? "#fff3e0"
                                      : "transparent",
                                  borderRadius: "6px",
                                  cursor: isEventDate ? "pointer" : "default",
                                  border: isToday && !isEventDate ? "2px solid #ff9800" : "none",
                                  position: "relative",
                                }}
                                onClick={() => {
                                  if (isEventDate) {
                                    const event = dayEvents[0]; // Open first event by default
                                    if (event) {
                                      handleFileClick(event);
                                      handleJulyCalendarClose();
                                    }
                                  }
                                }}
                              >
                                <span>{date.getDate()}</span>
                                {eventCount > 0 && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: "4px",
                                      left: "4px",
                                      display: "flex",
                                      gap: "4px",
                                      flexWrap: "wrap",
                                      maxWidth: "calc(100% - 8px)",
                                    }}
                                  >
                                    {dayEvents.map((event, i) => {
                                      // Calculate if this dot would fit in the available space
                                      const dotWidth = 8;
                                      const gap = 4;
                                      const maxDotsPerRow = Math.floor(
                                        (window.innerWidth * 0.8 - 8) / (dotWidth + gap),
                                      );
                                      const row = Math.floor(i / maxDotsPerRow);
                                      const maxRows = 2; // Maximum 2 rows of dots

                                      // If this dot would be in the 3rd row or beyond, show +X instead
                                      if (row >= maxRows) {
                                        const remainingCount = dayEvents.length - maxRows * maxDotsPerRow;
                                        return (
                                          <div
                                            key={`more-${i}`}
                                            style={{
                                              width: "8px",
                                              height: "8px",
                                              borderRadius: "50%",
                                              background: isEventDate ? "white" : "#ff9800",
                                              cursor: "pointer",
                                              transition: "all 0.2s ease",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              fontSize: "5px",
                                              fontWeight: "600",
                                            }}
                                            onMouseEnter={e => {
                                              e.currentTarget.style.transform = "scale(1.2)";
                                              e.currentTarget.style.boxShadow = "0 2px 4px rgba(255, 152, 0, 0.3)";
                                            }}
                                            onMouseLeave={e => {
                                              e.currentTarget.style.transform = "scale(1)";
                                              e.currentTarget.style.boxShadow = "none";
                                            }}
                                            onClick={e => {
                                              e.stopPropagation();
                                              // Show the first remaining event
                                              const remainingEvents = dayEvents.slice(maxRows * maxDotsPerRow);
                                              if (remainingEvents.length > 0) {
                                                handleFileClick(remainingEvents[0]);
                                                handleJulyCalendarClose();
                                              }
                                            }}
                                            title={`${remainingCount} more summaries`}
                                          >
                                            +{remainingCount}
                                          </div>
                                        );
                                      }

                                      return (
                                        <div
                                          key={i}
                                          style={{
                                            width: "8px",
                                            height: "8px",
                                            borderRadius: "50%",
                                            background: isEventDate ? "white" : "#ff9800",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",
                                            position: "relative",
                                          }}
                                          onMouseEnter={e => {
                                            e.currentTarget.style.transform = "scale(1.2)";
                                            e.currentTarget.style.boxShadow = "0 2px 4px rgba(255, 152, 0, 0.3)";
                                          }}
                                          onMouseLeave={e => {
                                            e.currentTarget.style.transform = "scale(1)";
                                            e.currentTarget.style.boxShadow = "none";
                                          }}
                                          onClick={e => {
                                            e.stopPropagation();
                                            handleFileClick(event);
                                            handleJulyCalendarClose();
                                          }}
                                          title={
                                            event.summary.length > 100
                                              ? event.summary.substring(0, 100) + "..."
                                              : event.summary
                                          }
                                        />
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Calendar Popup for August */}
              <AnimatePresence>
                {augustFolderOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "rgba(0, 0, 0, 0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 1000,
                    }}
                    onClick={handleAugustCalendarClose}
                  >
                    <motion.div
                      style={{
                        background: "rgba(255, 255, 255, 0.7)",
                        backdropFilter: "blur(20px)",
                        borderRadius: "12px",
                        padding: "24px",
                        maxWidth: "800px",
                        width: "90%",
                        maxHeight: "80vh",
                        overflowY: "auto",
                        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "20px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <CalendarIcon style={{ width: "24px", height: "24px", color: "#4caf50" }} />
                          <h2
                            style={{
                              fontSize: "20px",
                              fontWeight: "600",
                              color: "#212529",
                              margin: 0,
                            }}
                          >
                            August 2025 Calendar
                          </h2>
                        </div>
                        <button
                          onClick={handleAugustCalendarClose}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "8px",
                            borderRadius: "4px",
                            color: "#6c757d",
                          }}
                        >
                          <XMarkIcon style={{ width: "20px", height: "20px" }} />
                        </button>
                      </div>

                      {/* Calendar Grid */}
                      <div style={{ marginBottom: "24px" }}>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(7, 1fr)",
                            gap: "4px",
                            marginBottom: "16px",
                          }}
                        >
                          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                            <div
                              key={day}
                              style={{
                                textAlign: "center",
                                fontSize: "14px",
                                fontWeight: "700",
                                color: "#212529",
                                padding: "8px",
                              }}
                            >
                              {day}
                            </div>
                          ))}
                          {generateCalendarDays(2025, 7).map((date, index) => {
                            const isCurrentMonth = date.getMonth() === 7;
                            const dayEvents = augustEvents.filter(
                              event => date.toISOString().split("T")[0] === event.date,
                            );
                            const isEventDate = dayEvents.length > 0;
                            const isToday = date.toDateString() === new Date().toDateString();
                            const eventCount = dayEvents.length;

                            return (
                              <div
                                key={index}
                                style={{
                                  aspectRatio: "1",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "12px",
                                  fontWeight: isEventDate ? "600" : "400",
                                  color: isCurrentMonth ? (isEventDate ? "white" : "#212529") : "#6c757d",
                                  background: isEventDate
                                    ? "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)"
                                    : isToday
                                      ? "#e8f5e8"
                                      : "transparent",
                                  borderRadius: "6px",
                                  cursor: isEventDate ? "pointer" : "default",
                                  border: isToday && !isEventDate ? "2px solid #4caf50" : "none",
                                  position: "relative",
                                }}
                                onClick={() => {
                                  if (isEventDate) {
                                    const event = dayEvents[0]; // Open first event by default
                                    if (event) {
                                      handleFileClick(event);
                                      handleAugustCalendarClose();
                                    }
                                  }
                                }}
                              >
                                <span>{date.getDate()}</span>
                                {eventCount > 0 && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: "4px",
                                      left: "4px",
                                      display: "flex",
                                      gap: "4px",
                                      flexWrap: "wrap",
                                      maxWidth: "calc(100% - 8px)",
                                    }}
                                  >
                                    {dayEvents.map((event, i) => {
                                      // Calculate if this dot would fit in the available space
                                      const dotWidth = 8;
                                      const gap = 4;
                                      const maxDotsPerRow = Math.floor(
                                        (window.innerWidth * 0.8 - 8) / (dotWidth + gap),
                                      );
                                      const row = Math.floor(i / maxDotsPerRow);
                                      const maxRows = 2; // Maximum 2 rows of dots

                                      // If this dot would be in the 3rd row or beyond, show +X instead
                                      if (row >= maxRows) {
                                        const remainingCount = dayEvents.length - maxRows * maxDotsPerRow;
                                        return (
                                          <div
                                            key={`more-${i}`}
                                            style={{
                                              width: "8px",
                                              height: "8px",
                                              borderRadius: "50%",
                                              background: isEventDate ? "white" : "#4caf50",
                                              cursor: "pointer",
                                              transition: "all 0.2s ease",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              fontSize: "5px",
                                              fontWeight: "600",
                                            }}
                                            onMouseEnter={e => {
                                              e.currentTarget.style.transform = "scale(1.2)";
                                              e.currentTarget.style.boxShadow = "0 2px 4px rgba(76, 175, 80, 0.3)";
                                            }}
                                            onMouseLeave={e => {
                                              e.currentTarget.style.transform = "scale(1)";
                                              e.currentTarget.style.boxShadow = "none";
                                            }}
                                            onClick={e => {
                                              e.stopPropagation();
                                              // Show the first remaining event
                                              const remainingEvents = dayEvents.slice(maxRows * maxDotsPerRow);
                                              if (remainingEvents.length > 0) {
                                                handleFileClick(remainingEvents[0]);
                                                handleAugustCalendarClose();
                                              }
                                            }}
                                            title={`${remainingCount} more summaries`}
                                          >
                                            +{remainingCount}
                                          </div>
                                        );
                                      }

                                      return (
                                        <div
                                          key={i}
                                          style={{
                                            width: "8px",
                                            height: "8px",
                                            borderRadius: "50%",
                                            background: isEventDate ? "white" : "#4caf50",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",
                                            position: "relative",
                                          }}
                                          onMouseEnter={e => {
                                            e.currentTarget.style.transform = "scale(1.2)";
                                            e.currentTarget.style.boxShadow = "0 2px 4px rgba(76, 175, 80, 0.3)";
                                          }}
                                          onMouseLeave={e => {
                                            e.currentTarget.style.transform = "scale(1)";
                                            e.currentTarget.style.boxShadow = "none";
                                          }}
                                          onClick={e => {
                                            e.stopPropagation();
                                            handleFileClick(event);
                                            handleAugustCalendarClose();
                                          }}
                                          title={
                                            event.summary.length > 100
                                              ? event.summary.substring(0, 100) + "..."
                                              : event.summary
                                          }
                                        />
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Calendar Popup for Event Details */}
        <AnimatePresence>
          {showCalendar && selectedEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}
              onClick={closeCalendar}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{
                  background: "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(20px)",
                  borderRadius: "12px",
                  padding: "24px",
                  maxWidth: "600px",
                  width: "90%",
                  maxHeight: "80vh",
                  overflowY: "auto",
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                }}
                onClick={e => e.stopPropagation()}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <CalendarIcon style={{ width: "24px", height: "24px", color: "#007bff" }} />
                    <h2
                      style={{
                        fontSize: "20px",
                        fontWeight: "600",
                        color: "#212529",
                        margin: 0,
                      }}
                    >
                      Event Details
                    </h2>
                  </div>
                  <button
                    onClick={closeCalendar}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "8px",
                      borderRadius: "4px",
                      color: "#6c757d",
                    }}
                  >
                    <XMarkIcon style={{ width: "20px", height: "20px" }} />
                  </button>
                </div>

                {/* Event Details */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                    borderRadius: "8px",
                    padding: "20px",
                    border: "1px solid #dee2e6",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#212529",
                      margin: "0 0 12px 0",
                    }}
                  >
                    {selectedEvent.title}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#6c757d",
                        fontWeight: "500",
                      }}
                    >
                      {new Date(selectedEvent.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#007bff",
                        fontWeight: "500",
                      }}
                    >
                      {selectedEvent.messageCount} messages
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#495057",
                      lineHeight: "1.5",
                      margin: "0 0 16px 0",
                    }}
                  >
                    {selectedEvent.summary}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                    {selectedEvent.tags.map((tag, index) => (
                      <span
                        key={index}
                        style={{
                          fontSize: "12px",
                          color: "#007bff",
                          background: "#e3f2fd",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontWeight: "500",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#6c757d",
                        fontWeight: "500",
                      }}
                    >
                      Participants:
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {selectedEvent.participants.map((participant, index) => (
                        <span
                          key={index}
                          style={{
                            fontSize: "12px",
                            color: "#495057",
                            background: "#f8f9fa",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            border: "1px solid #dee2e6",
                          }}
                        >
                          {participant}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                  <button
                    onClick={() => {}} disabled
                    style={{
                      flex: 1,
                      background: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "12px 16px",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <ArrowDownTrayIcon style={{ width: "16px", height: "16px" }} />
                    Export
                  </button>
                  <button
                    onClick={() => {
                      deleteSummary(selectedEvent.id);
                      closeCalendar();
                    }}
                    style={{
                      flex: 1,
                      background: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "12px 16px",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <TrashIcon style={{ width: "16px", height: "16px" }} />
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatSummariesPage;
