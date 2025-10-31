'use client';

import { useEffect, useState } from 'react';
import { parseEther } from 'viem';
import { parseUnits, encodeBytes32String, Interface } from 'ethers';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import LandNFT_ABI from '../abi/LandNFT_ABI.json';
import { saveMintToFirebase } from '../lib/saveToFirebase';

const LAND_NFT_CONTRACT = process.env.NEXT_PUBLIC_LANDNFT_CONTRACT as `0x${string}` | undefined;
if (!LAND_NFT_CONTRACT) throw new Error('Missing NEXT_PUBLIC_LANDNFT_CONTRACT in env');

interface MintButtonProps {
  metadataUrl: string; // ipfs://...
  gatewayUrl: string;  // https://gateway.pinata.cloud/ipfs/...
  state: string;
}

export default function MintButton({ metadataUrl, gatewayUrl }: MintButtonProps) {
  const { address: connectedAddress } = useAccount();

  const [to, setTo] = useState('');
  const [uri, setUri] = useState('');
  const [state, setState] = useState('');
  const [amount, setAmount] = useState(1);
  const [priceUSDT, setPriceUSDT] = useState('');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [minting, setMinting] = useState(false);

  const { writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } =
    useWaitForTransactionReceipt({ hash: txHash });

  // Auto-fill recipient & metadata on load
  useEffect(() => {
    if (connectedAddress) setTo(connectedAddress);

    if (gatewayUrl) {
      setUri(gatewayUrl); // auto-fill URI input

      fetch(gatewayUrl)
        .then((res) => res.json())
        .then((data) => {
          if (data.state) {
            setState(encodeBytes32String(data.state)); // auto-fill Location (State) as bytes32
          }
          if (data.price) {
            setPriceUSDT(parseUnits(data.price.toString(), 6).toString());
          }
        })
        .catch((err) => console.error('Failed to fetch metadata:', err));
    }
  }, [metadataUrl, gatewayUrl, connectedAddress]);

  // ✅ Auto-save to Firebase when confirmed
  useEffect(() => {
    if (isConfirmed && receipt) {
      (async () => {
        try {
          const metadataJson = await fetch(uri).then((res) => res.json());

          // ✅ Extract serial (tokenId) from LandNFTMinted event
          let tokenId: number | undefined;

          try {
            const iface = new Interface(LandNFT_ABI);

            for (const log of receipt.logs) {
              // Some Hedera logs use mirror addresses, so skip the address filter
              try {
                const parsed = iface.parseLog(log);

                // Must exactly match your Solidity event name
                if (parsed?.name === 'LandNFTMinted') {
                  const serial = parsed.args?.serial;
                  if (serial !== undefined) {
                    tokenId = Number(serial.toString());
                    console.log('✅ Found serial in event:', tokenId);
                    break;
                  }
                }
              } catch (err) {
                // Skip unrelated logs
              }
            }
          } catch (err) {
            console.warn('Log parse error:', err);
          }

          if (tokenId === undefined || isNaN(tokenId)) {
            console.error('⚠️ TokenId not found. Raw logs:', receipt.logs);
            throw new Error('TokenId not found in logs');
          }


          await saveMintToFirebase({
            name: metadataJson.name,
            coordinates: metadataJson.coordinates,
            metadataUri: metadataUrl,
            imageUrl: metadataJson.image?.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'),
            tokenId,
            walletAddress: to,
            contractAddress: LAND_NFT_CONTRACT!,
          });


          alert('✅ Minted & saved to Firebase!');
        } catch (err) {
          console.error('Firebase save error:', err);
        }
      })();
    }
  }, [isConfirmed, receipt, uri, metadataUrl, to]);


  const handleMint = async () => {
    const recipient = to || connectedAddress;
    if (!recipient || !uri || amount <= 0 || !state || !priceUSDT) {
      alert('❌ Fill recipient, URI, state, amount, and price.');
      return;
    }

    try {
      setMinting(true);

      const tx = await writeContractAsync({
        address: LAND_NFT_CONTRACT!,
        abi: LandNFT_ABI,
        functionName: 'mintLand',
        args: [
          recipient,          // address to
          uri,                // metadataURI
          BigInt(amount),     // amount (unused but required)
          state,              // bytes32 region
          priceUSDT           // purchasePriceUSD (BigInt)
        ],
        value: parseEther('0.001'),
      });

      setTxHash(tx);
    } catch (err: any) {
      console.error('Mint error:', err);
      alert(err?.message || 'Minting failed');
    } finally {
      setMinting(false);
    }
  };


  return (
    <div className="mt-6 border p-4 rounded shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Mint Land NFT</h2>

      <label className="block mb-1 font-medium">Recipient Address</label>
      <input
        type="text"
        value={to}
        readOnly
        placeholder={connectedAddress || '0x...'}
        className="w-full border p-2 mb-4 rounded"
      />

      <label className="block mb-1 font-medium">IPFS URL</label>
      <input
        type="url"
        value={uri}
        onChange={(e) => setUri(e.target.value)}  // ✅ make it editable
        className="w-full border p-2 mb-4 rounded"
      />



      <label className="block mb-1 font-medium">Region (State)</label>
      <input
        type="text"
        value={state}
        readOnly
        className="w-full border p-2 mb-4 rounded"
      />

      <label className="block mb-1 font-medium">No of Plot(s)</label>
      <input
        type="number"
        min={1}
        value={amount}
        readOnly
        className="w-full border p-2 mb-4 rounded"
      />

      <label className="block mb-1 font-medium">Price (USDT)</label>
      <input
        type="number"
        value={priceUSDT}
        readOnly
        className="w-full border p-2 mb-4 rounded"
      />

      <button
        onClick={handleMint}
        disabled={minting || isConfirming}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {minting ? 'Minting...' : isConfirming ? 'Confirming...' : isConfirmed ? '✅ Minted' : 'Mint NFT'}
      </button>

      {txHash && (
        <p className="mt-3 text-sm text-gray-700 break-all">
          Tx:{' '}
          <a
            href={`https://hashscan.io/testnet/transaction/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {txHash}
          </a>
        </p>
      )}
    </div>
  );
}

