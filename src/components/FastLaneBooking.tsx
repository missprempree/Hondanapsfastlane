import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, CalendarIcon, Users } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

import { cn } from './ui/utils';
import { format } from 'date-fns';
import { DeliveryTicketPrint } from './DeliveryTicketPrint';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface Dock {
  id: string;
  label: string;
  info: string;
}

interface DisabledSlot {
  dock: string;
  time: string;
}

interface AvailabilityData {
  date: string;
  times: string[];
  breaks: string[];
  docks: Dock[];
  disabled: DisabledSlot[];
}

interface SelectedSlot {
  rowIdx: number;
  colIdx: number;
}

interface InterestedUsers {
  [key: string]: number; // key format: "rowIdx-colIdx", value: number of interested users
}

interface ActiveBooking {
  [key: string]: boolean; // key format: "rowIdx-colIdx", value: whether someone is actively booking
}

interface TransitioningSlot {
  [key: string]: boolean; // key format: "rowIdx-colIdx", value: whether slot is transitioning from popular to disabled
}

const DOCKS: Dock[] = [
  { id: 'A1', label: 'A1', info: 'APC Pack' },
  { id: 'A2', label: 'A2', info: 'APC Pack' },
  { id: 'B3', label: 'B3', info: 'Maker Pack' },
  { id: 'C4', label: 'C4', info: 'F/L Unload' },
];

const TIME_SLOTS = ['07:30', '09:00', '10:30', '12:00', '13:00', '14:30', '16:00'];
const BREAK_TIMES = ['12:00'];
const MAX_SELECTIONS = 3;

// Truck types from PLGT018R table
const TRUCK_TYPES = [
  { value: '4W', label: '4W' },
  { value: '6W', label: '6W' }
];

interface FastLaneBookingProps {
  userType: string;
}

