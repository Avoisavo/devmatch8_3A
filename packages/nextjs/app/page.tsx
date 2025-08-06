"use client";

import { ChatBox, ResultPanel } from "../components/llama";
import { SubscribeButton } from "../components/scaffold-eth/SubscribeButton";
import { useChat } from "../hooks/llama";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const { messages, isLoading, error, clearMessages } = useChat();

  return (
    <>
      <div className="flex flex-col h-full pt-16 relative">
        {/* Subscribe Button with Sky Background */}
        <div className="w-full mb-4 flex-1">
          <SubscribeButton />
        </div>

        {/* Result panel area */}
        <div className="w-full mb-4">
          <ResultPanel messages={messages} isLoading={isLoading} error={error} onClear={clearMessages} />
        </div>

        {/* ChatBox fixed at bottom overlaying the sky */}
        <div className="fixed bottom-4 left-4 right-4 z-50 h-80">
          <div className="bg-base-100/90 backdrop-blur-sm rounded-lg border border-base-300 shadow-lg h-full">
            <ChatBox />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
