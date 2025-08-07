"use client";

import SkyBackground from "~~/components/livingroom/SkyBackground";

export const SubscribeButton = () => {
  // Subscription functionality moved to Header component

  return (
    <div className="flex flex-col gap-4 p-6 bg-base-200 rounded-lg h-full relative">
      {/* Sky Background area - full screen */}
      <div className="flex-1 bg-base-100 rounded-lg border-2 border-solid border-base-300 relative overflow-hidden">
        {/* Sky Background */}
        <div className="absolute inset-0">
          <SkyBackground />
        </div>
      </div>

      {/* Subscribe buttons moved to Header component */}
      <div className="flex flex-col gap-2">
        <div className="text-center text-sm text-base-content/60">Subscription functionality is now in the header</div>
      </div>
    </div>
  );
};
