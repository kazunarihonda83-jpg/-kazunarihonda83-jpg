'use client';

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, ExternalLink } from 'lucide-react';

interface QRCodeGeneratorProps {
  url: string;
  title?: string;
  description?: string;
  size?: number;
}

export default function QRCodeGenerator({
  url,
  title = 'Menu QR Code',
  description = 'Scan to view menu',
  size = 300,
}: QRCodeGeneratorProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `menu-qrcode-${Date.now()}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=800');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            @media print {
              @page { margin: 0; }
              body { margin: 1cm; }
            }
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            h1 {
              margin-bottom: 10px;
              font-size: 24px;
            }
            p {
              margin-bottom: 30px;
              color: #666;
              font-size: 16px;
            }
            .qr-container {
              border: 3px solid #000;
              padding: 30px;
              border-radius: 10px;
            }
            .url {
              margin-top: 30px;
              font-size: 12px;
              color: #666;
              word-break: break-all;
              text-align: center;
              max-width: 400px;
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>${description}</p>
          <div class="qr-container">
            ${qrRef.current?.querySelector('svg')?.outerHTML || ''}
          </div>
          <div class="url">${url}</div>
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
              }, 500);
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="admin-card p-8">
      <div className="flex flex-col items-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-center mb-6">{description}</p>

        <div ref={qrRef} className="mb-6 p-4 bg-white border-4 border-gray-300 rounded-xl">
          <QRCodeSVG
            value={url}
            size={size}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: '',
              height: 0,
              width: 0,
              excavate: true,
            }}
          />
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <Download className="w-5 h-5" />
            PNG形式でダウンロード
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            <Printer className="w-5 h-5" />
            印刷
          </button>
        </div>

        <div className="w-full p-4 bg-gray-100 rounded-lg">
          <div className="flex items-start gap-3">
            <ExternalLink className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700 mb-1">メニューURL:</p>
              <p className="text-xs text-gray-600 break-all font-mono bg-white p-2 rounded border border-gray-300">
                {url}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
