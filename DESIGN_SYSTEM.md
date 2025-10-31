# 🎨 UNIShare Design System

> **Modern, Clean, Student-Friendly Design Language**
>
> Last Updated: October 30, 2025

---

## 🎯 Design Philosophy

**Target Audience:** University students (18-25 years old)
**Design Goals:**

- ✨ Modern & Fresh (not corporate)
- 🎓 Professional yet approachable
- 📱 Mobile-first responsive
- ♿ Accessible (WCAG AA)
- ⚡ Fast & intuitive
- 🌈 Vibrant but not overwhelming

---

## 🎨 Color Palette

### Primary Colors (Purple Gradient Theme)

```css
--primary-50: #faf5ff /* Very light purple background */ --primary-100: #f3e8ff
  /* Light purple hover states */ --primary-200: #e9d5ff /* Subtle highlights */
  --primary-300: #d8b4fe /* Borders, dividers */ --primary-400: #c084fc
  /* Secondary actions */ --primary-500: #a855f7 /* PRIMARY BRAND COLOR */
  --primary-600: #9333ea /* Primary hover */ --primary-700: #7e22ce
  /* Primary active */ --primary-800: #6b21a8 /* Dark accents */
  --primary-900: #581c87 /* Very dark purple */;
```

### Secondary Colors (Indigo)

```css
--secondary-500: #6366f1 /* Indigo for variety */ --secondary-600: #4f46e5
  /* Indigo hover */;
```

### Accent Colors (Course Color Options)

```css
--accent-blue: #3b82f6 /* Sky Blue */ --accent-green: #10b981
  /* Emerald Green */ --accent-orange: #f97316 /* Orange */
  --accent-red: #ef4444 /* Red */ --accent-pink: #ec4899 /* Pink */
  --accent-teal: #14b8a6 /* Teal */ --accent-yellow: #eab308 /* Yellow */
  --accent-indigo: #6366f1 /* Indigo */;
```

### Neutral Colors (Gray Scale)

```css
--gray-50: #fafafa /* Backgrounds */ --gray-100: #f5f5f5 /* Card backgrounds */
  --gray-200: #e5e5e5 /* Borders */ --gray-300: #d4d4d4 /* Disabled states */
  --gray-400: #a3a3a3 /* Placeholder text */ --gray-500: #737373
  /* Secondary text */ --gray-600: #525252 /* Body text */ --gray-700: #404040
  /* Headings */ --gray-800: #262626 /* Dark text */ --gray-900: #171717
  /* Darkest text */;
```

### Semantic Colors

```css
--success: #10b981 /* Green - approvals, success */ --warning: #f59e0b
  /* Amber - pending, warnings */ --error: #ef4444 /* Red - errors, delete */
  --info: #3b82f6 /* Blue - information */;
```

### Dark Mode (Future)

```css
--dark-bg: #0f172a /* Slate 900 */ --dark-surface: #1e293b /* Slate 800 */
  --dark-border: #334155 /* Slate 700 */;
```

---

## 📝 Typography

### Font Families

```css
--font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", monospace;
```

### Font Sizes (Mobile-First)

```css
/* Mobile (320px+) */
--text-xs: 0.75rem /* 12px - Labels, captions */ --text-sm: 0.875rem
  /* 14px - Secondary text */ --text-base: 1rem /* 16px - Body text */
  --text-lg: 1.125rem /* 18px - Emphasized text */ --text-xl: 1.25rem
  /* 20px - Small headings */ --text-2xl: 1.5rem /* 24px - H3 */
  --text-3xl: 1.875rem /* 30px - H2 */ --text-4xl: 2.25rem /* 36px - H1 */
  --text-5xl: 3rem /* 48px - Display */ /* Tablet (768px+) */
  --text-4xl-md: 2.5rem /* 40px */ --text-5xl-md: 3.5rem /* 56px */
  /* Desktop (1024px+) */ --text-5xl-lg: 4rem /* 64px */;
```

### Font Weights

```css
--font-normal: 400 --font-medium: 500 --font-semibold: 600 --font-bold: 700
  --font-extrabold: 800;
```

### Line Heights

```css
--leading-tight: 1.25 /* Headings */ --leading-normal: 1.5 /* Body text */
  --leading-relaxed: 1.75 /* Long-form content */;
```

---

## 🎭 Component Patterns

### Spacing System (4px base unit)

```css
--space-0: 0 --space-1: 0.25rem /* 4px */ --space-2: 0.5rem /* 8px */
  --space-3: 0.75rem /* 12px */ --space-4: 1rem /* 16px */ --space-5: 1.25rem
  /* 20px */ --space-6: 1.5rem /* 24px */ --space-8: 2rem /* 32px */
  --space-10: 2.5rem /* 40px */ --space-12: 3rem /* 48px */ --space-16: 4rem
  /* 64px */ --space-20: 5rem /* 80px */;
```

### Border Radius

