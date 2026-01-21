# Union Cash - Design Guidelines

## Design Approach

**Selected Approach**: Reference-based design drawing from modern fintech leaders (Stripe, Coinbase, Revolut, PayPal) with emphasis on trust, clarity, and efficiency.

**Core Principles**:
- Trust through clarity: Financial data must be immediately scannable
- Hierarchy through scale: Critical information (balances) prominent, secondary actions accessible
- Consistent patterns: Reduce cognitive load with predictable layouts
- Purposeful whitespace: Data breathes, never cramped

---

## Typography System

**Font Stack**: 
- Primary: Inter (via Google Fonts) - exceptional readability for financial data
- Monospace: JetBrains Mono - for crypto addresses, transaction IDs

**Hierarchy**:
- Page titles: text-3xl font-bold
- Section headers: text-xl font-semibold  
- Card titles: text-lg font-semibold
- Body text: text-base font-normal
- Financial figures (balances): text-2xl md:text-4xl font-bold
- Labels/captions: text-sm font-medium
- Tiny metadata: text-xs

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16 for consistency
- Component padding: p-4 to p-6
- Card spacing: p-6 to p-8
- Section margins: mb-8, gap-6
- Button padding: px-6 py-3
- Icon spacing: mr-2, gap-3

**Grid Structure**:
- Sidebar: fixed w-64 (desktop), collapsible drawer (mobile)
- Main content: flex-1 with max-w-7xl mx-auto px-6
- Dashboard cards: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Quick actions: grid grid-cols-2 md:grid-cols-4 gap-4

---

## Component Library

### Navigation
**Sidebar (Desktop)**:
- Fixed left sidebar, h-screen, w-64
- Logo at top (p-6)
- Navigation items with icons (Heroicons), px-4 py-3, rounded-lg
- Active state: distinct background treatment
- User profile at bottom with balance preview

**Mobile Navigation**:
- Bottom tab bar with 5 key sections
- Hamburger menu for full navigation

### Dashboard Components

**Wallet Card** (Hero Component):
- Large card showcasing total balance
- Subtle gradient background treatment
- Balance: Large typography (text-4xl font-bold)
- Asset breakdown: Grid with SOL/USDC/Fiat (text-xl)
- Card appearance: Rounded corners (rounded-2xl), elevated shadow

**Quick Actions Bar**:
- 4 buttons: Send, Receive, Top Up, Request
- Icon + label vertical layout
- Equal width distribution
- Rounded-xl containers with p-4

**Quick Card Access**:
- Horizontal button group
- Icons: Credit card, QR code, QR scanner
- Compact design: px-4 py-2
- Space between actions: gap-3

**Balance Display Cards**:
- Individual cards for each currency type
- Icon (currency logo) + label + amount
- Trend indicator (optional): Small chart or percentage
- Minimal design: p-6, rounded-xl

### Page-Specific Components

**Payment Interface**:
- Two-column layout: Send form | Recent recipients
- Form: Large input fields, clear labels
- Currency selector: Dropdown with icons
- Amount input: Large, centered, prominent

**Card Management**:
- Card visual representation (card-shaped div)
- Card details in structured grid
- Action buttons: Freeze, Settings, Add New
- Transaction list below

**Budget Page**:
- Circular/donut charts for category breakdown
- Progress bars for budget limits
- Category cards: Icon + name + spent/limit
- Time period selector (Month/Year)

**History Page**:
- List view with infinite scroll
- Each transaction: Icon | Description | Amount | Date
- Filters: Sticky top bar with date range, type, status
- Search bar: Prominent, w-full md:w-96

**Analytics Page**:
- Line/bar charts for spending trends (Recharts)
- Grid of metric cards: Total spent, Average, Categories
- Chart height: h-64 to h-80
- Time range toggles: Week/Month/Year

**Security Settings**:
- Card-based settings groups
- Toggle switches for features
- Two-factor setup: Step-by-step flow
- Activity log: Table format

### Modals & Overlays

**Transaction Modals** (Send/Receive/Request):
- Centered modal, max-w-md
- Clear header with close button
- Form fields with generous spacing (space-y-4)
- Primary action button at bottom
- QR code display: Centered, p-8

**QR Payment Modal**:
- Camera view for scanning
- QR preview: square aspect ratio, max-w-sm
- Instructions text below
- Cancel button accessible

### Form Elements
- Input fields: Rounded borders (rounded-lg), adequate padding (px-4 py-3)
- Labels: Always above inputs, font-medium, mb-2
- Validation: Inline error messages, text-sm
- Success states: Checkmark icon with confirmation text

### Buttons
- Primary actions: Larger (px-6 py-3), font-semibold, rounded-lg
- Secondary actions: Outlined style, same sizing
- Icon buttons: Square (h-10 w-10), rounded-lg
- Disabled state: Reduced opacity

---

## Cards & Containers

**Standard Card**:
- Rounded corners: rounded-xl to rounded-2xl
- Padding: p-6 to p-8
- Elevated appearance
- Border treatment for hierarchy

**Interactive Cards** (clickable):
- Hover state: Subtle lift effect (translate-y)
- Cursor pointer
- Transition: transition-all duration-200

---

## Data Visualization

**Charts (using Recharts)**:
- Responsive containers: ResponsiveContainer width="100%" height={300}
- Clean grid lines, minimal chrome
- Tooltips: Rounded, padded, clear typography
- Legend: Below chart, horizontal layout

---

## Icons

**Library**: Heroicons (via CDN)
- Financial icons: CreditCardIcon, BanknotesIcon, ArrowUpIcon, ArrowDownIcon
- Navigation: HomeIcon, ChartBarIcon, CogIcon, ShieldCheckIcon
- Actions: QrCodeIcon, PaperAirplaneIcon, ArrowPathIcon
- Size: h-5 w-5 for inline, h-6 w-6 for standalone

---

## Responsive Behavior

**Breakpoints**:
- Mobile: Base styles, single column
- Tablet (md:): 2-column grids, sidebar appears
- Desktop (lg:): 3-column grids, full sidebar, max-w-7xl content

**Mobile Optimizations**:
- Stack all grid layouts to single column
- Bottom navigation instead of sidebar
- Larger touch targets (min h-12)
- Full-width buttons on mobile

---

## Animations

**Minimal & Purposeful**:
- Page transitions: fade-in on route change (opacity 0 to 1, 200ms)
- Balance updates: Number count-up animation (1 second)
- Modal entry/exit: Slide up from bottom (mobile), fade + scale (desktop)
- No scroll animations, no parallax, no decorative motion

---

## Accessibility

- All interactive elements: Clear focus states with visible outline
- Color contrast: Ensure WCAG AA compliance for all text
- Form inputs: Associated labels, error announcements
- Icon buttons: aria-label for screen readers
- Keyboard navigation: Full tab order, ESC to close modals

---

## Images

**No Hero Images**: This is a dashboard application - no marketing imagery needed.

**Asset Usage**:
- Currency logos: Small icons (h-8 w-8) for SOL, USDC, USD
- QR codes: Generated dynamically, square format
- User avatar: Circular (rounded-full), h-10 w-10 (sidebar), h-16 w-16 (profile)
- Card backgrounds: Subtle gradients or patterns, not photos

---

## Critical Layout Notes

- Dashboard: Primary content area with max-w-7xl, centered
- Sidebar: Always visible on desktop (lg:), hidden drawer on mobile
- Content padding: px-6 to px-8 for main areas
- Card grids: Consistent gap-6 throughout
- No full-viewport sections (this is an app, not a landing page)
- Maintain vertical rhythm: consistent spacing between sections (space-y-8)