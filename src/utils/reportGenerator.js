// Report generation utilities for SECVA Analytics Dashboard

// Detect the data range from all uploaded data
export function detectDataRange(normalizedData) {
  const allDates = [];
  
  // Collect dates from account metrics
  if (normalizedData.accountMetrics) {
    normalizedData.accountMetrics.forEach(row => {
      if (row.date) allDates.push(row.date);
    });
  }
  
  // Collect dates from posts
  [...normalizedData.twitterPosts, ...normalizedData.instagramPosts, ...normalizedData.facebookPosts].forEach(post => {
    if (post.date) allDates.push(post.date);
  });
  
  if (allDates.length === 0) {
    return null;
  }
  
  const sortedDates = allDates.sort((a, b) => a - b);
  return {
    startDate: sortedDates[0],
    endDate: sortedDates[sortedDates.length - 1],
  };
}

// Calculate report period based on selection (rolling backwards from end date)
export function calculatePeriodRange(endDate, periodMonths) {
  // Use UTC to match the GMT dates from Hootsuite CSV exports
  const endUTC = new Date(endDate);
  const periodEnd = new Date(Date.UTC(
    endUTC.getUTCFullYear(), 
    endUTC.getUTCMonth(), 
    endUTC.getUTCDate(), 
    0, 0, 0, 0
  ));
  
  // Calculate start date by going back N months from the end date
  const periodStart = new Date(Date.UTC(
    periodEnd.getUTCFullYear(),
    periodEnd.getUTCMonth() - periodMonths,
    periodEnd.getUTCDate() + 1, // Start the day after N months ago
    0, 0, 0, 0
  ));
  
  return { periodStart, periodEnd };
}

// Check if data covers the full requested period
export function checkDataCoverage(dataRange, periodRange) {
  const fullCoverage = dataRange.startDate <= periodRange.periodStart;
  const actualStart = fullCoverage ? periodRange.periodStart : dataRange.startDate;
  
  return {
    fullCoverage,
    actualStart,
    actualEnd: periodRange.periodEnd,
    coverageNote: fullCoverage 
      ? null 
      : `Note: Data only available from ${formatDate(dataRange.startDate)}`,
  };
}

// Filter data by date range (using UTC for consistency with Hootsuite GMT dates)
export function filterByPeriod(data, startDate, endDate) {
  if (!Array.isArray(data)) return [];
  
  // Get UTC timestamp at midnight for comparison
  const getUTCMidnight = (d) => {
    const date = new Date(d);
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0);
  };
  
  const startTime = getUTCMidnight(startDate);
  const endTime = getUTCMidnight(endDate);
  
  return data.filter(row => {
    if (!row.date) return false;
    const rowTime = getUTCMidnight(row.date);
    return rowTime >= startTime && rowTime <= endTime;
  });
}

// Format date for display
export function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Format number with commas
export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Math.round(num).toLocaleString('en-US');
}

// Format percentage
export function formatPercent(num, decimals = 1) {
  if (num === null || num === undefined || isNaN(num)) return '0%';
  return `${num.toFixed(decimals)}%`;
}

// Calculate follower growth
export function calculateFollowerGrowth(startValue, endValue) {
  const change = endValue - startValue;
  const percentChange = startValue > 0 
    ? ((change / startValue) * 100)
    : 0;
  return { 
    change, 
    percentChange,
    formatted: change >= 0 ? `+${formatNumber(change)}` : formatNumber(change),
    percentFormatted: change >= 0 ? `+${percentChange.toFixed(1)}%` : `${percentChange.toFixed(1)}%`,
  };
}