```css
--radius-sm: 0.25rem /* 4px - Small elements */ --radius-md: 0.375rem
  /* 6px - Buttons, inputs */ --radius-lg: 0.5rem /* 8px - Cards */
  --radius-xl: 0.75rem /* 12px - Modals */ --radius-2xl: 1rem
  /* 16px - Special cards */ --radius-full: 9999px /* Circular */;
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

/* Colored Shadows for Course Cards */
--shadow-purple: 0 10px 30px -5px rgb(168 85 247 / 0.3);
--shadow-blue: 0 10px 30px -5px rgb(59 130 246 / 0.3);
--shadow-green: 0 10px 30px -5px rgb(16 185 129 / 0.3);
```

### Transitions

```css
--transition-fast: 150ms ease-in-out --transition-base: 200ms ease-in-out
  --transition-slow: 300ms ease-in-out --transition-bounce: 300ms
  cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

---

## 🧩 Component Specifications

### 1. **Buttons**

#### Primary Button

```tsx
className="
  px-6 py-3
  bg-primary-600
  hover:bg-primary-700
  active:bg-primary-800
  text-white
  font-semibold
  rounded-lg
  shadow-md
  hover:shadow-lg
  transition-all duration-200
  focus:ring-4 focus:ring-primary-200
"
```

#### Secondary Button

```tsx
className="
  px-6 py-3
  bg-white
  border-2 border-primary-600
  hover:bg-primary-50
  text-primary-700
  font-semibold
  rounded-lg
  transition-all duration-200
  focus:ring-4 focus:ring-primary-200
"
```

#### Icon Button

```tsx
className="
  p-2
  rounded-full
  hover:bg-gray-100
  transition-colors
  focus:ring-2 focus:ring-primary-300
"
```

### 2. **Cards**

#### Course Card

```tsx
className="
  bg-white
  rounded-xl
  shadow-md
  hover:shadow-xl
  transition-all duration-300
  border border-gray-200
  overflow-hidden
  group
  cursor-pointer
  hover:-translate-y-1
"
```

#### Resource Card

```tsx
className="
  bg-gradient-to-br from-white to-gray-50
  rounded-lg
  border border-gray-200
  p-6
  hover:border-primary-300
  hover:shadow-md
  transition-all duration-200
"
```

### 3. **Inputs**

#### Text Input

```tsx
className="
  w-full
  px-4 py-3
  rounded-lg
  border border-gray-300
  focus:border-primary-500
  focus:ring-4 focus:ring-primary-100
  transition-all
  placeholder:text-gray-400
  text-gray-900
"
```

#### Search Input

```tsx
className="
  w-full
  pl-12 pr-4 py-3
  rounded-full
  border border-gray-300
  focus:border-primary-500
  focus:ring-4 focus:ring-primary-100
  bg-gray-50
  focus:bg-white
  transition-all
"
```

### 4. **Navigation**

#### Navbar

```tsx
className="
  bg-white/80
  backdrop-blur-lg
  border-b border-gray-200
  sticky top-0
  z-50
  shadow-sm
"
```

#### Sidebar

```tsx
className="
  w-64
  bg-gray-50
  border-r border-gray-200
  h-screen
  overflow-y-auto
  sticky top-0
"
```

### 5. **Badges & Tags**

#### Status Badge

```tsx
// Success
className =
  "px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium";

// Warning
className =
  "px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium";

// Error
className =
  "px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium";
```

#### Role Badge

```tsx
// Owner
className =
  "px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold";

// Contributor
className = "px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold";

// Viewer
className = "px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold";
```

---

## 🎨 Page Layouts

### Empty State Pattern

```tsx
<div className="flex flex-col items-center justify-center px-4 py-16">
  <div className="bg-primary-100 mb-6 flex h-24 w-24 items-center justify-center rounded-full">
    <Icon className="text-primary-600 h-12 w-12" />
  </div>
  <h3 className="mb-2 text-2xl font-bold text-gray-800">No items yet</h3>
  <p className="mb-6 max-w-md text-center text-gray-500">
    Description of what to do
  </p>
  <Button>Call to Action</Button>
</div>
```

### Loading State Pattern

```tsx
<div className="animate-pulse">
  <div className="mb-4 h-4 w-3/4 rounded bg-gray-200"></div>
  <div className="h-4 w-1/2 rounded bg-gray-200"></div>
</div>
```

### Grid Layouts

```tsx
// Course Grid (Responsive)
className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

// Resource Grid
className =
  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";
