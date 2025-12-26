import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { X } from 'lucide-react';

export function ApproveChildPOIncomplete() {
  const getCurrentDateTime = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
  };

  const initialTableData = [
    {
      no: '1',
      makerCode: '05646',
      makerName: 'Astemo Asia ltd',
      invoiceDate: '12/9/2025',
      invoiceNo: 'ABC123456789',
      poNo: '703232',
      item: '0010',
      partNo: '063691LAF00',
      partNameEn: 'KIT,A/S HARN, LH',
      partNameTh: 'ชุดสายไฟ',
      poQty: '20',
      unitPrice: '1,012.89',
      deliveryQty: '20',
      amount: '20,257.80',
      approval: '',
    },
    {
      no: '2',
      makerCode: '05647',
      makerName: 'AAAAAAA',
      invoiceDate: '13/9/2025',
      invoiceNo: 'ABC123456789',
      poNo: '703232',
      item: '0010',
      partNo: '063691LAF01',
      partNameEn: 'KIT,A/S HARN, LH',
      partNameTh: 'ชุดสายไฟ',
      poQty: '20',
      unitPrice: '1,012.89',
      deliveryQty: '20',
      amount: '20,257.80',
      approval: '',
    },
    {
      no: '3',
      makerCode: '05648',
      makerName: 'BBBBBBBB',
      invoiceDate: '14/9/2025',
      invoiceNo: 'ABC123456791',
      poNo: '703232',
      item: '0010',
      partNo: '063691LAF02',
      partNameEn: 'KIT,A/S HARN, LH',
      partNameTh: 'ชุดสายไฟ',
      poQty: '20',
      unitPrice: '1,012.89',
      deliveryQty: '20',
      amount: '20,257.80',
      approval: '',
    },
    {
      no: '4',
      makerCode: '05649',
      makerName: 'CCCCCCC',
      invoiceDate: '15/9/2025',
      invoiceNo: 'ABC123456792',
      poNo: '703232',
      item: '0010',
      partNo: '063691LAF03',
      partNameEn: 'KIT,A/S HARN, LH',
      partNameTh: 'ชุดสายไฟ',
      poQty: '20',
      unitPrice: '1,012.89',
      deliveryQty: '20',
      amount: '20,257.80',
      approval: '',
    },
  ];

  const [tableData, setTableData] = useState(initialTableData);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showApprovedDialog, setShowApprovedDialog] = useState(false);
  const [showRejectedDialog, setShowRejectedDialog] = useState(false);
  const [submitDateFrom, setSubmitDateFrom] = useState<Date>();
  const [submitDateTo, setSubmitDateTo] = useState<Date>();
  const [approvalStatus, setApprovalStatus] = useState<string>("waiting");
  const [isFromCalendarOpen, setIsFromCalendarOpen] = useState(false);
  const [isToCalendarOpen, setIsToCalendarOpen] = useState(false);

  const handleRowClick = (index: number) => {
    // Don't show confirmation dialog if the row is already approved or rejected
    if (tableData[index].approval === 'OK' || tableData[index].approval === 'NG') {
      return;
    }
    setSelectedRowIndex(index);
    setShowConfirmDialog(true);
  };

  const handleConfirmYes = () => {
    setShowConfirmDialog(false);
    setShowApprovedDialog(true);
  };

  const handleApprovedDialogClose = () => {
    // Update the approval status for the selected row
    if (selectedRowIndex !== null) {
      setTableData(prevData => 
        prevData.map((row, index) => 
          index === selectedRowIndex ? { ...row, approval: 'OK' } : row
        )
      );
      setSelectedRowIndex(null);
    }
    setShowApprovedDialog(false);
  };

  const handleConfirmNo = () => {
    setShowConfirmDialog(false);
    setShowRejectedDialog(true);
  };

  const handleRejectedDialogClose = () => {
    // Stamp "NG" on the approval column instead of deleting the row
    if (selectedRowIndex !== null) {
      setTableData(prevData => 
        prevData.map((row, index) => 
          index === selectedRowIndex ? { ...row, approval: 'NG' } : row
        )
      );
      setSelectedRowIndex(null);
    }
    setShowRejectedDialog(false);
  };

  const handleConfirmClose = () => {
    setShowConfirmDialog(false);
    setSelectedRowIndex(null);
  };

  const handleFromDateSelect = (date: Date | undefined) => {
    setSubmitDateFrom(date);
    if (date) {
      setIsFromCalendarOpen(false);
    }
  };

  const handleToDateSelect = (date: Date | undefined) => {
    setSubmitDateTo(date);
    if (date) {
      setIsToCalendarOpen(false);
    }
  };

  return (
    <div className="flex-1 p-2 space-y-2 overflow-auto">
      {/* Date Time Header */}
      <div className="bg-gray-100 px-2 py-1 flex justify-end text-[11px]">
        {getCurrentDateTime()}
      </div>

      {/* Search Criteria Section */}
      <div className="bg-white border border-gray-400 p-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-[12px] font-semibold whitespace-nowrap">Submit date From:</label>
            <Input 
              className="h-7 text-[11px] w-[100px] border-gray-400 bg-yellow-50" 
              value={submitDateFrom ? format(submitDateFrom, 'dd/MM/yyyy') : ''}
              readOnly
            />
            <Popover>
              <PopoverTrigger asChild>
                <button className="cursor-pointer">
                  <CalendarIcon className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={submitDateFrom}
                  onSelect={setSubmitDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[12px] font-semibold whitespace-nowrap">To:</label>
            <Input 
              className="h-7 text-[11px] w-[100px] border-gray-400 bg-yellow-50" 
              value={submitDateTo ? format(submitDateTo, 'dd/MM/yyyy') : ''}
              readOnly
            />
            <Popover>
              <PopoverTrigger asChild>
                <button className="cursor-pointer">
                  <CalendarIcon className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={submitDateTo}
                  onSelect={setSubmitDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[12px] font-semibold whitespace-nowrap">Approval status:</label>
            <Select value={approvalStatus} onValueChange={setApprovalStatus}>
              <SelectTrigger className="h-7 w-40 text-[11px] border-gray-400 bg-yellow-50">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="waiting">Waiting for Approve</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="h-7 px-6 text-[11px] bg-blue-600 hover:bg-blue-700 text-white"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-400">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-gray-300">
                <th className="border border-gray-400 px-1 py-1 w-8">No.</th>
                <th className="border border-gray-400 px-1 py-1 w-16">Maker Code</th>
                <th className="border border-gray-400 px-1 py-1 w-32">Maker Name</th>
                <th className="border border-gray-400 px-1 py-1 w-24">Invoice Date</th>
                <th className="border border-gray-400 px-1 py-1 w-32">Invoice No.</th>
                <th className="border border-gray-400 px-1 py-1 w-16">PO no.</th>
                <th className="border border-gray-400 px-1 py-1 w-12">Item</th>
                <th className="border border-gray-400 px-1 py-1 w-32">Part No.</th>
                <th className="border border-gray-400 px-1 py-1 w-36">Part Name (En)</th>
                <th className="border border-gray-400 px-1 py-1 w-36">Part Name (Th)</th>
                <th className="border border-gray-400 px-1 py-1 w-16">PO Q'ty</th>
                <th className="border border-gray-400 px-1 py-1 w-20">Unit price</th>
                <th className="border border-gray-400 px-1 py-1 w-24">Delivery Q'ty</th>
                <th className="border border-gray-400 px-1 py-1 w-20">Amount</th>
                <th className="border border-gray-400 px-1 py-1 w-16">Approval</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr 
                  key={index} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(index)}
                >
                  <td className="border border-gray-400 px-1 py-1 text-center">{row.no}</td>
                  <td className="border border-gray-400 px-1 py-1">{row.makerCode}</td>
                  <td className="border border-gray-400 px-1 py-1">{row.makerName}</td>
                  <td className="border border-gray-400 px-1 py-1 text-center">{row.invoiceDate}</td>
                  <td className="border border-gray-400 px-1 py-1">{row.invoiceNo}</td>
                  <td className="border border-gray-400 px-1 py-1">{row.poNo}</td>
                  <td className="border border-gray-400 px-1 py-1">{row.item}</td>
                  <td className="border border-gray-400 px-1 py-1">{row.partNo}</td>
                  <td className="border border-gray-400 px-1 py-1">{row.partNameEn}</td>
                  <td className="border border-gray-400 px-1 py-1">{row.partNameTh}</td>
                  <td className="border border-gray-400 px-1 py-1 text-right">{row.poQty}</td>
                  <td className="border border-gray-400 px-1 py-1 text-right">{row.unitPrice}</td>
                  <td className="border border-gray-400 px-1 py-1 text-right">{row.deliveryQty}</td>
                  <td className="border border-gray-400 px-1 py-1 text-right">{row.amount}</td>
                  <td className="border border-gray-400 px-1 py-1 text-center">
                    {row.approval && (
                      <span className="text-blue-700 underline">{row.approval}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exit Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          className="h-7 text-[11px] px-8 border border-gray-400"
        >
          Exit
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-md">
          <button
            onClick={handleConfirmClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[14px]">Confirmation</AlertDialogTitle>
            <AlertDialogDescription className="text-[12px]">
              Reconfirm to approve Child PO Incomplete?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <Button
              onClick={handleConfirmYes}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] h-8 px-6"
            >
              Yes
            </Button>
            <Button
              onClick={handleConfirmNo}
              variant="outline"
              className="bg-white hover:bg-gray-100 text-black border-red-600 text-[11px] h-8 px-6"
            >
              No
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approved Dialog */}
      <AlertDialog open={showApprovedDialog} onOpenChange={setShowApprovedDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[14px]">Success</AlertDialogTitle>
            <AlertDialogDescription className="text-[12px]">
              Child PO Incomplete is approved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              className="h-8 text-[11px] px-6"
              onClick={handleApprovedDialogClose}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rejected Dialog */}
      <AlertDialog open={showRejectedDialog} onOpenChange={setShowRejectedDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[14px]">Rejected</AlertDialogTitle>
            <AlertDialogDescription className="text-[12px]">
              Child PO Incomplete is rejected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              className="h-8 text-[11px] px-6"
              onClick={handleRejectedDialogClose}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}