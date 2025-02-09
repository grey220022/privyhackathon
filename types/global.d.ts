interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (eventName: string, callback: Function) => void;
    removeListener: (eventName: string, callback: Function) => void;
    isMetaMask?: boolean;
  };
} 