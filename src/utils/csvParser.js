import Papa from 'papaparse';
import JSZip from 'jszip';

// File type detection based on column headers
export const FILE_TYPES = {
  ACCOUNT_METRICS: 'account_metrics',
  TWITTER_POSTS: 'twitter_posts',
  INSTAGRAM_POSTS: 'instagram_posts',
  FACEBOOK_POSTS: 'facebook_posts',
  TWITTER_TOP_POSTS: 'twitter_top_posts',
  INSTAGRAM_TOP_POSTS: 'instagram_top_posts',
  FACEBOOK_TOP_POSTS: 'facebook_top_posts',
};

// Column patterns for file type detection
const FILE_PATTERNS = {
  [FILE_TYPES.ACCOUNT_METRICS]: ['Followers', 'Post impressions', 'Social network'],
  [FILE_TYPES.TWITTER_POSTS]: ['Tweet Text', 'Impressions', 'Engagement Rate', 'Retweets'],
  [FILE_TYPES.TWITTER_TOP_POSTS]: ['Tweet Text', 'Engagement Rate'],
  [FILE_TYPES.INSTAGRAM_POSTS]: ['Instagram Account', 'Instagram Post ID', 'Likes', 'Comments'],
  [FILE_TYPES.INSTAGRAM_TOP_POSTS]: ['Instagram Account', 'Engagement'],
  [FILE_TYPES.FACEBOOK_POSTS]: ['Facebook Page', 'Facebook Post ID', 'Reactions', 'Comments', 'Shares'],
  [FILE_TYPES.FACEBOOK_TOP_POSTS]: ['Facebook Page', 'Reactions'],
};

// Detect file type from headers
export function detectFileType(headers) {
  const headerStr = headers.join(' ').toLowerCase();
  
  // Check for account metrics FIRST (aggregate data with multiple platform breakdowns)
  // These files have columns like "Followers > Social network" and "Post impressions > Social network"
  // but NOT individual post IDs
  if (headerStr.includes('followers') && 
      headerStr.includes('social network') && 
      !headerStr.includes('post id') &&
      !headerStr.includes('tweet id') &&
      !headerStr.includes('post permalink')) {
    return FILE_TYPES.ACCOUNT_METRICS;
  }
  
  // Check for Twitter posts (including top posts)
  if (headerStr.includes('tweet text') || headerStr.includes('tweet id')) {
    if (headerStr.includes('impressions') && headerStr.includes('engagements')) {
      return FILE_TYPES.TWITTER_POSTS;
    }
    return FILE_TYPES.TWITTER_TOP_POSTS;
  }
  
  // Check for Instagram posts
  if (headerStr.includes('instagram post id')) {
    if (headerStr.includes('reach') && headerStr.includes('views')) {
      return FILE_TYPES.INSTAGRAM_POSTS;
    }
    return FILE_TYPES.INSTAGRAM_TOP_POSTS;
  }
  
  // Check for Facebook posts
  if (headerStr.includes('facebook post id')) {
    if (headerStr.includes('shares')) {
      return FILE_TYPES.FACEBOOK_POSTS;
    }
    return FILE_TYPES.FACEBOOK_TOP_POSTS;
  }
  
  return null;
}

// Parse a single CSV file
export function parseCSV(fileContent, fileName) {
  return new Promise((resolve, reject) => {
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn(`Parsing warnings for ${fileName}:`, results.errors);
        }
        
        const headers = results.meta.fields || [];
        const fileType = detectFileType(headers);
        
        if (!fileType) {
          resolve({
            success: false,
            fileName,
            error: 'Unable to detect file type from headers',
            headers,
          });
          return;
        }
        
        resolve({
          success: true,
          fileName,
          fileType,
          data: results.data,
          headers,
          rowCount: results.data.length,
        });
      },
      error: (error) => {
        reject({
          success: false,
          fileName,
          error: error.message,
        });
      },
    });
  });
}

// Parse a ZIP file containing multiple CSVs
export async function parseZipFile(file) {
  const zip = new JSZip();
  const contents = await zip.loadAsync(file);
  const results = [];
  
  for (const [filename, zipEntry] of Object.entries(contents.files)) {
    if (filename.endsWith('.csv') && !zipEntry.dir) {
      try {
        const content = await zipEntry.async('string');
        const parsed = await parseCSV(content, filename);
        results.push(parsed);
      } catch (error) {
        results.push({
          success: false,
          fileName: filename,
          error: error.message || 'Failed to parse CSV',
        });
      }
    }
  }
  
  return results;
}

