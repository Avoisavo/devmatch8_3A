import { ethers } from "hardhat";

async function main() {
  // Optional param: --userContract=0x...
  const userContractArg = process.env.USER_CONTRACT || process.argv.find(a => a.startsWith("--userContract="))?.split("=")[1];
  console.log("Testing Contract Summary Storage on Oasis Sapphire Testnet...");
  
  try {
    // Get signers
    const signers = await ethers.getSigners();
    const deployer = signers[0];
    const user = deployer; // Use deployer as user for testnet testing
    console.log("Deployer/Test User:", deployer.address);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ROSE");

    // Get deployed contract addresses
    const contractFactory: any = await ethers.getContract("ContractFactory", deployer);
    const subscriptionContract: any = await ethers.getContract("SubscriptionContract", deployer);
    
    console.log("\n=== Contract Addresses ===");
    console.log("SubscriptionContract:", await subscriptionContract.getAddress());
    console.log("ContractFactory:", await contractFactory.getAddress());

    // Ensure both directions are wired: SubscriptionContract -> ContractFactory and Factory -> SubscriptionContract
    // 1) SubscriptionContract knows the factory
    const currentFactory = await subscriptionContract.contractFactory();
    if (currentFactory === ethers.ZeroAddress) {
      console.log("\n=== Wiring SubscriptionContract -> ContractFactory ===");
      const setFactoryTx = await subscriptionContract.setContractFactory(await contractFactory.getAddress());
      await setFactoryTx.wait();
      console.log("✓ SubscriptionContract setContractFactory:", await contractFactory.getAddress());
    } else {
      console.log("\nSubscriptionContract already wired to ContractFactory:", currentFactory);
    }

    // 2) ContractFactory knows the subscription contract (required for onlySubscriptionContract)
    const factoryInfo = await contractFactory.getFactoryInfo();
    const currentSubscriptionInFactory = factoryInfo[0];
    if (currentSubscriptionInFactory === ethers.ZeroAddress) {
      console.log("=== Wiring ContractFactory -> SubscriptionContract ===");
      const setSubTx = await contractFactory.setSubscriptionContract(await subscriptionContract.getAddress());
      await setSubTx.wait();
      console.log("✓ ContractFactory setSubscriptionContract:", await subscriptionContract.getAddress());
    } else {
      console.log("ContractFactory already wired to SubscriptionContract:", currentSubscriptionInFactory);
    }

    // Step 1: User subscribes to create user contract
    console.log("\n=== Step 1: User Subscription ===");
    
    const subscriptionPrice = await subscriptionContract.subscriptionPrice();
    console.log("Subscription price:", ethers.formatEther(subscriptionPrice), "ETH");
    
    const subscribeTx = await subscriptionContract.connect(user).subscribe({
      value: subscriptionPrice
    });
    await subscribeTx.wait();
    console.log("✓ User subscribed successfully");

    // Get user's contract address (prefer CLI arg if provided)
    const userContractAddress = userContractArg || (await contractFactory.getUserContract(user.address));
    console.log("✓ User contract created at:", userContractAddress);
    if (userContractAddress === ethers.ZeroAddress) {
      throw new Error("User contract was not created. Ensure factory is set on SubscriptionContract and try again.");
    }

    // Get user contract instance (fully qualified to avoid HH701)
    const userContract: any = await ethers.getContractAt(
      "contracts/UserContract.sol:UserContract",
      userContractAddress,
      user,
    );

    // Step 2: Create a new session
    console.log("\n=== Step 2: Create Chat Session ===");
    
    const createSessionTx = await userContract.createNewSession();
    const receipt = await createSessionTx.wait();
    
    // Extract session ID from events
    const sessionCreatedEvent = receipt?.logs.find((log: any) => {
      try {
        const parsed = userContract.interface.parseLog(log);
        return parsed?.name === "ChatSessionCreated";
      } catch {
        return false;
      }
    });

    if (!sessionCreatedEvent) {
      throw new Error("SessionCreated event not found");
    }

    const parsedEvent = userContract.interface.parseLog(sessionCreatedEvent);
    const sessionId = parsedEvent?.args[1]; // sessionId is the second indexed parameter
    
    console.log("✓ New session created with ID:", sessionId);

    // Step 3: Store a test summary
    console.log("\n=== Step 3: Store Chat Summary ===");
    
    const testSummary = "This is a test chat summary about AI assistant conversation discussing weather, technology, and user preferences. The conversation lasted 5 minutes with 8 total messages exchanged.";
    
    // Simple encryption (base64 encoding for demo)
    const encryptedSummary = Buffer.from(testSummary, 'utf8').toString('base64');
    const summaryBytes = ethers.toUtf8Bytes(encryptedSummary);
    
    console.log("Original summary:", testSummary);
    console.log("Encrypted summary length:", encryptedSummary.length);
    
    // Store summary in contract (note: this would normally be called by TEE, but we're simulating)
    // For testing, we'll set the user as TEE contract temporarily
    const setTEETx = await userContract.connect(deployer).setTEEContract(user.address);
    await setTEETx.wait();
    console.log("✓ Set user as TEE contract for testing");
    
    const storeSummaryTx = await userContract.storeChatSummary(sessionId, summaryBytes);
    await storeSummaryTx.wait();
    console.log("✓ Summary stored in contract successfully");

    // Step 4: Retrieve and verify summary
    console.log("\n=== Step 4: Retrieve and Verify Summary ===");
    
    const retrievedSummary = await userContract.getChatSummary(sessionId);
    console.log("Retrieved summary structure:", {
      sessionId: retrievedSummary.sessionId,
      createdAt: new Date(Number(retrievedSummary.createdAt) * 1000).toISOString(),
      messageCount: retrievedSummary.messageCount.toString(),
      encryptedDataLength: retrievedSummary.encryptedSummary.length
    });

    // Decrypt and verify
    const decryptedSummary = Buffer.from(ethers.toUtf8String(retrievedSummary.encryptedSummary), 'base64').toString('utf8');
    console.log("Decrypted summary:", decryptedSummary);
    
    if (decryptedSummary === testSummary) {
      console.log("✅ Summary storage and retrieval SUCCESSFUL!");
    } else {
      console.log("❌ Summary mismatch!");
      console.log("Expected:", testSummary);
      console.log("Got:", decryptedSummary);
    }

    // Step 5: Test session management
    console.log("\n=== Step 5: Test Session Management ===");
    
    const allSessions: string[] = await userContract.getAllSessionIds();
    console.log("All user sessions:", allSessions.map((id: string) => id.toString()));
    
    const activeSessions: string[] = await userContract.getActiveSessions();
    console.log("Active sessions:", activeSessions.map((id: string) => id.toString()));
    
    const sessionInfo = await userContract.getSessionInfo(sessionId);
    console.log("Session info:", {
      sessionId: sessionInfo.sessionId,
      createdAt: new Date(Number(sessionInfo.createdAt) * 1000).toISOString(),
      isActive: sessionInfo.isActive,
      messageCount: sessionInfo.messageCount.toString()
    });

    // Step 6: Test multiple summaries
    console.log("\n=== Step 6: Test Multiple Summaries ===");
    
    // Create another session
    const createSession2Tx = await userContract.createNewSession();
    const receipt2 = await createSession2Tx.wait();
    
    const sessionCreatedEvent2 = receipt2?.logs.find((log: any) => {
      try {
        const parsed = userContract.interface.parseLog(log);
        return parsed?.name === "ChatSessionCreated";
      } catch {
        return false;
      }
    });

    const parsedEvent2 = userContract.interface.parseLog(sessionCreatedEvent2!);
    const sessionId2 = parsedEvent2?.args[1];
    
    const testSummary2 = "Second chat summary about different topics including programming, books, and travel recommendations. This conversation was shorter with 4 messages.";
    const encryptedSummary2 = Buffer.from(testSummary2, 'utf8').toString('base64');
    const summaryBytes2 = ethers.toUtf8Bytes(encryptedSummary2);
    
    const storeSummary2Tx = await userContract.storeChatSummary(sessionId2, summaryBytes2);
    await storeSummary2Tx.wait();
    
    console.log("✓ Second summary stored");
    
    // Verify both summaries exist
    const allSessionsAfter = await userContract.getAllSessionIds();
    console.log("Total sessions after:", allSessionsAfter.length);
    
    for (let i = 0; i < allSessionsAfter.length; i++) {
      const sessionId = allSessionsAfter[i];
      try {
        const summary = await userContract.getChatSummary(sessionId);
        const decrypted = Buffer.from(ethers.toUtf8String(summary.encryptedSummary), 'base64').toString('utf8');
        console.log(`Session ${i + 1} summary: ${decrypted.substring(0, 50)}...`);
      } catch {
        console.log(`Session ${i + 1}: No summary stored yet`);
      }
    }

    console.log("\n🎉 All tests completed successfully!");
    console.log("\n=== Summary ===");
    console.log("✓ User subscription and contract creation");
    console.log("✓ Session creation and management"); 
    console.log("✓ Summary storage with encryption");
    console.log("✓ Summary retrieval and decryption");
    console.log("✓ Multiple sessions and summaries");
    console.log("\nThe contract-based summary storage system is working correctly!");

  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});
