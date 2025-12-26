import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import type { POItem } from './PTOListTable';

export interface SelectedItem {
  seq: string;
  poNo: string;
  item: string;
  partNo: string;
  partNameEn: string;
  partNameTh: string;
  poQty: string;
  unitPrice: string;
  deliveryQty: string;
  amount: string;
  coo: string;
}

interface SelectedItemsTableProps {
  onAddToInvoice: () => void;
  selectedPOItems: POItem[];
  onExit: () => void;
}

export function SelectedItemsTable({ onAddToInvoice, selectedPOItems, onExit }: SelectedItemsTableProps) {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  // Convert PO items to selected items format when selectedPOItems changes
  useEffect(() => {
    const convertedItems: SelectedItem[] = selectedPOItems.map((poItem, index) => {
      const deliveryQty = poItem.remain;
      const unitPrice = parseFloat(poItem.unitPrice.replace(/,/g, '')) || 0;
      const qty = parseFloat(deliveryQty) || 0;
      const amount = (unitPrice * qty).toFixed(2);

      return {
        seq: (index + 1).toString(),
        poNo: poItem.poNo,
        item: poItem.item,
        partNo: poItem.partNo,
        partNameEn: poItem.partNameEn,
        partNameTh: poItem.partNameTh,
        poQty: poItem.poQty,
        unitPrice: poItem.unitPrice,
        deliveryQty: deliveryQty,
        amount: amount,
        coo: '',
      };
    });
    setSelectedItems(convertedItems);
  }, [selectedPOItems]);

  const handleUnitPriceChange = (index: number, value: string) => {
    // Allow empty string, digits, comma, and one decimal point
    if (value === '' || /^[\d,]*\.?\d{0,2}$/.test(value)) {
      const newItems = [...selectedItems];
      newItems[index].unitPrice = value;
      
      // Recalculate amount
      const unitPrice = parseFloat(value.replace(/,/g, '')) || 0;
      const qty = parseFloat(newItems[index].deliveryQty) || 0;
      newItems[index].amount = (unitPrice * qty).toFixed(2);
      
      setSelectedItems(newItems);
    }
  };

  const handleDeliveryQtyChange = (index: number, value: string) => {
    // Allow empty string, digits, and one decimal point
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      const newItems = [...selectedItems];
      newItems[index].deliveryQty = value;
      
      // Recalculate amount
      const unitPrice = parseFloat(newItems[index].unitPrice.replace(/,/g, '')) || 0;
      const qty = parseFloat(value) || 0;
      newItems[index].amount = (unitPrice * qty).toFixed(2);
      
      setSelectedItems(newItems);
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = selectedItems.filter((_, i) => i !== index);
    // Update sequence numbers
    const resequencedItems = newItems.map((item, i) => ({
      ...item,
      seq: (i + 1).toString()
    }));
    setSelectedItems(resequencedItems);
  };

  return (
    <div className="bg-[#E8E8E8] p-3 border border-gray-400">
      <div className="bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-gray-300">
                <th className="border border-gray-400 px-1 py-1 bg-[#B8E6F5] w-8">Seq</th>
                <th className="border border-gray-400 px-1 py-1 w-20">PO No.</th>
                <th className="border border-gray-400 px-1 py-1 w-12">Item</th>
                <th className="border border-gray-400 px-1 py-1 w-32">Part No.</th>
                <th className="border border-gray-400 px-1 py-1 w-48">Part Name (En)</th>
                <th className="border border-gray-400 px-1 py-1 w-48">Part Name (Th)</th>
                <th className="border border-gray-400 px-1 py-1 w-16">PO Q'ty</th>
                <th className="border border-gray-400 px-1 py-1 w-20">Unit price</th>
                <th className="border border-gray-400 px-1 py-1 w-24">Delivery Q'ty</th>
                <th className="border border-gray-400 px-1 py-1 w-20">Amount</th>
                <th className="border border-gray-400 px-1 py-1 w-12">COO</th>
                <th className="border border-gray-400 px-1 py-1 w-12">Check</th>
                <th className="border border-gray-400 px-1 py-1 w-16">Remove</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-400 px-1 py-1 text-center bg-[#B8E6F5]">
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
                      value={item.unitPrice}
                      onChange={(e) => handleUnitPriceChange(index, e.target.value)}
                      className="w-full bg-transparent text-right text-[11px] text-gray-400 outline-none"
                    />
                  </td>
                  <td className="border border-gray-400 px-1 py-1 text-right bg-[#FFFFCC]">
                    <input
                      type="text"
                      value={item.deliveryQty}
                      onChange={(e) => handleDeliveryQtyChange(index, e.target.value)}
                      className="w-full bg-transparent text-right text-[11px] text-gray-400 outline-none"
                    />
                  </td>
                  <td className="border border-gray-400 px-1 py-1 text-right">{item.amount}</td>
                  <td className="border border-gray-400 px-1 py-1 text-center">{item.coo}</td>
                  <td className="border border-gray-400 px-1 py-1 text-center">
                  </td>
                  <td className="border border-gray-400 px-1 py-1 text-center">
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="inline-flex items-center justify-center hover:text-red-600 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end p-2 gap-2">
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              className="h-7 text-[11px] px-6 border border-gray-400 hidden"
            >
              Remove
            </Button>
            <Button
              variant="outline"
              className="h-7 text-[11px] px-6 border border-gray-400 hidden"
            >
              Confirm
            </Button>
            <div className="flex items-center gap-2">
              <Button
                className="h-7 text-[11px] px-4 bg-[#da1212] hover:bg-[#e53935] text-white"
                onClick={onAddToInvoice}
              >
                Next
              </Button>
              <Button
                variant="outline"
                className="h-7 text-[11px] px-4 border border-gray-400"
                onClick={onExit}
              >
                Exit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
