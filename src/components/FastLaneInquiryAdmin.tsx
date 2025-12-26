import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, CalendarIcon, Printer, Trash2, FileSpreadsheet } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from './ui/alert-dialog';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from './ui/utils';
import { format } from 'date-fns';
import { DeliveryTicketPrint } from './DeliveryTicketPrint';
import * as XLSX from 'xlsx';

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
  bookedBy?: 'supplier' | 'apc';
  supplierName?: string;
  supplierCode?: string;
  contactPerson?: string;
  phoneNumber?: string;
}

interface AvailabilityData {
  docks: Dock[];
  times: string[];
  disabled: { dock: string; time: string }[];
  booked: { dock: string; time: string; licensePlate: string; truckType: string; bookingId: string; bookedBy?: 'supplier' | 'apc'; invoiceNo?: string; supplierName?: string; transportMode?: string }[];
}

interface BookedSlot {
  rowIdx: number;
  colIdx: number;
  licensePlate: string;
  truckType: string;
}

const BREAK_TIMES = ['12:00'];

function FastLaneInquiryAdmin() {
  // Date states
  const [deliverDate, setDeliverDate] = useState<Date>();
  
  const [baseDate, setBaseDate] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  
  // Delivery place state
  const [deliveryPlace, setDeliveryPlace] = useState<string>('APC2');
  
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
  
  // Excel export dialog states
  const [showExcelExportDialog, setShowExcelExportDialog] = useState<boolean>(false);
  const [excelExportWH, setExcelExportWH] = useState<string>('APC2');
  const [excelExportDateFrom, setExcelExportDateFrom] = useState<Date>();
  const [excelExportDateTo, setExcelExportDateTo] = useState<Date>();

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

    // Admin view: No disabled slots - all slots are visible
    const disabled: { dock: string; time: string }[] = [];

    // Mock some booked slots (this would come from backend in real app)
    // Note: Same bookingId for combined slots
    // Green slots: booked by APC (bookedBy: 'apc' or undefined)
    // Light blue slots: booked by supplier (bookedBy: 'supplier')
    const booked = [
      { dock: 'A1', time: '07:30', licensePlate: 'JKL-7890', truckType: '6W', bookingId: 'BK20241114008', bookedBy: 'apc' as const, transportMode: 'MILKRUN' },
      { dock: 'A1', time: '09:00', licensePlate: 'ABC-1234', truckType: '4W', bookingId: 'BK20241114001', bookedBy: 'apc' as const, transportMode: 'MILKRUN' },
      { dock: 'A1', time: '10:30', licensePlate: 'ABC-1234', truckType: '4W', bookingId: 'BK20241114001', bookedBy: 'apc' as const, transportMode: 'MILKRUN' },
      { dock: 'A2', time: '14:30', licensePlate: 'XYZ-5678', truckType: '6W', bookingId: 'BK20241114002', bookedBy: 'apc' as const, transportMode: 'MILKRUN' },
      { dock: 'B3', time: '09:00', licensePlate: 'DEF-9012', truckType: '4W', bookingId: 'BK20241114003', bookedBy: 'apc' as const, transportMode: 'AYU Drop' },
      { dock: 'B3', time: '10:30', licensePlate: 'MNO-2468', truckType: '4W', bookingId: 'BK20241114009', bookedBy: 'supplier' as const, invoiceNo: '12345', supplierName: 'SUPPLIER CO.' },
      { dock: 'C4', time: '13:00', licensePlate: 'GHI-3456', truckType: '4W', bookingId: 'BK20241114004', bookedBy: 'apc' as const, transportMode: 'MILKRUN' },
      // Supplier bookings (light blue)
      { dock: 'A2', time: '07:30', licensePlate: '72-3494', truckType: '6W', bookingId: 'BK20241114005', bookedBy: 'supplier' as const, invoiceNo: '05205', supplierName: 'ASTEMO ASIA LTD.' },
      { dock: 'B3', time: '13:00', licensePlate: 'SUP-1122', truckType: '4W', bookingId: 'BK20241114006', bookedBy: 'supplier' as const, invoiceNo: '05231', supplierName: 'THAILAND LTD.' },
      { dock: 'C4', time: '16:00', licensePlate: 'SUP-3344', truckType: '4W', bookingId: 'BK20241114007', bookedBy: 'supplier' as const, invoiceNo: '49090', supplierName: 'APM' },
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
      'BK20241114005': {
        bookingId: 'BK20241114005',
        dock: 'A2',
        dockInfo: 'APC Pack',
        timeSlots: ['07:30'],
        licensePlate: '72-3494',
        truckType: '6W',
        deliveryDate: currentDate,
        bookedBy: 'supplier',
        supplierName: 'ASTEMO ASIA LTD.',
        supplierCode: '05646',
        contactPerson: 'John Smith',
        phoneNumber: '081-234-5678',
        invoices: [
          { id: '9', seq: 1, invoiceNo: '05205', arrivalNo: 'ARV-009', items: 2, pcs: 60, amountExcVat: '55,000.00', status: '30' },
        ]
      },
      'BK20241114006': {
        bookingId: 'BK20241114006',
        dock: 'B3',
        dockInfo: 'Maker Pack',
        timeSlots: ['13:00'],
        licensePlate: 'SUP-1122',
        truckType: '4W',
        deliveryDate: currentDate,
        bookedBy: 'supplier',
        supplierName: 'THAILAND LTD.',
        supplierCode: 'SUP-002',
        contactPerson: 'Jane Doe',
        phoneNumber: '082-345-6789',
        invoices: [
          { id: '10', seq: 1, invoiceNo: '05231', arrivalNo: 'ARV-010', items: 12, pcs: 350, amountExcVat: '95,000.00', status: '30' },
          { id: '11', seq: 2, invoiceNo: 'INV-2024-011', arrivalNo: 'ARV-011', items: 4, pcs: 100, amountExcVat: '35,000.00', status: '30' },
        ]
      },
      'BK20241114007': {
        bookingId: 'BK20241114007',
        dock: 'C4',
        dockInfo: 'F/L Unload',
        timeSlots: ['16:00'],
        licensePlate: 'SUP-3344',
        truckType: '4W',
        deliveryDate: currentDate,
        bookedBy: 'supplier',
        supplierName: 'APM',
        supplierCode: 'SUP-003',
        contactPerson: 'Mike Johnson',
        phoneNumber: '083-456-7890',
        invoices: [
          { id: '12', seq: 1, invoiceNo: '49090', arrivalNo: 'ARV-012', items: 5, pcs: 150, amountExcVat: '48,500.00', status: '30' },
        ]
      },
      'BK20241114008': {
        bookingId: 'BK20241114008',
        dock: 'A1',
        dockInfo: 'APC Pack',
        timeSlots: ['07:30'],
        licensePlate: 'JKL-7890',
        truckType: '6W',
        deliveryDate: currentDate,
        bookedBy: 'apc',
        invoices: [
          { id: '13', seq: 1, invoiceNo: 'INV-2024-013', arrivalNo: 'ARV-013', items: 6, pcs: 175, amountExcVat: '52,000.00', status: '30' },
        ]
      },
      'BK20241114009': {
        bookingId: 'BK20241114009',
        dock: 'B3',
        dockInfo: 'Maker Pack',
        timeSlots: ['10:30'],
        licensePlate: 'MNO-2468',
        truckType: '4W',
        deliveryDate: currentDate,
        bookedBy: 'supplier',
        supplierName: 'SUPPLIER CO.',
        supplierCode: 'SUP-004',
        contactPerson: 'Sarah Lee',
        phoneNumber: '084-567-8901',
        invoices: [
          { id: '14', seq: 1, invoiceNo: '12345', arrivalNo: 'ARV-014', items: 3, pcs: 90, amountExcVat: '38,000.00', status: '30' },
        ]
      },
    };

    return bookingDetailsMap[bookingId] || null;
  };

  // Handle previous day
  const handlePreviousDay = () => {
    const previousDate = addDays(currentDate, -1);
    // Check if previousDate is within 7 days before deliverDate
    if (deliverDate) {
      const minDate = addDays(toISODateLocal(deliverDate), -7);
      if (isBefore(previousDate, minDate)) return;
    }
    setCurrentDate(previousDate);
    setAvailability(getAvailabilityForDate(previousDate));
  };

  // Handle next day
  const handleNextDay = () => {
    const nextDate = addDays(currentDate, 1);
    // Check if nextDate is within 7 days after deliverDate
    if (deliverDate) {
      const maxDate = addDays(toISODateLocal(deliverDate), 7);
      if (!isBefore(nextDate, maxDate) && nextDate !== maxDate) return;
    }
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
  const isSlotBooked = (rowIdx: number, colIdx: number): { booked: boolean; licensePlate?: string; truckType?: string; bookingId?: string; bookedBy?: 'supplier' | 'apc'; invoiceNo?: string; supplierName?: string; transportMode?: string } => {
    if (!availability) return { booked: false };
    const dock = availability.docks[rowIdx];
    const time = availability.times[colIdx];
    const bookedSlot = availability.booked.find(
      (slot) => slot.dock === dock.id && slot.time === time
    );
    if (bookedSlot) {
      return { booked: true, licensePlate: bookedSlot.licensePlate, truckType: bookedSlot.truckType, bookingId: bookedSlot.bookingId, bookedBy: bookedSlot.bookedBy, invoiceNo: bookedSlot.invoiceNo, supplierName: bookedSlot.supplierName, transportMode: bookedSlot.transportMode };
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

  // Handle export to Excel - open dialog
  const handleExportToExcel = () => {
    // Initialize with default values
    setExcelExportWH(deliveryPlace);
    setExcelExportDateFrom(deliverDate);
    setExcelExportDateTo(deliverDate);
    setShowExcelExportDialog(true);
  };

  // Perform actual Excel export
  const performExcelExport = () => {
    if (!availability) return;

    // Create worksheet data
    const worksheetData: any[][] = [];

    // Add header row
    const headerRow = [
      'Date to delivery',
      'Wh',
      'Slot',
      'Time',
      'Transport mode',
      'Truck type',
      'License plate',
      'Maker code',
      'Maker name',
      'Inv. No',
      'PART NO.',
      'Arrival No.',
      'Qty',
      'Vol.',
      'TLM3',
      'Delivery Ticket No.'
    ];
    worksheetData.push(headerRow);

    // Collect all bookings sorted by dock and time
    const bookingsToExport: Array<{
      dock: string;
      dockInfo: string;
      time: string;
      bookingDetail: BookingDetail;
    }> = [];

    availability.docks.forEach((dock, rowIdx) => {
      availability.times.forEach((time, colIdx) => {
        const isBreakTime = BREAK_TIMES.includes(time);
        if (isBreakTime) return; // Skip break times
        
        const bookedInfo = isSlotBooked(rowIdx, colIdx);
        if (bookedInfo.booked && bookedInfo.bookingId) {
          const bookingDetail = getBookingDetails(bookedInfo.bookingId);
          if (bookingDetail) {
            // Check if we already added this booking (for multi-slot bookings)
            const alreadyAdded = bookingsToExport.some(
              b => b.bookingDetail.bookingId === bookingDetail.bookingId
            );
            if (!alreadyAdded) {
              bookingsToExport.push({
                dock: dock.id,
                dockInfo: dock.info,
                time: time,
                bookingDetail: bookingDetail
              });
            }
          }
        }
      });
    });

    // Sort bookings by date, then dock, then time
    bookingsToExport.sort((a, b) => {
      if (a.bookingDetail.deliveryDate !== b.bookingDetail.deliveryDate) {
        return a.bookingDetail.deliveryDate.localeCompare(b.bookingDetail.deliveryDate);
      }
      if (a.dock !== b.dock) {
        return a.dock.localeCompare(b.dock);
      }
      return a.time.localeCompare(b.time);
    });

    // Convert bookings to rows
    bookingsToExport.forEach((booking) => {
      const { dock, time, bookingDetail } = booking;
      const isSupplierBooking = bookingDetail.bookedBy === 'supplier';
      
      // Format delivery date
      const [year, month, day] = bookingDetail.deliveryDate.split('-').map(Number);
      const deliveryDateFormatted = `${day}/${month}/${year}`;
      
      // Get transport mode based on dock info
      const transportMode = bookingDetail.dockInfo.includes('DIRECT') ? 'DIRECT' : 
                           bookingDetail.dockInfo.includes('MILK') ? 'MILK RUN' : 'MILK RUN';
      
      // If there are invoices, create a row for each invoice
      if (bookingDetail.invoices && bookingDetail.invoices.length > 0) {
        bookingDetail.invoices.forEach((invoice, idx) => {
          const row = [
            deliveryDateFormatted,                                    // Date to delivery
            deliveryPlace,                                            // Wh
            dock,                                                     // Slot
            time,                                                     // Time
            transportMode,                                            // Transport mode
            bookingDetail.truckType,                                  // Truck type
            bookingDetail.licensePlate,                               // License plate
            isSupplierBooking ? (bookingDetail.supplierCode || '') : '', // Maker code
            isSupplierBooking ? (bookingDetail.supplierName || '') : '', // Maker name
            invoice.invoiceNo,                                        // Inv. No
            'XXXXXXXXX',                                              // PART NO. (mock data)
            invoice.arrivalNo,                                        // Arrival No.
            invoice.pcs,                                              // Qty
            '0.025',                                                  // Vol. (mock data)
            '0.25',                                                   // TLM3 (mock data)
            'XXXXXXXXXX'                                              // Delivery Ticket No. (mock data)
          ];
          worksheetData.push(row);
        });
      } else {
        // No invoices, create a single row with booking info
        const row = [
          deliveryDateFormatted,                                    // Date to delivery
          deliveryPlace,                                            // Wh
          dock,                                                     // Slot
          time,                                                     // Time
          transportMode,                                            // Transport mode
          bookingDetail.truckType,                                  // Truck type
          bookingDetail.licensePlate,                               // License plate
          isSupplierBooking ? (bookingDetail.supplierCode || '') : '', // Maker code
          isSupplierBooking ? (bookingDetail.supplierName || '') : '', // Maker name
          '',                                                       // Inv. No
          '',                                                       // PART NO.
          '',                                                       // Arrival No.
          '',                                                       // Qty
          '',                                                       // Vol.
          '',                                                       // TLM3
          ''                                                        // Delivery Ticket No.
        ];
        worksheetData.push(row);
      }
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    const colWidths = [
      { wch: 13 },  // Date to delivery
      { wch: 6 },   // Wh
      { wch: 6 },   // Slot
      { wch: 6 },   // Time
      { wch: 15 },  // Transport mode
      { wch: 11 },  // Truck type
      { wch: 14 },  // License plate
      { wch: 11 },  // Maker code
      { wch: 28 },  // Maker name
      { wch: 15 },  // Inv. No
      { wch: 15 },  // PART NO.
      { wch: 13 },  // Arrival No.
      { wch: 5 },   // Qty
      { wch: 6 },   // Vol.
      { wch: 6 },   // TLM3
      { wch: 16 }   // Delivery Ticket No.
    ];
    ws['!cols'] = colWidths;

    // Apply styling
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;

        // Initialize cell style
        ws[cellAddress].s = {
          alignment: { vertical: 'center', horizontal: 'center' },
          font: { sz: 10, name: 'Arial' },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          }
        };

        // Header row styling
        if (R === 0) {
          ws[cellAddress].s.font = { sz: 10, bold: true, name: 'Arial' };
          ws[cellAddress].s.fill = { fgColor: { rgb: 'D3D3D3' } };
        }

        // Maker name column - left align
        if (C === 8 && R > 0) {
          ws[cellAddress].s.alignment = { vertical: 'center', horizontal: 'left' };
        }
      }
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Fast Lane Data');

    // Generate Excel file and trigger download
    const dateFromStr = excelExportDateFrom ? toISODateLocal(excelExportDateFrom).replace(/-/g, '') : '';
    const dateToStr = excelExportDateTo ? toISODateLocal(excelExportDateTo).replace(/-/g, '') : '';
    const fileName = `FastLane_Export_${excelExportWH}_${dateFromStr}_${dateToStr}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    // Close the dialog
    setShowExcelExportDialog(false);
  };

  if (!availability) return null;

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-white to-red-50">
            <div className="space-y-3">
              {/* First Row: Date and Delivery Place */}
              <div className="flex items-center gap-6">
                {/* Select Date to Deliver */}
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[13px] text-gray-700">Select Date to Deliver:</span>
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

                {/* Delivery Place */}
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[13px] text-gray-700">Delivery Place:</span>
                  <Select value={deliveryPlace} onValueChange={setDeliveryPlace}>
                    <SelectTrigger className="h-6 text-[11px] w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APC1">APC1</SelectItem>
                      <SelectItem value="APC2">APC2</SelectItem>
                      <SelectItem value="APC3">APC3</SelectItem>
                      <SelectItem value="Warehouse A">Warehouse A</SelectItem>
                      <SelectItem value="Warehouse B">Warehouse B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Second Row: Search and Excel Buttons */}
              <div className="flex justify-end gap-2">
                <Button 
                  className="h-8 px-6 bg-[#da1212] hover:bg-[#e53935] text-white text-[11px]"
                  onClick={() => {
                    // Search functionality
                    console.log('Searching with:', { deliverDate, deliveryPlace });
                  }}
                >
                  Search
                </Button>
                <Button 
                  variant="outline"
                  className="h-8 px-4 text-[11px] border-[#da1212] text-[#da1212] hover:bg-red-50"
                  onClick={handleExportToExcel}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-1" />
                  Transfer to Excel
                </Button>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="p-6">
            {/* Select Time Range */}
            <div className="flex items-center justify-end gap-3 mb-3">
              <Button
                onClick={handlePreviousDay}
                disabled={deliverDate ? !isBefore(addDays(toISODateLocal(deliverDate), -7), currentDate) : isBefore(addDays(currentDate, -1), baseDate)}
                className="h-8 w-8 p-0 bg-[#da1212] hover:bg-[#e53935] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="bg-red-50 border border-red-200 text-[#da1212] px-4 py-2 rounded-full text-[12px] font-semibold min-w-[200px] text-center">
                {formatThaiDate(currentDate)}
              </span>
              <Button
                onClick={handleNextDay}
                disabled={deliverDate ? !isBefore(currentDate, addDays(toISODateLocal(deliverDate), 7)) : false}
                className="h-8 w-8 p-0 bg-[#da1212] hover:bg-[#e53935] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Booking table */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              {/* Header Section - 1 row */}
              <div
                className="grid border-b border-gray-300"
                style={{
                  gridTemplateColumns: `80px 140px repeat(${availability.times.length}, 1fr)`,
                }}
              >
                {/* Row 1: Dock, Info, and Time headers */}
                <div className="bg-gray-100 border-r border-gray-300 p-2 flex items-center justify-center text-[12px] font-semibold">
                  Dock
                </div>
                <div className="bg-gray-100 border-r border-gray-300 p-2 flex items-center justify-center text-[12px] font-semibold">
                  Info.
                </div>
                {availability.times.map((time, idx) => {
                  const isBreakTime = BREAK_TIMES.includes(time);
                  return (
                    <div
                      key={`time-header-${time}`}
                      className="bg-gray-100 border-r border-gray-300 p-2 flex items-center justify-center text-[12px] font-semibold"
                    >
                      {time} {isBreakTime && <span className="text-gray-400 ml-1">(break)</span>}
                    </div>
                  );
                })}
              </div>

              {/* Body Section */}
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `80px 140px repeat(${availability.times.length}, 1fr)`,
                }}
              >
                {/* Data Rows */}
                {availability.docks.map((dock, rowIdx) => (
                <React.Fragment key={dock.id}>
                  {/* First column: Dock Label (A1, A2, B3, C4) */}
                  <div className="bg-white border-r border-b border-gray-300 p-3 flex items-center justify-center text-[12px] font-semibold">
                    {dock.label}
                  </div>

                  {/* Second column: Dock Info (APC Pack, Maker Pack, F/L Unload) */}
                  <div className="bg-white border-r border-b border-gray-300 p-3 flex items-center justify-center text-[12px] font-semibold">
                    {dock.info}
                  </div>

                  {/* Time Slots */}
                  {availability.times.map((time, colIdx) => {
                    const isBreakTime = BREAK_TIMES.includes(time);
                    const bookedInfo = isSlotBooked(rowIdx, colIdx);
                    const isSupplierBooking = bookedInfo.bookedBy === 'supplier';

                    let cellClasses = 'border-r border-b border-gray-300 p-1 flex flex-col items-center justify-center text-[10px]';

                    if (isBreakTime) {
                      cellClasses += ' bg-slate-100 text-gray-600';
                    } else if (bookedInfo.booked) {
                      if (isSupplierBooking) {
                        cellClasses += ' bg-blue-100 border-2 border-blue-400 cursor-pointer hover:bg-blue-200 transition-colors';
                      } else {
                        cellClasses += ' bg-green-100 border-2 border-green-600 cursor-pointer hover:bg-green-200 transition-colors';
                      }
                    } else {
                      cellClasses += ' bg-white';
                    }

                    return (
                      <div
                        key={`${rowIdx}-${colIdx}`}
                        className={cellClasses}
                        title={bookedInfo.booked ? (isSupplierBooking ? `${bookedInfo.invoiceNo} - ${bookedInfo.supplierName} - Click for details` : `${bookedInfo.licensePlate} (${bookedInfo.truckType}) - Click for details`) : ''}
                        onClick={() => bookedInfo.booked && bookedInfo.bookingId && handleBookingClick(bookedInfo.bookingId)}
                      >
                        {isBreakTime ? (
                          <span className="text-[12px]">—</span>
                        ) : bookedInfo.booked ? (
                          <>
                            {isSupplierBooking ? (
                              <>
                                <span className="font-semibold text-blue-700">{bookedInfo.invoiceNo}</span>
                                <span className="text-[9px] text-blue-600">{bookedInfo.supplierName}</span>
                              </>
                            ) : (
                              <>
                                {bookedInfo.transportMode && (
                                  <span className="text-[9px] text-green-600">{bookedInfo.transportMode}</span>
                                )}
                                <span className="font-semibold text-green-700">{bookedInfo.licensePlate}</span>
                                <span className="text-[9px] text-green-600">{bookedInfo.truckType}</span>
                              </>
                            )}
                          </>
                        ) : null}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Detail Dialog */}
      {selectedBooking && (
        <Dialog open={showBookingDetail} onOpenChange={setShowBookingDetail}>
          <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto p-6">
            {selectedBooking.bookedBy === 'supplier' ? (
              /* Supplier Booking Detail View */
              <div className="relative bg-white text-[11px]">
               
                {/* Information Grid */}
                <div className="space-y-2 mb-5">

                  <div className="grid grid-cols-[150px,1fr] gap-x-4 items-start">
                    <span className="font-semibold">Slot &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : &nbsp;&nbsp; {selectedBooking.dock} {selectedBooking.dockInfo}</span>
                  
                  </div>
                
                  <div className="grid grid-cols-[150px,1fr] gap-x-4 items-start">
                    <span className="font-semibold">Maker code &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : &nbsp;&nbsp; {selectedBooking.supplierCode}</span>
                  </div>
                
                  <div className="grid grid-cols-[150px,1fr] gap-x-4 items-start">
                    <span className="font-semibold">Maker name &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : &nbsp;&nbsp; {selectedBooking.supplierName}</span>
                  </div>
                
                  <div className="grid grid-cols-[150px,1fr] gap-x-4 items-start">
                    <span className="font-semibold">Truck type &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : &nbsp;&nbsp; {selectedBooking.truckType}</span>
                  </div>
                
                  <div className="grid grid-cols-[150px,1fr] gap-x-4 items-start">
                    <span className="font-semibold">License plate &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : &nbsp;&nbsp; {selectedBooking.licensePlate}</span>
                  </div>
                
                  <div className="grid grid-cols-[150px,1fr] gap-x-4 items-start">
                    <span className="font-semibold">Total Invoice Qty : &nbsp;&nbsp; {selectedBooking.invoices.length}</span>
                  </div>
                
                  <div className="grid grid-cols-[150px,1fr] gap-x-4 items-start">
                    <span className="font-semibold">Total Arrival No &nbsp; : &nbsp;&nbsp; {selectedBooking.invoices.length}</span>
                  </div>
                
                </div>

                {/* Summary Table */}
                <div className="border-t-2 border-b-2 border-black mt-5">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-black">
                        <th className="py-1.5 text-center"></th>
                        <th className="py-1.5 text-center">ITEM</th>
                        <th className="py-1.5 text-center">Q'TY</th>
                        <th className="py-1.5 text-center">VOLUME</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-1.5 text-left">TOTAL</td>
                        <td className="py-1.5 text-center">{selectedBooking.invoices.reduce((sum, inv) => sum + inv.items, 0)}</td>
                        <td className="py-1.5 text-center">{selectedBooking.invoices.reduce((sum, inv) => sum + inv.pcs, 0)}</td>
                        <td className="py-1.5 text-center">0.250035</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* APC Booking Detail View - Read Only for Admin */
              <div className="relative bg-white text-[11px]">
               
                {/* Information Grid */}
                <div className="space-y-2 mb-5">

                  <div className="grid grid-cols-[150px,1fr] gap-x-4 items-start">
                    <span className="font-semibold">Slot &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : &nbsp;&nbsp; {selectedBooking.dock} {selectedBooking.dockInfo}</span>
                  </div>
                
                  <div className="grid grid-cols-[150px,1fr] gap-x-4 items-start">
                    <span className="font-semibold">Delivery date &nbsp;&nbsp;&nbsp;&nbsp; : &nbsp;&nbsp; {deliverDate ? format(deliverDate, 'dd/MM/yyyy') : ''}</span>
                  </div>
                
                  <div className="grid grid-cols-[150px,1fr] gap-x-4 items-start">
                    <span className="font-semibold">Time &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : &nbsp;&nbsp; {selectedBooking.timeSlots.join(', ')}</span>
                  </div>
                
                  <div className="grid grid-cols-[150px,1fr] gap-x-4 items-start">
                    <span className="font-semibold">Delivery place &nbsp;&nbsp;&nbsp;&nbsp; : &nbsp;&nbsp; {deliveryPlace}</span>
                  </div>
                
                  <div className="grid grid-cols-[150px,1fr] gap-x-4 items-start">
                    <span className="font-semibold">Truck type &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : &nbsp;&nbsp; {selectedBooking.truckType}</span>
                  </div>
                
                  <div className="grid grid-cols-[150px,1fr] gap-x-4 items-start">
                    <span className="font-semibold">License plate &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : &nbsp;&nbsp; {selectedBooking.licensePlate}</span>
                  </div>
                
                  <div className="grid grid-cols-[150px,1fr] gap-x-4 items-start">
                    <span className="font-semibold">Total Invoice Qty : &nbsp;&nbsp; {selectedBooking.invoices.length}</span>
                  </div>
                
                  <div className="grid grid-cols-[150px,1fr] gap-x-4 items-start">
                    <span className="font-semibold">Total Arrival No &nbsp; : &nbsp;&nbsp; {selectedBooking.invoices.length}</span>
                  </div>
                
                </div>

                {/* Summary Table */}
                <div className="border-t-2 border-b-2 border-black mt-5">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-black">
                        <th className="py-1.5 text-center"></th>
                        <th className="py-1.5 text-center">ITEM</th>
                        <th className="py-1.5 text-center">Q'TY</th>
                        <th className="py-1.5 text-center">VOLUME</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-1.5 text-left">TOTAL</td>
                        <td className="py-1.5 text-center">{selectedBooking.invoices.reduce((sum, inv) => sum + inv.items, 0)}</td>
                        <td className="py-1.5 text-center">{selectedBooking.invoices.reduce((sum, inv) => sum + inv.pcs, 0)}</td>
                        <td className="py-1.5 text-center">0.250035</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Close Button - Read Only View */}
                <div className="flex justify-center gap-3 pt-4">
                  <Button
                    onClick={() => setShowBookingDetail(false)}
                    variant="outline"
                    className="h-8 px-6 text-[11px] border-gray-400"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
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
                        <span className="font-semibold">Select/<br />Deselect all</span>
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

      {/* Excel Export Dialog */}
      <Dialog open={showExcelExportDialog} onOpenChange={setShowExcelExportDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[14px]">Transfer to Excel</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Select WH */}
            <div className="space-y-2">
              <label className="text-[12px] font-semibold text-gray-700">Select WH</label>
              <Select value={excelExportWH} onValueChange={setExcelExportWH}>
                <SelectTrigger className="h-8 text-[11px]">
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APC1">APC1</SelectItem>
                  <SelectItem value="APC2">APC2</SelectItem>
                  <SelectItem value="APC3">APC3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <label className="text-[12px] font-semibold text-gray-700">Date From</label>
              <div className="relative">
                <Input
                  type="date"
                  className="h-8 text-[11px] w-full"
                  value={excelExportDateFrom ? toISODateLocal(excelExportDateFrom) : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [year, month, day] = e.target.value.split('-').map(Number);
                      setExcelExportDateFrom(new Date(year, month - 1, day));
                    } else {
                      setExcelExportDateFrom(undefined);
                    }
                  }}
                />
              </div>
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <label className="text-[12px] font-semibold text-gray-700">Date To</label>
              <div className="relative">
                <Input
                  type="date"
                  className="h-8 text-[11px] w-full"
                  value={excelExportDateTo ? toISODateLocal(excelExportDateTo) : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [year, month, day] = e.target.value.split('-').map(Number);
                      setExcelExportDateTo(new Date(year, month - 1, day));
                    } else {
                      setExcelExportDateTo(undefined);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Dialog Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowExcelExportDialog(false)}
              className="h-8 text-[11px] px-4"
            >
              Cancel
            </Button>
            <Button
              onClick={performExcelExport}
              className="h-8 text-[11px] px-4 bg-[#da1212] hover:bg-[#e53935] text-white"
            >
              <FileSpreadsheet className="w-3 h-3 mr-1" />
              Transfer to Excel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FastLaneInquiryAdmin;
