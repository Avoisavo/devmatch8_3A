"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export const SubscribeButton = () => {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  // Read contract functions
  const { data: subscriptionPrice } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "subscriptionPrice",
  });

  const { data: isSubscribed } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "isSubscribed",
    args: [address],
  });

  const { data: totalSubscribers } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "totalSubscribers",
  });

  // Write contract functions
  const { writeContractAsync: subscribeAsync } = useScaffoldWriteContract({
    contractName: "YourContract",
  });

  const { writeContractAsync: unsubscribeAsync } = useScaffoldWriteContract({
    contractName: "YourContract",
  });

  const handleSubscribe = async () => {
    if (!address) {
      notification.error("Please connect your wallet first");
      return;
    }

    if (isSubscribed) {
      notification.error("You are already subscribed");
      return;
    }

    try {
      setIsLoading(true);
      await subscribeAsync({
        functionName: "subscribe",
        value: subscriptionPrice,
      });
      notification.success("Successfully subscribed!");
    } catch (error) {
      console.error("Subscribe error:", error);
      notification.error("Failed to subscribe");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!address) {
      notification.error("Please connect your wallet first");
      return;
    }

    if (!isSubscribed) {
      notification.error("You are not subscribed");
      return;
    }

    try {
      setIsLoading(true);
      await unsubscribeAsync({
        functionName: "unsubscribe",
      });
      notification.success("Successfully unsubscribed!");
    } catch (error) {
      console.error("Unsubscribe error:", error);
      notification.error("Failed to unsubscribe");
    } finally {
      setIsLoading(false);
    }
  };

  const formatEther = (value: bigint | undefined) => {
    if (!value) return "0";
    return (Number(value) / 1e18).toFixed(4);
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-base-200 rounded-lg">
      <h3 className="text-xl font-bold">Subscription Service</h3>

      <div className="stats shadow">
        <div className="stat">
          <div className="stat-title">Total Subscribers</div>
          <div className="stat-value text-primary">{totalSubscribers?.toString() || "0"}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Subscription Price</div>
          <div className="stat-value text-secondary">{formatEther(subscriptionPrice)} ETH</div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {address && (
          <div className="text-sm">
            Your Status:{" "}
            <span className={isSubscribed ? "text-success font-bold" : "text-error font-bold"}>
              {isSubscribed ? "Subscribed" : "Not Subscribed"}
            </span>
          </div>
        )}

        <div className="flex gap-2">
          <button
            className={`btn btn-primary ${isLoading ? "loading" : ""}`}
            onClick={handleSubscribe}
            disabled={isLoading || !address || isSubscribed}
          >
            {isLoading ? "Processing..." : "Subscribe"}
          </button>

          <button
            className={`btn btn-outline btn-error ${isLoading ? "loading" : ""}`}
            onClick={handleUnsubscribe}
            disabled={isLoading || !address || !isSubscribed}
          >
            {isLoading ? "Processing..." : "Unsubscribe"}
          </button>
        </div>

        {!address && <div className="text-sm text-warning">Please connect your wallet to subscribe</div>}
      </div>
    </div>
  );
};
