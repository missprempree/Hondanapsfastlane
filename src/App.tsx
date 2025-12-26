import { LeftNavigation } from './components/LeftNavigation';
import { SearchCriteria } from './components/SearchCriteria';
import { PTOListTable, POItem } from './components/PTOListTable';
import { SelectedItemsTable } from './components/SelectedItemsTable';
import { InvoiceEntryForm, InvoiceFormData } from './components/InvoiceEntryForm';
import { SubmissionConfirmation } from './components/SubmissionConfirmation';
import { InvoiceDraft, DraftData } from './components/InvoiceDraft';
import { SupplierInvoiceMaintenance } from './components/SupplierInvoiceMaintenance';
import { ApproveChildPOIncomplete } from './components/ApproveChildPOIncomplete';
import { FastLaneScheduleMaintenance } from './components/FastLaneScheduleMaintenance';
import FastLaneBooking from './components/FastLaneBooking';
import FastLaneInquiry from './components/FastLaneInquiry';
import FastLaneInquiryAdmin from './components/FastLaneInquiryAdmin';
import { Button } from './components/ui/button';
import { User } from 'lucide-react';
import { useState } from 'react';
import { Toaster } from './components/ui/sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';

export default function App() {
  const [showSelectedItems, setShowSelectedItems] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showInvoiceDraft, setShowInvoiceDraft] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [showApproveChild, setShowApproveChild] = useState(false);
  const [showFastLaneSchedule, setShowFastLaneSchedule] = useState(false);
  const [showFastLaneBooking, setShowFastLaneBooking] = useState(false);
  const [showFastLaneInquiry, setShowFastLaneInquiry] = useState(false);
  const [showFastLaneInquiryAdmin, setShowFastLaneInquiryAdmin] = useState(false);
  const [resetCheckboxes, setResetCheckboxes] = useState(false);
  const [clearTable, setClearTable] = useState(false);
  const [showAddButton, setShowAddButton] = useState(false);
  const [draftFormData, setDraftFormData] = useState<InvoiceFormData | undefined>(undefined);
  const [currentSubmenu, setCurrentSubmenu] = useState('Supplier Invoice Entry');
  const [selectedPOItems, setSelectedPOItems] = useState<POItem[]>([]);
  const [userType, setUserType] = useState<string>('Supplier');

  const handleAddClick = (selectedItems: POItem[]) => {
    setSelectedPOItems(selectedItems);
    setShowSelectedItems(true);
  };

  const handleExitSelectedItems = () => {
    setShowSelectedItems(false);
    setSelectedPOItems([]);
    setResetCheckboxes(true);
    setTimeout(() => setResetCheckboxes(false), 100);
  };

  const handleAddToInvoice = () => {
    setShowInvoiceForm(true);
  };

  const handleExitInvoiceForm = () => {
    setShowInvoiceForm(false);
    setShowSelectedItems(false);
    setDraftFormData(undefined);
    setSelectedPOItems([]);
    setResetCheckboxes(true);
    setTimeout(() => setResetCheckboxes(false), 100);
  };

  const handleResetToInitialScreen = () => {
    setShowInvoiceForm(false);
    setShowSelectedItems(false);
    setShowConfirmation(false);
    setShowInvoiceDraft(false);
    setShowMaintenance(false);
    setShowApproveChild(false);
    setShowFastLaneSchedule(false);
    setShowFastLaneBooking(false);
    setShowFastLaneInquiry(false);
    setShowFastLaneInquiryAdmin(false);
    setDraftFormData(undefined);
    setSelectedPOItems([]);
    setCurrentSubmenu('Supplier Invoice Entry');
    setShowAddButton(false);
    setResetCheckboxes(true);
    setTimeout(() => setResetCheckboxes(false), 100);
  };

  const handleInvoiceDraftClick = () => {
    setShowInvoiceDraft(true);
    setShowInvoiceForm(false);
    setShowSelectedItems(false);
    setShowConfirmation(false);
    setShowMaintenance(false);
    setShowApproveChild(false);
    setShowFastLaneSchedule(false);
    setShowFastLaneBooking(false);
    setShowFastLaneInquiry(false);
    setShowFastLaneInquiryAdmin(false);
    setDraftFormData(undefined);
    setCurrentSubmenu('Invoice Draft');
  };

  const handleInvoiceMaintenanceClick = () => {
    setShowMaintenance(true);
    setShowInvoiceForm(false);
    setShowSelectedItems(false);
    setShowConfirmation(false);
    setShowInvoiceDraft(false);
    setShowApproveChild(false);
    setShowFastLaneSchedule(false);
    setShowFastLaneBooking(false);
    setShowFastLaneInquiry(false);
    setShowFastLaneInquiryAdmin(false);
    setDraftFormData(undefined);
    setCurrentSubmenu('Supplier Invoice Maintenance');
  };

  const handleApproveChildPOIncompleteClick = () => {
    setShowApproveChild(true);
    setShowInvoiceForm(false);
    setShowSelectedItems(false);
    setShowConfirmation(false);
    setShowInvoiceDraft(false);
    setShowMaintenance(false);
    setShowFastLaneSchedule(false);
    setShowFastLaneBooking(false);
    setShowFastLaneInquiry(false);
    setShowFastLaneInquiryAdmin(false);
    setDraftFormData(undefined);
    setCurrentSubmenu('Approve Child PO Incomplete');
  };

  const handleFastLaneScheduleMaintenanceClick = () => {
    setShowFastLaneSchedule(true);
    setShowInvoiceForm(false);
    setShowSelectedItems(false);
    setShowConfirmation(false);
    setShowInvoiceDraft(false);
    setShowMaintenance(false);
    setShowApproveChild(false);
    setShowFastLaneBooking(false);
    setShowFastLaneInquiry(false);
    setShowFastLaneInquiryAdmin(false);
    setDraftFormData(undefined);
    setCurrentSubmenu('Fast Lane Schedule Maintenance');
  };

  const handleFastLaneBookingClick = () => {
    setShowFastLaneBooking(true);
    setShowInvoiceForm(false);
    setShowSelectedItems(false);
    setShowConfirmation(false);
    setShowInvoiceDraft(false);
    setShowMaintenance(false);
    setShowApproveChild(false);
    setShowFastLaneSchedule(false);
    setShowFastLaneInquiry(false);
    setShowFastLaneInquiryAdmin(false);
    setDraftFormData(undefined);
    setCurrentSubmenu('Fast Lane Booking');
  };

  const handleFastLaneInquiryClick = () => {
    setShowFastLaneInquiry(true);
    setShowInvoiceForm(false);
    setShowSelectedItems(false);
    setShowConfirmation(false);
    setShowInvoiceDraft(false);
    setShowMaintenance(false);
    setShowApproveChild(false);
    setShowFastLaneSchedule(false);
    setShowFastLaneBooking(false);
    setShowFastLaneInquiryAdmin(false);
    setDraftFormData(undefined);
    setCurrentSubmenu('Fast Lane Inquiry');
  };

  const handleFastLaneInquiryAdminClick = () => {
    setShowFastLaneInquiryAdmin(true);
    setShowInvoiceForm(false);
    setShowSelectedItems(false);
    setShowConfirmation(false);
    setShowInvoiceDraft(false);
    setShowMaintenance(false);
    setShowApproveChild(false);
    setShowFastLaneSchedule(false);
    setShowFastLaneBooking(false);
    setShowFastLaneInquiry(false);
    setDraftFormData(undefined);
    setCurrentSubmenu('Fast Lane Inquiry (Admin)');
  };

  const handleExitInvoiceDraft = () => {
    setShowInvoiceDraft(false);
    setCurrentSubmenu('Supplier Invoice Entry');
  };

  const handleDraftInvoiceClick = (draftData: DraftData) => {
    // Convert draft data to form data
    const formData: InvoiceFormData = {
      invoiceNo: draftData.invoiceNo,
      invoiceDate: draftData.invoiceDate,
      supplierBranch: draftData.supplierBranch,
      deliveryAtAPC: draftData.deliveryAtAPC,
    };
    setDraftFormData(formData);
    setShowInvoiceDraft(false);
    setShowInvoiceForm(true);
    setShowSelectedItems(true);
    setCurrentSubmenu('Supplier Invoice Entry');
  };

  const handleSubmitSuccess = () => {
    setShowInvoiceForm(false);
    setShowConfirmation(true);
  };

  const handleClearTable = () => {
    setClearTable(true);
    setShowAddButton(false);
    setShowSelectedItems(false);
    setSelectedPOItems([]);
    setTimeout(() => setClearTable(false), 100);
  };

  const handleSearch = () => {
    setShowAddButton(true);
    // Reset clearTable to show data again
    setClearTable(false);
  };

  // Determine active screen for navigation
  const getActiveScreen = (): 'entry' | 'draft' | 'maintenance' | 'approveChild' | 'fastLaneSchedule' | 'fastLaneBooking' | 'fastLaneInquiry' | 'fastLaneInquiryAdmin' => {
    if (showInvoiceDraft) return 'draft';
    if (showMaintenance) return 'maintenance';
    if (showApproveChild) return 'approveChild';
    if (showFastLaneSchedule) return 'fastLaneSchedule';
    if (showFastLaneBooking) return 'fastLaneBooking';
    if (showFastLaneInquiry) return 'fastLaneInquiry';
    if (showFastLaneInquiryAdmin) return 'fastLaneInquiryAdmin';
    return 'entry';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <LeftNavigation 
        onSupplierInvoiceEntryClick={handleResetToInitialScreen}
        onInvoiceDraftClick={handleInvoiceDraftClick}
        onInvoiceMaintenanceClick={handleInvoiceMaintenanceClick}
        onApproveChildPOIncompleteClick={handleApproveChildPOIncompleteClick}
        onFastLaneScheduleMaintenanceClick={handleFastLaneScheduleMaintenanceClick}
        onFastLaneBookingClick={handleFastLaneBookingClick}
        onFastLaneInquiryClick={handleFastLaneInquiryClick}
        onFastLaneInquiryAdminClick={handleFastLaneInquiryAdminClick}
        activeScreen={getActiveScreen()}
      />
      
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Header */}
        <div className="bg-[#DC143C] text-white px-4 py-1 flex items-center justify-center relative">
          <h1 className="text-[16px] font-bold">{currentSubmenu}</h1>
          <div className="flex items-center gap-2 absolute right-4">
            <Button
              variant="outline"
              className="h-6 text-[11px] px-2 bg-[#FFD700] hover:bg-[#FFC700] text-black border-none"
            >
              SIGN OUT
            </Button>
            {showFastLaneBooking ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="cursor-pointer hover:opacity-80 transition-opacity">
                    <User className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[160px] p-3" align="end">
                  <div className="space-y-2">
                    <div className="text-[11px] text-gray-600 font-semibold">User Type</div>
                    <Select value={userType} onValueChange={setUserType}>
                      <SelectTrigger className="h-7 text-[11px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Supplier">Supplier</SelectItem>
                        <SelectItem value="Milk run And AYU">Milk run And AYU</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>
        </div>

        {/* Main Content */}
        {showFastLaneInquiryAdmin ? (
          <FastLaneInquiryAdmin />
        ) : showFastLaneInquiry ? (
          <FastLaneInquiry />
        ) : showFastLaneBooking ? (
          <FastLaneBooking userType={userType} />
        ) : showFastLaneSchedule ? (
          <FastLaneScheduleMaintenance />
        ) : showApproveChild ? (
          <ApproveChildPOIncomplete />
        ) : showMaintenance ? (
          <SupplierInvoiceMaintenance />
        ) : showInvoiceDraft ? (
          <InvoiceDraft 
            onExit={handleExitInvoiceDraft}
            onInvoiceClick={handleDraftInvoiceClick}
          />
        ) : showConfirmation ? (
          <SubmissionConfirmation 
            onGoToMaintenance={handleInvoiceMaintenanceClick}
            onGoToEntry={handleResetToInitialScreen}
          />
        ) : !showInvoiceForm ? (
          <div className="flex-1 p-2 space-y-2 overflow-auto">
            <SearchCriteria onClear={handleClearTable} onSearch={handleSearch} />
            {showAddButton && <PTOListTable onAddClick={handleAddClick} resetCheckboxes={resetCheckboxes} clearTable={clearTable} showAddButton={showAddButton} />}
            {showSelectedItems && <SelectedItemsTable onAddToInvoice={handleAddToInvoice} selectedPOItems={selectedPOItems} onExit={handleExitSelectedItems} />}
          </div>
        ) : (
          <InvoiceEntryForm 
            onExit={handleExitInvoiceForm} 
            onDeleteAll={handleResetToInitialScreen}
            onSubmitSuccess={handleSubmitSuccess}
            onSaveDraftSuccess={handleResetToInitialScreen}
            initialData={draftFormData}
          />
        )}
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
