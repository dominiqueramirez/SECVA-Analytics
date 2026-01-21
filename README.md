# SECVA Social Media Analytics Dashboard

A React-based analytics dashboard for generating social media performance reports for the Secretary of Veterans Affairs (@SecVetAffairs) accounts across X/Twitter, Instagram, and Facebook.

## Features

- **Drag & Drop File Upload**: Upload CSV files or ZIP archives containing Hootsuite exports
- **Auto-Detection**: Automatically detects file types based on column headers
- **Dynamic Date Ranges**: Calculates report periods (3-month, 6-month, 1-year) from data end date
- **Comprehensive Reports**: Generates executive summaries, platform breakdowns, top posts, and insights
- **Export Options**: Copy formatted report to clipboard
- **GitHub Pages Ready**: Deployable as a static site

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
npm run build
```

### Deploying to GitHub Pages

1. Update `homepage` in `package.json` with your GitHub username:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/secva-analytics"
   ```

2. Deploy:
   ```bash
   npm run deploy
   ```

## Usage

1. **Upload Data Files**: Drag and drop a ZIP file containing Hootsuite CSV exports, or upload individual CSV files
2. **Select Report Period**: Choose 3-month, 6-month, or 1-year report
3. **Generate Report**: Click "Generate Report" to create the analytics report
4. **Export**: Use "Copy to Clipboard" to copy the formatted report

## Supported File Types

| File Type | Description |
|-----------|-------------|
| Account Metrics | Daily aggregate metrics (followers, impressions) |
| X/Twitter Posts | Individual post performance data |
| Instagram Posts | Individual post performance data |
| Facebook Posts | Individual post performance data |

## Tech Stack

- **React** - UI Framework
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **PapaParse** - CSV Parsing
- **JSZip** - ZIP File Handling
- **Lucide React** - Icons

## License

Internal VA Digital Communications Tool
