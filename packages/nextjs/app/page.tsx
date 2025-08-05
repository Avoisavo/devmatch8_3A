"use client";

import { ChatBox, ResultPanel } from "../components/llama";
import { useChat } from "../hooks/llama";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const { messages, isLoading, error, clearMessages } = useChat();

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        {/* Empty space for future UI - above chatbox */}
        <div className="w-full min-h-[400px] bg-base-200 rounded-lg mb-8 flex items-center justify-center">
          <p className="text-base-content/60">Empty space for your UI</p>
        </div>

        {/* Main content area with chatbox and result tab */}
        <div className="w-full flex gap-6 mb-8">
          {/* Chatbox area */}
          <div className="flex-1">
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
