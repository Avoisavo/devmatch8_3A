"use client";

import { useState } from "react";
import Floor from "../components/Floor";
import { NoHydration } from "../components/NoHydration";
import { ChatBox, ResultPanel } from "../components/llama";
import { SubscribeButton } from "../components/scaffold-eth/SubscribeButton";
import { useChat } from "../hooks/llama";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const { messages, isLoading, error, clearMessages } = useChat();
  const [isTalking, setIsTalking] = useState(false);

  return (
    <NoHydration
      fallback={
        <div className="flex flex-col h-full pt-16 relative">
          <div className="w-full mb-4 flex-1">
            <div className="flex flex-col gap-4 p-6 bg-base-200 rounded-lg h-full relative">
              <div className="flex-1 bg-base-100 rounded-lg border-2 border-solid border-base-300 relative overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to bottom, #b3e0ff 0%, #e3f0fd 100%)",
                  }}
                ></div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-center text-sm text-base-content/60">Loading...</div>
              </div>
            </div>
          </div>
          <div className="fixed bottom-4 left-4 right-4 z-50 h-80">
            <div className="bg-base-100/90 backdrop-blur-sm rounded-lg border border-base-300 shadow-lg h-full p-4">
              <div className="text-center text-base-content/60">Chat loading...</div>
            </div>
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-full pt-16 relative">
        {/* VISIBLE FLOOR SECTION */}
        <div className="w-full" style={{ height: "60vh", position: "relative" }}>
          <Floor gatherAndTalk={isTalking} />
        </div>

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
            <ChatBox onTalkingChange={setIsTalking} />
          </div>
        </div>
      </div>
    </NoHydration>
  );
};

export default Home;
