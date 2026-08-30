# Tasks Route Specification

## Overview
The Tasks route (`/tasks`) displays all game tasks/quests with progress tracking, rewards, and merchant organization. Tasks are grouped by merchants (corpId) with two distinct viewing modes and comprehensive search functionality.

## Core Features

### Two-State Display System
1. **Multi-Merchant Overview** (`selectedMerchant` is null)
   - Show all merchants as individual panels
   - Display only current/available tasks for each merchant
   - Compact task cards with essential information
   - Collapsed counters for upcoming/finished tasks
   - Each merchant panel is self-contained to avoid height mismatches

2. **Single Merchant Detailed View** (`selectedMerchant` is not null)
   - Focus on one merchant's complete task list
   - Desktop: Split layout with merchant info sidebar (left) and tasks (right)
   - Mobile: Compact header with merchant info and task count badges
   - Show all task states organized by categories
   - Full task details with objectives, tips, and rewards

### Task Status Management
- **Available**: Player can start this task (green indicators)
- **Active**: Task is in progress (yellow indicators)
- **Completed**: Task finished (green indicators)
- **Locked**: Prerequisites not met (red indicators)
- All status changes tracked via localStorage with reactive UI updates

### Search & Filtering
- Global search bar (task names and objectives)
- Filter by merchant/corp
- Filter by map
- Filter by task type
- Filter by availability status
- Mobile-optimized search interface

## Data Structure

### Task Progress Tracking
```typescript
interface TaskProgress {
  taskId: string;
  status: 'locked' | 'available' | 'active' | 'completed';
  objectiveProgress?: boolean[]; // completion status per objective
  completedAt?: string; // ISO date string
  startedAt?: string; // ISO date string
}

interface UserProgress {
  tasks: Record<string, TaskProgress>;
  lastUpdated: string;
}
```

### Task Data Format
Based on provided format with these key fields:
- `id`: Unique task identifier
- `name`: Task display name
- `gameId`: Internal game reference
- `description`: Full task description (for detail view)
- `objectives`: Array of task objectives
- `corpId`: Merchant corporation identifier
- `type`: Array of task types (extract, kill, collect, etc.)
- `map`: Array of applicable maps
- `reward`: Array of reward objects
- `requiredTasks`: Array of prerequisite task IDs
- `requiredLevel`: Minimum player level
- `order`: Task sequence number

## Component Architecture

```
TasksPageContent (main container)
├── TasksHeader
│   ├── Page title and description
│   ├── SearchBar (global search)
│   └── ViewToggle (removed - now handled by selectedMerchant state)
├── TasksMainContent
│   ├── MultiMerchantView (when selectedMerchant is null)
│   │   └── MerchantPanel[] (compact view for each corp)
│   │       ├── MerchantHeader (logo, name, reputation)
│   │       ├── CurrentTasksList (available + active tasks only)
│   │       │   └── TaskCompactCard[]
│   │       └── TaskCounters (upcoming/finished badges)
│   └── SingleMerchantView (when selectedMerchant is set)
│       └── MerchantPanel (selected view)
│           ├── Desktop Layout:
│           │   ├── LeftSidebar (col-span-1)
│           │   │   ├── CorpImage + ProgressBar
│           │   │   ├── MerchantImage + Name
│           │   │   ├── TaskCounts (available/active/completed/locked)
│           │   │   └── BackButton
│           │   └── RightContent (col-span-3)
│           │       └── TaskDetailedList (organized by status)
│           └── Mobile Layout:
│               ├── CompactHeader
│               │   ├── CorpImage + MerchantName
│               │   └── TaskCountBadges
│               └── TasksList
└── TasksFloatingActions (mobile quick actions)
```

## UI Components Specification

### MerchantPanel (New Combined Component)
**Three View Modes:**

#### 1. Collapsed View (different merchant selected)
- Minimal sidebar button with merchant name and chevron
- Shows active task count
- Hover effects for selection

#### 2. Compact View (multi-merchant overview)
- Full merchant card with clickable header
- Shows current tasks (available + active) only
- Task cards with essential info and action buttons
- "View all tasks" button for detailed view
- Self-contained panel to avoid height mismatches

#### 3. Selected View (single merchant detailed)
**Desktop Layout (lg: breakpoint):**
- **Left Sidebar (25% width):**
   - Corp image + progress bar showing completion percentage
   - Large merchant image with name
   - Task count boxes (available/active/completed/locked)
   - Back to overview button
- **Right Content (75% width):**
   - Organized task lists by status
   - Full task details with all objectives

**Mobile Layout:**
- **Compact Header:**
   - Corp image + merchant name + back button
   - Task count badges (compact, horizontal)
- **Full-width task lists below header**

### TaskCompactCard (Multi-Merchant View)
**Display Elements:**
- Task name with order badge
- First objective (truncated to ~50 chars)
- Map badges (small icons with emojis)
- Task type badges (icons with emojis)
- Status indicator icon
- Quick action buttons (Start/Complete)

