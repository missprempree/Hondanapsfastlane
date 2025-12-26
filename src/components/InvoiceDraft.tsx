import { Button } from './ui/button';
import { Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Input } from './ui/input';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format } from 'date-fns';

export interface DraftData {
  no: number;
  draftDate: string;
  invoiceNo: string;
  invoiceDate: string;
  supplierBranch: string;
  deliveryAtAPC: string;
}

interface InvoiceDraftProps {
  onExit: () => void;
  onInvoiceClick?: (draftData: DraftData) => void;
}

export function InvoiceDraft({ onExit, onInvoiceClick }: InvoiceDraftProps) {
  const [drafts, setDrafts] = useState<DraftData[]>([
    { no: 1, draftDate: '12/9/2025', invoiceNo: 'ABC123456789', invoiceDate: '10/11/2025', supplierBranch: '00000', deliveryAtAPC: 'yes' },
    { no: 2, draftDate: '15/9/2025', invoiceNo: 'XAOUN09102025', invoiceDate: '14/11/2025', supplierBranch: '00001', deliveryAtAPC: 'no' },
    { no: 3, draftDate: '20/9/2025', invoiceNo: 'TESTALABAMA007', invoiceDate: '18/11/2025', supplierBranch: '00002', deliveryAtAPC: 'yes' },
  ]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetNo, setDeleteTargetNo] = useState<number | null>(null);
  const [draftDateFrom, setDraftDateFrom] = useState<Date | undefined>(undefined);
  const [draftDateTo, setDraftDateTo] = useState<Date | undefined>(undefined);

  const handleDeleteClick = (no: number) => {
    setDeleteTargetNo(no);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetNo !== null) {
      setDrafts(drafts.filter(draft => draft.no !== deleteTargetNo));
      setDeleteDialogOpen(false);
      setDeleteTargetNo(null);
    }
  };

  const handleClear = () => {
    setDraftDateFrom(undefined);
    setDraftDateTo(undefined);
  };

  return (
    <div className="flex-1 bg-[#E8E8E8] p-3">
      {/* Red Header */}


      {/* Search Criteria Section */}
      <div className="bg-white border border-gray-400 p-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-[11px] w-[80px]">Draft Date</label>
          <div className="flex items-center gap-1">
            <span className="text-[11px]">From</span>
            <Input 
              className="h-6 text-[11px] w-[100px]" 
              value={draftDateFrom ? format(draftDateFrom, 'dd/MM/yyyy') : ''}
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
                  selected={draftDateFrom}
                  onSelect={setDraftDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <span className="text-[11px] ml-2">To</span>
            <Input 
              className="h-6 text-[11px] w-[100px]" 
              value={draftDateTo ? format(draftDateTo, 'dd/MM/yyyy') : ''}
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
                  selected={draftDateTo}
                  onSelect={setDraftDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Search Button */}
          <Button
            className="h-6 text-[11px] px-3 bg-[#4A90E2] hover:bg-[#357ABD] text-white ml-2"
          >
            Search
          </Button>
          <Button 
            variant="outline" 
            className="h-6 text-[11px] px-3 bg-white hover:bg-gray-100 text-black border border-gray-300"
            onClick={handleClear}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-400 p-4">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 px-4 py-2 text-center text-[13px]">No</th>
              <th className="border border-gray-400 px-4 py-2 text-center text-[13px]">Draft Date</th>
              <th className="border border-gray-400 px-4 py-2 text-center text-[13px]">Invoice No.</th>
              <th className="border border-gray-400 px-4 py-2 text-center text-[13px] w-16"></th>
            </tr>
          </thead>
          <tbody>
            {drafts.map((draft) => (
              <tr key={draft.no} className="hover:bg-gray-50">
                <td className="border border-gray-400 px-4 py-3 text-center text-[11px]">
                  {draft.no}
                </td>
                <td className="border border-gray-400 px-4 py-3 text-center text-[11px]">
                  {draft.draftDate}
                </td>
                <td className="border border-gray-400 px-4 py-3 text-center text-[11px]">
                  <a 
                    href="#" 
                    className="text-blue-600 underline hover:text-blue-800"
                    onClick={(e) => {
                      e.preventDefault();
                      onInvoiceClick?.(draft);
                    }}
                  >
                    {draft.invoiceNo}
                  </a>
                </td>
                <td className="border border-gray-400 px-4 py-3 text-center">
                  <button
                    onClick={() => handleDeleteClick(draft.no)}
                    className="hover:opacity-70 cursor-pointer"
                  >
                    <Trash2 className="w-5 h-5 mx-auto" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Exit Button */}
        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            className="h-7 text-[11px] px-6 border border-gray-400"
            onClick={onExit}
          >
            Exit
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm to delete?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the draft invoice.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}