// Calculate aggregate metrics from account_metrics (matches Hootsuite dashboard)
export function calculateAggregateMetrics(accountMetrics, startDate, endDate) {
  if (!accountMetrics || accountMetrics.length === 0) {
    return {
      totalPosts: 0,
      totalImpressions: 0,
      xPosts: 0,
      igPosts: 0,
      fbPosts: 0,
      threadsPosts: 0,
    };
  }
  
  // Get UTC timestamp at midnight for comparison
  const getUTCMidnight = (d) => {
    const date = new Date(d);
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0);
  };
  
  const startTime = getUTCMidnight(startDate);
  const endTime = getUTCMidnight(endDate);
  
  // Filter to period
  const periodData = accountMetrics.filter(row => {
    if (!row.date) return false;
    const rowTime = getUTCMidnight(row.date);
    return rowTime >= startTime && rowTime <= endTime;
  });
  
  console.log('calculateAggregateMetrics - Period:', new Date(startTime).toISOString(), 'to', new Date(endTime).toISOString());
  console.log('calculateAggregateMetrics - Total rows:', accountMetrics.length, 'Filtered rows:', periodData.length);
  
  // Sum up per-platform daily values (NOT the cumulative totalPosts/totalImpressions columns)
  const xPosts = periodData.reduce((sum, row) => sum + (row.xPosts || 0), 0);
  const igPosts = periodData.reduce((sum, row) => sum + (row.igPosts || 0), 0);
  const fbPosts = periodData.reduce((sum, row) => sum + (row.fbPosts || 0), 0);
  const threadsPosts = periodData.reduce((sum, row) => sum + (row.threadsPosts || 0), 0);
  
  // Sum per-platform impressions
  const xImpressions = periodData.reduce((sum, row) => sum + (row.xImpressions || 0), 0);
  const igImpressions = periodData.reduce((sum, row) => sum + (row.igImpressions || 0), 0);
  const fbImpressions = periodData.reduce((sum, row) => sum + (row.fbImpressions || 0), 0);
  const threadsImpressions = periodData.reduce((sum, row) => sum + (row.threadsImpressions || 0), 0);
  
  return {
    totalPosts: xPosts + igPosts + fbPosts + threadsPosts,
    totalImpressions: xImpressions + igImpressions + fbImpressions + threadsImpressions,
    xPosts,
    igPosts,
    fbPosts,
    threadsPosts,
  };
}

// Get follower values at start and end of period
export function getFollowerMetrics(accountMetrics, startDate, endDate) {
  if (!accountMetrics || accountMetrics.length === 0) {
    return {
      x: { start: 0, end: 0, growth: calculateFollowerGrowth(0, 0) },
      ig: { start: 0, end: 0, growth: calculateFollowerGrowth(0, 0) },
      fb: { start: 0, end: 0, growth: calculateFollowerGrowth(0, 0) },
      threads: { start: 0, end: 0, growth: calculateFollowerGrowth(0, 0) },
    };
  }
  
  // Get UTC timestamp at midnight for comparison
  const getUTCMidnight = (d) => {
    const date = new Date(d);
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0);
  };
  
  const startTime = getUTCMidnight(startDate);
  const endTime = getUTCMidnight(endDate);
  
  // Filter to period
  const periodData = accountMetrics.filter(row => {
    if (!row.date) return false;
    const rowTime = getUTCMidnight(row.date);
    return rowTime >= startTime && rowTime <= endTime;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));
  
  if (periodData.length === 0) {
    return {
      x: { start: 0, end: 0, growth: calculateFollowerGrowth(0, 0) },
      ig: { start: 0, end: 0, growth: calculateFollowerGrowth(0, 0) },
      fb: { start: 0, end: 0, growth: calculateFollowerGrowth(0, 0) },
      threads: { start: 0, end: 0, growth: calculateFollowerGrowth(0, 0) },
    };
  }
  
  // Find first non-zero values for start
  const findFirstNonZero = (data, key) => {
    for (const row of data) {
      if (row[key] > 0) return row[key];
    }
    return 0;
  };
  
  // Find last non-zero values for end
  const findLastNonZero = (data, key) => {
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i][key] > 0) return data[i][key];
    }
    return 0;
  };
  
  const xStart = findFirstNonZero(periodData, 'xFollowers');
  const xEnd = findLastNonZero(periodData, 'xFollowers');
  const igStart = findFirstNonZero(periodData, 'igFollowers');
  const igEnd = findLastNonZero(periodData, 'igFollowers');
  const fbStart = findFirstNonZero(periodData, 'fbFollowers');
  const fbEnd = findLastNonZero(periodData, 'fbFollowers');
  const threadsStart = findFirstNonZero(periodData, 'threadsFollowers');
  const threadsEnd = findLastNonZero(periodData, 'threadsFollowers');
  
  return {
    x: { start: xStart, end: xEnd, growth: calculateFollowerGrowth(xStart, xEnd) },
    ig: { start: igStart, end: igEnd, growth: calculateFollowerGrowth(igStart, igEnd) },
    fb: { start: fbStart, end: fbEnd, growth: calculateFollowerGrowth(fbStart, fbEnd) },
    threads: { start: threadsStart, end: threadsEnd, growth: calculateFollowerGrowth(threadsStart, threadsEnd) },
  };
}

