import { PrivyClient } from "@privy-io/server-auth";
//import { ethers } from 'ethers';

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.NEXT_PUBLIC_PRIVY_APP_SECRET!
);

// POST: 創建錢包或發送交易
export async function POST(request: Request) {
  try {
    const { action, to, amount, walletId } = await request.json();
    
    if (action === 'create') {
      // 創建新錢包
      const wallet = await privy.walletApi.create({
        chainType: 'ethereum'
      });
      
      return Response.json({
        id: wallet.id,
        address: wallet.address,
        chainType: wallet.chainType
      });
    } 
    else if (action === 'send') {
      // 發送交易
      if (!walletId || !to || !amount) {
        return Response.json({ 
          error: "Missing required parameters" 
        }, { status: 400 });
      }
      // @ts-ignore
      const {data} = await privy.walletApi.rpc({
        // Your wallet ID (not address), returned during creation
        walletId: walletId,
        method: 'eth_sendTransaction',
        caip2: 'eip155:11155111',
        params: {
          transaction: {
            // Be sure to replace this with your recipient address
            to,
            value: amount,
            chainId: 11155111,
          },
        },
      });
      
      const {hash} = data;
      return Response.json({
        hash,
      });

    }
    
    return Response.json({ 
      error: "Invalid action" 
    }, { status: 400 });
  } catch (error: any) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
}