import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Download, Printer, Calendar, X } from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import pdfIcon from 'figma:asset/941a6ddaee3dd3ae293e4339250d731633c39611.png';
import deliveryTicketImage from 'figma:asset/34d1dc8a29333abea86af5ceedfd6f12b0312bc3.png';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from './ui/alert-dialog';

interface MaintenanceItem {
  id: string;
  invoiceNo: string;
  arrivalNo: string;
  items: number | string;
  pcs: number;
  check: string;
  status: number | string;
  deliveryTicket: 'issue' | 'issue-outlined' | 'already' | 'issue-disabled';
}

const initialMockData: MaintenanceItem[] = [
  {
    id: '1',
    invoiceNo: '123456789ABC',
    arrivalNo: 'A59120001',
    items: 2,
    pcs: 64,
    check: '',
    status: 10,
    deliveryTicket: 'issue'
  },
  {
    id: '2',
    invoiceNo: 'ABC123456789',
    arrivalNo: 'A59120002',
    items: 2,
    pcs: 217,
    check: 'Cost, COO',
    status: 10,
    deliveryTicket: 'issue-outlined'
  },
  {
    id: '3',
    invoiceNo: '00009445674G',
    arrivalNo: 'A59100001',
    items: 3,
    pcs: 30,
    check: '',
    status: 40,
    deliveryTicket: 'already'
  },
  {
    id: '4',
    invoiceNo: 'XAOUN12092025',
    arrivalNo: 'A59100002',
    items: 4,
    pcs: 150,
    check: '',
    status: 20,
    deliveryTicket: 'already'
  },
  {
    id: '5',
    invoiceNo: 'Justsparepartd8',
    arrivalNo: 'A59110001',
    items: 10,
    pcs: 2000,
    check: '',
    status: 30,
    deliveryTicket: 'already'
  },
  {
    id: '6',
    invoiceNo: 'ABC123456789_CHILDINCOMPLETE',
    arrivalNo: 'C59120002',
    items: '',
    pcs: 20,
    check: 'Child Incomplete',
    status: 9,
    deliveryTicket: 'issue-disabled'
  },
];

