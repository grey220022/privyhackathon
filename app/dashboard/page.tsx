'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import { ethers } from "ethers";

// 定義交易類型
interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  blockNumber: string;
  blockHash: string;
  gas: string;
  gasPrice: string;
}

export default function DashboardPage() {
  const [balance, setBalance] = useState<string>("0");
  const [showReceive, setShowReceive] = useState<boolean>(false);
  const [sendAddress, setSendAddress] = useState<string>("");
  const [sendAmount, setSendAmount] = useState<string>("");
  const [showSend, setShowSend] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const router = useRouter();
  const {
    ready,
    authenticated,
    user,
    logout,
    linkEmail,
    linkWallet,
    unlinkEmail,
    linkPhone,
    unlinkPhone,
    unlinkWallet,
    linkGoogle,
    unlinkGoogle,
    linkTwitter,
    unlinkTwitter,
    linkDiscord,
    unlinkDiscord,
    sendTransaction,
  } = usePrivy();

  const wallet = user?.wallet;

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (wallet?.address) {
      fetchBalance();
      fetchTransactionHistory();
    }
  }, [wallet?.address]);

  const fetchBalance = async (): Promise<void> => {
    if (wallet?.address) {
      // 連接到 Sepolia 測試網
      const provider = new ethers.providers.JsonRpcProvider(
        "https://eth-sepolia.g.alchemy.com/v2/qWOLFAmc1qpP8Sbb0GfNrCzen_O1N1pw"
      );
      const balance = await provider.getBalance(wallet.address);
      setBalance(ethers.utils.formatEther(balance));
    }
  };

  const fetchTransactionHistory = async (): Promise<void> => {
    if (wallet?.address) {
      try {
        const response = await fetch(
          `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${wallet.address}&startblock=0&endblock=99999999&sort=desc&apikey=D81GXERPXM4PVA8V3HNF5XRGJF3RKWGDRI`
        );
        const data = await response.json();
        if (data.status === "1" && data.result) {
          setTransactions(data.result.slice(0, 10)); // 只顯示最近10筆交易
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    }
  };

  const handleSend = async (): Promise<void> => {
    try {
      if (!sendAddress || !sendAmount) {
        alert("Please enter address and amount");
        return;
      }

      const tx = {
        to: sendAddress,
        value: ethers.utils.parseEther(sendAmount).toString(),
        chainId: 11155111  // Sepolia testnet chainId
      };

      const { hash } = await sendTransaction(tx);
      alert("Transaction sent successfully!");
      setShowSend(false);
      fetchBalance();
      fetchTransactionHistory();
    } catch (error) {
      console.error("Transaction error:", error);
      alert("Error sending transaction");
    }
  };

  const numAccounts = user?.linkedAccounts?.length || 0;
  const canRemoveAccount = numAccounts > 1;

  const email = user?.email;
  const phone = user?.phone;

  const googleSubject = user?.google?.subject || null;
  const twitterSubject = user?.twitter?.subject || null;
  const discordSubject = user?.discord?.subject || null;

  const formatDate = (timestamp: string): string => {
    return new Date(parseInt(timestamp) * 1000).toLocaleString();
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <Head>
        <title>My Crypto Wallet (Sepolia Testnet)</title>
      </Head>

      <main className="flex flex-col min-h-screen bg-gray-50">
        {ready && authenticated ? (
          <>
            {/* Navigation Bar */}
            <nav className="bg-white shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                  <h1 className="text-xl font-bold text-gray-900">My Wallet (Sepolia)</h1>
                  <button
                    onClick={logout}
                    className="text-sm bg-red-100 hover:bg-red-200 px-4 py-2 rounded-md text-red-600"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Wallet Balance Card */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-sm text-gray-500 uppercase mb-2">Total Balance</h2>
                <div className="text-3xl font-bold">{balance} SepoliaETH</div>
                <p className="text-sm text-gray-500 mt-1">
                  Wallet Address: {wallet?.address || 'No wallet connected'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                  onClick={() => setShowSend(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center"
                >
                  <span>Send</span>
                </button>
                <button 
                  onClick={() => setShowReceive(true)}
                  className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center"
                >
                  <span>Receive</span>
                </button>
              </div>

              {/* Send Modal */}
              {showSend && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white p-6 rounded-lg w-96">
                    <h2 className="text-xl font-bold mb-4">Send ETH</h2>
                    <input
                      type="text"
                      placeholder="Recipient Address"
                      className="w-full p-2 border rounded mb-4"
                      value={sendAddress}
                      onChange={(e) => setSendAddress(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Amount in ETH"
                      className="w-full p-2 border rounded mb-4"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowSend(false)}
                        className="px-4 py-2 bg-gray-200 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSend}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Receive Modal */}
              {showReceive && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white p-6 rounded-lg w-96">
                    <h2 className="text-xl font-bold mb-4">Receive ETH</h2>
                    <p className="mb-4">Your wallet address:</p>
                    <p className="break-all bg-gray-100 p-4 rounded">{wallet?.address}</p>
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => setShowReceive(false)}
                        className="px-4 py-2 bg-gray-200 rounded"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction History */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
                <div className="space-y-4">
                  {transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              To/From
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {transactions.map((tx: Transaction) => (
                            <tr key={tx.hash} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  tx.from.toLowerCase() === wallet?.address?.toLowerCase()
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {tx.from.toLowerCase() === wallet?.address?.toLowerCase() ? 'Sent' : 'Received'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {ethers.utils.formatEther(tx.value)} ETH
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {tx.from.toLowerCase() === wallet?.address?.toLowerCase()
                                  ? `To: ${formatAddress(tx.to)}`
                                  : `From: ${formatAddress(tx.from)}`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(tx.timeStamp)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <a
                                  href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  View
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-4">
                      No transactions yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </>
  );
}