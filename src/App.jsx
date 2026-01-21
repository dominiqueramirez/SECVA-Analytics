import { useState, useEffect, useMemo } from 'react';
import { BarChart3, FileWarning, ArrowUp } from 'lucide-react';
import FileUpload from './components/FileUpload';
import PeriodSelector from './components/PeriodSelector';
import ReportDisplay from './components/ReportDisplay';
import { normalizeData } from './utils/csvParser';
import { 
  detectDataRange, 
  calculatePeriodRange, 
  checkDataCoverage,
  generateReport 
} from './utils/reportGenerator';

function App() {
  const [parsedFiles, setParsedFiles] = useState([]);
  const [normalizedData, setNormalizedData] = useState(null);
  const [dataRange, setDataRange] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(3); // Default to 3 months
  const [reportData, setReportData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When files are processed, normalize the data
  const handleFilesProcessed = (files) => {
    setParsedFiles(files);
    const successfulFiles = files.filter(f => f.success);
    
    if (successfulFiles.length > 0) {
      const normalized = normalizeData(successfulFiles);
      setNormalizedData(normalized);
      
      // Detect data range
      const range = detectDataRange(normalized);
      setDataRange(range);
      
      // Reset report
      setReportData(null);
    }
  };

  // Calculate period range based on selection
  const periodRange = useMemo(() => {
    if (!dataRange) return null;
    return calculatePeriodRange(dataRange.endDate, selectedPeriod);
  }, [dataRange, selectedPeriod]);

  // Check data coverage
  const coverage = useMemo(() => {
    if (!dataRange || !periodRange) return null;
    return checkDataCoverage(dataRange, periodRange);
  }, [dataRange, periodRange]);

  // Check if we have minimum required data
  const hasRequiredData = useMemo(() => {
    if (!normalizedData) return false;
    
    // Need at least some post data
    const hasPosts = 
      normalizedData.twitterPosts.length > 0 ||
      normalizedData.instagramPosts.length > 0 ||
      normalizedData.facebookPosts.length > 0;
    
    return hasPosts;
  }, [normalizedData]);

  // Generate report
  const handleGenerateReport = () => {
    if (!normalizedData || !periodRange || !coverage) return;
    
    setIsGenerating(true);
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const report = generateReport(
        normalizedData,
        coverage.actualStart,
        periodRange.periodEnd
      );
      setReportData(report);
      setIsGenerating(false);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-va-blue text-white py-4 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <BarChart3 className="w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold">SECVA Social Media Analytics</h1>
            <p className="text-blue-200 text-sm">Report Generator</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-6 px-4 space-y-6">
        {/* File Upload Section */}
        <FileUpload onFilesProcessed={handleFilesProcessed} />

        {/* Period Selector */}
        <PeriodSelector
          dataRange={dataRange}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          periodRange={periodRange}
          coverage={coverage}
        />

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGenerateReport}
            disabled={!hasRequiredData || isGenerating}
            className={`
              px-8 py-3 rounded-lg font-semibold text-lg
              transition-all duration-200 shadow-md
              ${hasRequiredData && !isGenerating
                ? 'bg-va-blue text-white hover:bg-va-blue-dark hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isGenerating ? 'Generating Report...' : 'Generate Report'}
          </button>
        </div>

        {/* Missing Data Warning */}
        {parsedFiles.length > 0 && !hasRequiredData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <FileWarning className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-800 font-medium">Missing Required Data</p>
              <p className="text-yellow-700 text-sm mt-1">
                Please upload at least one post data file (X/Twitter, Instagram, or Facebook posts) 
                to generate a report.
              </p>
            </div>
          </div>
        )}

        {/* Report Display */}
        {reportData && (
          <ReportDisplay reportData={reportData} dataRange={dataRange} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 py-4 px-6 mt-8">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-600">
          <p>VA Digital Communications | SECVA Social Media Analytics Tool</p>
          <p className="text-xs mt-1">Data sourced from Hootsuite exports</p>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-va-blue text-white p-3 rounded-full shadow-lg hover:bg-va-blue-dark transition-all duration-200 hover:shadow-xl z-50"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default App;