// Calculate Twitter metrics
export function calculateTwitterMetrics(posts) {
  if (!posts || posts.length === 0) {
    return {
      postsCount: 0,
      totalImpressions: 0,
      totalEngagements: 0,
      totalLikes: 0,
      totalRetweets: 0,
      totalQuoteTweets: 0,
      totalReplies: 0,
      avgEngagementRate: 0,
    };
  }
  
  const totalImpressions = posts.reduce((sum, p) => sum + (p.impressions || 0), 0);
  const totalEngagements = posts.reduce((sum, p) => sum + (p.engagements || 0), 0);
  const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const totalRetweets = posts.reduce((sum, p) => sum + (p.retweets || 0), 0);
  const totalQuoteTweets = posts.reduce((sum, p) => sum + (p.quoteTweets || 0), 0);
  const totalReplies = posts.reduce((sum, p) => sum + (p.replies || 0), 0);
  
  // Calculate average engagement rate
  const postsWithRate = posts.filter(p => p.engagementRate > 0);
  const avgEngagementRate = postsWithRate.length > 0
    ? postsWithRate.reduce((sum, p) => sum + p.engagementRate, 0) / postsWithRate.length
    : 0;
  
  return {
    postsCount: posts.length,
    totalImpressions,
    totalEngagements,
    totalLikes,
    totalRetweets,
    totalQuoteTweets,
    totalReplies,
    avgEngagementRate,
  };
}

// Calculate Instagram metrics
export function calculateInstagramMetrics(posts) {
  if (!posts || posts.length === 0) {
    return {
      postsCount: 0,
      totalLikes: 0,
      totalComments: 0,
      totalReach: 0,
      totalViews: 0,
      totalEngagement: 0,
      postsByType: {},
    };
  }
  
  const postsByType = {};
  posts.forEach(p => {
    const type = p.postType || 'Unknown';
    postsByType[type] = (postsByType[type] || 0) + 1;
  });
  
  return {
    postsCount: posts.length,
    totalLikes: posts.reduce((sum, p) => sum + (p.likes || 0), 0),
    totalComments: posts.reduce((sum, p) => sum + (p.comments || 0), 0),
    totalReach: posts.reduce((sum, p) => sum + (p.reach || 0), 0),
    totalViews: posts.reduce((sum, p) => sum + (p.views || 0), 0),
    totalEngagement: posts.reduce((sum, p) => sum + (p.likes || 0) + (p.comments || 0), 0),
    postsByType,
  };
}

// Calculate Facebook metrics
export function calculateFacebookMetrics(posts) {
  if (!posts || posts.length === 0) {
    return {
      postsCount: 0,
      totalReactions: 0,
      totalComments: 0,
      totalShares: 0,
      totalEngagement: 0,
      postsByType: {},
    };
  }
  
  const postsByType = {};
  posts.forEach(p => {
    const type = p.postType || 'Unknown';
    postsByType[type] = (postsByType[type] || 0) + 1;
  });
  
  return {
    postsCount: posts.length,
    totalReactions: posts.reduce((sum, p) => sum + (p.reactions || 0), 0),
    totalComments: posts.reduce((sum, p) => sum + (p.comments || 0), 0),
    totalShares: posts.reduce((sum, p) => sum + (p.shares || 0), 0),
    totalEngagement: posts.reduce((sum, p) => sum + (p.reactions || 0) + (p.comments || 0) + (p.shares || 0), 0),
    postsByType,
  };
}

// Get top posts by engagement
export function getTopPosts(posts, sortKey, limit = 5) {
  if (!posts || posts.length === 0) return [];
  
  return [...posts]
    .sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0))
    .slice(0, limit);
}

