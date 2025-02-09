import express from 'express';
import cors from 'cors';
import { PrivyClient } from '@privy-io/server-auth';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const privy = new PrivyClient(
  "cm6xikcys013jnd04c6t1kevn",
  "45p87Y4QFThYsqELnetRWB2qcYcKVrHq53koJgC3WhHFJgh4jh4uZCEDDvWA4M3atUnVnP4Z4aT4SYtwPGErR1uL"
);

app.post('/api/wallet', async (req:any, res:any) => {
  try {
    const { action, to, amount, walletId } = req.body;

    if (action === 'create') {
      console.log("creating wallet!");
      const wallet = await privy.walletApi.create({
        chainType: 'ethereum'
      });
      console.log(wallet);
      return res.json({
        id: wallet.id,
        address: wallet.address,
        chainType: wallet.chainType
      });
    } else if (action === 'send') {
      console.log(walletId);
      console.log(to);
      console.log(amount);
      if (!walletId || !to || !amount) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      console.log("sending");
      // @ts-ignore
      try{
      const data  = await privy.walletApi.rpc({
        walletId: walletId,
        method: 'eth_sendTransaction',
        caip2: 'eip155:11155111',
        params: {
          transaction: {
            to,
            value: amount,
            chainId: 11155111,
          },
        },
      });
      console.log(data);
    }
    catch(e:any){
      console.log(e);
    }
      //const { hash } = data;
      return res.json({ hash:"" });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 啟動服務
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});