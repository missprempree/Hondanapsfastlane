import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, CalendarIcon, Printer, Trash2 } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from './ui/alert-dialog';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from './ui/utils';
import { format } from 'date-fns';
import { DeliveryTicketPrint } from './DeliveryTicketPrint';

interface Dock {
  id: string;
  label: string;
  info: string;
}

interface Invoice {
  id: string;
  seq: number;
  invoiceNo: string;
  arrivalNo: string;
  items: number;
  pcs: number;
  amountExcVat: string;
  status: string;
}

interface BookingDetail {
  bookingId: string;
  dock: string;
  dockInfo: string;
  timeSlots: string[];
  licensePlate: string;
  truckType: string;
  invoices: Invoice[];
  deliveryDate: string;
}

interface AvailabilityData {
  docks: Dock[];
  times: string[];
  disabled: { dock: string; time: string }[];
  booked: { dock: string; time: string; licensePlate: string; truckType: string; bookingId: string; makerCode?: string }[];
}

interface BookedSlot {
  rowIdx: number;
  colIdx: number;
  licensePlate: string;
  truckType: string;
}

const BREAK_TIMES = ['12:00'];

function FastLaneInquiry() {
  // Date states
  const [deliverDate, setDeliverDate] = useState<Date>();
  
  const [baseDate, setBaseDate] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  
  // Booking detail dialog states
  const [showBookingDetail, setShowBookingDetail] = useState<boolean>(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const [showPrintDialog, setShowPrintDialog] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  
  // Edit form states
  const [editLicensePlate, setEditLicensePlate] = useState<string>('');
  const [editTruckType, setEditTruckType] = useState<string>('');
  
  // Add invoice dialog states
  const [showAddInvoiceDialog, setShowAddInvoiceDialog] = useState<boolean>(false);
  const [invoiceEntryDateFrom, setInvoiceEntryDateFrom] = useState<Date>();
  const [invoiceEntryDateTo, setInvoiceEntryDateTo] = useState<Date>();
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Set<string>>(new Set());
  
  // Delete slot confirmation dialog states
  const [showDeleteSlotDialog, setShowDeleteSlotDialog] = useState<boolean>(false);

  // Initialize with today's date
  useEffect(() => {
    const today = new Date();
    const todayStr = toISODateLocal(today);
    setBaseDate(todayStr);
    setCurrentDate(todayStr);
    setDeliverDate(today);
    
    // Load availability data
    setAvailability(getAvailabilityForDate(todayStr));
  }, []);

  // Helper: Convert Date to YYYY-MM-DD in local timezone
  const toISODateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const addDays = (dateStr: string, days: number): string => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days);
    return toISODateLocal(date);
  };

  const formatThaiDate = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('us-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const isBefore = (date1: string, date2: string): boolean => {
    return date1 < date2;
  };

  // Mock availability data with some booked slots
  const getAvailabilityForDate = (dateStr: string): AvailabilityData => {
    const times = ['07:30', '09:00', '10:30', '12:00', '13:00', '14:30', '16:00'];

    const docks: Dock[] = [ { id: 'A1', label: 'A1', info: 'APC Pack' },
                            { id: 'A2', label: 'A2', info: 'APC Pack' },
                            { id: 'B3', label: 'B3', info: 'Maker Pack' },
                            { id: 'C4', label: 'C4', info: 'F/L Unload' },
                          ];

    // Mock some disabled slots
    const disabled = [
      { dock: 'A1', time: '07:30' },
      { dock: 'D2', time: '09:00' },
      { dock: 'B3', time: '10:30' },
    ];

    // Mock some booked slots (this would come from backend in real app)
    // Note: Same bookingId for combined slots
    const booked = [
      { dock: 'A1', time: '09:00', licensePlate: 'ABC-1234', truckType: '4W', bookingId: 'BK20241114001', makerCode: '05646' },
      { dock: 'A1', time: '10:30', licensePlate: 'ABC-1234', truckType: '4W', bookingId: 'BK20241114001', makerCode: '05646' },
      { dock: 'A2', time: '14:30', licensePlate: 'XYZ-5678', truckType: '6W', bookingId: 'BK20241114002', makerCode: '05646' },
      { dock: 'B3', time: '09:00', licensePlate: 'DEF-9012', truckType: '4W', bookingId: 'BK20241114003', makerCode: '05646' },
      { dock: 'C4', time: '13:00', licensePlate: 'GHI-3456', truckType: '4W', bookingId: 'BK20241114004', makerCode: '05646' },
    ];

    return { docks, times, disabled, booked };
  };

  // Mock booking details with invoices (this would come from backend)
  const getBookingDetails = (bookingId: string): BookingDetail | null => {
    const bookingDetailsMap: { [key: string]: BookingDetail } = {
      'BK20241114001': {
        bookingId: 'BK20241114001',
        dock: 'A1',
        dockInfo: 'APC Pack',
        timeSlots: ['09:00', '10:30'],
        licensePlate: 'ABC-1234',
        truckType: '4W',
        deliveryDate: currentDate,
        invoices: [
          { id: '1', seq: 1, invoiceNo: 'INV-2024-001', arrivalNo: 'ARV-001', items: 5, pcs: 150, amountExcVat: '50,000.00', status: '30' },
          { id: '2', seq: 2, invoiceNo: 'INV-2024-002', arrivalNo: 'ARV-002', items: 3, pcs: 80, amountExcVat: '30,000.00', status: '30' },
          { id: '3', seq: 3, invoiceNo: 'INV-2024-003', arrivalNo: 'ARV-003', items: 4, pcs: 120, amountExcVat: '45,500.00', status: '30' },
        ]
      },
      'BK20241114002': {
        bookingId: 'BK20241114002',
        dock: 'A2',
        dockInfo: 'APC Pack',
        timeSlots: ['14:30'],
        licensePlate: 'XYZ-5678',
        truckType: '6W',
        deliveryDate: currentDate,
        invoices: [
          { id: '4', seq: 1, invoiceNo: 'INV-2024-004', arrivalNo: 'ARV-004', items: 8, pcs: 250, amountExcVat: '75,000.00', status: '30' },
          { id: '5', seq: 2, invoiceNo: 'INV-2024-005', arrivalNo: 'ARV-005', items: 6, pcs: 180, amountExcVat: '62,000.00', status: '30' },
        ]
      },
      'BK20241114003': {
        bookingId: 'BK20241114003',
        dock: 'B3',
        dockInfo: 'Maker Pack',
        timeSlots: ['09:00'],
        licensePlate: 'DEF-9012',
        truckType: '4W',
        deliveryDate: currentDate,
        invoices: [
          { id: '6', seq: 1, invoiceNo: 'INV-2024-006', arrivalNo: 'ARV-006', items: 10, pcs: 300, amountExcVat: '120,000.00', status: '30' },
          { id: '7', seq: 2, invoiceNo: 'INV-2024-007', arrivalNo: 'ARV-007', items: 5, pcs: 120, amountExcVat: '45,000.00', status: '30' },
        ]
      },
      'BK20241114004': {
        bookingId: 'BK20241114004',
        dock: 'C4',
        dockInfo: 'F/L Unload',
        timeSlots: ['13:00'],
        licensePlate: 'GHI-3456',
        truckType: '4W',
        deliveryDate: currentDate,
        invoices: [
          { id: '8', seq: 1, invoiceNo: 'INV-2024-008', arrivalNo: 'ARV-008', items: 7, pcs: 200, amountExcVat: '60,000.00', status: '30' },
        ]
      },
    };

    return bookingDetailsMap[bookingId] || null;
  };

  // Handle previous day
  const handlePreviousDay = () => {
    const previousDate = addDays(currentDate, -1);
    if (isBefore(previousDate, baseDate)) return;
    setCurrentDate(previousDate);
    setAvailability(getAvailabilityForDate(previousDate));
  };

  // Handle next day
  const handleNextDay = () => {
    const nextDate = addDays(currentDate, 1);
    // Check if nextDate is within 7 days after baseDate
    const maxDate = addDays(baseDate, 7);
    if (!isBefore(nextDate, maxDate) && nextDate !== maxDate) return;
    
    setCurrentDate(nextDate);
    setAvailability(getAvailabilityForDate(nextDate));
  };

  // Check if slot is disabled
  const isSlotDisabled = (rowIdx: number, colIdx: number): boolean => {
    if (!availability) return false;
    const dock = availability.docks[rowIdx];
    const time = availability.times[colIdx];
    return availability.disabled.some(
      (slot) => slot.dock === dock.id && slot.time === time
    );
  };

  // Check if slot is booked
  const isSlotBooked = (rowIdx: number, colIdx: number): { booked: boolean; licensePlate?: string; truckType?: string; bookingId?: string; makerCode?: string } => {
    if (!availability) return { booked: false };
    const dock = availability.docks[rowIdx];
    const time = availability.times[colIdx];
    const bookedSlot = availability.booked.find(
      (slot) => slot.dock === dock.id && slot.time === time
    );
    if (bookedSlot) {
      return { booked: true, licensePlate: bookedSlot.licensePlate, truckType: bookedSlot.truckType, bookingId: bookedSlot.bookingId, makerCode: bookedSlot.makerCode };
    }
    return { booked: false };
  };

  // Handle booking slot click
  const handleBookingClick = (bookingId: string) => {
    const bookingDetail = getBookingDetails(bookingId);
    if (bookingDetail) {
      setSelectedBooking(bookingDetail);
      setShowBookingDetail(true);
      setIsEditMode(false); // Reset edit mode when opening dialog
      setEditLicensePlate(bookingDetail.licensePlate);
      setEditTruckType(bookingDetail.truckType);
    }
  };

  // Handle reprint
  const handleReprint = () => {
    if (selectedBooking) {
      setShowBookingDetail(false);
      setShowPrintDialog(true);
    }
  };

  // Handle delete invoice
  const handleDeleteInvoice = (invoiceId: string) => {
    if (selectedBooking) {
      const updatedInvoices = selectedBooking.invoices.filter(inv => inv.id !== invoiceId);
      setSelectedBooking({
        ...selectedBooking,
        invoices: updatedInvoices
      });
    }
  };

  // Handle edit mode
  const handleEditClick = () => {
    setIsEditMode(true);
  };

  // Get available invoices with status "20"
  const getAvailableInvoices = (): Invoice[] => {
    // Mock available invoices from delivery master with status "20"
    return [
      { id: 'av1', seq: 1, invoiceNo: 'JUSTPARENT007', arrivalNo: 'A59100001', items: 5, pcs: 200, amountExcVat: '1,130.50', status: '20' },
      { id: 'av2', seq: 2, invoiceNo: 'JUSTCHILDPART007', arrivalNo: 'A59110001', items: 6, pcs: 666, amountExcVat: '14,679.77', status: '20' },
      { id: 'av3', seq: 3, invoiceNo: 'TESTINPUT091025', arrivalNo: 'A59110003', items: 1, pcs: 250, amountExcVat: '6,777.80', status: '20' },
    ];
  };

  // Handle add invoice
  const handleAddInvoice = () => {
    setSelectedInvoiceIds(new Set());
    setShowAddInvoiceDialog(true);
  };

  // Handle select/deselect all invoices
  const handleSelectAllInvoices = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(getAvailableInvoices().map(inv => inv.id));
      setSelectedInvoiceIds(allIds);
    } else {
      setSelectedInvoiceIds(new Set());
    }
  };

  // Handle individual invoice selection
  const handleInvoiceSelection = (invoiceId: string, checked: boolean) => {
    const newSelection = new Set(selectedInvoiceIds);
    if (checked) {
      newSelection.add(invoiceId);
    } else {
      newSelection.delete(invoiceId);
    }
    setSelectedInvoiceIds(newSelection);
  };

  // Handle submit add invoices
  const handleSubmitAddInvoices = () => {
    if (selectedBooking && selectedInvoiceIds.size > 0) {
      const availableInvoices = getAvailableInvoices();
      const invoicesToAdd = availableInvoices.filter(inv => selectedInvoiceIds.has(inv.id));
      
      // Update sequence numbers for new invoices
      const maxSeq = selectedBooking.invoices.length > 0 
        ? Math.max(...selectedBooking.invoices.map(inv => inv.seq))
        : 0;
      
      const newInvoices = invoicesToAdd.map((inv, idx) => ({
        ...inv,
        seq: maxSeq + idx + 1
      }));

      const updatedBooking = {
        ...selectedBooking,
        invoices: [...selectedBooking.invoices, ...newInvoices]
      };
      
      setSelectedBooking(updatedBooking);
      setShowAddInvoiceDialog(false);
      setSelectedInvoiceIds(new Set());
    }
  };

  // Handle submit edit
  const handleSubmitEdit = () => {
    if (selectedBooking) {
      // Update the booking with new values
      const updatedBooking = {
        ...selectedBooking,
        licensePlate: editLicensePlate,
        truckType: editTruckType
      };
      setSelectedBooking(updatedBooking);
      // TODO: Save to backend
      console.log('Submitted changes:', updatedBooking);
      setIsEditMode(false);
    }
  };

  // Handle close edit mode
  const handleCloseEdit = () => {
    // Reset to original values
    if (selectedBooking) {
      setEditLicensePlate(selectedBooking.licensePlate);
      setEditTruckType(selectedBooking.truckType);
    }
    setIsEditMode(false);
  };

  // Handle delete slot button click
  const handleDeleteSlotClick = () => {
    setShowDeleteSlotDialog(true);
  };

  // Handle confirm delete slot
  const handleConfirmDeleteSlot = () => {
    if (selectedBooking && availability) {
      // Remove the booked slots from availability
      const updatedBooked = availability.booked.filter(
        slot => slot.bookingId !== selectedBooking.bookingId
      );
      
      setAvailability({
        ...availability,
        booked: updatedBooked
      });
      
      // Close dialogs
      setShowDeleteSlotDialog(false);
      setShowBookingDetail(false);
      setIsEditMode(false);
    }
  };

  if (!availability) return null;

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-white to-red-50">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[13px] text-gray-700"> Select Date to Deliver: </span>
                <Input 
                  className="h-6 text-[11px] w-[100px]" 
                  value={deliverDate ? format(deliverDate, 'dd/MM/yyyy') : ''}
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
                      selected={deliverDate}
                      onSelect={(date) => {
                        if (date) {
                          setDeliverDate(date);
                          const dateStr = toISODateLocal(date);
                          setCurrentDate(dateStr);
                          setAvailability(getAvailabilityForDate(dateStr));
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-gray-700">
                  <span className="font-semibold">Delivery Place :</span> APC2
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-gray-700">
                  <span className="font-semibold">Transport Mode :</span> Direct
                </span>
              </div>
            </div>
            
            {/* Procurement PIC Row */}
            <div className="flex items-center">
              <span className="text-[13px] text-gray-700">
                <span className="font-semibold">Procurement PIC :</span> MR. JOHN DOE
              </span>
            </div>

            {/* Maker Code and Maker Name Row */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-gray-700">
                  <span className="font-semibold">Maker Code :</span> 05646
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-gray-700">
                  <span className="font-semibold">Maker Name :</span> ASTEMO ASIA LTD.
                </span>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="p-6">
            {/* Select Time Range */}
            <div className="flex items-center justify-end gap-3 mb-3">
              <Button
                onClick={handlePreviousDay}
                disabled={isBefore(addDays(currentDate, -1), baseDate)}
                className="h-8 w-8 p-0 bg-[#da1212] hover:bg-[#e53935] text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="bg-red-50 border border-red-200 text-[#da1212] px-4 py-2 rounded-full text-[12px] font-semibold min-w-[200px] text-center">
                {formatThaiDate(currentDate)}
              </span>
              <Button
                onClick={handleNextDay}
                disabled={!isBefore(currentDate, addDays(baseDate, 7))}
                className="h-8 w-8 p-0 bg-[#da1212] hover:bg-[#e53935] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Booking table */}
            <div
              className="grid border border-gray-300 rounded-lg overflow-hidden"
              style={{
                gridTemplateColumns: `80px 160px repeat(${availability.times.length}, 1fr)`,
              }}
            >
              {/* Header Row */}
              <div className="bg-gray-100 border-r border-b border-gray-300 p-3 flex items-center justify-center text-[12px] font-semibold">
                Dock
              </div>
              <div className="bg-gray-100 border-r border-b border-gray-300 p-3 flex items-center justify-center text-[12px] font-semibold">
                Info
              </div>
              {availability.times.map((time) => {
                const isBreakTime = BREAK_TIMES.includes(time);
                return (
                  <div
                    key={time}
                    className="bg-gray-100 border-r border-b border-gray-300 p-3 flex items-center justify-center text-[12px] font-semibold"
                  >
                    {time} {isBreakTime && <span className="text-gray-400 ml-1">(break)</span>}
                  </div>
                );
              })}

              {/* Data Rows */}
              {availability.docks.map((dock, rowIdx) => (
                <React.Fragment key={dock.id}>
                  {/* Dock Label */}
                  <div className="bg-white border-r border-b border-gray-300 p-3 flex items-center justify-center text-[12px] font-semibold">
                    {dock.label}
                  </div>

                  {/* Dock Info */}
                  <div className="bg-white border-r border-b border-gray-300 p-3 flex items-center justify-center text-[12px] font-semibold">
                    {dock.info}
                  </div>

                  {/* Time Slots */}
                  {availability.times.map((time, colIdx) => {
                    const isBreakTime = BREAK_TIMES.includes(time);
                    const isDisabled = isSlotDisabled(rowIdx, colIdx);
                    const bookedInfo = isSlotBooked(rowIdx, colIdx);

                    let cellClasses = 'border-r border-b border-gray-300 p-1 flex flex-col items-center justify-center text-[10px]';

                    if (isBreakTime) {
                      cellClasses += ' bg-slate-100 text-gray-600';
                    } else if (isDisabled) {
                      cellClasses += ' bg-gray-200 text-gray-500';
                    } else if (bookedInfo.booked) {
                      cellClasses += ' bg-green-100 border-2 border-green-600 cursor-pointer hover:bg-green-200 transition-colors';
                    } else {
                      cellClasses += ' bg-white';
                    }

                    return (
                      <div
                        key={`${rowIdx}-${colIdx}`}
                        className={cellClasses}
                        title={bookedInfo.booked ? `${bookedInfo.licensePlate} (${bookedInfo.truckType}) - Click for details` : ''}
                        onClick={() => bookedInfo.booked && bookedInfo.bookingId && handleBookingClick(bookedInfo.bookingId)}
                      >
                        {isBreakTime ? (
                          <span className="text-[12px]">—</span>
                        ) : isDisabled ? (
                          <span className="text-[12px]">×</span>
                        ) : bookedInfo.booked ? (
                          <>
                            {bookedInfo.makerCode && (
                              <span className="text-[9px] text-green-600">{bookedInfo.makerCode}</span>
                            )}
                            <span className="font-semibold text-green-700">{bookedInfo.licensePlate}</span>
                            <span className="text-green-600 text-[9px]">{bookedInfo.truckType}</span>
                          </>
                        ) : null}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 text-[12px] text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border-2 border-green-600 rounded"></div>
                <span>Booked (Click for details)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <span>Not Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-slate-100 border border-gray-300 rounded"></div>
                <span>Break Time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                <span>Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Detail Dialog */}
      {selectedBooking && (
        <Dialog open={showBookingDetail} onOpenChange={setShowBookingDetail}>
          <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto p-6">
            <div className="space-y-4">
              {/* Compact Header - Single Line */}
              <div className="bg-white border border-gray-300 p-3 text-[11px]">
                <div className="flex items-center gap-4 flex-wrap justify-between">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span><strong>Slot :</strong> {selectedBooking.dock}</span>
                    <span><strong>Delivery date :</strong> {deliverDate ? format(deliverDate, 'dd/MM/yyyy') : ''}</span>
                    <span><strong>Time :</strong> {selectedBooking.timeSlots.join(', ')}</span>
                    <span><strong>Delivery place :</strong> APC2</span>
                    {!isEditMode ? (
                      <>
                        <span><strong>License plate :</strong> {selectedBooking.licensePlate}</span>
                        <span><strong>Truck type :</strong> {selectedBooking.truckType}</span>
                      </>
                    ) : (
                      <>
                        <span className="flex items-center gap-2">
                          <strong>License plate :</strong>
                          <Input
                            value={editLicensePlate}
                            onChange={(e) => setEditLicensePlate(e.target.value)}
                            className="h-6 w-32 text-[11px] px-2"
                          />
                        </span>
                        <span className="flex items-center gap-2">
                          <strong>Truck type :</strong>
                          <Select value={editTruckType} onValueChange={setEditTruckType}>
                            <SelectTrigger className="h-6 text-[10px] border-gray-400">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="4W">4W (4-Wheel)</SelectItem>
                              <SelectItem value="6W">6W (6-Wheel)</SelectItem>
                            </SelectContent>
                          </Select>
                        </span>
                      </>
                    )}
                  </div>
                  {isEditMode && (
                    <Button
                      onClick={handleDeleteSlotClick}
                      className="h-6 px-4 text-[11px] bg-[#da1212] hover:bg-[#e53935] text-white ml-auto"
                    >
                      Delete slot
                    </Button>
                  )}
                </div>
              </div>

              {/* Invoice Table */}
              <div className="border border-gray-300">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="bg-white border-b border-gray-300">
                      <th className="border-r border-gray-300 px-2 py-2 text-center font-semibold">Seq</th>
                      <th className="border-r border-gray-300 px-2 py-2 text-left font-semibold">Invoice no.</th>
                      <th className="border-r border-gray-300 px-2 py-2 text-left font-semibold">Arrival no.</th>
                      <th className="border-r border-gray-300 px-2 py-2 text-center font-semibold">Items</th>
                      <th className="border-r border-gray-300 px-2 py-2 text-center font-semibold">Pcs.</th>
                      <th className="border-r border-gray-300 px-2 py-2 text-right font-semibold">Amount (Exc. Vat.)</th>
                      <th className={cn("px-2 py-2 text-center font-semibold", isEditMode && "border-r border-gray-300")}>Status</th>
                      {isEditMode && (
                        <th className="px-2 py-2 text-center font-semibold">Delete</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBooking.invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-gray-300 hover:bg-gray-50">
                        <td className="border-r border-gray-300 px-2 py-2 text-center">{invoice.seq}</td>
                        <td className="border-r border-gray-300 px-2 py-2">{invoice.invoiceNo}</td>
                        <td className="border-r border-gray-300 px-2 py-2">{invoice.arrivalNo}</td>
                        <td className="border-r border-gray-300 px-2 py-2 text-center">{invoice.items}</td>
                        <td className="border-r border-gray-300 px-2 py-2 text-center">{invoice.pcs}</td>
                        <td className="border-r border-gray-300 px-2 py-2 text-right">{invoice.amountExcVat}</td>
                        <td className={cn("px-2 py-2 text-center", isEditMode && "border-r border-gray-300")}>{invoice.status}</td>
                        {isEditMode && (
                          <td className="px-2 py-2 text-center">
                            <button
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors inline-flex items-center justify-center"
                              title="Delete invoice"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Edit Mode Buttons - shown only in edit mode */}
              {isEditMode && (
                <div className="space-y-2">
                  <div className="flex justify-start">
                    <Button
                      onClick={handleAddInvoice}
                      variant="outline"
                      className="h-8 px-6 text-[11px] border-gray-400"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <Button
                      onClick={handleSubmitEdit}
                      className="h-8 px-6 text-[11px] bg-[#da1212] hover:bg-[#e53935] text-white"
                    >
                      Submit
                    </Button>
                    <Button
                      onClick={handleCloseEdit}
                      variant="outline"
                      className="h-8 px-6 text-[11px] border-gray-400"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons - hidden in edit mode */}
              {!isEditMode && (
                <div className="flex justify-center gap-3 pt-2">
                  <Button
                    onClick={handleReprint}
                    variant="outline"
                    className="h-8 px-6 text-[11px] border-gray-400"
                  >
                    Print privilege ticket
                  </Button>
                  <Button
                    onClick={handleEditClick}
                    className="h-8 px-6 text-[11px] bg-[#da1212] hover:bg-[#e53935] text-white"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => setShowBookingDetail(false)}
                    variant="outline"
                    className="h-8 px-6 text-[11px] border-gray-400"
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Print Dialog */}
      {showPrintDialog && selectedBooking && (
        <DeliveryTicketPrint
          tickets={[{
            slotCode: `${selectedBooking.dock}-${selectedBooking.timeSlots.join(',')}`,
            deliveryDate: selectedBooking.deliveryDate,
            deliveryPlace: 'APC2',
            makerCode: '05646',
            makerName: 'ASTEMO ASIA LTD.',
            transportMode: 'Direct',
            licensePlate: selectedBooking.licensePlate,
            truckType: selectedBooking.truckType,
            bookingId: selectedBooking.bookingId
          }]}
          onClose={() => {
            setShowPrintDialog(false);
            setShowBookingDetail(true); // Return to booking detail
          }}
        />
      )}

      {/* Add Invoice Dialog */}
      <Dialog open={showAddInvoiceDialog} onOpenChange={setShowAddInvoiceDialog}>
        <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Date Filters */}
            <div className="flex items-center gap-4 text-[11px]">
              <span className="whitespace-nowrap">Invoice entry date from :</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-7 px-2 text-[11px] justify-start text-left font-normal border-gray-300",
                      !invoiceEntryDateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {invoiceEntryDateFrom ? format(invoiceEntryDateFrom, 'dd/MM/yyyy') : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={invoiceEntryDateFrom}
                    onSelect={setInvoiceEntryDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <span className="whitespace-nowrap">To :</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-7 px-2 text-[11px] justify-start text-left font-normal border-gray-300",
                      !invoiceEntryDateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {invoiceEntryDateTo ? format(invoiceEntryDateTo, 'dd/MM/yyyy') : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={invoiceEntryDateTo}
                    onSelect={setInvoiceEntryDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Maker Info */}
            <div className="text-[11px] space-y-1">
              <div>Maker code : 05686</div>
              <div>Maker name : ASTEMO ASIA LTD.</div>
            </div>

            {/* Invoice Table */}
            <div className="border border-gray-300 bg-gray-100">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="bg-white border-b border-gray-300">
                    <th className="border-r border-gray-300 px-2 py-2 text-left">
                      <div className="flex items-center gap-1">
                        <Checkbox
                          checked={selectedInvoiceIds.size === getAvailableInvoices().length && getAvailableInvoices().length > 0}
                          onCheckedChange={handleSelectAllInvoices}
                        />
                        <span className="font-semibold"></span>
                      </div>
                    </th>
                    <th className="border-r border-gray-300 px-2 py-2 text-left font-semibold">Invoice no.</th>
                    <th className="border-r border-gray-300 px-2 py-2 text-left font-semibold">Arrival no.</th>
                    <th className="border-r border-gray-300 px-2 py-2 text-center font-semibold">Items</th>
                    <th className="border-r border-gray-300 px-2 py-2 text-center font-semibold">Pcs.</th>
                    <th className="border-r border-gray-300 px-2 py-2 text-right font-semibold">Amount (Exc. Vat.)</th>
                    <th className="px-2 py-2 text-center font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getAvailableInvoices().map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-300 bg-white hover:bg-gray-50">
                      <td className="border-r border-gray-300 px-2 py-2">
                        <Checkbox
                          checked={selectedInvoiceIds.has(invoice.id)}
                          onCheckedChange={(checked) => handleInvoiceSelection(invoice.id, checked as boolean)}
                        />
                      </td>
                      <td className="border-r border-gray-300 px-2 py-2">{invoice.invoiceNo}</td>
                      <td className="border-r border-gray-300 px-2 py-2">{invoice.arrivalNo}</td>
                      <td className="border-r border-gray-300 px-2 py-2 text-center">{invoice.items}</td>
                      <td className="border-r border-gray-300 px-2 py-2 text-center">{invoice.pcs}</td>
                      <td className="border-r border-gray-300 px-2 py-2 text-right">{invoice.amountExcVat}</td>
                      <td className="px-2 py-2 text-center">{invoice.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

           
            {/* Action Buttons */}
            <div className="flex justify-center gap-3 pt-2">
              <Button
                onClick={handleSubmitAddInvoices}
                disabled={selectedInvoiceIds.size === 0}
                className="h-8 px-6 text-[11px] bg-[#da1212] hover:bg-[#e53935] text-white disabled:bg-gray-300 disabled:text-gray-500"
              >
                Submit
              </Button>
              <Button
                onClick={() => {
                  setShowAddInvoiceDialog(false);
                  setSelectedInvoiceIds(new Set());
                }}
                variant="outline"
                className="h-8 px-6 text-[11px] border-gray-400"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Slot Confirmation Dialog */}
      <AlertDialog open={showDeleteSlotDialog} onOpenChange={setShowDeleteSlotDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to delete slot {selectedBooking?.dock} ({selectedBooking?.timeSlots.join(', ')})?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDeleteSlot}
              className="bg-[#da1212] hover:bg-[#e53935]"
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default FastLaneInquiry;