export function SupplierInvoiceMaintenance() {
  const [invoiceData, setInvoiceData] = useState<MaintenanceItem[]>(initialMockData);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [showDeleteSuccessDialog, setShowDeleteSuccessDialog] = useState(false);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [selectedIssueItem, setSelectedIssueItem] = useState<MaintenanceItem | null>(null);
  const [totalAmount, setTotalAmount] = useState('720.00');

  // Toggle all checkboxes
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(invoiceData.map(item => item.id));
      setSelectedItems(allIds);
    } else {
      setSelectedItems(new Set());
    }
  };

  // Toggle individual checkbox
  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  // Check if all items are selected
  const allSelected = invoiceData.length > 0 && selectedItems.size === invoiceData.length;

  // Handle Transfer Excel File
  const handleTransferExcel = () => {
    // Validation: Check if at least 1 checkbox is selected
    if (selectedItems.size === 0) {
      setShowErrorDialog(true);
      return;
    }

    // Get current date for filename
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const filename = `Invoice_detail_${day}${month}${year}.xlsx`;

    // Sample data matching the image structure
    const excelData = [
      {
        'Entry Date': '12/9/2025',
        'INVOICE DATE': '12/9/2025',
        'INVOICE NO': '123456789ABC',
        'SUPPLIER CODE': '05646',
        'MAKER NAME': 'ASTEMO ASIA LTD.',
        'ARRIVAL NO': 'A59120001',
        'Items': '1',
        'PART NO': '995113Y000',
        'PART NAME': 'INST CLUST ASM-D/MTER',
        'PO': '2460216',
        'ITEM': '10',
        'PO_PRICE': '1124',
        'QO_QTY': '50',
        'PO_REMAIN': '50',
        'Unit price': '1124',
        'DELIVERY_QTY': '50',
        'AMOUNT': '56200',
        'TAX_AMOUNT': '0',
        'DELIVERY AT APC': '',
        'STATUS': '10',
        'ERROR_CODE': ''
      },
      {
        'Entry Date': '12/9/2025',
        'INVOICE DATE': '12/9/2025',
        'INVOICE NO': '123456789ABC',
        'SUPPLIER CODE': '05646',
        'MAKER NAME': 'ASTEMO ASIA LTD.',
        'ARRIVAL NO': 'A59120001',
        'Items': '2',
        'PART NO': '613776003',
        'PART NAME': 'O-RING',
        'PO': '2460516',
        'ITEM': '10',
        'PO_PRICE': '4.21',
        'QO_QTY': '14',
        'PO_REMAIN': '14',
        'Unit price': '4.21',
        'DELIVERY_QTY': '14',
        'AMOUNT': '58.94',
        'TAX_AMOUNT': '0',
        'DELIVERY AT APC': '',
        'STATUS': '10',
        'ERROR_CODE': ''
      },
      {
        'Entry Date': '12/9/2025',
        'INVOICE DATE': '12/9/2025',
        'INVOICE NO': 'ABC123456789',
        'SUPPLIER CODE': '05646',
        'MAKER NAME': 'ASTEMO ASIA LTD.',
        'ARRIVAL NO': 'A59120002',
        'Items': '1',
        'PART NO': '897002661',
        'PART NAME': 'UNIT COMP-BULK H/LN',
        'PO': '2460528',
        'ITEM': '950',
        'PO_PRICE': '514.68',
        'QO_QTY': '131',
        'PO_REMAIN': '131',
        'Unit price': '514.68',
        'DELIVERY_QTY': '131',
        'AMOUNT': '67423.08',
        'TAX_AMOUNT': '0',
        'DELIVERY AT APC': '',
        'STATUS': '10',
        'ERROR_CODE': 'COST'
      },
      {
        'Entry Date': '12/9/2025',
        'INVOICE DATE': '12/9/2025',
        'INVOICE NO': 'ABC123456789',
        'SUPPLIER CODE': '05646',
        'MAKER NAME': 'ASTEMO ASIA LTD.',
        'ARRIVAL NO': 'A59120002',
        'Items': '2',
        'PART NO': '387708CT32',
        'PART NAME': 'UNIT COMP-BULK H/LN',
        'PO': '2460545F',
        'ITEM': '1030',
        'PO_PRICE': '514.68',
        'QO_QTY': '86',
        'PO_REMAIN': '86',
        'Unit price': '514.68',
        'DELIVERY_QTY': '86',
        'AMOUNT': '44262.48',
        'TAX_AMOUNT': '0',
        'DELIVERY AT APC': '',
        'STATUS': '10',
        'ERROR_CODE': 'COO'
      }
    ];

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invoice Details');

    // Generate Excel file and download
    XLSX.writeFile(wb, filename);
  };

  // Handle Delete
  const handleDelete = () => {
    // Validation 1: Check if at least 1 checkbox is selected
    if (selectedItems.size === 0) {
      setDeleteErrorMessage('Please select at least one invoice to delete.');
      return;
    }

    // Validation 2: Check if all selected items have status 10 or 20
    const selectedItemsData = invoiceData.filter(item => selectedItems.has(item.id));
    const hasInvalidStatus = selectedItemsData.some(item => {
      const status = typeof item.status === 'number' ? item.status : parseInt(item.status);
      return status !== 10 && status !== 20;
    });

    if (hasInvalidStatus) {
      setDeleteErrorMessage('Only invoices with status 10 or 20 can be deleted.');
      return;
    }

    // If validation passes, show confirmation dialog
    setShowDeleteConfirmDialog(true);
  };

  // Confirm and perform deletion
  const confirmDelete = () => {
    // Close confirmation dialog
    setShowDeleteConfirmDialog(false);
    
    // Filter out the deleted items from invoiceData
    const updatedData = invoiceData.filter(item => !selectedItems.has(item.id));
    setInvoiceData(updatedData);
    
    // Clear selected items
    setSelectedItems(new Set());
    
    // Show success dialog
    setShowDeleteSuccessDialog(true);
  };

  // Handle Issue button click (only blue issue button)
  const handleIssueClick = (item: MaintenanceItem) => {
    setSelectedIssueItem(item);
    // Set a default or calculated total amount
    setTotalAmount('720.00');
    setShowIssueDialog(true);
  };

  // Handle Issue submit
  const handleIssueSubmit = () => {
    if (selectedIssueItem) {
      // Update the invoice data
      setInvoiceData(prevData => 
        prevData.map(item => 
          item.id === selectedIssueItem.id
            ? {
                ...item,
                status: 20,
                deliveryTicket: 'already' as const
              }
            : item
        )
      );
    }
    setShowIssueDialog(false);
  };

  // Handle PDF print/view
  const handlePrintPDF = async (item: MaintenanceItem) => {
    // Convert image to data URI first
    try {
      const response = await fetch(deliveryTicketImage);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        
        // Create a new window to display the delivery ticket in PDF viewer style
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Delivery Ticket - ${item.invoiceNo}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                background: #525659;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                height: 100vh;
              }
              
              /* Toolbar */
              .toolbar {
                background: #323639;
                border-bottom: 1px solid #1a1a1a;
                padding: 8px 16px;
                display: flex;
                align-items: center;
                gap: 16px;
              }
              
              .toolbar button {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: transparent;
                border: none;
                color: white;
                cursor: pointer;
                border-radius: 4px;
              }
              
              .toolbar button:hover {
                background: rgba(255, 255, 255, 0.1);
              }
              
              .page-info {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-left: 8px;
              }
              
              .page-number {
                background: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 14px;
              }
              
              .page-total {
                color: white;
                font-size: 14px;
              }
              
              .toolbar-right {
                margin-left: auto;
                display: flex;
                gap: 8px;
              }
              
              /* Content Area */
              .content {
                flex: 1;
                overflow: auto;
                padding: 24px;
                display: flex;
                justify-content: center;
              }
              
              .document {
                background: white;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                max-width: 950px;
              }
              
              .document img {
                display: block;
                width: 100%;
                height: auto;
              }
              
              /* Icons */
              .icon {
                width: 20px;
                height: 20px;
              }
              
              @media print {
                .toolbar {
                  display: none !important;
                }
                body {
                  background: white;
                }
                .content {
                  padding: 0;
                }
                .document {
                  box-shadow: none;
                  max-width: 100%;
                }
              }
            </style>
          </head>
          <body>
            <!-- Toolbar -->
            <div class="toolbar">
              <!-- Zoom Out -->
              <button title="Zoom out" onclick="zoomOut()">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              
              <!-- Zoom In -->
              <button title="Zoom in" onclick="zoomIn()">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              
              <!-- Open File -->
              <button title="Open">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </button>
              
              <!-- Page Navigation -->
              <div class="page-info">
                <div class="page-number">1</div>
                <span class="page-total">of 10</span>
              </div>
              
              <!-- Rotate -->
              <button title="Rotate" onclick="rotate()">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              </button>
              
              <!-- Right side buttons -->
              <div class="toolbar-right">
                <!-- Search -->
                <button title="Search">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </button>
                
                <!-- Print -->
                <button title="Print" onclick="window.print()">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                </button>
                
                <!-- Download -->
                <button title="Download">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
                
                <!-- Save -->
                <button title="Save">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Content Area -->
            <div class="content">
              <div class="document" id="document">
                <img src="${imageDataUrl}" alt="Delivery Ticket" />
              </div>
            </div>
            
            <script>
              let currentZoom = 1;
              
              function zoomIn() {
                currentZoom = Math.min(currentZoom + 0.1, 3);
                applyZoom();
              }
              
              function zoomOut() {
                currentZoom = Math.max(currentZoom - 0.1, 0.5);
                applyZoom();
              }
              
              function applyZoom() {
                const doc = document.getElementById('document');
                doc.style.transform = 'scale(' + currentZoom + ')';
                doc.style.transformOrigin = 'top center';
              }
              
              let rotation = 0;
              function rotate() {
                rotation = (rotation + 90) % 360;
                const doc = document.getElementById('document');
                doc.style.transform = 'rotate(' + rotation + 'deg) scale(' + currentZoom + ')';
              }
            </script>
          </body>
        </html>
        `);
          printWindow.document.close();
        }
      };
      
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error loading image:', error);
    }
  };

  return (
    <div className="flex-1 p-2 space-y-2 overflow-auto">
      {/* Search Criteria */}
      <div className="bg-white border border-gray-300">
        <div className="p-3 space-y-1">
          {/* Row 1: Invoice Entry and Date Range */}
          <div className="flex items-center gap-4">
            <span className="text-[11px]">INVOICE ENTRY</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px]">DATE FROM</span>
              <div className="relative flex items-center">
                <Input 
                  type="date" 
                  defaultValue="2025-09-01"
                  className="h-6 text-[11px] w-[130px] pr-7" 
                />
                <Calendar className="absolute right-1 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px]">DATE TO</span>
              <div className="relative flex items-center">
                <Input 
                  type="date" 
                  defaultValue="2025-09-12"
                  className="h-6 text-[11px] w-[130px] pr-7" 
                />
                <Calendar className="absolute right-1 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 2: Procurement PIC */}
          <div className="flex items-center">
            <span className="text-[11px]">PROCUREMENT PIC : MR.JOHN DOE</span>
          </div>

          {/* Row 3: Maker Code and Name */}
          <div className="flex items-center gap-8">
            <span className="text-[11px]">MAKER CODE : 05646</span>
            <span className="text-[11px]">MAKER NAME : ASTEMO ASIA LTD.</span>
          </div>
        </div>
      </div>

      {/* Invoice List Table */}
      <div className="bg-white border border-gray-300">
        <div className="overflow-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="border-r border-gray-300 px-2 py-1.5 text-center w-[100px]">
                  <div className="flex justify-center">
                    <Checkbox 
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </div>
                </th>
                <th className="border-r border-gray-300 px-2 py-1.5 text-center min-w-[120px]">Invoice no.</th>
                <th className="border-r border-gray-300 px-2 py-1.5 text-center min-w-[100px]">Arrival no.</th>
                <th className="border-r border-gray-300 px-2 py-1.5 text-center w-[60px]">Items</th>
                <th className="border-r border-gray-300 px-2 py-1.5 text-center w-[60px]">Pcs.</th>
                <th className="border-r border-gray-300 px-2 py-1.5 text-center min-w-[100px]">Check</th>
                <th className="border-r border-gray-300 px-2 py-1.5 text-center min-w-[80px]">Status</th>
                <th className="border-r border-gray-300 px-2 py-1.5 text-center min-w-[120px]">Delivery<br/>ticket</th>
                <th className="px-2 py-1.5 text-center w-[60px]">Print</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="border-r border-gray-300 px-2 py-1.5 text-center">
                    <div className="flex justify-center">
                      <Checkbox 
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                      />
                    </div>
                  </td>
                  <td className="border-r border-gray-300 px-2 py-1.5 text-center">
                    {item.invoiceNo}
                  </td>
                  <td className="border-r border-gray-300 px-2 py-1.5 text-center">{item.arrivalNo}</td>
                  <td className="border-r border-gray-300 px-2 py-1.5 text-center">{item.items}</td>
                  <td className="border-r border-gray-300 px-2 py-1.5 text-center">{item.pcs}</td>
                  <td className="border-r border-gray-300 px-2 py-1.5 text-center">{item.check}</td>
                  <td className="border-r border-gray-300 px-2 py-1.5 text-center">{item.status}</td>
                  <td className="border-r border-gray-300 px-2 py-1.5 text-center">
                    {item.deliveryTicket === 'issue' && (
                      <Button 
                        onClick={() => handleIssueClick(item)}
                        className="h-6 text-[11px] px-3 bg-[#00A0DC] hover:bg-[#0080B0] text-white"
                      >
                        Issue
                      </Button>
                    )}
                    {item.deliveryTicket === 'issue-outlined' && (
                      <Button className="h-6 text-[11px] px-3 bg-white hover:bg-gray-50 text-black border border-gray-400">
                        Issue
                      </Button>
                    )}
                    {item.deliveryTicket === 'already' && (
                      <span className="text-gray-400">Already</span>
                    )}
                    {item.deliveryTicket === 'issue-disabled' && (
                      <span className="text-gray-300">Issue</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    {(item.status === 20 || item.status === 30 || item.status === 40) && (
                      <img 
                        src={pdfIcon}
                        alt="PDF"
                        className="w-5 h-5 mx-auto cursor-pointer hover:opacity-80" 
                        onClick={() => handlePrintPDF(item)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-300 px-3 py-2 flex justify-center gap-2">
          <Button 
            onClick={handleTransferExcel}
            className="h-6 text-[11px] px-4 bg-[#22C55E] hover:bg-[#16A34A] text-white"
          >
            Transfer excel file
          </Button>
          <Button 
            onClick={handleDelete}
            className="h-6 text-[11px] px-4 bg-white hover:bg-gray-100 text-[#DC143C] border border-[#DC143C]"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Transfer Excel Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[14px]">Validation Error</AlertDialogTitle>
            <AlertDialogDescription className="text-[12px]">
              Please select at least one invoice to transfer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button 
              onClick={() => setShowErrorDialog(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] h-8"
            >
              OK
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Error Dialog */}
      <AlertDialog open={deleteErrorMessage !== ''} onOpenChange={() => setDeleteErrorMessage('')}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[14px]">Validation Error</AlertDialogTitle>
            <AlertDialogDescription className="text-[12px]">
              {deleteErrorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button 
              onClick={() => setDeleteErrorMessage('')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] h-8"
            >
              OK
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[14px]">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-[12px]">
              Confirm to delete?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button 
              onClick={() => setShowDeleteConfirmDialog(false)}
              className="bg-gray-200 hover:bg-gray-300 text-black text-[11px] h-8"
            >
              NO
            </Button>
            <Button 
              onClick={confirmDelete}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] h-8"
            >
              YES
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Success Dialog */}
      <AlertDialog open={showDeleteSuccessDialog} onOpenChange={setShowDeleteSuccessDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[14px]">Success</AlertDialogTitle>
            <AlertDialogDescription className="text-[12px]">
              Deletion is completed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button 
              onClick={() => setShowDeleteSuccessDialog(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] h-8"
            >
              OK
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Issue Confirmation Dialog */}
      <AlertDialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
        <AlertDialogContent className="max-w-3xl">
          <button
            onClick={() => setShowIssueDialog(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-[13px]">Confirm Total Invoice Amount</AlertDialogTitle>
          </AlertDialogHeader>
          
          {selectedIssueItem && (
            <div className="space-y-4">
              {/* Invoice Details Table */}
              <div className="overflow-auto">
                <table className="w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-400 px-3 py-1.5 text-center">No</th>
                      <th className="border border-gray-400 px-3 py-1.5 text-center">Invoice no.</th>
                      <th className="border border-gray-400 px-3 py-1.5 text-center">Arrival no.</th>
                      <th className="border border-gray-400 px-3 py-1.5 text-center">Items</th>
                      <th className="border border-gray-400 px-3 py-1.5 text-center">
                        Total Amount<br/>(Ex.Vat)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-400 px-3 py-1.5 text-center">1</td>
                      <td className="border border-gray-400 px-3 py-1.5 text-center">
                        {selectedIssueItem.invoiceNo}
                      </td>
                      <td className="border border-gray-400 px-3 py-1.5 text-center">
                        {selectedIssueItem.arrivalNo}
                      </td>
                      <td className="border border-gray-400 px-3 py-1.5 text-center">
                        {selectedIssueItem.items}
                      </td>
                      <td className="border border-gray-400 px-3 py-1.5 text-center">
                        <Input
                          type="text"
                          onChange={(e) => setTotalAmount(e.target.value)}
                          className="h-7 text-[11px] text-center bg-yellow-50 border border-gray-300 focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action Button */}
              <div className="flex justify-center">
                <Button 
                  onClick={handleIssueSubmit}
                  className="h-7 text-[11px] px-3 bg-[#4A90E2] hover:bg-[#357ABD] text-white"
                >
                  Submit
                </Button>
              </div>
            </div>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}