// Process uploaded files (handles both CSV and ZIP)
export async function processUploadedFiles(files) {
  const results = [];
  
  for (const file of files) {
    if (file.name.endsWith('.zip')) {
      const zipResults = await parseZipFile(file);
      results.push(...zipResults);
    } else if (file.name.endsWith('.csv')) {
      const content = await file.text();
      const parsed = await parseCSV(content, file.name);
      results.push(parsed);
    } else {
      results.push({
        success: false,
        fileName: file.name,
        error: 'Unsupported file type. Please upload CSV or ZIP files.',
      });
    }
  }
  
  return results;
}

// Normalize data for consistent processing
export function normalizeData(parsedFiles) {
  const normalized = {
    accountMetrics: null,
    twitterPosts: [],
    instagramPosts: [],
    facebookPosts: [],
    twitterTopPosts: [],
    instagramTopPosts: [],
    facebookTopPosts: [],
  };
  
  for (const file of parsedFiles) {
    if (!file.success) continue;
    
    switch (file.fileType) {
      case FILE_TYPES.ACCOUNT_METRICS:
        normalized.accountMetrics = normalizeAccountMetrics(file.data, file.headers);
        break;
      case FILE_TYPES.TWITTER_POSTS:
        normalized.twitterPosts = normalizeTwitterPosts(file.data);
        break;
      case FILE_TYPES.INSTAGRAM_POSTS:
        normalized.instagramPosts = normalizeInstagramPosts(file.data);
        break;
      case FILE_TYPES.FACEBOOK_POSTS:
        normalized.facebookPosts = normalizeFacebookPosts(file.data);
        break;
      case FILE_TYPES.TWITTER_TOP_POSTS:
        normalized.twitterTopPosts = normalizeTwitterPosts(file.data);
        break;
      case FILE_TYPES.INSTAGRAM_TOP_POSTS:
        normalized.instagramTopPosts = normalizeInstagramPosts(file.data);
        break;
      case FILE_TYPES.FACEBOOK_TOP_POSTS:
        normalized.facebookTopPosts = normalizeFacebookPosts(file.data);
        break;
    }
  }
  
  return normalized;
}

// Find column by partial match
function findColumn(headers, patterns) {
  for (const pattern of patterns) {
    const found = headers.find(h => h.toLowerCase().includes(pattern.toLowerCase()));
    if (found) return found;
  }
  return null;
}

// Normalize account metrics data
function normalizeAccountMetrics(data, headers) {
  // Find the right columns based on patterns
  const xFollowersCol = findColumn(headers, ['Followers > Social network - X', 'Followers (Daily aggregated values for Social Networks: @']);
  const igFollowersCol = findColumn(headers, ['Followers > Social network - Instagram']);
  const fbFollowersCol = findColumn(headers, ['Followers > Social network - Facebook']);
  const threadsFollowersCol = findColumn(headers, ['Followers > Social network - Threads']);
  
  // Per-network daily impressions
  const xImpressionsCol = findColumn(headers, ['Post impressions > Social network - X']);
  const igImpressionsCol = findColumn(headers, ['Post impressions > Social network - Instagram', 'Reach > Social network - Instagram']);
  const fbImpressionsCol = findColumn(headers, ['Post impressions > Social network - Facebook', 'Reach > Social network - Facebook']);
  const threadsImpressionsCol = findColumn(headers, ['Post impressions > Social network - Threads']);
  
  // Aggregated totals (these match Hootsuite's dashboard numbers - but are cumulative, not daily)
  const postsCol = findColumn(headers, ['Posts (This column']);
  const totalImpressionsCol = findColumn(headers, ['Post impressions (This column']);
  
  // Per-network daily posts
  const xPostsCol = findColumn(headers, ['Posts > Social network - X']);
  const igPostsCol = findColumn(headers, ['Posts > Social network - Instagram']);
  const fbPostsCol = findColumn(headers, ['Posts > Social network - Facebook']);
  const threadsPostsCol = findColumn(headers, ['Posts > Social network - Threads']);
  
  return data.map(row => ({
    date: parseDate(row['Date (GMT)']),
    xFollowers: parseNumber(row[xFollowersCol]),
    igFollowers: parseNumber(row[igFollowersCol]),
    fbFollowers: parseNumber(row[fbFollowersCol]),
    threadsFollowers: parseNumber(row[threadsFollowersCol]),
    // Per-network daily impressions
    xImpressions: parseNumber(row[xImpressionsCol]),
    igImpressions: parseNumber(row[igImpressionsCol]),
    fbImpressions: parseNumber(row[fbImpressionsCol]),
    threadsImpressions: parseNumber(row[threadsImpressionsCol]),
    // Aggregated totals (cumulative - not for summing)
    totalPosts: parseNumber(row[postsCol]),
    totalImpressions: parseNumber(row[totalImpressionsCol]),
    // Per-network daily posts
    xPosts: parseNumber(row[xPostsCol]),
    igPosts: parseNumber(row[igPostsCol]),
    fbPosts: parseNumber(row[fbPostsCol]),
    threadsPosts: parseNumber(row[threadsPostsCol]),
    raw: row,
  })).filter(row => row.date);
}