```

---

## 🌈 Course Color System

### Available Course Colors

Each course can be assigned one of these colors:

```typescript
export const courseColors = {
  purple: {
    bg: "bg-purple-500",
    hover: "hover:bg-purple-600",
    text: "text-purple-600",
    lightBg: "bg-purple-50",
    border: "border-purple-200",
    gradient: "from-purple-500 to-purple-600",
    shadow: "shadow-purple-500/30",
    hex: "#a855f7",
  },
  blue: {
    bg: "bg-blue-500",
    hover: "hover:bg-blue-600",
    text: "text-blue-600",
    lightBg: "bg-blue-50",
    border: "border-blue-200",
    gradient: "from-blue-500 to-blue-600",
    shadow: "shadow-blue-500/30",
    hex: "#3b82f6",
  },
  green: {
    bg: "bg-green-500",
    hover: "hover:bg-green-600",
    text: "text-green-600",
    lightBg: "bg-green-50",
    border: "border-green-200",
    gradient: "from-green-500 to-green-600",
    shadow: "shadow-green-500/30",
    hex: "#10b981",
  },
  orange: {
    bg: "bg-orange-500",
    hover: "hover:bg-orange-600",
    text: "text-orange-600",
    lightBg: "bg-orange-50",
    border: "border-orange-200",
    gradient: "from-orange-500 to-orange-600",
    shadow: "shadow-orange-500/30",
    hex: "#f97316",
  },
  red: {
    bg: "bg-red-500",
    hover: "hover:bg-red-600",
    text: "text-red-600",
    lightBg: "bg-red-50",
    border: "border-red-200",
    gradient: "from-red-500 to-red-600",
    shadow: "shadow-red-500/30",
    hex: "#ef4444",
  },
  pink: {
    bg: "bg-pink-500",
    hover: "hover:bg-pink-600",
    text: "text-pink-600",
    lightBg: "bg-pink-50",
    border: "border-pink-200",
    gradient: "from-pink-500 to-pink-600",
    shadow: "shadow-pink-500/30",
    hex: "#ec4899",
  },
  teal: {
    bg: "bg-teal-500",
    hover: "hover:bg-teal-600",
    text: "text-teal-600",
    lightBg: "bg-teal-50",
    border: "border-teal-200",
    gradient: "from-teal-500 to-teal-600",
    shadow: "shadow-teal-500/30",
    hex: "#14b8a6",
  },
  indigo: {
    bg: "bg-indigo-500",
    hover: "hover:bg-indigo-600",
    text: "text-indigo-600",
    lightBg: "bg-indigo-50",
    border: "border-indigo-200",
    gradient: "from-indigo-500 to-indigo-600",
    shadow: "shadow-indigo-500/30",
    hex: "#6366f1",
  },
};
```

---

## ✨ Animation Guidelines

### Micro-Interactions

- **Hover**: Scale up 2-5%, subtle shadow increase
- **Click**: Scale down 2%, brief pulse
- **Focus**: Ring animation with brand color
- **Loading**: Pulse or spinner with brand color

### Page Transitions

```tsx
// Fade in from bottom
className = "animate-in slide-in-from-bottom-4 fade-in duration-300";

// Scale up
className = "animate-in zoom-in-95 duration-200";
```

### Scroll Animations

- Stagger children animations
- Parallax effects on hero sections
- Fade in content as it enters viewport

---

## 📱 Responsive Breakpoints

```css
/* Mobile First */
sm:  640px   /* Small tablets */
md:  768px   /* Tablets */
lg:  1024px  /* Laptops */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large screens */
```

---

## ♿ Accessibility

### Focus States

- All interactive elements must have visible focus rings
- Use `focus:ring-4 focus:ring-primary-200` pattern
- Keyboard navigation fully supported

### Color Contrast

- All text must meet WCAG AA standards (4.5:1)
- Icons paired with text labels
- Color not the only indicator of meaning

### Aria Labels

- All buttons have descriptive aria-labels
- Form inputs have associated labels
- Loading states announced to screen readers

---

## 🎯 Icon System

**Library**: Lucide React (Modern, clean, 1000+ icons)

### Common Icons

```typescript
import {
  Book, // Courses
  FileText, // Assignments
  CheckSquare, // Tasks
  FolderOpen, // Content
  StickyNote, // Notes
  Calendar, // Events/Timetable
  Users, // Collaborators
  Plus, // Add actions
  X, // Close/Remove
  Heart, // Favorites
  Settings, // Settings
  Search, // Search
  Filter, // Filter
  MoreVertical, // More options
  Download, // Download
  Upload, // Upload
} from "lucide-react";
```

---

## 🎨 Usage Examples

### Hero Section

```tsx
<section className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
  <div className="container mx-auto px-4 py-20">
    <h1 className="mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-5xl font-extrabold text-transparent">
      UNIShare
    </h1>
    <p className="text-xl text-purple-100">Your academic companion</p>
  </div>
</section>
```

### Dashboard Layout

```tsx
<div className="min-h-screen bg-gray-50">
  <Navbar />
  <div className="container mx-auto max-w-7xl px-4 py-8">
    <h1 className="mb-8 text-3xl font-bold text-gray-900">My Courses</h1>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Course Cards */}
    </div>
  </div>
</div>
```

---

## 📚 Resources

- **Tailwind CSS**: https://tailwindcss.com/docs
- **Shadcn UI**: https://ui.shadcn.com (component base)
- **Lucide Icons**: https://lucide.dev
- **Radix UI**: https://www.radix-ui.com (accessible primitives)
- **Color Tool**: https://uicolors.app/create (generate color scales)

---

**Note**: This design system is a living document. Update as new patterns emerge.
