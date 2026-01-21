import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { processUploadedFiles } from '../utils/csvParser';

export default function FileUpload({ onFilesProcessed }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [error, setError] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  }, []);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    await processFiles(files);
  };

  const processFiles = async (files) => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const results = await processUploadedFiles(files);
      setProcessedFiles(results);
      
      const successfulFiles = results.filter(f => f.success);
      const failedFiles = results.filter(f => !f.success);
      
      if (failedFiles.length > 0) {
        setError(`${failedFiles.length} file(s) failed to process: ${failedFiles.map(f => f.fileName).join(', ')}`);
      }
      
      if (successfulFiles.length > 0) {
        onFilesProcessed(results);
      }
    } catch (err) {
      setError(`Error processing files: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileTypeLabel = (fileType) => {
    const labels = {
      account_metrics: 'Account Metrics',
      twitter_posts: 'X/Twitter Posts',
      instagram_posts: 'Instagram Posts',
      facebook_posts: 'Facebook Posts',
      twitter_top_posts: 'X/Twitter Top Posts',
      instagram_top_posts: 'Instagram Top Posts',
      facebook_top_posts: 'Facebook Top Posts',
    };
    return labels[fileType] || fileType;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-va-blue mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5" />
        Step 1: Upload Data Files
      </h2>
      
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${isDragging 
            ? 'border-va-blue bg-blue-50' 
            : 'border-gray-300 hover:border-va-blue hover:bg-gray-50'
          }
          ${isProcessing ? 'opacity-50 cursor-wait' : ''}
        `}
      >
        <input
          type="file"
          multiple
          accept=".csv,.zip"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={isProcessing}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          {isProcessing ? (
            <Loader2 className="w-12 h-12 mx-auto text-va-blue animate-spin" />
          ) : (
            <FileText className="w-12 h-12 mx-auto text-gray-400" />
          )}
          <p className="mt-4 text-gray-600">
            {isProcessing 
              ? 'Processing files...' 
              : isDragging 
                ? 'Drop files here' 
                : 'Drag & drop CSV or ZIP files here'
            }
          </p>
          <p className="mt-2 text-sm text-gray-400">
            or click to browse
          </p>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Processed Files List */}
      {processedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
          {processedFiles.map((file, index) => (
            <div 
              key={index}
              className={`flex items-center gap-2 p-2 rounded ${
                file.success ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              {file.success ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm ${file.success ? 'text-green-700' : 'text-red-700'}`}>
                {file.fileName}
              </span>
              {file.success && (
                <span className="text-xs text-gray-500 ml-auto">
                  {getFileTypeLabel(file.fileType)} ({file.rowCount} rows)
                </span>
              )}
              {!file.success && (
                <span className="text-xs text-red-500 ml-auto">
                  {file.error}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>Supported files:</strong> Upload a ZIP file containing Hootsuite CSV exports, or upload individual CSV files. 
          The tool will automatically detect file types based on their content.
        </p>
      </div>
    </div>
  );
}