**Interactions:**
- Click → Navigate to `/tasks/[taskId]`
- Checkbox → Toggle task completion
- Hover → Show reward preview tooltip

### TaskExpandableCard (Single Merchant View)
**Collapsed State:**
- Same as TaskCompactCard
- Reward preview (money amount, key items)
- Prerequisites indicator if locked

**Expanded State:**
- Full objectives list with checkboxes
- Complete reward breakdown
- Tips section (if available)
- Prerequisites with links
- Action buttons (start/complete task)

### MerchantCard
**Elements:**
- Corp logo (compact) + merchant logo (larger)
- Merchant name and corp affiliation
- Reputation progress bar
- Available tasks count
- Upcoming/finished task counters (collapsible)

### SearchBar
**Features:**
- Real-time search with debouncing
- Search through task names and objectives
- Clear search button
- Search suggestions/autocomplete
- Mobile-optimized input with proper keyboard

## State Management

### Component State Structure
```typescript
interface TasksPageState {
  // View state (removed redundant viewMode)
  selectedMerchant: string | null; // null = multi-view, string = single merchant view
  searchQuery: string;
  
  // Filters
  filters: {
    maps: string[];
    types: string[];
    status: TaskStatus[];
    merchants: string[];
  };
  
  // User progress (synced with localStorage)
  userProgress: UserProgress;
  
  // UI state
  expandedTasks: Set<string>;
  isLoading: boolean;
}
```

### localStorage Integration
- **Key**: `exfil-zone-tasks-progress`
- **Sync Strategy**: Load on mount, save on task status changes
- **Backup Strategy**: Export/import functionality for data portability

## Responsive Design

### Desktop (1024px+)
- **Multi-merchant view**: Stacked merchant panels with full task cards
- **Single merchant view**: 25/75 split layout with merchant sidebar
- Hover states and tooltips
- Large merchant images and progress indicators

### Tablet (768px - 1023px)
- **Multi-merchant view**: Single column merchant panels
- **Single merchant view**: Stacked layout (merchant info on top)
- Touch-friendly interaction targets

### Mobile (< 768px)
- **Multi-merchant view**: Compact merchant cards
- **Single merchant view**: Header with task count badges + full-width tasks
- Merchant images scaled down to badges/icons
- Swipe gestures for task actions

## Navigation & SEO

### Route Structure
- `/tasks` - Main tasks page
- `/tasks/[taskId]` - Individual task detail page
- `/tasks?merchant=[corpId]` - Deep link to merchant view
- `/tasks?search=[query]` - Deep link with search

### SEO Optimization
- Dynamic meta descriptions based on filters
- Structured data for task information
- Breadcrumb navigation
- Canonical URLs for filtered views

## Performance Considerations

### Data Loading
- Tasks data bundled at build time (TypeScript export)
- Lazy loading for merchant logos
- Virtual scrolling for large task lists (if needed)

### Search Optimization
- Debounced search (300ms delay)
- Fuzzy search implementation for typo tolerance
- Search result highlighting

### State Updates
- Batch localStorage updates
- Memoized computed values (filtered tasks, progress calculations)
- Optimistic UI updates for task completion

## Accessibility

### Keyboard Navigation
- Tab order through merchants → tasks → actions
- Arrow key navigation within task lists
- Enter/Space for task actions

### Screen Reader Support
- Descriptive aria-labels for all interactive elements
- Progress announcements for task completion
- Landmark regions for page sections

### Visual Accessibility
- High contrast mode support
- Consistent focus indicators
- Adequate touch target sizes (44px minimum)

## Integration Points

### Future Route Connections
- Link to `/tasks/[taskId]` for detailed task pages
- Integration with `/maps` route for task locations
- Connection to `/items` route for reward items
- Link to merchant profiles when implemented

### External Integrations
- YouTube video embedding for video guides
- Potential webhook support for progress sharing

## Development Priority

### Phase 1 (MVP) ✅ Completed
1. ✅ Basic multi-merchant view with compact panels
2. ✅ Search functionality with debounced input
3. ✅ localStorage progress tracking with reactive state
4. ✅ Mobile responsive layout with adaptive merchant panels
5. ✅ Three-mode MerchantPanel component (collapsed/compact/selected)

### Phase 2 (In Progress)
1. 🚧 Single merchant detailed view - left sidebar layout completed
2. ⏳ Task detailed lists organized by status (available/active/completed/locked)
3. ⏳ Task filtering system (by maps, types, status)
4. ⏳ Enhanced task cards with reward previews and tips

### Phase 3 (Advanced)
1. Task dependency visualization
2. Progress statistics and visualizations
3. Advanced search with autocomplete
4. Achievement system integration

## Technical Notes

### Bundle Size Considerations
- Tasks data is ~143KB - acceptable for TypeScript bundling
- Image optimization for merchant/corp logos
- Code splitting for advanced features

### Browser Compatibility
- localStorage fallback for older browsers
- Progressive enhancement for advanced features
- Touch event handling for mobile interactions