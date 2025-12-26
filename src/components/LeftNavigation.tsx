import { ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface LeftNavigationProps {
  onSupplierInvoiceEntryClick?: () => void;
  onInvoiceDraftClick?: () => void;
  onInvoiceMaintenanceClick?: () => void;
  onApproveChildPOIncompleteClick?: () => void;
  onFastLaneScheduleMaintenanceClick?: () => void;
  onFastLaneBookingClick?: () => void;
  onFastLaneInquiryClick?: () => void;
  onFastLaneInquiryAdminClick?: () => void;
  activeScreen?: 'entry' | 'draft' | 'maintenance' | 'approveChild' | 'fastLaneSchedule' | 'fastLaneBooking' | 'fastLaneInquiry' | 'fastLaneInquiryAdmin';
}

export function LeftNavigation({ onSupplierInvoiceEntryClick, onInvoiceDraftClick, onInvoiceMaintenanceClick, onApproveChildPOIncompleteClick, onFastLaneScheduleMaintenanceClick, onFastLaneBookingClick, onFastLaneInquiryClick, onFastLaneInquiryAdminClick, activeScreen = 'entry' }: LeftNavigationProps) {
  const [expandedItem, setExpandedItem] = useState<string>(
    activeScreen === 'approveChild' ? 'Child PO Incomplete' : 
    (activeScreen === 'fastLaneSchedule' || activeScreen === 'fastLaneBooking' || activeScreen === 'fastLaneInquiry' || activeScreen === 'fastLaneInquiryAdmin') ? 'Fast Lane' : 
    'Supplier Invoice'
  );

  const menuItems = [
    { label: 'Main Menu', hasIcon: true },
    { label: 'ETD Confirmation', hasIcon: true },
    { label: 'PD ETD Confirmation', hasIcon: true },
    { label: 'Import Invoice and Shipment Entry', hasIcon: true },
    { label: 'Trilateral Trade', hasIcon: true },
    { label: 'Child Part Tracking', hasIcon: true },
    { label: 'Tax Privilege', hasIcon: true },
    { label: 'Web EDI for Spare Parts', hasIcon: true },
    { label: 'Tariff Code', hasIcon: true },
    { 
      label: 'Supplier Invoice', 
      hasIcon: true, 
      isActive: false,
      subItems: [
        { label: 'Supplier Invoice Entry', isActive: activeScreen === 'entry' },
        { label: 'Supplier Invoice Maintenance', isActive: activeScreen === 'maintenance' },
        { label: 'Invoice Draft', isActive: activeScreen === 'draft' },
      ]
    },
    { 
      label: 'Fast Lane', 
      hasIcon: true,
      isActive: false,
      subItems: [
        { label: 'Fast Lane Master maintenance', isActive: activeScreen === 'fastLaneSchedule' },
        { label: 'Fast Lane Booking', isActive: activeScreen === 'fastLaneBooking' },
        { label: 'Fast Lane Inquiry & Maintenance', isActive: activeScreen === 'fastLaneInquiry' },
        { label: 'Fast Lane Inquiry & Maintenance (Admin)', isActive: activeScreen === 'fastLaneInquiryAdmin' },   
      ]
    },
    { 
      label: 'Child PO Incomplete', 
      hasIcon: true,
      isActive: false,
      subItems: [
        { label: 'Approve Child PO Incomplete', isActive: activeScreen === 'approveChild' },
      ]
    },
  ];

  const toggleExpand = (label: string) => {
    setExpandedItem(expandedItem === label ? '' : label);
  };

  return (
    <div className="w-[140px] bg-[#DC143C] text-white flex-shrink-0">
      {menuItems.map((item, index) => (
        <div key={index}>
          <div
            className={`px-2 py-1.5 text-[11px] font-bold flex items-center justify-between border-b border-[#FF6B6B] cursor-pointer hover:bg-[#C41230] ${
              item.isActive ? 'bg-[#B01028]' : ''
            }`}
            onClick={() => item.subItems && toggleExpand(item.label)}
          >
            <span className="font-bold">{item.label}</span>
            {item.hasIcon && !item.subItems && (
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
            )}
            {item.subItems && (
              expandedItem === item.label ? (
                <ChevronDown className="w-3 h-3 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-3 h-3 flex-shrink-0" />
              )
            )}
          </div>
          {item.subItems && expandedItem === item.label && (
            <div className="bg-[#A01020]">
              {item.subItems.map((subItem, subIndex) => (
                <div
                  key={subIndex}
                  className={`px-4 py-1.5 text-[11px] border-b border-[#FF6B6B] cursor-pointer hover:bg-[#C41230] ${
                    subItem.isActive ? 'bg-[#901018]' : ''
                  }`}
                  onClick={() => {
                    if (subItem.label === 'Supplier Invoice Entry' && onSupplierInvoiceEntryClick) {
                      onSupplierInvoiceEntryClick();
                    }
                    if (subItem.label === 'Invoice Draft' && onInvoiceDraftClick) {
                      onInvoiceDraftClick();
                    }
                    if (subItem.label === 'Supplier Invoice Maintenance' && onInvoiceMaintenanceClick) {
                      onInvoiceMaintenanceClick();
                    }
                    if (subItem.label === 'Approve Child PO Incomplete' && onApproveChildPOIncompleteClick) {
                      onApproveChildPOIncompleteClick();
                    }
                    if (subItem.label === 'Fast Lane Master maintenance' && onFastLaneScheduleMaintenanceClick) {
                      onFastLaneScheduleMaintenanceClick();
                    }
                    if (subItem.label === 'Fast Lane Booking' && onFastLaneBookingClick) {
                      onFastLaneBookingClick();
                    }
                    if (subItem.label === 'Fast Lane Inquiry & Maintenance' && onFastLaneInquiryClick) {
                      onFastLaneInquiryClick();
                    }
                    if (subItem.label === 'Fast Lane Inquiry & Maintenance (Admin)' && onFastLaneInquiryAdminClick) {
                      onFastLaneInquiryAdminClick();
                    }
                  }}
                >
                  <span className={subItem.isActive ? 'font-bold' : ''}>{subItem.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
