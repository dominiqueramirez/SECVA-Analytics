import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, BarChart3, Users, Eye } from 'lucide-react';
import { formatNumber } from '../utils/reportGenerator';

// VA brand colors
const COLORS = {
  vaBlue: '#003f72',
  vaBlueDark: '#002e52',
  twitter: '#000000',
  instagram: '#E4405F',
  facebook: '#1877F2',
  threads: '#000000',
  accent1: '#0071bc',
  accent2: '#02bfe7',
  accent3: '#4aa564',
  accent4: '#fdb81e',
};

const PLATFORM_COLORS = {
  x: COLORS.twitter,
  instagram: COLORS.instagram,
  facebook: COLORS.facebook,
  threads: COLORS.threads,
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatter ? formatter(entry.value) : formatNumber(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Section wrapper for charts
const ChartSection = ({ title, icon, children }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <h4 className="text-sm font-semibold text-va-blue flex items-center gap-2 mb-4">
      {icon}
      {title}
    </h4>
    {children}
  </div>
);

// Follower Growth Chart - By Platform
export function FollowerGrowthByPlatformChart({ monthlyBreakdown }) {
  // Prepare data for the chart
  const data = monthlyBreakdown.map(month => ({
    month: month.month,
    'X/Twitter': month.twitter.followers || 0,
    'Instagram': month.instagram.followers || 0,
    'Facebook': month.facebook.followers || 0,
  }));

  return (
    <ChartSection title="Follower Growth Over Time (By Platform)" icon={<Users className="w-4 h-4" />}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line 
            type="monotone" 
            dataKey="X/Twitter" 
            stroke={PLATFORM_COLORS.x} 
            strokeWidth={2}
            dot={{ fill: PLATFORM_COLORS.x, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="Instagram" 
            stroke={PLATFORM_COLORS.instagram} 
            strokeWidth={2}
            dot={{ fill: PLATFORM_COLORS.instagram, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="Facebook" 
            stroke={PLATFORM_COLORS.facebook} 
            strokeWidth={2}
            dot={{ fill: PLATFORM_COLORS.facebook, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartSection>
  );
}

// Follower Growth Chart - All Platforms Combined
export function FollowerGrowthCombinedChart({ monthlyBreakdown }) {
  // Prepare data for the chart - sum all platforms
  const data = monthlyBreakdown.map(month => ({
    month: month.month,
    'Total Followers': (month.twitter.followers || 0) + (month.instagram.followers || 0) + (month.facebook.followers || 0),
  }));

  return (
    <ChartSection title="Follower Growth Over Time (All Platforms)" icon={<Users className="w-4 h-4" />}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="followerGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.vaBlue} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={COLORS.vaBlue} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Area 
            type="monotone" 
            dataKey="Total Followers" 
            stroke={COLORS.vaBlue} 
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#followerGradient)"
            dot={{ fill: COLORS.vaBlue, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartSection>
  );
}

// Individual Platform Follower Charts
export function TwitterFollowerChart({ monthlyBreakdown }) {
  const data = monthlyBreakdown.map(month => ({
    month: month.month,
    'Followers': month.twitter.followers || 0,
  }));

  return (
    <ChartSection title="X/Twitter Follower Growth" icon={<Users className="w-4 h-4" />}>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="twitterGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={PLATFORM_COLORS.x} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={PLATFORM_COLORS.x} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="Followers" 
            stroke={PLATFORM_COLORS.x} 
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#twitterGradient)"
            dot={{ fill: PLATFORM_COLORS.x, strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartSection>
  );
}

export function InstagramFollowerChart({ monthlyBreakdown }) {
  const data = monthlyBreakdown.map(month => ({
    month: month.month,
    'Followers': month.instagram.followers || 0,
  }));

  return (
    <ChartSection title="Instagram Follower Growth" icon={<Users className="w-4 h-4" />}>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="instagramGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={PLATFORM_COLORS.instagram} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={PLATFORM_COLORS.instagram} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="Followers" 
            stroke={PLATFORM_COLORS.instagram} 
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#instagramGradient)"
            dot={{ fill: PLATFORM_COLORS.instagram, strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartSection>
  );
}

export function FacebookFollowerChart({ monthlyBreakdown }) {
  const data = monthlyBreakdown.map(month => ({
    month: month.month,
    'Followers': month.facebook.followers || 0,
  }));

  return (
    <ChartSection title="Facebook Follower Growth" icon={<Users className="w-4 h-4" />}>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="facebookGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={PLATFORM_COLORS.facebook} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={PLATFORM_COLORS.facebook} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="Followers" 
            stroke={PLATFORM_COLORS.facebook} 
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#facebookGradient)"
            dot={{ fill: PLATFORM_COLORS.facebook, strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartSection>
  );
}

// Impressions Over Time Chart
export function ImpressionsChart({ monthlyBreakdown }) {
  const data = monthlyBreakdown.map(month => ({
    month: month.month,
    impressions: month.total.impressions || 0,
    'X/Twitter': month.twitter.impressions || 0,
    'Instagram': month.instagram.views || 0,
  }));

  return (
    <ChartSection title="Impressions Over Time" icon={<Eye className="w-4 h-4" />}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="impressionsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.vaBlue} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={COLORS.vaBlue} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => value >= 1000000 ? `${(value/1000000).toFixed(1)}M` : value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Area 
            type="monotone" 
            dataKey="impressions" 
            name="Total Impressions"
            stroke={COLORS.vaBlue} 
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#impressionsGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartSection>
  );
}

// Posts Per Month Chart
export function PostsPerMonthChart({ monthlyBreakdown }) {
  const data = monthlyBreakdown.map(month => ({
    month: month.month,
    'X/Twitter': month.twitter.posts || 0,
    'Instagram': month.instagram.posts || 0,
    'Facebook': month.facebook.posts || 0,
  }));

  return (
    <ChartSection title="Posts Published Per Month" icon={<BarChart3 className="w-4 h-4" />}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="X/Twitter" fill={PLATFORM_COLORS.x} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Instagram" fill={PLATFORM_COLORS.instagram} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Facebook" fill={PLATFORM_COLORS.facebook} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartSection>
  );
}

// Engagements Over Time Chart
export function EngagementsChart({ monthlyBreakdown }) {
  const data = monthlyBreakdown.map(month => ({
    month: month.month,
    'X/Twitter': month.twitter.engagements || 0,
    'Instagram': month.instagram.engagements || 0,
    'Facebook': month.facebook.engagements || 0,
    total: month.total.engagements || 0,
  }));

  return (
    <ChartSection title="Engagements Over Time" icon={<TrendingUp className="w-4 h-4" />}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line 
            type="monotone" 
            dataKey="X/Twitter" 
            stroke={PLATFORM_COLORS.x} 
            strokeWidth={2}
            dot={{ fill: PLATFORM_COLORS.x, strokeWidth: 2, r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="Instagram" 
            stroke={PLATFORM_COLORS.instagram} 
            strokeWidth={2}
            dot={{ fill: PLATFORM_COLORS.instagram, strokeWidth: 2, r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="Facebook" 
            stroke={PLATFORM_COLORS.facebook} 
            strokeWidth={2}
            dot={{ fill: PLATFORM_COLORS.facebook, strokeWidth: 2, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartSection>
  );
}

// Platform Distribution Pie Chart
export function PlatformDistributionChart({ twitterMetrics, instagramMetrics, facebookMetrics }) {
  const data = [
    { name: 'X/Twitter', value: twitterMetrics.postsCount, color: PLATFORM_COLORS.x },
    { name: 'Instagram', value: instagramMetrics.postsCount, color: PLATFORM_COLORS.instagram },
    { name: 'Facebook', value: facebookMetrics.postsCount, color: PLATFORM_COLORS.facebook },
  ].filter(item => item.value > 0);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label if less than 5%

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ChartSection title="Posts by Platform" icon={<BarChart3 className="w-4 h-4" />}>
      <div className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={90}
              innerRadius={50}
              dataKey="value"
              strokeWidth={2}
              stroke="#fff"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [formatNumber(value) + ' posts', name]}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value, entry) => (
                <span style={{ color: entry.color }}>
                  {value} ({formatNumber(entry.payload.value)})
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartSection>
  );
}

// Combined follower summary with mini sparklines
export function FollowerSummaryChart({ followerMetrics }) {
  const platforms = [
    { key: 'x', name: 'X/Twitter', color: PLATFORM_COLORS.x, ...followerMetrics.x },
    { key: 'ig', name: 'Instagram', color: PLATFORM_COLORS.instagram, ...followerMetrics.ig },
    { key: 'fb', name: 'Facebook', color: PLATFORM_COLORS.facebook, ...followerMetrics.fb },
  ];

  return (
    <ChartSection title="Follower Summary by Platform" icon={<Users className="w-4 h-4" />}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {platforms.map(platform => (
          <div 
            key={platform.key}
            className="bg-gray-50 rounded-lg p-4 border-l-4"
            style={{ borderLeftColor: platform.color }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{platform.name}</span>
              <span 
                className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  platform.growth.change >= 0 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {platform.growth.formatted}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {formatNumber(platform.end)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Started at {formatNumber(platform.start)}
            </div>
          </div>
        ))}
      </div>
    </ChartSection>
  );
}

// Main Charts Component - combines all charts
export default function ReportCharts({ reportData }) {
  const { 
    monthlyBreakdown, 
    followerMetrics, 
    twitterMetrics, 
    instagramMetrics, 
    facebookMetrics 
  } = reportData;

  if (!monthlyBreakdown || monthlyBreakdown.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <h3 className="text-md font-semibold text-va-blue border-b border-gray-200 pb-2 flex items-center gap-2">
        <BarChart3 className="w-4 h-4" />
        Performance Visualizations
      </h3>
      
      {/* Follower Summary Cards */}
      <FollowerSummaryChart followerMetrics={followerMetrics} />
      
      {/* Follower Growth Charts - By Platform and Combined */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FollowerGrowthByPlatformChart monthlyBreakdown={monthlyBreakdown} />
        <FollowerGrowthCombinedChart monthlyBreakdown={monthlyBreakdown} />
      </div>
      
      {/* Individual Platform Follower Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TwitterFollowerChart monthlyBreakdown={monthlyBreakdown} />
        <InstagramFollowerChart monthlyBreakdown={monthlyBreakdown} />
        <FacebookFollowerChart monthlyBreakdown={monthlyBreakdown} />
      </div>
      
      {/* Other Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ImpressionsChart monthlyBreakdown={monthlyBreakdown} />
        <EngagementsChart monthlyBreakdown={monthlyBreakdown} />
        <PostsPerMonthChart monthlyBreakdown={monthlyBreakdown} />
        <PlatformDistributionChart 
          twitterMetrics={twitterMetrics}
          instagramMetrics={instagramMetrics}
          facebookMetrics={facebookMetrics}
        />
      </div>
    </section>
  );
}
