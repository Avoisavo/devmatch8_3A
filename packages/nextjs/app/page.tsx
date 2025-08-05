"use client";

import { ChatBox, ResultPanel } from "../components/llama";
import { useChat } from "../hooks/llama";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const { messages, isLoading, error, clearMessages } = useChat();

  return (
    <>
      <div className="flex flex-col h-full pt-16">
        {/* Empty space for future UI - above chatbox */}
        <div className="w-full h-32 bg-base-200 rounded-lg mb-4 flex items-center justify-center">
          <p className="text-base-content/60">Empty space for your UI</p>
        </div>

        {/* Main content area with chatbox and result tab */}
        <div className="w-full flex gap-6 flex-1 min-h-0">
          {/* Chatbox area */}
          <div className="flex-1 min-h-0">
            <ChatBox />
          </div>

          {/* Result tab area */}
          <ResultPanel messages={messages} isLoading={isLoading} error={error} onClear={clearMessages} />
        </div>
      </div>
    </>
  );
};

export default Home;
