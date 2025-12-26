import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';

interface ScheduleSlot {
  id: string;
  dock: string;
  info: string;
}

export function FastLaneScheduleMaintenance() {
  const [deliverPlace, setDeliverPlace] = useState('APC2');
  const [timeStart, setTimeStart] = useState('8:30');
  const [timeEnd] = useState('17:00');
  const [appliedDate, setAppliedDate] = useState('');
  const [timeDuration, setTimeDuration] = useState('1:30');
  const [noOfSlot, setNoOfSlot] = useState('5');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSchedule, setShowSchedule] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [scheduleData, setScheduleData] = useState<ScheduleSlot[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentDateTime(`${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`);

      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + 7);
      const futureDay = String(futureDate.getDate()).padStart(2, '0');
      const futureMonth = String(futureDate.getMonth() + 1).padStart(2, '0');
      const futureYear = futureDate.getFullYear();
      setAppliedDate(`${futureDay}/${futureMonth}/${futureYear}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const generateTimeSlots = (start: string, end: string, duration: string, maxSlots?: number): string[] => {
    const slots: string[] = [];
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const [durationHour, durationMin] = duration.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const durationMinutes = durationHour * 60 + durationMin;

    for (let current = startMinutes; current <= endMinutes; current += durationMinutes) {
      if (maxSlots && slots.length >= maxSlots) break;
      const hours = Math.floor(current / 60);
      const minutes = current % 60;
      slots.push(`${hours}:${String(minutes).padStart(2, '0')}`);
    }

    return slots;
  };

  const initializeScheduleData = (slotCount: number): ScheduleSlot[] => {
    const slotNames = ['A1', 'A3', 'B3', 'C4', 'C5'];
    const infoData = ['APC Pack', 'F/L', 'Maker Pack', 'F/L Unload', 'F/L Unload'];

    return Array.from({ length: slotCount }, (_, i) => ({
      id: `slot-${i}`,
      dock: slotNames[i] || `Slot${i + 1}`,
      info: infoData[i] || ''
    }));
  };

  const handleApply = () => {
    setIsProcessing(true);
    setProgress(0);
    setShowSchedule(false);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      setIsProcessing(false);
      // Generate time slots without maxSlots limit - based on time range only
      const slots = generateTimeSlots(timeStart, timeEnd, timeDuration);
      setTimeSlots(slots);
      // noOfSlot controls the number of dock/info row pairs
      const data = initializeScheduleData(parseInt(noOfSlot));
      setScheduleData(data);
      setShowSchedule(true);
    }, 2000);
  };

  const handleRevise = (slotId: string) => {
    console.log('Revising slot:', slotId);
  };

  const handleConfirm = () => {
    setShowConfirmDialog(true);
  };

  const updateSlotData = (slotId: string, field: 'dock' | 'info', value: string) => {
    setScheduleData(prev => prev.map(slot => (slot.id === slotId ? { ...slot, [field]: value } : slot)));
  };

  return (
    <div className="flex-1 p-4 space-y-4 overflow-auto bg-gray-100">
      <div className="flex justify-end">
        <div className="text-[11px] text-gray-600">{currentDateTime}</div>
      </div>

      <div className="bg-white border border-gray-300 p-4">
        <div className="space-y-3 ml-32 mr-32">
          <div className="grid grid-cols-3 gap-8">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <label className="text-[12px] font-semibold whitespace-nowrap w-[140px]">Delivery Place:</label>
                <Select value={deliverPlace} onValueChange={setDeliverPlace}>
                  <SelectTrigger className="h-7 w-20 text-[11px] border border-gray-400 bg-yellow-50 py-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APC1">APC1</SelectItem>
                    <SelectItem value="APC2">APC2</SelectItem>
                    <SelectItem value="APC3">APC3</SelectItem>
                    <SelectItem value="APC4">APC4</SelectItem>
                    <SelectItem value="APC5">APC5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <label className="text-[12px] font-semibold whitespace-nowrap w-[160px]">Time Start:</label>
                <Input
                  value={timeStart}
                  onChange={e => setTimeStart(e.target.value)}
                  className="h-7 w-20 text-[11px] text-center border border-gray-400 bg-yellow-50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <label className="text-[12px] font-semibold whitespace-nowrap w-[80px]">Time End:</label>
                <div className="flex items-center gap-2">
                  <Input value={timeEnd} readOnly className="h-7 w-20 text-[11px] text-center border border-gray-400 bg-gray-100" />
                  <div className="w-24 ml-4"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <label className="text-[12px] font-semibold whitespace-nowrap w-[140px]">Applied date next 7 Day</label>
                <span className="text-[12px] text-blue-600 font-semibold">{appliedDate}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <label className="text-[12px] font-semibold whitespace-nowrap w-[160px]">Time duration per Slot:</label>
                <Select value={timeDuration} onValueChange={setTimeDuration}>
                  <SelectTrigger className="h-7 w-20 text-[11px] border border-gray-400 bg-yellow-50 py-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0:30">0:30</SelectItem>
                    <SelectItem value="1:00">1:00</SelectItem>
                    <SelectItem value="1:30">1:30</SelectItem>
                    <SelectItem value="2:00">2:00</SelectItem>
                    <SelectItem value="2:30">2:30</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <label className="text-[12px] font-semibold whitespace-nowrap w-[80px]">No. of Slot:</label>
                <Input
                  value={noOfSlot}
                  onChange={e => setNoOfSlot(e.target.value)}
                  className="h-7 w-20 text-[11px] text-center border border-gray-400 bg-yellow-50"
                />
                <Button
                  onClick={handleApply}
                  disabled={isProcessing}
                  className="h-7 text-[11px] px-8 w-24 bg-[#4A90E2] hover:bg-[#357ABD] text-white ml-4"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>

        {isProcessing && (
          <div className="mt-4 space-y-2">
            <div className="text-[11px]">Processing.........</div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </div>

      {showSchedule && (
        <div className="bg-white border border-gray-300 p-4 space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-400" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th className="border border-gray-400 bg-gray-100 p-1.5 text-[10px] w-20"></th>
                  <th className="border border-gray-400 bg-gray-100 p-1.5 text-[10px] w-20"></th>
                  <th className="border border-gray-400 bg-gray-100 p-1.5 text-[10px] w-24">Slot</th>
                 
                  {timeSlots.map((time, idx) => (
                    <th key={idx} className="border border-gray-400 bg-gray-100 p-1.5 text-[10px] min-w-[70px]">
                      {time}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scheduleData.map((slot, idx) => (
                  <>
                    <tr key={`${slot.id}-dock`}>
                      <td rowSpan={2} className="border border-gray-400 p-1 text-center align-middle bg-white">
                        <Button
                          onClick={() => handleRevise(slot.id)}
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-[11px] gap-1"
                        >
                          <Pencil className="w-3 h-3" />
                          Revise
                        </Button>
                      </td>
                      <td className="border border-gray-400 bg-green-100 p-2 text-[12px] text-center font-semibold">Dock</td>
                      {timeSlots.map((_, timeIdx) => (
                        <td key={timeIdx} className="border border-gray-400 p-1 bg-white" style={{ height: '40px' }}>
                          {timeIdx === 0 ? (
                            <Input
                              value={slot.dock}
                              onChange={e => updateSlotData(slot.id, 'dock', e.target.value)}
                              className="h-7 text-[11px] text-center border-0 bg-yellow-50"
                            />
                          ) : (
                            <div className="h-7">&nbsp;</div>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr key={`${slot.id}-info`}>
                      <td className="border border-gray-400 bg-green-100 p-2 text-[12px] text-center font-semibold">Info.</td>
                      {timeSlots.map((_, timeIdx) => (
                        <td key={timeIdx} className="border border-gray-400 p-1 bg-white" style={{ height: '40px' }}>
                          {timeIdx === 0 ? (
                            <Input
                              value={slot.info}
                              onChange={e => updateSlotData(slot.id, 'info', e.target.value)}
                              className="h-7 text-[11px] text-center border-0 bg-yellow-50"
                            />
                          ) : (
                            <div className="h-7">&nbsp;</div>
                          )}
                        </td>
                      ))}
                      <td className="border border-gray-400 p-1 bg-white" style={{ height: '40px' }}>
                          <div className="h-7">&nbsp;</div>
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center pt-2">
            <Button
              onClick={handleConfirm}
              className="h-7 px-6 text-[11px] bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Fast Lane Schedule has been confirmed for {deliverPlace}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              onClick={() => setShowConfirmDialog(false)}
              className="h-7 px-6 text-[11px] bg-gray-300 hover:bg-gray-400 text-black"
            >
              OK
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}