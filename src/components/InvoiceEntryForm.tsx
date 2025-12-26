import { Button } from './ui/button';
import { Input } from './ui/input';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns@4.1.0';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

const radioStyles = `
  .radio-apc {
    appearance: none;
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border: 2px solid #d1d5db;
    border-radius: 50%;
    outline: none;
    cursor: pointer;
    position: relative;
    background-color: white;
  }
  .radio-apc:checked {
    border-color: #dc2626;
    background-color: white;
  }
  .radio-apc:checked::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #dc2626;
  }
`;

export interface InvoiceFormData {
  invoiceNo: string;
  invoiceDate: string;
  supplierBranch: string;
  deliveryAtAPC: string;
}

interface InvoiceEntryFormProps {
  onExit: () => void;
  onDeleteAll: () => void;
  onSubmitSuccess: () => void;
  onSaveDraftSuccess: () => void;
  initialData?: InvoiceFormData;
}

export function InvoiceEntryForm({ onExit, onDeleteAll, onSubmitSuccess, onSaveDraftSuccess, initialData }: InvoiceEntryFormProps) {
  const [selectedItems] = useState([
    {
      seq: '1',
      poNo: '649134R',
      item: '0010',
      partNo: '99204ZE20450',
      partNameEn: 'JET SET, PILOT',
      partNameTh: 'นมหนู',
      poQty: '50',
      unitPrice: '13.24',
      deliveryQty: '20',
      amount: '264.80',
      coo: 'TH',
    },
    {
      seq: '2',
      poNo: '746610F',
      item: '0010',
      partNo: '16137Z05003',
      partNameEn: 'O-RING',
      partNameTh: '',
      poQty: '14',
      unitPrice: '5.00',
      deliveryQty: '14',
      amount: '70.00',
      coo: '',
      check: 'Cost,COO',
    },
    {
      seq: '3',
      poNo: '703232',
      item: '0010',
      partNo: '06369TLAF00',
      partNameEn: 'KIT A/S HARN LH',
      partNameTh: 'ชุดสายไฟ',
      poQty: '20',
      unitPrice: '1,012.89',
      deliveryQty: '20',
      amount: '20,257.80',
      coo: 'JP',
      check: 'Child PO Incomplete',
    },
  ]);

  // Helper function to parse date string (dd/MM/yyyy) to Date object
  const parseDate = (dateStr: string): Date | undefined => {
    if (!dateStr) return undefined;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return undefined;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  };

  const [unitPrices, setUnitPrices] = useState(['13.24', '5.00', '1,012.89']);
  const [deliveryQtys, setDeliveryQtys] = useState(['20', '14', '20']);
  const [deliveryAtAPC, setDeliveryAtAPC] = useState(initialData?.deliveryAtAPC || '');
  const [invoiceNo, setInvoiceNo] = useState(initialData?.invoiceNo || '');
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(initialData?.invoiceDate ? parseDate(initialData.invoiceDate) : undefined);
  const [supplierBranch, setSupplierBranch] = useState(initialData?.supplierBranch || '');
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showSaveDraftDialog, setShowSaveDraftDialog] = useState(false);
  const [showExitConfirmDialog, setShowExitConfirmDialog] = useState(false);

  const handleUnitPriceChange = (index: number, value: string) => {
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      const newPrices = [...unitPrices];
      newPrices[index] = value;
      setUnitPrices(newPrices);
    }
  };

  const handleDeliveryQtyChange = (index: number, value: string) => {
    if (value === '' || /^\d*$/.test(value)) {
      const newQtys = [...deliveryQtys];
      newQtys[index] = value;
      setDeliveryQtys(newQtys);
    }
  };

  // Check if all required fields are filled
  const isFormComplete = deliveryAtAPC !== '' && invoiceNo !== '' && invoiceDate !== undefined && supplierBranch !== '';

  const handleSaveDraft = () => {
    // Show success dialog when Save Draft is clicked
    setShowSaveDraftDialog(true);
  };

  const handleExitClick = () => {
    // If form is complete, show confirmation dialog
    // Otherwise, exit directly
    if (isFormComplete) {
      setShowExitConfirmDialog(true);
    } else {
      onExit();
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirmDialog(false);
    onExit();
  };

  const handleSubmit = () => {
    if (!invoiceDate) return;
    
    // Check if invoice date is in current month
    const now = new Date();
    const isCurrentMonth = invoiceDate.getMonth() === now.getMonth() && invoiceDate.getFullYear() === now.getFullYear();
    
    if (!isCurrentMonth) {
      setShowErrorDialog(true);
      return;
    }
    
    // If validation passes, proceed with submit and redirect to confirmation screen
    onSubmitSuccess();
  };

  return (
    <div className="flex-1 p-2 space-y-3 overflow-auto">
      <style>{radioStyles}</style>
      {/* Supplier Information */}
      <div className="bg-white p-2 border border-gray-400 flex items-center justify-between text-[11px]">
        <div className="flex gap-8">
          <div>
            <span>Maker Code* : </span>
            <span>05646</span>
          </div>
          <div>
            <span>Maker Name : </span>
            <span>ASTEMO ASIA LTD.</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div>
            <span>Delivery Place : </span>
            <span>APC 2</span>
          </div>
          <div>
            <span>Transport Mode : </span>
            <span>Direct</span>
          </div>
        </div>
      </div>

      {/* Selected Items Table */}
      <div className="bg-white border border-gray-400">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-gray-300">
                <th className="border border-gray-400 px-1 py-1 w-8">Seq</th>
                <th className="border border-gray-400 px-1 py-1 w-20">PO No.</th>
                <th className="border border-gray-400 px-1 py-1 w-12">Item</th>
                <th className="border border-gray-400 px-1 py-1 w-32">Part No.</th>
                <th className="border border-gray-400 px-1 py-1 w-40">Part Name (En)</th>
                <th className="border border-gray-400 px-1 py-1 w-40">Part Name (Th)</th>
                <th className="border border-gray-400 px-1 py-1 w-16">PO Q'ty</th>
                <th className="border border-gray-400 px-1 py-1 w-20">Unit price</th>
                <th className="border border-gray-400 px-1 py-1 w-24">Delivery Q'ty</th>
                <th className="border border-gray-400 px-1 py-1 w-20">Amount</th>
                <th className="border border-gray-400 px-1 py-1 w-12">COO</th>
                <th className="border border-gray-400 px-1 py-1 w-16">Check</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-400 px-1 py-1 text-center">
                    {item.seq}
                  </td>
                  <td className="border border-gray-400 px-1 py-1">{item.poNo}</td>
                  <td className="border border-gray-400 px-1 py-1">{item.item}</td>
                  <td className="border border-gray-400 px-1 py-1">{item.partNo}</td>
                  <td className="border border-gray-400 px-1 py-1">{item.partNameEn}</td>
                  <td className="border border-gray-400 px-1 py-1">{item.partNameTh}</td>
                  <td className="border border-gray-400 px-1 py-1 text-right">{item.poQty}</td>
                  <td className="border border-gray-400 px-1 py-1 text-right bg-[#FFFFCC]">
                    <input
                      type="text"
                      value={unitPrices[index]}
                      onChange={(e) => handleUnitPriceChange(index, e.target.value)}
                      className={`w-full bg-transparent text-right text-[11px] outline-none ${
                        item.check && (item.check.includes('Cost') || item.check.includes('COO') || item.check.includes('Child PO Incomplete')) 
                          ? 'text-red-600' 
                          : ''
                      }`}
                    />
                  </td>
                  <td className="border border-gray-400 px-1 py-1 text-right bg-[#FFFFCC]">
                    <input
                      type="text"
                      value={deliveryQtys[index]}
                      onChange={(e) => handleDeliveryQtyChange(index, e.target.value)}
                      className="w-full bg-transparent text-right text-[11px] outline-none"
                    />
                  </td>
                  <td className="border border-gray-400 px-1 py-1 text-right">{item.amount}</td>
                  <td className={`border border-gray-400 px-1 py-1 text-center ${item.check ? 'bg-red-600 text-white' : ''}`}>
                    {item.coo || ''}
                  </td>
                  <td className="border border-gray-400 px-1 py-1 text-center">{item.check}</td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end p-2">
          <Button
            variant="outline"
            className="h-6 text-[11px] px-4 border border-gray-400"
            onClick={onDeleteAll}
          >
            Delete all
          </Button>
        </div>
      </div>

      {/* Delivery at APC Section */}
      <div className="bg-white p-4 border border-gray-400">
        <div className="flex items-center text-[11px] mb-4">
          <label className="w-28">Delivery at APC</label>
          <span className="mx-2">:</span>
          <Select value={deliveryAtAPC} onValueChange={setDeliveryAtAPC}>
            <SelectTrigger className="h-6 w-40 text-[11px] bg-[#FFFFCC]">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes" className="text-[11px]">Yes</SelectItem>
              <SelectItem value="no" className="text-[11px]">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-8 items-start">
          <div className="flex-1 space-y-2">
            <div className="flex items-center text-[11px]">
              <label className="w-28">Invoice No</label>
              <span className="mx-2">:</span>
              <Input
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="h-6 text-[11px] w-40 bg-[#FFFFCC]"
              />
            </div>
            <div className="flex items-center text-[11px]">
              <label className="w-28">Invoice Date</label>
              <span className="mx-2">:</span>
              <Input
                type="text"
                value={invoiceDate ? format(invoiceDate, 'dd/MM/yyyy') : ''}
                readOnly
                placeholder="Select date"
                className="h-7 text-[9px] w-40 bg-[#FFFFCC] cursor-pointer"
                onClick={() => {}}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="outline-none ml-1">
                    <CalendarIcon className="w-4 h-4 cursor-pointer" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={invoiceDate}
                    onSelect={setInvoiceDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex-1 flex items-start text-[11px]">
            <label className="w-28">Supplier branch</label>
            <span className="mx-2">:</span>
            <Select value={supplierBranch} onValueChange={setSupplierBranch}>
              <SelectTrigger className="h-6 text-[11px] w-32 bg-[#FFFFCC]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="00000">00000</SelectItem>
                <SelectItem value="00001">00001</SelectItem>
                <SelectItem value="00002">00002</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-4 text-[10px]">
              <div>Ex.</div>
              <div>Head office: 00000</div>
              <div>Branch 1: 00001</div>
              <div>Branch 2: 00002</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          className={`h-7 text-[11px] px-6 border border-gray-400 ${!isFormComplete ? 'text-gray-400 cursor-not-allowed' : ''}`}
          disabled={!isFormComplete}
          onClick={handleSaveDraft}
        >
          Save draft
        </Button>
        <Button
          variant="outline"
          className={`h-7 text-[11px] px-6 border border-gray-400 ${!isFormComplete ? 'text-gray-400 cursor-not-allowed' : ''}`}
          disabled={!isFormComplete}
          onClick={handleSubmit}
        >
          Submit
        </Button>
        <Button
          variant="outline"
          className="h-7 text-[11px] px-6 border border-gray-400"
          onClick={handleExitClick}
        >
          Exit
        </Button>
      </div>

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[14px]">Cannot submit!</AlertDialogTitle>
            <AlertDialogDescription className="text-[12px]">
              Remark: <span className="text-red-600">Invoice date is not a current month</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="h-8 text-[11px] px-6">OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save Draft Success Dialog */}
      <AlertDialog open={showSaveDraftDialog} onOpenChange={setShowSaveDraftDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[14px]">Success</AlertDialogTitle>
            <AlertDialogDescription className="text-[12px]">
              Invoice has been saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              className="h-8 text-[11px] px-6"
              onClick={() => {
                setShowSaveDraftDialog(false);
                onSaveDraftSuccess();
              }}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitConfirmDialog} onOpenChange={setShowExitConfirmDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[14px]">Data don't save !</AlertDialogTitle>
            <AlertDialogDescription className="text-[12px]">
              Are you sure to exit without saving? The data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <Button
              onClick={handleConfirmExit}
              variant="outline"
              className="bg-white hover:bg-gray-100 text-black border-red-600 text-[11px] h-8 px-6"
            >
              Yes
            </Button>
            <Button
              onClick={() => setShowExitConfirmDialog(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] h-8 px-6"
            >
              No
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}