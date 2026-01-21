import { Calendar, AlertTriangle } from 'lucide-react';
import { formatDate } from '../utils/reportGenerator';

export default function PeriodSelector({ 
  dataRange, 
  selectedPeriod, 
  onPeriodChange,
  periodRange,
  coverage 
}) {
  const periods = [
    { id: 3, label: '3 Month', months: 3 },
    { id: 6, label: '6 Month', months: 6 },
    { id: 12, label: '1 Year', months: 12 },
  ];

  if (!dataRange) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 opacity-50">
        <h2 className="text-lg font-semibold text-va-blue mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Step 2: Select Report Period
        </h2>
        <p className="text-gray-500 text-sm">Upload data files to see available date range</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-va-blue mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Step 2: Select Report Period
      </h2>

      {/* Data Range Display */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          📊 <strong>Data Available:</strong> {formatDate(dataRange.startDate)} – {formatDate(dataRange.endDate)}
        </p>
      </div>

      {/* Period Selection Buttons */}
      <div className="flex gap-3 mb-4">
        {periods.map((period) => (
          <button
            key={period.id}
            onClick={() => onPeriodChange(period.months)}
            className={`
              flex-1 py-3 px-4 rounded-lg font-medium text-sm
              transition-all duration-200
              ${selectedPeriod === period.months
                ? 'bg-va-blue text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Selected Period Display */}
      {periodRange && (
        <div className={`p-3 rounded-lg ${coverage?.fullCoverage ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <p className="text-sm font-medium text-gray-700">
            <strong>Selected Period:</strong> {formatDate(coverage?.actualStart || periodRange.periodStart)} – {formatDate(periodRange.periodEnd)}
          </p>
          
          {!coverage?.fullCoverage && (
            <div className="mt-2 flex items-start gap-2 text-yellow-700">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-xs">
                {coverage?.coverageNote || 'Data does not cover the full selected period'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
