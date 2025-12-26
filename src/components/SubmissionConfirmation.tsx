interface SubmissionConfirmationProps {
  onGoToMaintenance: () => void;
  onGoToEntry: () => void;
}

export function SubmissionConfirmation({ onGoToMaintenance, onGoToEntry }: SubmissionConfirmationProps) {
  return (
    <div className="flex-1 bg-gray-100 p-4">
      {/* Info Header */}
      <div className="bg-white p-3 mb-4 border border-gray-400">
        <div className="flex justify-between items-center text-[11px]">
          <div className="flex gap-8">
            <div>
              <span>Maker Code* : </span>
              <span>05646</span>
            </div>
            <div>
              <span>Maker Name : </span>
              <span>ASTEMO ASIA LTD.</span>
            </div>
          </div>
          <div className="flex gap-8">
            <div>
              <span>Delivery Place</span>
              <span className="ml-2">: APC 2</span>
            </div>
          </div>
        </div>
        <div className="text-[11px] text-right mt-1">
          <span>Transport Mode : </span>
          <span>Direct</span>
        </div>
      </div>

      {/* Success Message */}
      <div className="bg-white p-6 mb-4 border border-gray-400">
        <h2 className="text-[14px] mb-6">Invoice has been submitted.</h2>
        
        {/* Results Table */}
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 px-4 py-2 text-[11px] text-center">Invoice no.</th>
              <th className="border border-gray-400 px-4 py-2 text-[11px] text-center">Delivery Ticket/Arrival no.</th>
              <th className="border border-gray-400 px-4 py-2 text-[11px] text-center">Remark</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 px-4 py-3 text-[11px] text-center">ABC123456789</td>
              <td className="border border-gray-400 px-4 py-3 text-[11px] text-center">
                <div>A59120001</div>
                <div>C59120001</div>
              </td>
              <td className="border border-gray-400 px-4 py-3 text-[11px] text-center">Cost,COO</td>
            </tr>
          </tbody>
        </table>

        <div className="flex flex-col items-left gap-2 text-[12px] text-red-500">
          <span>Caution!! : Invoice need to be verified.</span>
          <span>Please check invoice maintenance and retrieve report and contact to APC.</span>
        </div>
        <br></br>
        {/* Navigation Links */}
        <div className="flex flex-col items-center gap-2 text-[12px]">
          {/*
          <button
            onClick={onGoToMaintenance}
            className="text-blue-600 hover:underline"
          >
         Go to Supplier Invoice Maintenance &gt;&gt;
          </button>
          <button
            onClick={onGoToEntry}
            className="text-blue-600 hover:underline"
          >
            Go to Supplier Invoice Entry &gt;&gt;
          </button>
           */}
        </div>
      </div>
    </div>
  );
}
