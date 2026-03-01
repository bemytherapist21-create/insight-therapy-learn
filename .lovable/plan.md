

# Plan: Precision Insights - Data Analysis Tool

## Overview

Build a multi-step data analysis tool accessible from the "Precision Insights" card on the InsightFusion page. Users upload CSV/Excel files, the AI analyzes the structure, asks clarifying questions about columns and business context, then generates actionable insights with an interactive dashboard.

## User Flow

```text
InsightFusion Page
  └── Click "Precision Insights" card
        └── /insight-fusion/precision-insights
              ├── Step 1: Upload CSV/Excel file
              ├── Step 2: AI analyzes file structure, shows columns/sheets
              ├── Step 3: Chat with AI to define columns, business context
              ├── Step 4: AI generates insights
              └── Step 5: Dashboard with charts + downloadable summary
```

## Implementation Steps

### Step 1: Create Storage Bucket for Data Files

Create a `data-files` storage bucket via SQL migration so users can upload their CSV/Excel files. Add RLS policies so users can only access their own uploads.

### Step 2: Create the Edge Function - `analyze-data`

A single edge function that handles two modes:

- **Mode: "parse"** - Receives the uploaded file content, uses Lovable AI (gemini-3-flash-preview) to identify sheets, columns, data types, and summary statistics. Returns structured JSON.
- **Mode: "insights"** - Receives the parsed structure + user-provided column definitions + business context. Uses AI to generate descriptive, diagnostic, predictive, and strategic insights. Also performs market context analysis.

The edge function will use streaming for the insights generation to show results progressively.

### Step 3: Create the Precision Insights Page

**File: `src/pages/PrecisionInsights.tsx`**

A multi-step wizard-style page matching the existing site design (glass-card styling, purple-orange gradients, dark background):

- **Step 1 - Upload**: Drag-and-drop or click-to-upload area for CSV/Excel files. File is uploaded to the storage bucket and content is sent to the edge function for parsing.
- **Step 2 - Define Structure**: Displays detected sheets, columns, and data types in an interactive form. User can add descriptions/meanings for each column. Highlights any new/unknown columns.
- **Step 3 - Business Context**: A form/chat where the user describes their business model, revenue streams, KPI priorities, target audience, geography, and growth stage.
- **Step 4 - Insights Dashboard**: AI-generated insights displayed in 4 layers (Descriptive, Diagnostic, Predictive, Strategic) with:
  - KPI cards using recharts (bar, line, pie charts)
  - Trend analysis visualizations
  - Segment analysis
  - Risk identification
  - Market context section
  - Strategic recommendations

### Step 4: Add Route and Navigation

- Add `/insight-fusion/precision-insights` route to `App.tsx`
- Make the "Precision Insights" benefit card on InsightFusion page clickable, navigating to this new route

### Step 5: Create Supporting Components

- **FileUploader** - Drag-and-drop file upload component with progress indicator
- **ColumnDefinitionForm** - Interactive form to define column meanings
- **BusinessContextForm** - Structured form for business details
- **InsightsDashboard** - Dashboard layout with recharts visualizations
- **InsightCard** - Individual insight cards with icons and categories

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/pages/PrecisionInsights.tsx` | Create | Main multi-step wizard page |
| `src/components/insights/FileUploader.tsx` | Create | File upload component |
| `src/components/insights/ColumnDefinitionForm.tsx` | Create | Column definition form |
| `src/components/insights/BusinessContextForm.tsx` | Create | Business context form |
| `src/components/insights/InsightsDashboard.tsx` | Create | Dashboard with charts |
| `supabase/functions/analyze-data/index.ts` | Create | Edge function for parsing and insights |
| `src/App.tsx` | Modify | Add route |
| `src/pages/InsightFusion.tsx` | Modify | Make Precision Insights card clickable |
| SQL Migration | Create | Storage bucket + data analysis tables |

## Technical Details

### Database Tables

- **`data_analyses`** - Stores analysis sessions (user_id, file_name, file_path, parsed_structure, column_definitions, business_context, insights, status, timestamps)

### Edge Function Architecture

The `analyze-data` edge function will:
1. Accept file content (base64 for Excel, raw text for CSV)
2. Use Lovable AI to parse structure and generate insights
3. Handle rate limiting (429) and payment errors (402) gracefully
4. Stream insights generation for real-time feedback

### Design Consistency

All new components will use the existing design system:
- `glass-card` class for card backgrounds
- `bg-gradient-primary` for buttons
- `hover:shadow-glow` for interactive elements
- Purple/orange gradient accents
- White text on dark backgrounds
- `animate-fade-in` and `animate-scale-in` for animations

### File Parsing Approach

Since we cannot run Python in the browser, CSV parsing will be done client-side using basic JavaScript (splitting by delimiters). For Excel files, the file will be sent to the edge function where AI will extract the structure from the raw content. For large files, only the first 100 rows will be sampled for analysis.