// Normalize Twitter posts data
function normalizeTwitterPosts(data) {
  return data.map(row => ({
    date: parseDate(row['Date (GMT)']),
    text: row['Tweet Text'] || '',
    permalink: row['Tweet Permalink'] || '',
    impressions: parseNumber(row['Impressions']),
    engagements: parseNumber(row['Engagements']),
    likes: parseNumber(row['Likes']),
    retweets: parseNumber(row['Retweets']),
    quoteTweets: parseNumber(row['Quote Tweets']),
    replies: parseNumber(row['Replies']),
    engagementRate: parseNumber(row['Engagement Rate']),
    tags: row['Tweet Tags'] || '',
    campaign: row['Tweet Campaign'] || '',
  })).filter(row => row.date);
}

// Normalize Instagram posts data
function normalizeInstagramPosts(data) {
  return data.map(row => ({
    date: parseDate(row['Date (GMT)']),
    postType: row['Post Type'] || '',
    message: row['Post Message'] || '',
    permalink: row['Post Permalink'] || '',
    likes: parseNumber(row['Likes']),
    comments: parseNumber(row['Comments']),
    reach: parseNumber(row['Reach']),
    views: parseNumber(row['Views']),
    engagement: parseNumber(row['Engagement']),
    tags: row['Post Tags'] || '',
    campaign: row['Post Campaign'] || '',
  })).filter(row => row.date);
}

// Normalize Facebook posts data
function normalizeFacebookPosts(data) {
  return data.map(row => ({
    date: parseDate(row['Date (GMT)']),
    postType: row['Post Type'] || '',
    title: row['Post Title'] || row['Title'] || '',
    message: row['Post Message'] || '',
    permalink: row['Post Permalink'] || '',
    reactions: parseNumber(row['Reactions']),
    comments: parseNumber(row['Comments']),
    shares: parseNumber(row['Shares']),
    tags: row['Post Tags'] || '',
    campaign: row['Post Campaign'] || '',
  })).filter(row => row.date);
}

// Parse date string to Date object (treating as UTC to match Hootsuite's GMT dates)
function parseDate(dateStr) {
  if (!dateStr) return null;
  
  // Handle various date formats from Hootsuite
  // Format is typically: "2025-01-21 00:00:00" or "2025-01-21" or "Jan 21, 2025"
  let date;
  
  // If it contains a time component with space separator, parse as UTC
  if (dateStr.includes(' ') && dateStr.match(/\d{4}-\d{2}-\d{2}/)) {
    // Format: "2025-01-21 00:00:00" - parse as UTC
    const [datePart] = dateStr.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // Format: "2025-01-21" - parse as UTC
    const [year, month, day] = dateStr.split('-').map(Number);
    date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  } else {
    // Fallback: let JS parse it, then convert to UTC midnight
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return null;
    date = new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0, 0));
  }
  
  return isNaN(date.getTime()) ? null : date;
}

// Parse number from various formats
function parseNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  const cleaned = String(value).replace(/[,%]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
