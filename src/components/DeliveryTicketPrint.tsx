import { useState } from 'react';
import { Printer, Download, Search, RotateCw, FileText, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface DeliveryTicket {
  slotCode: string;
  deliveryDate: string;
  deliveryPlace: string;
  makerCode: string;
  makerName: string;
  transportMode: string;
  licensePlate: string;
  truckType: string;
  bookingId: string;
}

interface DeliveryTicketPrintProps {
  tickets: DeliveryTicket[];
  onClose: () => void;
}

export function DeliveryTicketPrint({ tickets, onClose }: DeliveryTicketPrintProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const handlePrint = () => {
    window.print();
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  
  const handleNextPage = () => {
    if (currentPage < tickets.length) setCurrentPage(currentPage + 1);
  };

  const currentTicket = tickets[currentPage - 1];

  return (
    <div className="h-screen flex flex-col bg-[#525659]">
      {/* PDF Viewer Toolbar */}
      <div className="bg-[#323639] border-b border-gray-700 px-4 py-2 flex items-center gap-4 print:hidden">
        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button 
            className="w-8 h-8 flex items-center justify-center text-white hover:bg-gray-600 rounded"
            title="Zoom out"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button 
            className="w-8 h-8 flex items-center justify-center text-white hover:bg-gray-600 rounded"
            title="Zoom in"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Open File */}
        <button 
          className="w-8 h-8 flex items-center justify-center text-white hover:bg-gray-600 rounded"
          title="Open"
        >
          <FileText className="w-5 h-5" />
        </button>

        {/* Page Navigation */}
        <div className="flex items-center gap-2 ml-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center text-white hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="bg-white px-3 py-1 rounded text-sm min-w-[40px] text-center">
            {currentPage}
          </div>
          <span className="text-white text-sm">of {tickets.length}</span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === tickets.length}
            className="w-8 h-8 flex items-center justify-center text-white hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Rotate */}
        <button 
          className="w-8 h-8 flex items-center justify-center text-white hover:bg-gray-600 rounded ml-2"
          title="Rotate"
        >
          <RotateCw className="w-5 h-5" />
        </button>

        {/* Document Title */}
        <div className="flex-1 text-center">
          <span className="text-white">Delivery ticket {currentTicket.slotCode}</span>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          <button 
            className="w-8 h-8 flex items-center justify-center text-white hover:bg-gray-600 rounded"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>
          <button 
            onClick={handlePrint}
            className="w-8 h-8 flex items-center justify-center text-white hover:bg-gray-600 rounded"
            title="Print"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button 
            className="w-8 h-8 flex items-center justify-center text-white hover:bg-gray-600 rounded"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-white hover:bg-gray-600 rounded"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PDF Content Area */}
      <div className="flex-1 overflow-auto p-8 flex justify-center items-start">
        <div className="bg-white shadow-2xl w-[800px] p-8 relative">
          {/* Page Counter */}
          <div className="absolute top-4 right-4 text-[14px]">
            {currentPage}/{tickets.length}
          </div>

          {/* Title */}
          <div className="border-b border-gray-300 pb-3 mb-6">
            <h1 className="text-[18px] text-center">Fastlane Privilege Ticket</h1>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Row 1: Slot code, Delivery date, Delivery place */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-[12px] mb-1">Slot code</div>
                <div className="text-[16px]">{currentTicket.slotCode}</div>
              </div>
              <div className="text-center">
                <div className="text-[12px] mb-1">Delivery date</div>
                <div className="text-[16px]">{currentTicket.deliveryDate}</div>
              </div>
              <div className="text-center">
                <div className="text-[12px] mb-1">Delivery place</div>
                <div className="text-[16px]">{currentTicket.deliveryPlace}</div>
              </div>
            </div>

            {/* Row 2: Maker code, Maker name */}
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-[12px] mb-1">Maker code</div>
                <div className="text-[16px]">{currentTicket.makerCode}</div>
              </div>
              <div className="text-center">
                <div className="text-[12px] mb-1">Maker name</div>
                <div className="text-[16px]">{currentTicket.makerName}</div>
              </div>
            </div>

            {/* Row 3: Transport Mode */}
            <div className="text-center">
              <div className="text-[12px] mb-1">Transport Mode</div>
              <div className="text-[16px]">{currentTicket.transportMode}</div>
            </div>

            {/* Row 4: License Plate, QR Code, Truck Type */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-center">
                <div className="text-[12px] mb-1">License Plate</div>
                <div className="text-[16px]">{currentTicket.licensePlate}</div>
              </div>
              <div className="flex justify-center">
                <QRCodeSVG 
                  value={currentTicket.bookingId} 
                  size={120}
                  level="H"
                />
              </div>
              <div className="text-center">
                <div className="text-[12px] mb-1">Truck Type</div>
                <div className="text-[16px]">{currentTicket.truckType}</div>
              </div>
            </div>

            {/* Booking ID */}
            <div className="border-t border-gray-300 pt-4 mt-8">
              <div className="text-[11px] text-gray-600">
                Booking ID {currentTicket.bookingId}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            margin: 20mm;
          }
        }
      `}</style>
    </div>
  );
}
