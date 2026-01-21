import { useState } from 'react';
import { 
  FileText, Copy, Check, ExternalLink, TrendingUp, 
  Users, Eye, Heart, MessageCircle, Share2, 
  BarChart3, Lightbulb, Calendar
} from 'lucide-react';
import { formatNumber, formatPercent, formatDate, generatePlainTextReport } from '../utils/reportGenerator';
import ReportCharts from './ReportCharts';

export default function ReportDisplay({ reportData, dataRange }) {
  const [copied, setCopied] = useState(false);

  if (!reportData) return null;

  const { 
    periodStart, periodEnd, executiveSummary, followerMetrics,
    twitterMetrics, instagramMetrics, facebookMetrics,
    topTwitterPosts, topInstagramPosts, topFacebookPosts,
    monthlyBreakdown, insights 
  } = reportData;

  const handleCopyToClipboard = async () => {
    const plainText = generatePlainTextReport(reportData, dataRange);
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-va-blue flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Report Output
        </h2>
        <button
          onClick={handleCopyToClipboard}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
            transition-all duration-200
            ${copied 
              ? 'bg-green-600 text-white' 
              : 'bg-va-blue text-white hover:bg-va-blue-dark'
            }
          `}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy to Clipboard
            </>
          )}
        </button>
      </div>

      {/* Report Content */}
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-va-blue text-white p-4 rounded-lg text-center">
          <h1 className="text-xl font-bold">SECRETARY OF VETERANS AFFAIRS</h1>
          <p className="text-blue-200">Social Media Performance Report</p>
          <div className="mt-2 text-sm">
            <p>{formatDate(periodStart)} – {formatDate(periodEnd)}</p>
            <p className="text-blue-300 text-xs mt-1">Generated: {formatDate(new Date())}</p>
          </div>
        </div>

        {/* Executive Summary */}
        <section>
          <h3 className="text-md font-semibold text-va-blue border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Executive Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <SummaryCard 
              label="Total Posts" 
              value={formatNumber(executiveSummary.totalPosts)} 
              icon={<FileText className="w-5 h-5" />}
            />
            <SummaryCard 
              label="Total Impressions" 
              value={formatNumber(executiveSummary.totalImpressions)} 
              icon={<Eye className="w-5 h-5" />}
            />
            <SummaryCard 
              label="Total Engagements" 
              value={formatNumber(executiveSummary.totalEngagements)} 
              icon={<Heart className="w-5 h-5" />}
            />
            <SummaryCard 
              label="Avg Engagement Rate" 
              value={formatPercent(executiveSummary.avgEngagementRate)} 
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <FollowerSummaryCard 
              totalFollowers={followerMetrics.x.end + followerMetrics.ig.end + followerMetrics.fb.end + followerMetrics.threads.end}
              netGrowth={executiveSummary.netFollowerGrowth}
              icon={<Users className="w-5 h-5" />}
            />
          </div>
        </section>

        {/* Performance Visualizations */}
        <ReportCharts reportData={reportData} />

        {/* Platform Performance */}
        <section>
          <h3 className="text-md font-semibold text-va-blue border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Platform Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-medium text-gray-600">Metric</th>
                  <th className="text-right p-3 font-medium text-gray-600">X/Twitter</th>
                  <th className="text-right p-3 font-medium text-gray-600">Instagram</th>
                  <th className="text-right p-3 font-medium text-gray-600">Facebook</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="p-3 text-gray-700">Posts Published</td>
                  <td className="p-3 text-right font-medium">{twitterMetrics.postsCount}</td>
                  <td className="p-3 text-right font-medium">{instagramMetrics.postsCount}</td>
                  <td className="p-3 text-right font-medium">{facebookMetrics.postsCount}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-3 text-gray-700">Followers (Start)</td>
                  <td className="p-3 text-right">{formatNumber(followerMetrics.x.start)}</td>
                  <td className="p-3 text-right">{formatNumber(followerMetrics.ig.start)}</td>
                  <td className="p-3 text-right">{formatNumber(followerMetrics.fb.start)}</td>
                </tr>
                <tr>
                  <td className="p-3 text-gray-700">Followers (End)</td>
                  <td className="p-3 text-right">{formatNumber(followerMetrics.x.end)}</td>
                  <td className="p-3 text-right">{formatNumber(followerMetrics.ig.end)}</td>
                  <td className="p-3 text-right">{formatNumber(followerMetrics.fb.end)}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-3 text-gray-700">Follower Growth</td>
                  <td className="p-3 text-right">
                    <span className={followerMetrics.x.growth.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {followerMetrics.x.growth.formatted} ({followerMetrics.x.growth.percentFormatted})
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className={followerMetrics.ig.growth.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {followerMetrics.ig.growth.formatted} ({followerMetrics.ig.growth.percentFormatted})
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className={followerMetrics.fb.growth.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {followerMetrics.fb.growth.formatted} ({followerMetrics.fb.growth.percentFormatted})
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-gray-700">Total Impressions/Views</td>
                  <td className="p-3 text-right">{formatNumber(twitterMetrics.totalImpressions)}</td>
                  <td className="p-3 text-right">{formatNumber(instagramMetrics.totalViews)}</td>
                  <td className="p-3 text-right text-gray-400">N/A</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-3 text-gray-700">Total Engagements</td>
                  <td className="p-3 text-right">{formatNumber(twitterMetrics.totalEngagements)}</td>
                  <td className="p-3 text-right">{formatNumber(instagramMetrics.totalEngagement)}</td>
                  <td className="p-3 text-right">{formatNumber(facebookMetrics.totalEngagement)}</td>
                </tr>
                <tr>
                  <td className="p-3 text-gray-700">Avg Engagement Rate</td>
                  <td className="p-3 text-right">{formatPercent(twitterMetrics.avgEngagementRate)}</td>
                  <td className="p-3 text-right text-gray-400">N/A</td>
                  <td className="p-3 text-right text-gray-400">N/A</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Engagement Breakdown */}
        <section>
          <h3 className="text-md font-semibold text-va-blue border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Engagement Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Twitter */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-3">X/Twitter</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Likes</span>
                  <span className="font-medium">{formatNumber(twitterMetrics.totalLikes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Retweets</span>
                  <span className="font-medium">{formatNumber(twitterMetrics.totalRetweets)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quote Tweets</span>
                  <span className="font-medium">{formatNumber(twitterMetrics.totalQuoteTweets)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Replies</span>
                  <span className="font-medium">{formatNumber(twitterMetrics.totalReplies)}</span>
                </div>
              </div>
            </div>

            {/* Instagram */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-3">Instagram</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Likes</span>
                  <span className="font-medium">{formatNumber(instagramMetrics.totalLikes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Comments</span>
                  <span className="font-medium">{formatNumber(instagramMetrics.totalComments)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reach</span>
                  <span className="font-medium">{formatNumber(instagramMetrics.totalReach)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posts by Type</span>
                  <span className="font-medium text-xs">
                    {Object.entries(instagramMetrics.postsByType).map(([k, v]) => `${k}: ${v}`).join(', ') || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Facebook */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-3">Facebook</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reactions</span>
                  <span className="font-medium">{formatNumber(facebookMetrics.totalReactions)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Comments</span>
                  <span className="font-medium">{formatNumber(facebookMetrics.totalComments)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shares</span>
                  <span className="font-medium">{formatNumber(facebookMetrics.totalShares)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posts by Type</span>
                  <span className="font-medium text-xs">
                    {Object.entries(facebookMetrics.postsByType).map(([k, v]) => `${k}: ${v}`).join(', ') || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top Posts */}
        <section>
          <h3 className="text-md font-semibold text-va-blue border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Top Performing Posts
          </h3>
          
          {/* Twitter Top Posts */}
          {topTwitterPosts.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">X/Twitter</h4>
              <div className="space-y-2">
                {topTwitterPosts.map((post, i) => (
                  <PostCard 
                    key={i}
                    rank={i + 1}
                    date={post.date}
                    text={post.text}
                    permalink={post.permalink}
                    metrics={[
                      { label: 'Engagements', value: formatNumber(post.engagements) },
                      { label: 'Impressions', value: formatNumber(post.impressions) },
                    ]}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Instagram Top Posts */}
          {topInstagramPosts.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Instagram</h4>
              <div className="space-y-2">
                {topInstagramPosts.map((post, i) => (
                  <PostCard 
                    key={i}
                    rank={i + 1}
                    date={post.date}
                    text={post.message}
                    permalink={post.permalink}
                    metrics={[
                      { label: 'Likes', value: formatNumber(post.likes) },
                      { label: 'Views', value: formatNumber(post.views) },
                    ]}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Facebook Top Posts */}
          {topFacebookPosts.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Facebook</h4>
              <div className="space-y-2">
                {topFacebookPosts.map((post, i) => (
                  <PostCard 
                    key={i}
                    rank={i + 1}
                    date={post.date}
                    text={post.message}
                    permalink={post.permalink}
                    metrics={[
                      { label: 'Reactions', value: formatNumber(post.reactions) },
                      { label: 'Shares', value: formatNumber(post.shares) },
                    ]}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Monthly Breakdown */}
        {monthlyBreakdown.length > 0 && (
          <section>
            <h3 className="text-md font-semibold text-va-blue border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Monthly Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-medium text-gray-600">Month</th>
                    <th className="text-right p-3 font-medium text-gray-600">Posts</th>
                    <th className="text-right p-3 font-medium text-gray-600">Impressions</th>
                    <th className="text-right p-3 font-medium text-gray-600">Engagements</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {monthlyBreakdown.map((month, i) => (
                    <tr key={i} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                      <td className="p-3 text-gray-700 font-medium">{month.month}</td>
                      <td className="p-3 text-right">{month.total.posts}</td>
                      <td className="p-3 text-right">{formatNumber(month.total.impressions)}</td>
                      <td className="p-3 text-right">{formatNumber(month.total.engagements)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Key Insights */}
        {insights.length > 0 && (
          <section>
            <h3 className="text-md font-semibold text-va-blue border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Key Insights
            </h3>
            <div className="bg-yellow-50 rounded-lg p-4">
              <ul className="space-y-2">
                {insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-yellow-600">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// Summary Card Component
function SummaryCard({ label, value, icon, highlight }) {
  return (
    <div className={`p-4 rounded-lg ${highlight ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
      <div className={`${highlight ? 'text-green-600' : 'text-gray-400'} mb-2`}>
        {icon}
      </div>
      <p className={`text-2xl font-bold ${highlight ? 'text-green-700' : 'text-gray-800'}`}>
        {value}
      </p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

// Follower Summary Card Component (shows total + growth)
function FollowerSummaryCard({ totalFollowers, netGrowth, icon }) {
  const isPositive = netGrowth > 0;
  return (
    <div className={`p-4 rounded-lg ${isPositive ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
      <div className={`${isPositive ? 'text-green-600' : 'text-gray-400'} mb-2`}>
        {icon}
      </div>
      <p className={`text-2xl font-bold ${isPositive ? 'text-green-700' : 'text-gray-800'}`}>
        {formatNumber(totalFollowers)}
      </p>
      <p className="text-xs text-gray-500">Total Followers</p>
      <p className={`text-sm font-medium mt-1 ${isPositive ? 'text-green-600' : netGrowth < 0 ? 'text-red-600' : 'text-gray-500'}`}>
        {netGrowth >= 0 ? '+' : ''}{formatNumber(netGrowth)} growth
      </p>
    </div>
  );
}

// Post Card Component
function PostCard({ rank, date, text, permalink, metrics }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-va-blue text-white text-xs px-2 py-0.5 rounded">#{rank}</span>
            <span className="text-gray-500 text-xs">{formatDate(date)}</span>
            <div className="flex gap-2 text-xs text-gray-500">
              {metrics.map((m, i) => (
                <span key={i}>{m.label}: <strong>{m.value}</strong></span>
              ))}
            </div>
          </div>
          <p className="text-gray-700 text-xs line-clamp-2">"{text || '(No text)'}"</p>
        </div>
        {permalink && (
          <a 
            href={permalink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-va-blue hover:text-va-blue-light"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}