// Calculate monthly breakdown
export function calculateMonthlyBreakdown(normalizedData, startDate, endDate) {
  const months = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  
  while (current <= endDate) {
    const monthStart = new Date(current);
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    
    const twitterPosts = filterByPeriod(normalizedData.twitterPosts, monthStart, monthEnd);
    const instagramPosts = filterByPeriod(normalizedData.instagramPosts, monthStart, monthEnd);
    const facebookPosts = filterByPeriod(normalizedData.facebookPosts, monthStart, monthEnd);
    
    const twitterMetrics = calculateTwitterMetrics(twitterPosts);
    const instagramMetrics = calculateInstagramMetrics(instagramPosts);
    const facebookMetrics = calculateFacebookMetrics(facebookPosts);
    
    // Get follower counts at end of month
    const followerMetrics = getFollowerMetrics(normalizedData.accountMetrics, monthStart, monthEnd);
    
    months.push({
      month: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      monthDate: new Date(current),
      twitter: {
        posts: twitterMetrics.postsCount,
        impressions: twitterMetrics.totalImpressions,
        engagements: twitterMetrics.totalEngagements,
        followers: followerMetrics.x.end,
      },
      instagram: {
        posts: instagramMetrics.postsCount,
        views: instagramMetrics.totalViews,
        engagements: instagramMetrics.totalEngagement,
        followers: followerMetrics.ig.end,
      },
      facebook: {
        posts: facebookMetrics.postsCount,
        engagements: facebookMetrics.totalEngagement,
        followers: followerMetrics.fb.end,
      },
      total: {
        posts: twitterMetrics.postsCount + instagramMetrics.postsCount + facebookMetrics.postsCount,
        impressions: twitterMetrics.totalImpressions + instagramMetrics.totalViews,
        engagements: twitterMetrics.totalEngagements + instagramMetrics.totalEngagement + facebookMetrics.totalEngagement,
      },
    });
    
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
}

// Generate automatic insights
export function generateInsights(reportData) {
  const insights = [];
  
  // Find highest engagement month
  if (reportData.monthlyBreakdown && reportData.monthlyBreakdown.length > 0) {
    const highestEngagementMonth = reportData.monthlyBreakdown.reduce((max, month) => 
      month.total.engagements > max.total.engagements ? month : max
    );
    insights.push(`Highest engagement month was ${highestEngagementMonth.month} with ${formatNumber(highestEngagementMonth.total.engagements)} total engagements.`);
  }
  
  // Compare platform follower growth
  const { followerMetrics } = reportData;
  if (followerMetrics) {
    const platforms = [
      { name: 'X/Twitter', growth: followerMetrics.x.growth.percentChange },
      { name: 'Instagram', growth: followerMetrics.ig.growth.percentChange },
      { name: 'Facebook', growth: followerMetrics.fb.growth.percentChange },
    ].filter(p => p.growth !== 0);
    
    if (platforms.length >= 2) {
      platforms.sort((a, b) => b.growth - a.growth);
      if (platforms[0].growth > platforms[1].growth) {
        insights.push(`${platforms[0].name} follower growth of ${platforms[0].growth.toFixed(1)}% outpaced ${platforms[1].name} (${platforms[1].growth.toFixed(1)}%).`);
      }
    }
    
    // Highlight significant growth
    platforms.forEach(p => {
      if (p.growth > 50) {
        insights.push(`${p.name} showed significant growth with a ${p.growth.toFixed(1)}% increase in followers.`);
      }
    });
  }
  
  // Top performing post insight
  if (reportData.topTwitterPosts && reportData.topTwitterPosts.length > 0) {
    const topPost = reportData.topTwitterPosts[0];
    insights.push(`Top performing X/Twitter post reached ${formatNumber(topPost.impressions)} impressions on ${formatDate(topPost.date)}.`);
  }
  
  // Post type insights for Instagram
  if (reportData.instagramMetrics && reportData.instagramMetrics.postsByType) {
    const types = reportData.instagramMetrics.postsByType;
    const reelCount = types['Reel'] || 0;
    const photoCount = types['Photo'] || 0;
    if (reelCount > 0 && photoCount > 0) {
      insights.push(`Instagram content mix included ${reelCount} Reels and ${photoCount} Photos during this period.`);
    }
  }
  
  // Total posts insight
  const totalPosts = (reportData.twitterMetrics?.postsCount || 0) + 
                     (reportData.instagramMetrics?.postsCount || 0) + 
                     (reportData.facebookMetrics?.postsCount || 0);
  if (totalPosts > 0) {
    insights.push(`A total of ${formatNumber(totalPosts)} posts were published across all platforms during this period.`);
  }
  
  return insights.slice(0, 5); // Return max 5 insights
}

// Generate the full report
export function generateReport(normalizedData, periodStart, periodEnd) {
  // Filter data by period
  const twitterPosts = filterByPeriod(normalizedData.twitterPosts, periodStart, periodEnd);
  const instagramPosts = filterByPeriod(normalizedData.instagramPosts, periodStart, periodEnd);
  const facebookPosts = filterByPeriod(normalizedData.facebookPosts, periodStart, periodEnd);
  
  // Calculate metrics from individual posts (for detailed breakdowns)
  const twitterMetrics = calculateTwitterMetrics(twitterPosts);
  const instagramMetrics = calculateInstagramMetrics(instagramPosts);
  const facebookMetrics = calculateFacebookMetrics(facebookPosts);
  
  // Get aggregate metrics from account_metrics (matches Hootsuite dashboard)
  const aggregateMetrics = calculateAggregateMetrics(normalizedData.accountMetrics, periodStart, periodEnd);
  
  // Get follower metrics
  const followerMetrics = getFollowerMetrics(normalizedData.accountMetrics, periodStart, periodEnd);
  
  // Get top posts
  const topTwitterPosts = getTopPosts(twitterPosts, 'engagements', 5);
  const topInstagramPosts = getTopPosts(instagramPosts, 'likes', 5);
  const topFacebookPosts = getTopPosts(facebookPosts, 'reactions', 5);
  
  // Calculate monthly breakdown
  const monthlyBreakdown = calculateMonthlyBreakdown(normalizedData, periodStart, periodEnd);
  
  // Calculate executive summary using AGGREGATE metrics from account_metrics
  // This matches Hootsuite's dashboard numbers exactly
  const totalPosts = aggregateMetrics.totalPosts || 
    (twitterMetrics.postsCount + instagramMetrics.postsCount + facebookMetrics.postsCount);
  const totalImpressions = aggregateMetrics.totalImpressions || 
    (twitterMetrics.totalImpressions + instagramMetrics.totalViews);
  const totalEngagements = twitterMetrics.totalEngagements + instagramMetrics.totalEngagement + facebookMetrics.totalEngagement;
  const netFollowerGrowth = 
    followerMetrics.x.growth.change + 
    followerMetrics.ig.growth.change + 
    followerMetrics.fb.growth.change;
  
  const reportData = {
    periodStart,
    periodEnd,
    executiveSummary: {
      totalPosts,
      totalImpressions,
      totalEngagements,
      avgEngagementRate: twitterMetrics.avgEngagementRate,
      netFollowerGrowth,
    },
    aggregateMetrics, // Include for reference
    followerMetrics,
    twitterMetrics,
    instagramMetrics,
    facebookMetrics,
    topTwitterPosts,
    topInstagramPosts,
    topFacebookPosts,
    monthlyBreakdown,
    insights: [],
  };
  
  // Generate insights last (needs full report data)
  reportData.insights = generateInsights(reportData);
  
  return reportData;
}

// Generate plain text report for clipboard
export function generatePlainTextReport(reportData, dataRange) {
  const { periodStart, periodEnd, executiveSummary, followerMetrics, 
          twitterMetrics, instagramMetrics, facebookMetrics,
          topTwitterPosts, topInstagramPosts, topFacebookPosts,
          monthlyBreakdown, insights } = reportData;
  
  let text = '';
  
  // Header
  text += '═══════════════════════════════════════════════════════════════\n';
  text += 'SECRETARY OF VETERANS AFFAIRS - SOCIAL MEDIA PERFORMANCE REPORT\n';
  text += '═══════════════════════════════════════════════════════════════\n\n';
  
  text += `REPORT PERIOD: ${formatDate(periodStart)} – ${formatDate(periodEnd)}\n`;
  text += `DATA SOURCE RANGE: ${formatDate(dataRange.startDate)} – ${formatDate(dataRange.endDate)}\n`;
  text += `GENERATED: ${formatDate(new Date())}\n\n`;
  
  // Executive Summary
  text += '───────────────────────────────────────────────────────────────\n';
  text += 'EXECUTIVE SUMMARY\n';
  text += '───────────────────────────────────────────────────────────────\n\n';
  text += `Total Posts Published:        ${formatNumber(executiveSummary.totalPosts)}\n`;
  text += `Total Impressions:            ${formatNumber(executiveSummary.totalImpressions)}\n`;
  text += `Total Engagements:            ${formatNumber(executiveSummary.totalEngagements)}\n`;
  text += `Average Engagement Rate:      ${formatPercent(executiveSummary.avgEngagementRate)}\n`;
  text += `Net Follower Growth:          ${executiveSummary.netFollowerGrowth >= 0 ? '+' : ''}${formatNumber(executiveSummary.netFollowerGrowth)} (all platforms combined)\n\n`;
  
  // Platform Performance
  text += '───────────────────────────────────────────────────────────────\n';
  text += 'PLATFORM PERFORMANCE\n';
  text += '───────────────────────────────────────────────────────────────\n\n';
  text += `                        X/TWITTER    INSTAGRAM    FACEBOOK\n`;
  text += `Posts Published              ${padLeft(twitterMetrics.postsCount, 5)}        ${padLeft(instagramMetrics.postsCount, 5)}       ${padLeft(facebookMetrics.postsCount, 5)}\n`;
  text += `Followers (Start)       ${padLeft(formatNumber(followerMetrics.x.start), 10)}   ${padLeft(formatNumber(followerMetrics.ig.start), 10)}  ${padLeft(formatNumber(followerMetrics.fb.start), 10)}\n`;
  text += `Followers (End)         ${padLeft(formatNumber(followerMetrics.x.end), 10)}   ${padLeft(formatNumber(followerMetrics.ig.end), 10)}  ${padLeft(formatNumber(followerMetrics.fb.end), 10)}\n`;
  text += `Follower Growth         ${padLeft(followerMetrics.x.growth.formatted, 10)}   ${padLeft(followerMetrics.ig.growth.formatted, 10)}  ${padLeft(followerMetrics.fb.growth.formatted, 10)}\n`;
  text += `                        ${padLeft(`(${followerMetrics.x.growth.percentFormatted})`, 10)}   ${padLeft(`(${followerMetrics.ig.growth.percentFormatted})`, 10)}  ${padLeft(`(${followerMetrics.fb.growth.percentFormatted})`, 10)}\n`;
  text += `Total Impressions       ${padLeft(formatNumber(twitterMetrics.totalImpressions), 10)}   ${padLeft(formatNumber(instagramMetrics.totalViews), 10)}       N/A\n`;
  text += `Total Engagements       ${padLeft(formatNumber(twitterMetrics.totalEngagements), 10)}   ${padLeft(formatNumber(instagramMetrics.totalEngagement), 10)}  ${padLeft(formatNumber(facebookMetrics.totalEngagement), 10)}\n`;
  text += `Avg Engagement Rate     ${padLeft(formatPercent(twitterMetrics.avgEngagementRate), 10)}          N/A       N/A\n\n`;
  
  // Engagement Breakdown
  text += '───────────────────────────────────────────────────────────────\n';
  text += 'ENGAGEMENT BREAKDOWN\n';
  text += '───────────────────────────────────────────────────────────────\n\n';
  
  text += 'X/TWITTER:\n';
  text += `  Total Likes:        ${formatNumber(twitterMetrics.totalLikes)}\n`;
  text += `  Total Retweets:     ${formatNumber(twitterMetrics.totalRetweets)}\n`;
  text += `  Total Quote Tweets: ${formatNumber(twitterMetrics.totalQuoteTweets)}\n`;
  text += `  Total Replies:      ${formatNumber(twitterMetrics.totalReplies)}\n\n`;
  
  text += 'INSTAGRAM:\n';
  text += `  Total Likes:        ${formatNumber(instagramMetrics.totalLikes)}\n`;
  text += `  Total Comments:     ${formatNumber(instagramMetrics.totalComments)}\n`;
  text += `  Total Reach:        ${formatNumber(instagramMetrics.totalReach)}\n`;
  text += `  Posts by Type:      ${Object.entries(instagramMetrics.postsByType).map(([k, v]) => `${k}: ${v}`).join(', ') || 'N/A'}\n\n`;
  
  text += 'FACEBOOK:\n';
  text += `  Total Reactions:    ${formatNumber(facebookMetrics.totalReactions)}\n`;
  text += `  Total Comments:     ${formatNumber(facebookMetrics.totalComments)}\n`;
  text += `  Total Shares:       ${formatNumber(facebookMetrics.totalShares)}\n`;
  text += `  Posts by Type:      ${Object.entries(facebookMetrics.postsByType).map(([k, v]) => `${k}: ${v}`).join(', ') || 'N/A'}\n\n`;
  
  // Top Performing Posts
  text += '───────────────────────────────────────────────────────────────\n';
  text += 'TOP PERFORMING POSTS - X/TWITTER\n';
  text += '───────────────────────────────────────────────────────────────\n\n';
  topTwitterPosts.forEach((post, i) => {
    text += `${i + 1}. ${formatDate(post.date)} | ${formatNumber(post.engagements)} engagements | ${formatNumber(post.impressions)} impressions\n`;
    text += `   "${truncateText(post.text, 100)}"\n`;
    text += `   ${post.permalink}\n\n`;
  });
  
  text += '───────────────────────────────────────────────────────────────\n';
  text += 'TOP PERFORMING POSTS - INSTAGRAM\n';
  text += '───────────────────────────────────────────────────────────────\n\n';
  topInstagramPosts.forEach((post, i) => {
    text += `${i + 1}. ${formatDate(post.date)} | ${formatNumber(post.likes)} likes | ${formatNumber(post.views)} views\n`;
    text += `   "${truncateText(post.message, 100)}"\n`;
    text += `   ${post.permalink}\n\n`;
  });
  
  text += '───────────────────────────────────────────────────────────────\n';
  text += 'TOP PERFORMING POSTS - FACEBOOK\n';
  text += '───────────────────────────────────────────────────────────────\n\n';
  topFacebookPosts.forEach((post, i) => {
    text += `${i + 1}. ${formatDate(post.date)} | ${formatNumber(post.reactions)} reactions | ${formatNumber(post.shares)} shares\n`;
    text += `   "${truncateText(post.message, 100)}"\n`;
    text += `   ${post.permalink}\n\n`;
  });
  
  // Monthly Breakdown
  text += '───────────────────────────────────────────────────────────────\n';
  text += 'MONTHLY BREAKDOWN\n';
  text += '───────────────────────────────────────────────────────────────\n\n';
  text += `${'Month'.padEnd(12)} ${'Posts'.padStart(8)} ${'Impressions'.padStart(14)} ${'Engagements'.padStart(14)}\n`;
  text += `${'─'.repeat(12)} ${'─'.repeat(8)} ${'─'.repeat(14)} ${'─'.repeat(14)}\n`;
  monthlyBreakdown.forEach(month => {
    text += `${month.month.padEnd(12)} ${padLeft(month.total.posts, 8)} ${padLeft(formatNumber(month.total.impressions), 14)} ${padLeft(formatNumber(month.total.engagements), 14)}\n`;
  });
  text += '\n';
  
  // Key Insights
  text += '───────────────────────────────────────────────────────────────\n';
  text += 'KEY INSIGHTS\n';
  text += '───────────────────────────────────────────────────────────────\n\n';
  insights.forEach(insight => {
    text += `• ${insight}\n\n`;
  });
  
  // Footer
  text += '═══════════════════════════════════════════════════════════════\n';
  text += '                         END OF REPORT\n';
  text += '═══════════════════════════════════════════════════════════════\n';
  
  return text;
}

// Helper functions
function padLeft(str, len) {
  return String(str).padStart(len);
}

function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
