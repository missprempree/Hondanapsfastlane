import { Checkbox } from './ui/checkbox';
import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from './ui/alert-dialog';
import { Button } from './ui/button';

export interface POItem {
  poNo: string;
  item: string;
  partNo: string;
  partNameEn: string;
  partNameTh: string;
  model: string;
  unitPrice: string;
  poQty: string;
  cutQty: string;
  remain: string;
  issueDate: string;
  dueDate: string;
}

interface PTOListTableProps {
  onAddClick: (selectedItems: POItem[]) => void;
  resetCheckboxes?: boolean;
  clearTable?: boolean;
  showAddButton?: boolean;
}

export function PTOListTable({ onAddClick, resetCheckboxes, clearTable, showAddButton = true }: PTOListTableProps) {
  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  
  const initialItems = [
    {
      poNo: '649134R',
      item: '0010',
      partNo: '99204ZE20450',
      partNameEn: 'JET SET, PILOT',
      partNameTh: 'นมหนู',
      model: 'GX390T2',
      unitPrice: '13.24',
      poQty: '50',
      cutQty: '0',
      remain: '50',
      issueDate: '13/8/2025',
      dueDate: '14/10/2025',
    },
    {
      poNo: '560545F',
      item: '0950',
      partNo: '38770#ZV461',
      partNameEn: 'UNIT COMP,PGM-FI/IGN',
      partNameTh: 'คอมพิวเตอร์ควบคุมเครื่อง/ราNBC110',
      model: '',
      unitPrice: '514.68',
      poQty: '131',
      cutQty: '0',
      remain: '131',
      issueDate: '15/8/2025',
      dueDate: '16/9/2025',
    },
    {
      poNo: '560545F',
      item: '0390',
      partNo: '38770#73129',
      partNameEn: '',
      partNameTh: 'คอมพิวเตอร์ควบคุมเครื่อง/ราAFS125SHSE1(H)',
      model: '',
      unitPrice: '514.68',
      poQty: '86',
      cutQty: '0',
      remain: '86',
      issueDate: '15/8/2025',
      dueDate: '16/9/2025',
    },
    {
      poNo: '746610F',
      item: '0010',
      partNo: '16137Z05003',
      partNameEn: 'O-RING',
      partNameTh: '',
      model: 'WH30KR3',
      unitPrice: '4.21',
      poQty: '14',
      cutQty: '10',
      remain: '4',
      issueDate: '15/8/2025',
      dueDate: '19/9/2025',
    },
    {
      poNo: '703232',
      item: '0010',
      partNo: '06369TL4F00',
      partNameEn: 'KIT,A/S HARN,LH',
      partNameTh: 'ชุดสายไฟ',
      model: '9H2HY2023',
      unitPrice: '1,012.89',
      poQty: '20',
      cutQty: '0',
      remain: '20',
      issueDate: '15/8/2025',
      dueDate: '16/9/2025',
    },
  ];

  const [items, setItems] = useState(initialItems);

  // Initialize checkboxes to unchecked
  useEffect(() => {
    setCheckedItems(new Array(items.length).fill(false));
  }, [items.length]);

  // Reset checkboxes when resetCheckboxes prop changes
  useEffect(() => {
    if (resetCheckboxes) {
      setCheckedItems(new Array(items.length).fill(false));
      setSelectAll(false);
    }
  }, [resetCheckboxes]);

  // Clear or restore table when clearTable prop changes
  useEffect(() => {
    if (clearTable) {
      setItems([]);
      setCheckedItems([]);
      setSelectAll(false);
    } else if (showAddButton) {
      // Restore data when Search is clicked (showAddButton becomes true)
      setItems(initialItems);
      setCheckedItems(new Array(initialItems.length).fill(false));
      setSelectAll(false);
    }
  }, [clearTable, showAddButton]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setCheckedItems(new Array(items.length).fill(checked));
  };

  const handleItemCheck = (index: number, checked: boolean) => {
    const newCheckedItems = [...checkedItems];
    newCheckedItems[index] = checked;
    setCheckedItems(newCheckedItems);
    
    // Update select all checkbox
    setSelectAll(newCheckedItems.every(item => item));
  };

  const handleAddClick = () => {
    // Check if at least one checkbox is selected
    const hasSelectedItems = checkedItems.some(item => item);
    
    if (!hasSelectedItems) {
      setShowErrorDialog(true);
      return;
    }
    
    // Get selected items
    const selectedItems = items.filter((_, index) => checkedItems[index]);
    onAddClick(selectedItems);
  };

  return (
    <div className="bg-[#E8E8E8] p-3 border border-gray-400">
      <div className="bg-white">
        <div className="bg-[#FFCCCC] px-2 py-0.5 text-[11px] border border-gray-400">
          <span className="font-bold">P/O List</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-gray-300">
                <th className="border border-gray-400 px-1 py-1">
                  <div className="flex justify-center">
                    <Checkbox 
                      className="w-4 h-4"
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                    />
                  </div>
                </th>
                <th className="border border-gray-400 px-1 py-1">PO No.</th>
                <th className="border border-gray-400 px-1 py-1">Item</th>
                <th className="border border-gray-400 px-1 py-1">Part No.</th>
                <th className="border border-gray-400 px-1 py-1">Part name (EN)</th>
                <th className="border border-gray-400 px-1 py-1">Part name (TH)</th>
                <th className="border border-gray-400 px-1 py-1">Model</th>
                <th className="border border-gray-400 px-1 py-1">Unit price</th>
                <th className="border border-gray-400 px-1 py-1">PO Q'ty</th>
                <th className="border border-gray-400 px-1 py-1">Cut Q'ty</th>
                <th className="border border-gray-400 px-1 py-1">PO Remain</th>
                <th className="border border-gray-400 px-1 py-1">PO Issue date</th>
                <th className="border border-gray-400 px-1 py-1">PO Due date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-400 px-1 py-1 text-center">
                    <Checkbox 
                      className="w-4 h-4" 
                      checked={checkedItems[index] || false}
                      onCheckedChange={(checked) => handleItemCheck(index, checked as boolean)}
                    />
                  </td>
                  <td className="border border-gray-400 px-1 py-1">{item.poNo}</td>
                  <td className="border border-gray-400 px-1 py-1">{item.item}</td>
                  <td className="border border-gray-400 px-1 py-1">{item.partNo}</td>
                  <td className="border border-gray-400 px-1 py-1">{item.partNameEn}</td>
                  <td className="border border-gray-400 px-1 py-1">{item.partNameTh}</td>
                  <td className="border border-gray-400 px-1 py-1">{item.model}</td>
                  <td className="border border-gray-400 px-1 py-1 text-right">{item.unitPrice}</td>
                  <td className="border border-gray-400 px-1 py-1 text-right">{item.poQty}</td>
                  <td className="border border-gray-400 px-1 py-1 text-right">{item.cutQty}</td>
                  <td className="border border-gray-400 px-1 py-1 text-right">{item.remain}</td>
                  <td className="border border-gray-400 px-1 py-1">{item.issueDate}</td>
                  <td className="border border-gray-400 px-1 py-1">{item.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showAddButton && (
          <div className="p-2 flex justify-center">
            <button 
              className="bg-gray-200 hover:bg-gray-300 px-6 py-1 text-[11px] border border-gray-400"
              onClick={handleAddClick}
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[14px]">Validation Error</AlertDialogTitle>
            <AlertDialogDescription className="text-[12px]">
              Please select at least one item from the P/O List.
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
    </div>
  );
}
