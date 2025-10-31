// app/api/create-land-dnft/route.ts
import { NextResponse } from 'next/server';
import { PinataSDK } from 'pinata';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { File } from 'node-fetch';

const pinata = new PinataSDK({ pinataJwt: process.env.PINATA_JWT! });
const toGatewayUrl = (cid: string) => `https://gateway.pinata.cloud/ipfs/${cid}`;

async function generateSnapshot(coords: [number, number][]) {
  const html = `
    <html>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
        <style>body,html,#map{margin:0;padding:0;width:1000px;height:1000px;}</style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <script>
          const coords = ${JSON.stringify(coords)};
          const map = L.map('map').setView(coords[0], 18);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
          const polygon = L.polygon(coords, { color: 'yellow' }).addTo(map);
          coords.forEach(pt => L.circleMarker(pt, { radius: 5, color: 'red' }).addTo(map));
          map.fitBounds(polygon.getBounds().pad(1));
        </script>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1000, height: 1000 },
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const buffer = await page.screenshot({ type: 'png' });
  await browser.close();
  return buffer;
}

export const POST = async (req: Request) => {
  try {
    // Parse the incoming FormData (Web API)
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const coordinates = formData.get('coordinates') as string;
    const price = formData.get('price') as string;
    const country = formData.get('country') as string;
    const state = formData.get('state') as string;
    const landDocument = formData.get('landDocument') as File | null;

    if (!country || !state || !coordinates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const coords: [number, number][] = JSON.parse(coordinates);
    const timestamp = Date.now();

    // 1️⃣ Snapshot
    const snapshotBuffer = await generateSnapshot(coords);
    const snapshotFile = new File([snapshotBuffer], `snapshot-${timestamp}.png`, { type: 'image/png' });
    const snapshotUpload = await pinata.upload.public.file(snapshotFile);
    const imageCid = snapshotUpload.cid;

    // 2️⃣ Land document (if provided)
    let documentCid: string | null = null;
    if (landDocument) {
      const docUpload = await pinata.upload.public.file(landDocument);
      documentCid = docUpload.cid;
    }

    // 3️⃣ Metadata
    const attributes = [
      { trait_type: 'Price (USD)', value: price || '0' },
      { trait_type: 'Coordinates', value: coords.map(c => c.join(',')).join(' | ') },
      { trait_type: 'Country', value: country },
      { trait_type: 'State', value: state },
    ];
    if (documentCid) attributes.push({ trait_type: 'Land Document', value: `ipfs://${documentCid}` });

    const metadata = {
      name: name || `Land Parcel ${timestamp}`,
      description: description || 'A unique land parcel',
      image: `ipfs://${imageCid}`,
      coordinates: coords,
      price: price || '0',
      country,
      state,
      attributes,
    };

    const metadataFile = new File([Buffer.from(JSON.stringify(metadata))], `metadata-${timestamp}.json`, { type: 'application/json' });
    const metadataUpload = await pinata.upload.public.file(metadataFile);
    const metadataCid = metadataUpload.cid;

    // 4️⃣ Return result
    return NextResponse.json({
      metadataUri: `ipfs://${metadataCid}`,
      metadata,
      gateway: {
        image: toGatewayUrl(imageCid),
        metadata: toGatewayUrl(metadataCid),
        ...(documentCid && { document: toGatewayUrl(documentCid) }),
      },
    });
  } catch (err: any) {
    console.error('❌ Upload failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
