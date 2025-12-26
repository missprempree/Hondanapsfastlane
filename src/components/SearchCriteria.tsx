import { Input } from './ui/input';
import { Button } from './ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useState, useRef } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

interface SearchCriteriaProps {
  onClear?: () => void;
  onSearch?: () => void;
}

export function SearchCriteria({ onClear, onSearch }: SearchCriteriaProps) {
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [showUploadSummary, setShowUploadSummary] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Date states
  const [poIssueDateFrom, setPoIssueDateFrom] = useState<Date>();
  const [poIssueDateTo, setPoIssueDateTo] = useState<Date>();
  const [poDueDateFrom, setPoDueDateFrom] = useState<Date>();
  const [poDueDateTo, setPoDueDateTo] = useState<Date>();

  const handleTemplateDownload = () => {
    setShowDownloadDialog(true);
  };

  const handleConfirmDownload = () => {
    // Create a blank workbook
    const workbook = XLSX.utils.book_new();
    
    // Create a blank worksheet with headers
    const worksheetData = [
      ['PO No.', 'ITEM', 'PART NO.', 'Part Name', 'Unit price', 'Delivery Qty', 'Delivery at APC']
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    
    // Generate and download the file
    XLSX.writeFile(workbook, 'supplier_invoice_template.xlsx');
    
    // Close the dialog
    setShowDownloadDialog(false);
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
    } else if (file) {
      alert('Please select a CSV file only.');
      event.target.value = '';
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      // Handle file upload logic here
      console.log('Uploading file:', selectedFile.name);
      // Show upload summary dialog
      setShowUploadSummary(true);
    }
  };

  const handleCloseUploadSummary = () => {
    setShowUploadSummary(false);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Mock upload data with errors
  const uploadResults = [
    {
      line: 1,
      data: '649134R,10,99204ZE2045',
      errorPart: '1',
      dataAfterError: ',JET SET,PILOT,13.24,50,0',
      errorMessage: 'P/N IS INVALID'
    },
    {
      line: 2,
      data: '560545F,950,38770KZVA61,UNIT COMP,PGM-FI/IGN,514.68,',
      errorPart: '132',
      dataAfterError: ',0',
      errorMessage: 'EXCEED QTY PO'
    }
  ];

  return (
    <div className="bg-[#E8E8E8] p-3 border border-gray-400">
      <div className="bg-white p-3 border border-gray-400">
        <div className="mb-3 px-2 py-1 bg-[#FBE3D6]">
          <span className="text-[13px] font-bold">
            Search criteria
          </span>
        </div>

        <div className="flex gap-6">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-[11px] w-[100px]">Supplier code* : </label>
              <span className="text-[11px]">05646</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] w-[100px]">PO No Item</label>
              <Input className="h-6 text-[11px] flex-1" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] w-[100px]">Part No</label>
              <Input className="h-6 text-[11px] flex-1" />
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-[11px] w-[80px]">Supplier Name</label>
              <span className="text-[11px]">: ABTBND AISIA LTD.</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] w-[80px]">PO Issue Date</label>
              <div className="flex items-center gap-1">
                <span className="text-[11px]">From</span>
                <Input 
                  className="h-6 text-[11px] w-[100px]" 
                  value={poIssueDateFrom ? format(poIssueDateFrom, 'dd/MM/yyyy') : ''}
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
                      selected={poIssueDateFrom}
                      onSelect={setPoIssueDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <span className="text-[11px] ml-2">To</span>
                <Input 
                  className="h-6 text-[11px] w-[100px]" 
                  value={poIssueDateTo ? format(poIssueDateTo, 'dd/MM/yyyy') : ''}
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
                      selected={poIssueDateTo}
                      onSelect={setPoIssueDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] w-[80px]">PO Due-date</label>
              <div className="flex items-center gap-1">
                <span className="text-[11px]">From</span>
                <Input 
                  className="h-6 text-[11px] w-[100px]" 
                  value={poDueDateFrom ? format(poDueDateFrom, 'dd/MM/yyyy') : ''}
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
                      selected={poDueDateFrom}
                      onSelect={setPoDueDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <span className="text-[11px] ml-2">To</span>
                <Input 
                  className="h-6 text-[11px] w-[100px]" 
                  value={poDueDateTo ? format(poDueDateTo, 'dd/MM/yyyy') : ''}
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
                      selected={poDueDateTo}
                      onSelect={setPoDueDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="w-[200px] bg-white p-2 space-y-1">
            <div className="flex items-center gap-2">
              <label className="text-[11px]">Delivery Place</label>
              <span className="text-[11px]">: APC-2</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px]">Transport Mode</label>
              <span className="text-[11px]">: Direct</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <label className="text-[11px]">Upload CSV file</label>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button 
            variant="outline" 
            className="h-6 text-[11px] px-2"
            onClick={handleChooseFile}
          >
            Choose file
          </Button>
          {selectedFile && (
            <>
              <span className="text-[11px] text-gray-700">{selectedFile.name}</span>
              <Button 
                variant="outline" 
                className="h-6 text-[11px] px-3"
                onClick={handleUpload}
              >
                Upload
              </Button>
            </>
          )}
          <Button 
            variant="outline" 
            className="h-6 text-[11px] px-2 ml-auto"
            onClick={handleTemplateDownload}
          >
            Template Download
          </Button>
          <Button 
            className="h-6 text-[11px] px-3 bg-[#4A90E2] hover:bg-[#357ABD] text-white"
            onClick={onSearch}
          >
            Search
          </Button>
          <Button 
            variant="outline" 
            className="h-6 text-[11px] px-3 bg-white hover:bg-gray-100 text-black border border-gray-300"
            onClick={onClear}
          >
            Clear
          </Button>
        </div>
      </div>

      <AlertDialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Template Download</AlertDialogTitle>
            <AlertDialogDescription>
              Excel file has been downloaded. Do you want to save?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDownload}>Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showUploadSummary} onOpenChange={setShowUploadSummary}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-[13px] bg-gray-200 border border-gray-400 p-2">
              Upload summary
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-2">
            {/* Upload file section */}
            <div className="bg-[#FBE3D6] border border-gray-400 p-2">
              <div className="text-[11px] text-center">Upload file</div>
            </div>

            {/* Statistics */}
            <div className="border border-gray-400">
              <div className="flex text-[11px] border-b border-gray-400">
                <span className="px-2 py-1 flex-1 text-right">Total line</span>
                <div className="border-l border-gray-400"></div>
                <span className="px-2 py-1 flex-1">2</span>
              </div>
              <div className="flex text-[11px] border-b border-gray-400">
                <span className="px-2 py-1 flex-1 text-right">OK</span>
                <div className="border-l border-gray-400"></div>
                <span className="px-2 py-1 flex-1">0</span>
              </div>
              <div className="flex text-[11px]">
                <span className="px-2 py-1 flex-1 text-right">NG</span>
                <div className="border-l border-gray-400"></div>
                <span className="px-2 py-1 flex-1">2</span>
              </div>
            </div>

            {/* Error table */}
            <div className="border border-gray-400">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-400 px-2 py-1 w-12">Line</th>
                    <th className="border border-gray-400 px-2 py-1">Upload data</th>
                    <th className="border border-gray-400 px-2 py-1 w-48">Error message</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadResults.map((result) => (
                    <tr key={result.line}>
                      <td className="border border-gray-400 px-2 py-1 text-center align-top bg-white">
                        {result.line}
                      </td>
                      <td className="border border-gray-400 px-2 py-6 bg-white">
                        <div>
                          {result.data}
                          <span className="text-red-600">{result.errorPart}</span>
                          {result.dataAfterError}
                        </div>
                      </td>
                      <td className="border border-gray-400 px-2 py-6 bg-white align-top">
                        {result.errorMessage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Exit button */}
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                className="h-7 text-[11px] px-6 border border-gray-400"
                onClick={handleCloseUploadSummary}
              >
                Exit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
