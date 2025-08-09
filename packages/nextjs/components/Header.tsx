"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { parseEther } from "viem";
import { hardhat } from "viem/chains";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Bars3Icon, BugAntIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { FaucetButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  },

  {
    label: "Chat Summaries",
    href: "/chat-summaries",
    icon: <DocumentTextIcon className="h-4 w-4" />,
  },
  {
    label: "Contract Summaries",
    href: "/contract-summaries",
    icon: <DocumentTextIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-secondary shadow-md" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const { address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [isLoading, setIsLoading] = useState(false);

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  // Check if user has an active subscription
  const { data: isSubscribed } = useScaffoldReadContract({
    contractName: "SubscriptionAndSummaryFactory",
    functionName: "isActive",
    args: [address],
  });

  // Get subscription info
  const { data: subscriptionInfo } = useScaffoldReadContract({
    contractName: "SubscriptionAndSummaryFactory",
    functionName: "subscriptions",
    args: [address],
  });

  // Write contract function
  const { writeContractAsync: subscribeAsync } = useScaffoldWriteContract({
    contractName: "SubscriptionAndSummaryFactory",
  });

  const handleSubscribe = async () => {
    if (!address) {
      notification.error("Please connect your wallet first");
      return;
    }

    try {
      setIsLoading(true);
      const result = await subscribeAsync({
        functionName: "paySubscription",
        value: parseEther("1"), // 1 ROSE token
      });

      // Log transaction encryption status for Sapphire networks
      const isSapphireNetwork = targetNetwork.id === 0x5afe || targetNetwork.id === 0x5aff;
      if (isSapphireNetwork && result) {
        console.log(`Transaction hash: ${result}`);
        // Note: We'd need the transaction data to check encryption properly
        console.log("✅ Transaction sent on Sapphire network (confidential by default)");
      }

      notification.success("Successfully subscribed! 1 ROSE token deducted.");
    } catch (error) {
      console.error("Subscribe error:", error);
      notification.error("Failed to subscribe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 navbar bg-base-100 min-h-0 shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <details className="dropdown" ref={burgerMenuRef}>
          <summary className="ml-1 btn btn-ghost lg:hidden hover:bg-transparent">
            <Bars3Icon className="h-1/2" />
          </summary>
          <ul
            className="menu menu-compact dropdown-content mt-3 p-2 shadow-sm bg-base-100 rounded-box w-52"
            onClick={() => {
              burgerMenuRef?.current?.removeAttribute("open");
            }}
          >
            <HeaderMenuLinks />
          </ul>
        </details>
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex relative w-10 h-10">
            <Image alt="SE2 logo" className="cursor-pointer" fill src="/logo.svg" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">Scaffold-ETH</span>
            <span className="text-xs">Ethereum dev stack</span>
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end grow mr-4 flex items-center gap-2">
        <button
          className={`btn btn-primary btn-sm ${isLoading ? "loading" : ""}`}
          onClick={handleSubscribe}
          disabled={isLoading || !address}
        >
          {isLoading
            ? "Processing..."
            : isSubscribed
              ? `Subscribe Again (Active until ${subscriptionInfo ? new Date(Number(subscriptionInfo) * 1000).toLocaleDateString() : "N/A"})`
              : "Subscribe (1 ROSE)"}
        </button>

        {/* Custom Connect Button */}
        {address ? (
          <div className="dropdown dropdown-end">
            <button className="btn btn-primary btn-sm">
              {address.slice(0, 6)}...{address.slice(-4)}
            </button>
            <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                <button onClick={() => disconnect()}>Disconnect</button>
              </li>
            </ul>
          </div>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => connect({ connector: connectors[0] })}
            disabled={isPending}
          >
            {isPending ? "Connecting..." : "Connect Wallet"}
          </button>
        )}

        {isLocalNetwork && <FaucetButton />}
      </div>
    </div>
  );
};