export default function FastLaneBooking({ userType }: FastLaneBookingProps) {

  // Date states
  const [deliverDate, setDeliverDate] = useState<Date>(new Date());
  const [deliveryPlace, setDeliveryPlace] = useState<string>('APC2');
  
  const [baseDate, setBaseDate] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  
  // Track interested users for each slot
  const [interestedUsers, setInterestedUsers] = useState<InterestedUsers>({});
  
  // Track active booking animations
  const [activeBookings, setActiveBookings] = useState<ActiveBooking>({});
  
  // Track slots transitioning from popular to disabled
  const [transitioningSlots, setTransitioningSlots] = useState<TransitioningSlot>({});
  
  // Track simulated conflicts (for testing only - doesn't affect visual display)
  const [simulatedConflicts, setSimulatedConflicts] = useState<{dock: string, time: string}[]>([]);
  
  // View state
  const [showInvoiceTable, setShowInvoiceTable] = useState<boolean>(false);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [showDeliveryInfo, setShowDeliveryInfo] = useState<boolean>(false);
  const [showPrintDialog, setShowPrintDialog] = useState<boolean>(false);
  
  // Error dialog state
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Already booked slots dialog state
  const [showAlreadyBookedDialog, setShowAlreadyBookedDialog] = useState<boolean>(false);
  const [alreadyBookedSlots, setAlreadyBookedSlots] = useState<string[]>([]);
  
  // Delivery information state (one per selected slot)
  interface DeliverySlotInfo {
    slotCode: string;
    deliveryDate: string;
    deliveryPlace: string;
    makerCode: string;
    makerName: string;
    transportMode: string;
    licensePlate: string;
    truckType: string;
  }
  const [deliveryInfos, setDeliveryInfos] = useState<DeliverySlotInfo[]>([]);

  // Initialize dates
  useEffect(() => {
    const today = toISODateLocal(new Date());
    setBaseDate(today);
    setCurrentDate(today);
    setAvailability(getAvailabilityForDate(today));
  }, []);

  // Generate random interested users when availability changes
  useEffect(() => {
    if (!availability) return;
    
    const generateInterestedUsers = (): InterestedUsers => {
      const interested: InterestedUsers = {};
      const numDocks = availability.docks.length;
      const numTimes = availability.times.length;
      
      // Randomly add interested users to 30-40% of available slots
      for (let rowIdx = 0; rowIdx < numDocks; rowIdx++) {
        for (let colIdx = 0; colIdx < numTimes; colIdx++) {
          const time = availability.times[colIdx];
          // Skip break times and disabled slots
          if (BREAK_TIMES.includes(time)) continue;
          if (isSlotDisabled(rowIdx, colIdx)) continue;
          
          // 35% chance that a slot has interested users
          if (Math.random() < 0.35) {
            // Random number of interested users (1-4)
            const numUsers = Math.floor(Math.random() * 4) + 1;
            interested[`${rowIdx}-${colIdx}`] = numUsers;
          }
        }
      }
      
      return interested;
    };
    
    setInterestedUsers(generateInterestedUsers());
  }, [availability]);

  // Simulate real-time booking activity
  useEffect(() => {
    if (!availability) return;
    
    const simulateBookingActivity = () => {
      // Get all available slots with interested users (popular slots)
      const slotsWithInterest = Object.keys(interestedUsers).filter(key => interestedUsers[key] > 0);
      
      if (slotsWithInterest.length === 0) return;
      
      // 30% chance to trigger sequential booking (1-3 consecutive popular slots)
      const isSequentialBooking = Math.random() < 0.3;
      
      if (isSequentialBooking) {
        // Try to find consecutive popular slots (all must have interested users)
        const numDocks = availability.docks.length;
        const numTimes = availability.times.length;
        
        let consecutiveSlots: string[] = [];
        
        // Try to find 3 consecutive popular slots first, then 2, then fall back to 1
        for (let targetCount = 3; targetCount >= 1 && consecutiveSlots.length === 0; targetCount--) {
          for (let rowIdx = 0; rowIdx < numDocks && consecutiveSlots.length === 0; rowIdx++) {
            for (let colIdx = 0; colIdx <= numTimes - targetCount; colIdx++) {
              const slots: string[] = [];
              let allSlotsValid = true;
              
              // Check if all consecutive slots are available and popular
              for (let i = 0; i < targetCount; i++) {
                const slotKey = `${rowIdx}-${colIdx + i}`;
                const time = availability.times[colIdx + i];
                
                // Must be available, not break time, not disabled, AND have interested users
                if (
                  BREAK_TIMES.includes(time) ||
                  isSlotDisabled(rowIdx, colIdx + i) ||
                  !interestedUsers[slotKey] ||
                  interestedUsers[slotKey] === 0
                ) {
                  allSlotsValid = false;
                  break;
                }
                
                slots.push(slotKey);
              }
              
              if (allSlotsValid && slots.length >= 1) {
                consecutiveSlots = slots;
                break;
              }
            }
          }
        }
        
        // If we found consecutive popular slots, animate them sequentially
        if (consecutiveSlots.length > 0) {
          consecutiveSlots.forEach((slotKey, index) => {
            // Start each animation with a delay
            setTimeout(() => {
              setActiveBookings(prev => ({ ...prev, [slotKey]: true }));
              
              // After 2 seconds, complete the booking
              setTimeout(() => {
                setActiveBookings(prev => ({ ...prev, [slotKey]: false }));
                
                // 70% chance to increase, 20% to decrease, 10% to disable slot (someone booked it)
                const rand = Math.random();
                const shouldDisable = rand < 0.1; // 10% chance
                const shouldIncrease = rand >= 0.1 && rand < 0.8; // 70% chance
                
                if (shouldDisable) {
                  // Start transition animation from popular to disabled
                  setTransitioningSlots(prev => ({ ...prev, [slotKey]: true }));
                  
                  // After 1 second of transition, actually disable the slot
                  setTimeout(() => {
                    setTransitioningSlots(prev => ({ ...prev, [slotKey]: false }));
                    
                    // Remove from interested users and add to disabled slots
                    setInterestedUsers(prev => {
                      const newInterested = { ...prev };
                      delete newInterested[slotKey];
                      return newInterested;
                    });
                    
                    // Add to disabled slots
                    const [rowIdx, colIdx] = slotKey.split('-').map(Number);
                    setAvailability(prev => {
                      if (!prev) return prev;
                      const dock = prev.docks[rowIdx];
                      const time = prev.times[colIdx];
                      return {
                        ...prev,
                        disabled: [...prev.disabled, { dock: dock.id, time }]
                      };
                    });
                  }, 1000);
                } else {
                  setInterestedUsers(prev => {
                    const current = prev[slotKey] || 0;
                    let newCount = current;
                    
                    if (shouldIncrease) {
                      // Increase by 1-2 users
                      newCount = current + Math.floor(Math.random() * 2) + 1;
                    } else {
                      // Decrease by 1 user (but keep minimum at 0)
                      newCount = Math.max(0, current - 1);
                    }
                    
                    return { ...prev, [slotKey]: newCount };
                  });
                }
              }, 2000);
            }, index * 800); // 800ms delay between each slot
          });
          
          return; // Don't run single slot booking
        }
      }
      
      // Single slot booking (original behavior) - only on popular slots
      // Randomly pick a popular slot to show booking activity
      const randomSlot = slotsWithInterest[Math.floor(Math.random() * slotsWithInterest.length)];
      
      // Show booking animation
      setActiveBookings(prev => ({ ...prev, [randomSlot]: true }));
      
      // After 2 seconds, complete the booking (randomly increase, decrease, or disable)
      setTimeout(() => {
        setActiveBookings(prev => ({ ...prev, [randomSlot]: false }));
        
        // 40% chance to increase, 40% to decrease, 20% to disable slot (someone booked it)
        const rand = Math.random();
        const shouldDisable = rand < 0.2; // 20% chance
        const shouldIncrease = rand >= 0.2 && rand < 0.6; // 40% chance
        
        if (shouldDisable) {
          // Start transition animation from popular to disabled
          setTransitioningSlots(prev => ({ ...prev, [randomSlot]: true }));
          
          // After 1 second of transition, actually disable the slot
          setTimeout(() => {
            setTransitioningSlots(prev => ({ ...prev, [randomSlot]: false }));
            
            // Remove from interested users and add to disabled slots
            setInterestedUsers(prev => {
              const newInterested = { ...prev };
              delete newInterested[randomSlot];
              return newInterested;
            });
            
            // Add to disabled slots
            const [rowIdx, colIdx] = randomSlot.split('-').map(Number);
            setAvailability(prev => {
              if (!prev) return prev;
              const dock = prev.docks[rowIdx];
              const time = prev.times[colIdx];
              return {
                ...prev,
                disabled: [...prev.disabled, { dock: dock.id, time }]
              };
            });
          }, 1000);
        } else {
          setInterestedUsers(prev => {
            const current = prev[randomSlot] || 0;
            let newCount = current;
            
            if (shouldIncrease) {
              // Increase by 1-2 users
              newCount = current + Math.floor(Math.random() * 2) + 1;
            } else {
              // Decrease by 1 user (but keep minimum at 0)
              newCount = Math.max(0, current - 1);
            }
            
            return { ...prev, [randomSlot]: newCount };
          });
        }
      }, 2000);
    };
    
    // Run simulation every 3-6 seconds
    const interval = setInterval(() => {
      simulateBookingActivity();
    }, Math.random() * 3000 + 3000);
    
    return () => clearInterval(interval);
  }, [availability, interestedUsers]);

  // Date utility functions
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
  
  // Show error dialog
  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorDialog(true);
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

  // Generate mock disabled slots based on date
  const generateMockDisabledSlots = (dateStr: string): DisabledSlot[] => {
    const seed = [...dateStr].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const random = (index: number) => {
      return (Math.sin(seed + index) * 10000) % 1;
    };

    const disabledSlots: DisabledSlot[] = [];

    DOCKS.forEach((dock, rowIndex) => {
      TIME_SLOTS.forEach((time, colIndex) => {
        if (BREAK_TIMES.includes(time)) return;
        const randomValue = random(rowIndex * 11 + colIndex * 7);
        if (randomValue > 0.7) {
          disabledSlots.push({ dock: dock.id, time: time });
        }
      });
    });

    return disabledSlots;
  };

  const getAvailabilityForDate = (dateStr: string): AvailabilityData => {
    const disabledSlots = generateMockDisabledSlots(dateStr);
    return {
      date: dateStr,
      times: TIME_SLOTS,
      breaks: BREAK_TIMES,
      docks: DOCKS,
      disabled: disabledSlots,
    };
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

  // Check if slot is selected
  const isSlotSelected = (rowIdx: number, colIdx: number): boolean => {
    return selectedSlots.some((s) => s.rowIdx === rowIdx && s.colIdx === colIdx);
  };

  // Validate slot selection
  const canSelectSlot = (newRowIdx: number, newColIdx: number): { valid: boolean; message?: string } => {
    const selectedCount = selectedSlots.length;

    if (selectedCount === 0) {
      return { valid: true };
    }

    if (selectedCount >= MAX_SELECTIONS) {
      return { valid: false, message: 'Select up to 3 slots as maximum' };
    }

    const firstSlot = selectedSlots[0];

    // Check direction (vertical or horizontal)
    if (selectedCount === 1) {
      const isSameRow = newRowIdx === firstSlot.rowIdx;
      const isSameCol = newColIdx === firstSlot.colIdx;

      if (isSameRow) {
        return validateHorizontalContinuity([...selectedSlots, { rowIdx: newRowIdx, colIdx: newColIdx }], newRowIdx);
      } else if (isSameCol) {
        return validateVerticalContinuity([...selectedSlots, { rowIdx: newRowIdx, colIdx: newColIdx }], newColIdx);
      } else {
        return { valid: false, message: 'Please select slots in the same vertical or horizontal' };
      }
    }

    const allSameRow = selectedSlots.every((s) => s.rowIdx === firstSlot.rowIdx);
    const allSameCol = selectedSlots.every((s) => s.colIdx === firstSlot.colIdx);

    if (allSameRow && newRowIdx === firstSlot.rowIdx) {
      return validateHorizontalContinuity([...selectedSlots, { rowIdx: newRowIdx, colIdx: newColIdx }], newRowIdx);
    } else if (allSameCol && newColIdx === firstSlot.colIdx) {
      return validateVerticalContinuity([...selectedSlots, { rowIdx: newRowIdx, colIdx: newColIdx }], newColIdx);
    } else {
      return { valid: false, message: 'Please select slots in the same vertical or horizontal' };
    }
  };

  const validateHorizontalContinuity = (slots: SelectedSlot[], rowIdx: number): { valid: boolean; message?: string } => {
    if (!availability) return { valid: false };

    const sortedSlots = [...slots].sort((a, b) => a.colIdx - b.colIdx);
    const colIndices = sortedSlots.map((s) => s.colIdx);
    const minCol = Math.min(...colIndices);
    const maxCol = Math.max(...colIndices);

    // Check for disabled slots in between
    for (let col = minCol; col <= maxCol; col++) {
      const time = availability.times[col];
      if (BREAK_TIMES.includes(time)) continue;

      if (isSlotDisabled(rowIdx, col) && !colIndices.includes(col)) {
        return { valid: false, message: 'Cannot select across occupied slots' };
      }
    }

    // Check continuity
    const availableColsInRange: number[] = [];
    for (let col = minCol; col <= maxCol; col++) {
      const time = availability.times[col];
      if (!BREAK_TIMES.includes(time) && !isSlotDisabled(rowIdx, col)) {
        availableColsInRange.push(col);
      }
    }

    const allAvailableSelected = availableColsInRange.every((col) => colIndices.includes(col));
    if (!allAvailableSelected) {
      return { valid: false, message: 'Please select consecutive slots' };
    }

    return { valid: true };
  };

  const validateVerticalContinuity = (slots: SelectedSlot[], colIdx: number): { valid: boolean; message?: string } => {
    if (!availability) return { valid: false };

    const sortedSlots = [...slots].sort((a, b) => a.rowIdx - b.rowIdx);
    const rowIndices = sortedSlots.map((s) => s.rowIdx);
    const minRow = Math.min(...rowIndices);
    const maxRow = Math.max(...rowIndices);

    // Check for disabled slots in between
    for (let row = minRow; row <= maxRow; row++) {
      if (isSlotDisabled(row, colIdx) && !rowIndices.includes(row)) {
        return { valid: false, message: 'Cannot select across occupied slots' };
      }
    }

    // Check continuity
    const availableRowsInRange: number[] = [];
    for (let row = minRow; row <= maxRow; row++) {
      if (!isSlotDisabled(row, colIdx)) {
        availableRowsInRange.push(row);
      }
    }

    const allAvailableSelected = availableRowsInRange.every((row) => rowIndices.includes(row));
    if (!allAvailableSelected) {
      return { valid: false, message: 'Please select consecutive slots' };
    }

    return { valid: true };
  };

  // Handle cell click
  const handleCellClick = (rowIdx: number, colIdx: number, isBreak: boolean, isDisabled: boolean) => {
    if (isBreak || isDisabled) return;

    const isSelected = isSlotSelected(rowIdx, colIdx);

    if (isSelected) {
      setSelectedSlots((prev) => prev.filter((s) => !(s.rowIdx === rowIdx && s.colIdx === colIdx)));
    } else {
      const validation = canSelectSlot(rowIdx, colIdx);
      if (!validation.valid) {
        showError(validation.message);
        return;
      }
      setSelectedSlots((prev) => [...prev, { rowIdx, colIdx }]);
    }
  };

  // Handle previous day
  const handlePreviousDay = () => {
    const previousDate = addDays(currentDate, -1);
    if (isBefore(previousDate, baseDate)) return;
    setCurrentDate(previousDate);
    setAvailability(getAvailabilityForDate(previousDate));
    setSelectedSlots([]);
  };

  // Handle next day
  const handleNextDay = () => {
    const nextDate = addDays(currentDate, 1);
    // Check if nextDate is within 7 days after baseDate
    const maxDate = addDays(baseDate, 7);
    if (!isBefore(nextDate, maxDate) && nextDate !== maxDate) return;
    
    setCurrentDate(nextDate);
    setAvailability(getAvailabilityForDate(nextDate));
    setSelectedSlots([]);
  };

  // Handle date picker selection
  const handleDatePickerSelect = (date: Date | undefined) => {
    if (date) {
      const selectedDate = toISODateLocal(date);
      setBaseDate(selectedDate);
      setCurrentDate(selectedDate);
      setAvailability(getAvailabilityForDate(selectedDate));
      setSelectedSlots([]);
    }
  };

  // Get selected slots output
  const getSelectedSlotsOutput = () => {
    if (!availability) return { date: '', slots: [] };

    const slots = selectedSlots.map((slot) => ({
      dock: availability.docks[slot.rowIdx].id,
      time: availability.times[slot.colIdx],
    }));

    return {
      date: currentDate,
      slots: slots,
    };
  };

  // Handle Select Invoice button click
  const handleSelectInvoice = () => {
    // Check if delivery date is selected
    if (!deliverDate) {
      showError('Please select a delivery date before proceeding.');
      return;
    }

    // Check if delivery date is today or later
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    const selectedDeliveryDate = new Date(deliverDate);
    selectedDeliveryDate.setHours(0, 0, 0, 0);

    if (selectedDeliveryDate < today) {
      showError('Delivery date must be today or later. Please select a valid date.');
      return;
    }

    // Check if time slots are selected
    if (selectedSlots.length === 0) {
      showError('Please select at least one time slot before proceeding.');
      return;
    }

    // Check if any selected slots are now booked by another user (including simulated conflicts)
    if (availability) {
      const bookedSlotsList: string[] = [];
      const stillAvailableSlots: SelectedSlot[] = [];
      const conflictedSlots: {dock: string, time: string}[] = [];
      
      selectedSlots.forEach((slot) => {
        const dock = availability.docks[slot.rowIdx];
        const time = availability.times[slot.colIdx];
        
        // Check both real disabled slots and simulated conflicts
        const isNowDisabled = availability.disabled.some(
          (disabledSlot) => disabledSlot.dock === dock.id && disabledSlot.time === time
        ) || simulatedConflicts.some(
          (conflict) => conflict.dock === dock.id && conflict.time === time
        );
        
        if (isNowDisabled) {
          bookedSlotsList.push(`${time} - ${dock.label} (${dock.info})`);
          conflictedSlots.push({ dock: dock.id, time: time });
        } else {
          stillAvailableSlots.push(slot);
        }
      });
      
      // If some slots are now booked, show alert and update selection
      if (bookedSlotsList.length > 0) {
        setAlreadyBookedSlots(bookedSlotsList);
        setSelectedSlots(stillAvailableSlots);
        setShowAlreadyBookedDialog(true);
        
        // Add conflicted slots to the disabled list to show them as grey with "x"
        setAvailability({
          ...availability,
          disabled: [...availability.disabled, ...conflictedSlots],
        });
        
        // Clear simulated conflicts after applying them to the grid
        setSimulatedConflicts([]);
        return;
      }
    }

    // Switch to invoice selection view
    setShowInvoiceTable(true);
  };
  
  // Test function: Simulate another user booking the selected slots
  const simulateOtherUserBooking = () => {
    if (!availability || selectedSlots.length === 0) {
      return;
    }
    
    // Store simulated conflicts without changing visual display
    const conflicts = selectedSlots.map((slot) => ({
      dock: availability.docks[slot.rowIdx].id,
      time: availability.times[slot.colIdx],
    }));
    
    setSimulatedConflicts(conflicts);
  };

  // Mock invoice data
  const invoiceData = [
    {
      id: '1',
      makerCode: '05646',
      makerName: 'Atemo Asia LTD',
      invoiceDate: '9/9/2025',
      invoiceNo: 'JUSTPARENT007',
      arrivalNo: 'A59100001',
      items: 5,
      pcs: 200,
      amount: '1,130.50',
      status: '20'
    },
    {
      id: '2',
      makerCode: '05646',
      makerName: 'Atemo Asia LTD',
      invoiceDate: '10/9/2025',
      invoiceNo: 'JUSTCHILDPART007',
      arrivalNo: 'A59110001',
      items: 6,
      pcs: 666,
      amount: '14,679.77',
      status: '20'
    },
    {
      id: '3',
      makerCode: '05646',
      makerName: 'Atemo Asia LTD',
      invoiceDate: '10/9/2025',
      invoiceNo: 'TESTINPUT091025',
      arrivalNo: 'A59110003',
      items: 1,
      pcs: 250,
      amount: '6,777.80',
      status: '20'
    }
  ];

  // Handle invoice checkbox toggle
  const handleInvoiceToggle = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  // Handle select/deselect all
  const handleSelectAllInvoices = (checked: boolean) => {
    if (checked) {
      setSelectedInvoices(invoiceData.map(inv => inv.id));
    } else {
      setSelectedInvoices([]);
    }
  };

  // Handle Next button
  const handleNext = () => {
    if (selectedInvoices.length === 0) {
      showError('Please select at least one invoice.');
      return;
    }
    
    // Initialize delivery info for each selected slot
    const initialDeliveryInfos: DeliverySlotInfo[] = selectedSlots.map((slot) => {
      const dock = availability!.docks[slot.rowIdx];
      const time = availability!.times[slot.colIdx];
      const deliveryDateTime = deliverDate ? format(deliverDate, 'dd/MM/yyyy') + ' ' + time : '';
      
      return {
        slotCode: dock.label,
        deliveryDate: deliveryDateTime,
        deliveryPlace: 'APC 2',
        makerCode: '05686',
        makerName: 'ASTEMO ASIA LTD.',
        transportMode: 'DIRECT',
        licensePlate: '',
        truckType: ''
      };
    });
    
    setDeliveryInfos(initialDeliveryInfos);
    setShowDeliveryInfo(true);
  };

  // Handle Exit button from invoice table
  const handleExitInvoiceTable = () => {
    setShowInvoiceTable(false);
    setSelectedInvoices([]);
  };
  
  // Handle Exit button from delivery info
  const handleExitDeliveryInfo = () => {
    setShowDeliveryInfo(false);
    setDeliveryInfos([]);
  };
  
  // Update delivery info field
  const updateDeliveryInfo = (index: number, field: keyof DeliverySlotInfo, value: string) => {
    setDeliveryInfos(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };
  
  // Validate license plate format (max 9 characters, allow alphanumeric, Thai characters, and "-")
  const validateLicensePlate = (value: string): boolean => {
    // Allow digits, Thai characters, English letters, and hyphen, max 9 characters
    return value.length <= 9;
  };
  
  // Check for duplicate trucks in the same time slot
  const hasDuplicateTruckInSameSlot = (): boolean => {
    const slotMap = new Map<string, Set<string>>();
    
    for (let i = 0; i < deliveryInfos.length; i++) {
      const info = deliveryInfos[i];
      if (!info.licensePlate) continue;
      
      const slot = selectedSlots[i];
      const timeKey = availability!.times[slot.colIdx];
      
      if (!slotMap.has(timeKey)) {
        slotMap.set(timeKey, new Set());
      }
      
      const trucksInSlot = slotMap.get(timeKey)!;
      if (trucksInSlot.has(info.licensePlate)) {
        return true;
      }
      trucksInSlot.add(info.licensePlate);
    }
    
    return false;
  };
  
  // Check for same truck in three consecutive time slots
  const hasTruckInThreeConsecutiveSlots = (): boolean => {
    // Group slots by truck (license plate)
    const truckSlots = new Map<string, number[]>();
    
    for (let i = 0; i < deliveryInfos.length; i++) {
      const licensePlate = deliveryInfos[i].licensePlate;
      if (!licensePlate) continue;
      
      const timeIndex = selectedSlots[i].colIdx;
      
      if (!truckSlots.has(licensePlate)) {
        truckSlots.set(licensePlate, []);
      }
      truckSlots.get(licensePlate)!.push(timeIndex);
    }
    
    // Check each truck for three consecutive slots
    for (const [truck, timeIndices] of truckSlots.entries()) {
      const sortedIndices = [...timeIndices].sort((a, b) => a - b);
      
      for (let i = 0; i < sortedIndices.length - 2; i++) {
        if (sortedIndices[i+1] === sortedIndices[i] + 1 && 
            sortedIndices[i+2] === sortedIndices[i] + 2) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  // Generate booking ID (unique for each ticket)
  const generateBookingId = (index: number): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000) + index * 1000;
    return `${year}${month}${day}${String(random).padStart(5, '0')}`;
  };

  // Handle Confirm button
  const handleConfirm = () => {
    // Validate all slots have license plate and truck type
    for (let i = 0; i < deliveryInfos.length; i++) {
      if (!deliveryInfos[i].licensePlate || !deliveryInfos[i].truckType) {
        showError('Please fill in License Plate and Truck Type for all slots.');
        return;
      }
    }
    
    // Check for duplicate trucks in same time slot
    if (hasDuplicateTruckInSameSlot()) {
      showError('The same truck cannot be booked in the same time slot more than once.');
      return;
    }
    
    // Check for truck in three consecutive slots
    if (hasTruckInThreeConsecutiveSlots()) {
      showError('The same truck cannot be booked in three consecutive time slots.');
      return;
    }
    
    // Show print dialog
    setShowPrintDialog(true);
  };
  
  // Prepare tickets for printing
  const prepareTickets = () => {
    return deliveryInfos.map((info, index) => ({
      ...info,
      bookingId: generateBookingId(index)
    }));
  };

  if (!availability) return null;
  
  // Show print dialog if booking is confirmed
  if (showPrintDialog) {
    return (
      <DeliveryTicketPrint 
        tickets={prepareTickets()} 
        onClose={() => {
          setShowPrintDialog(false);
          // Reset to initial state
          setShowDeliveryInfo(false);
          setShowInvoiceTable(false);
          setSelectedInvoices([]);
          setDeliveryInfos([]);
          setSelectedSlots([]);
        }}
      />
    );
  }

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
                      onSelect={setDeliverDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[13px] text-gray-700">Delivery Place :</span>
                {userType === 'Milk run And AYU' ? (
                  <Select value={deliveryPlace} onValueChange={setDeliveryPlace}>
                    <SelectTrigger className="h-6 w-[100px] text-[11px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APC1">APC1</SelectItem>
                      <SelectItem value="APC2">APC2</SelectItem>
                      <SelectItem value="APC3">APC3</SelectItem>
                      <SelectItem value="APC4">APC4</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-[13px] text-gray-700">APC2</span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-gray-700">
                  <span className="font-semibold">Transport Mode :</span> {userType === 'Milk run And AYU' ? 'MILKRUN' : 'Direct'}
                </span>
              </div>
            </div>
            
            {/* Procurement PIC Row */}
            <div className="flex items-center">
              <span className="text-[13px] text-gray-700">
                <span className="font-semibold">Procurement PIC :</span> MR. JOHN DOE
              </span>
            </div>

             {/*  Maker Code and Maker Name Row */}
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
          {!showInvoiceTable && (
            <>
              {/*  Select Time Range */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-[11px] text-gray-600">
                  <ChevronRight className="h-3 w-3" />
                  <span>Bookings can be made up to 7 working days in advance</span>
                </div>
                <div className="flex items-center gap-3">
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
              </div>
              {/*  Booking table */}
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
                    const isSelected = isSlotSelected(rowIdx, colIdx);
                    const slotKey = `${rowIdx}-${colIdx}`;
                    const numInterestedUsers = interestedUsers[slotKey] || 0;
                    const isActivelyBooking = activeBookings[slotKey] || false;
                    const isTransitioning = transitioningSlots[slotKey] || false;

                    let cellClasses = 'border-r border-b border-gray-300 p-3 flex items-center justify-center text-[12px] transition-all cursor-pointer relative';

                    if (isBreakTime) {
                      cellClasses += ' bg-slate-100 text-gray-600 cursor-not-allowed';
                    } else if (isTransitioning) {
                      cellClasses += ' slot-transitioning cursor-not-allowed';
                    } else if (isDisabled) {
                      cellClasses += ' bg-gray-200 text-gray-500 cursor-not-allowed';
                    } else if (isSelected) {
                      cellClasses += ' bg-red-100 border-2 border-[#da1212] shadow-md';
                    } else {
                      cellClasses += ' bg-white hover:bg-red-50';
                    }

                    const slotContent = (
                      <div
                        key={`${rowIdx}-${colIdx}`}
                        className={cellClasses}
                        onClick={() => handleCellClick(rowIdx, colIdx, isBreakTime, isDisabled || isTransitioning)}
                      >
                        {/* Transitioning state - show both icon moving and × appearing */}
                        {isTransitioning && (
                          <>
                            {/* Orange icon fading and moving up */}
                            <div className="absolute top-1 right-1 transition-icon-exit">
                              <Users className="w-3 h-3 text-orange-500" />
                            </div>
                            {/* Dots fading out */}
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 pointer-events-none transition-dots-exit">
                              <div className="text-[10px] text-orange-600 booking-dots flex items-center">
                                <span>.</span>
                                <span>.</span>
                                <span>.</span>
                              </div>
                            </div>
                            {/* × appearing */}
                            <span className="transition-x-enter text-gray-500">×</span>
                          </>
                        )}
                        
                        {/* Normal states */}
                        {!isTransitioning && (
                          <>
                            {isBreakTime ? '—' : isDisabled ? '×' : ''}
                            {numInterestedUsers > 0 && !isBreakTime && !isDisabled && (
                              <div className="absolute top-1 right-1">
                                <div className={isActivelyBooking ? 'booking-icon-animate' : ''}>
                                  <Users className="w-3 h-3 text-orange-500" />
                                </div>
                              </div>
                            )}
                            
                            {/* Show animated dots on popular slots */}
                            {numInterestedUsers > 0 && !isBreakTime && !isDisabled && (
                              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 pointer-events-none">
                                <div className="text-[10px] text-orange-600 booking-dots flex items-center">
                                  <span>.</span>
                                  <span>.</span>
                                  <span>.</span>
                                </div>
                              </div>
                            )}
                            
                            {/* Pulse effect when count changes */}
                            {numInterestedUsers > 0 && !isBreakTime && !isDisabled && (
                              <div
                                key={`pulse-${numInterestedUsers}`}
                                className="absolute inset-0 pointer-events-none slot-count-change"
                              />
                            )}
                          </>
                        )}
                      </div>
                    );

                    // Wrap with tooltip if there are interested users
                    if (numInterestedUsers > 0 && !isBreakTime && !isDisabled) {
                      return (
                        <TooltipProvider key={`${rowIdx}-${colIdx}`} delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {slotContent}
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-orange-100 border-orange-300 text-orange-900 text-[11px] px-3 py-2">
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>There {numInterestedUsers === 1 ? 'is' : 'are'} {numInterestedUsers} {numInterestedUsers === 1 ? 'user' : 'users'} interested in booking this slot</span>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    }

                    return slotContent;
                  })}
                </React.Fragment>
              ))}
            </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 text-[12px] text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-[#da1212] rounded"></div>
                  <span>Selected</span>
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
                  <Users className="w-4 h-4 text-orange-500" />
                  <span>Others</span>
                </div>
                
                <div className="flex flex-col items-end gap-1 ml-auto">
                    <Button
                      onClick={handleSelectInvoice}
                      variant="outline"
                      className="h-7 text-[11px] px-8 w-24 bg-[#4A90E2] hover:bg-[#357ABD] text-white">
                      Select Invoice
                    </Button>
                    {/* Test button to simulate booking conflict - subtle for presentation */}
                    <button
                      onClick={simulateOtherUserBooking}
                      disabled={selectedSlots.length === 0}
                      className="text-[10px] opacity-10 hover:opacity-30 transition-opacity cursor-pointer disabled:opacity-5 disabled:cursor-not-allowed"
                      title="Test"
                    >
                      🧪
                    </button>
                </div>
              </div>
            </>
          )}

          {/* Invoice Selection Table */}
          {showInvoiceTable && !showDeliveryInfo && (
            <div className="space-y-4">
              {/* Invoice Table */}
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="p-3 text-left border-r border-gray-300">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={selectedInvoices.length === invoiceData.length}
                            onCheckedChange={handleSelectAllInvoices}
                          />
                        </div>
                      </th>
                      <th className="p-3 text-center font-semibold border-r border-gray-300">Maker Code</th>
                      <th className="p-3 text-center font-semibold border-r border-gray-300">Maker Name</th>
                      <th className="p-3 text-center font-semibold border-r border-gray-300">Invoice Date</th>
                      <th className="p-3 text-center font-semibold border-r border-gray-300">Invoice no.</th>
                      <th className="p-3 text-center font-semibold border-r border-gray-300">Arrival no.</th>
                      <th className="p-3 text-center font-semibold border-r border-gray-300">Items</th>
                      <th className="p-3 text-center font-semibold border-r border-gray-300">Pcs.</th>
                      <th className="p-3 text-center font-semibold border-r border-gray-300">Amount (Exc. Vat.)</th>
                      <th className="p-3 text-center font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-gray-300 hover:bg-gray-50">
                        <td className="p-3 border-r border-gray-300">
                          <Checkbox 
                            checked={selectedInvoices.includes(invoice.id)}
                            onCheckedChange={() => handleInvoiceToggle(invoice.id)}
                          />
                        </td>
                        <td className="p-3 text-center border-r border-gray-300">{invoice.makerCode}</td>
                        <td className="p-3 text-center border-r border-gray-300">{invoice.makerName}</td>
                        <td className="p-3 text-center border-r border-gray-300">{invoice.invoiceDate}</td>
                        <td className="p-3 text-center border-r border-gray-300">{invoice.invoiceNo}</td>
                        <td className="p-3 text-center border-r border-gray-300">{invoice.arrivalNo}</td>
                        <td className="p-3 text-center border-r border-gray-300">{invoice.items}</td>
                        <td className="p-3 text-center border-r border-gray-300">{invoice.pcs}</td>
                        <td className="p-3 text-center border-r border-gray-300">{invoice.amount}</td>
                        <td className="p-3 text-center">{invoice.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={handleNext}
                  variant="outline"
                  className="h-10 px-12 text-[13px] bg-[#4A90E2] hover:bg-[#357ABD] text-white border-2"
                >
                  Next
                </Button>
                <Button
                  onClick={handleExitInvoiceTable}
                  variant="outline"
                  className="h-10 px-12 text-[13px] bg-white hover:bg-gray-100 border-2 border-gray-400"
                >
                  Exit
                </Button>
              </div>
            </div>
          )}

          {/* Delivery Information Form */}
          {showDeliveryInfo && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-[16px] font-semibold">DELIVERY INFORMATION</h2>
              </div>

              {deliveryInfos.map((info, index) => (
                <div key={index} className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50 relative">
                  {/* Slot Counter */}
                  <div className="absolute top-4 right-4 text-[13px] font-semibold text-gray-700">
                    {index + 1}/{deliveryInfos.length}
                  </div>

                  {/* Row 1: Slot code, Delivery date, Delivery place */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Slot code</label>
                      <div className="bg-yellow-200 border border-gray-300 rounded px-3 py-2 text-[11px] text-center">
                        {info.slotCode}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Delivery date</label>
                      <div className="bg-yellow-200 border border-gray-300 rounded px-3 py-2 text-[11px] text-center">
                        {info.deliveryDate}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Delivery place</label>
                      <div className="bg-yellow-200 border border-gray-300 rounded px-3 py-2 text-[11px] text-center">
                        {info.deliveryPlace}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Maker code, Maker name */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Maker code</label>
                      <div className="bg-yellow-200 border border-gray-300 rounded px-3 py-2 text-[11px] text-center">
                        {info.makerCode}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Maker name</label>
                      <div className="bg-yellow-200 border border-gray-300 rounded px-3 py-2 text-[11px] text-center">
                        {info.makerName}
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Transport Mode */}
                  <div className="mb-4">
                    <label className="block text-[11px] font-semibold mb-1">Transport Mode</label>
                    <div className="bg-yellow-200 border border-gray-300 rounded px-3 py-2 text-[11px] text-center">
                      {info.transportMode}
                    </div>
                  </div>

                  {/* Row 4: License Plate, Truck Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">License Plate</label>
                      <Input
                        value={info.licensePlate}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (validateLicensePlate(value)) {
                            updateDeliveryInfo(index, 'licensePlate', value);
                          }
                        }}
                        placeholder="4กฎ-3495"
                        className="h-9 text-[11px] text-center"
                        maxLength={9}
                      />
                      <p className="text-[9px] text-gray-500 mt-1">Max 9 digits, allow "-"</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Truck Type</label>
                      <Select
                        value={info.truckType}
                        onValueChange={(value) => updateDeliveryInfo(index, 'truckType', value)}
                      >
                        <SelectTrigger className="h-9 text-[11px]">
                          <SelectValue placeholder="Select truck type" />
                        </SelectTrigger>
                        <SelectContent>
                          {TRUCK_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  onClick={handleConfirm}
                  variant="outline"
                  className="h-10 px-12 text-[13px] bg-white hover:bg-gray-100 border-2 border-gray-400"
                >
                  Confirm
                </Button>
                <Button
                  onClick={handleExitDeliveryInfo}
                  variant="outline"
                  className="h-10 px-12 text-[13px] bg-white hover:bg-gray-100 border-2 border-gray-400"
                >
                  Exit
                </Button>
              </div>
            </div>
          )}
          </div>

          {/* Mock Data Display 
          <div className="px-6 pb-6" >
            <h4 className="text-[14px] font-semibold text-gray-700 mb-2">Mock JSON (ข้อมูลวันปัจจุบัน)</h4>
            <pre className="bg-gray-50 border border-gray-300 p-3 rounded-lg overflow-x-auto text-[11px] text-gray-800 mb-4">
              {JSON.stringify(availability, null, 2)}
            </pre>

            <h4 className="text-[14px] font-semibold text-gray-700 mb-2">ผลลัพธ์การเลือก</h4>
            <pre className="bg-gray-50 border border-gray-300 p-3 rounded-lg overflow-x-auto text-[11px] text-gray-800">
              {JSON.stringify(getSelectedSlotsOutput(), null, 2)}
            </pre>
          </div>
          */}
        </div>
      </div>
      
      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Validation Error</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Already Booked Slots Dialog */}
      <AlertDialog open={showAlreadyBookedDialog} onOpenChange={setShowAlreadyBookedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p>The following time slot(s) have been booked by another user:</p>
                <div className="space-y-1">
                  {alreadyBookedSlots.map((slot, index) => (
                    <div key={index} className="text-red-600 font-medium">{slot}</div>
                  ))}
                </div>
                <p>Please select different time slots.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
