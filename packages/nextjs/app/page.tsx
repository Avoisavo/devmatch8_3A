"use client";

import type { NextPage } from "next";

const Home: NextPage = () => {
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
            <div className="bg-base-100 rounded-lg p-4 min-h-[300px] flex flex-col">
              <div className="flex-1 mb-4">
                <textarea
                  className="w-full h-full p-3 bg-base-200 rounded border border-base-300 resize-none"
                  placeholder="Type your message here..."
                />
              </div>
              <div className="flex justify-end">
                <button className="btn btn-primary">Send</button>
              </div>
            </div>
          </div>

          {/* Result tab area */}
          <div className="w-80 bg-base-100 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Results</h3>
            <div className="bg-base-200 rounded p-3 min-h-[250px]">
              <p className="text-base-content/60">Results will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
