'use client';

import { useState, useEffect } from 'react';
import UploadForm from '../../components/UploadForm';
import MetadataCard from '../../components/MetadataCard';
import MetadataPreview from '../../components/MetadataPreview';
import MintButton from '../../components/MintButton';
import ConnectWallet from '../../components/ConnectWallet';

export default function MintPage() {
  const [metadataUrl, setMetadataUrl] = useState('');
  const [gatewayUrl, setGatewayUrl] = useState('');
  const [stateValue, setStateValue] = useState('');
  const [metadata, setMetadata] = useState<any>(null);

  // Fetch and extract metadata from IPFS once it's uploaded
  useEffect(() => {
    if (metadataUrl.startsWith('ipfs://')) {
      const gateway = metadataUrl.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
      setGatewayUrl(gateway);

      fetch(gateway)
        .then((res) => res.json())
        .then((data) => {
          setMetadata(data);
          setStateValue(data?.state || '');
        })
        .catch((err) => {
          console.error('Failed to fetch metadata from gateway:', err);
        });
    }
  }, [metadataUrl]);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Mint Land NFT</h1>
      <ConnectWallet />
      
      <button className="mt-4 px-6 py-4 bg-green-600 text-white rounded">
        <a href="https://lifeless-haunting-v4x97754jr92x9jp-8080.app.github.dev/agents/landAgent/chat/27b2b02d-85b9-4423-af19-1c8e9c801e44" target="_blank" rel="noopener noreferrer">🤖 Ask AI</a>
      </button>

      <UploadForm onSuccess={setMetadataUrl} />

      {metadataUrl && metadata && (
        <>
          {/* <MetadataCard url={metadataUrl} metadata={metadata} /> */}
          {/* <MetadataPreview metadataUrl={metadataUrl} /> */}
          <MintButton
            metadataUrl={metadataUrl}
            gatewayUrl={gatewayUrl}
            state={stateValue}
          />
        </>
      )}
      {/* {<MintButton />} */}
    </div>
  );
}
