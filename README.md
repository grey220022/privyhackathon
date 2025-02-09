# Privy integration Eth Global

## Setup

1. Install the necessary dependencies 

```sh
npm i 
```

1. Initialize your environment variables by copying the `.env.example` file to an `.env.local` file. Then, in `.env.local`
   
```sh
cp .env.example .env.local

# Add your Privy App ID to .env.local
NEXT_PUBLIC_PRIVY_APP_ID=<your-privy-app-id>
```

## Building locally

run `npm run dev`. 

You can now visit http://localhost:3000 to see your app and login with Privy

