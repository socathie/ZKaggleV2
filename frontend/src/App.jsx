import './App.css'

import '@rainbow-me/rainbowkit/styles.css';
import {
  connectorsForWallets,
  wallet,
  RainbowKitProvider,
  midnightTheme,
} from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

import { YourApp } from './YourApp';

const { chains, provider } = configureChains(
  [
    chain.polygon,
    chain.localhost,
  ],
  [
    alchemyProvider({ apiKey: import.meta.env.ALCHEMY_ID }),
    publicProvider(),
  ]
);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      wallet.metaMask({ chains, shimDisconnect: true }),
      wallet.walletConnect({ chains }),
      wallet.rainbow({ chains }),
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: false,
  connectors,
  provider,
});

const App = () => {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} theme={midnightTheme()} coolMode>
        <YourApp />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default App
