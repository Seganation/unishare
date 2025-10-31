# 🎨 UNIShare - Branding Assets & Graphics Specifications

> **Status:** Placeholders Active - Awaiting Custom Graphics
>
> **Last Updated:** October 30, 2025

This document tracks all required branding assets, graphics, and images needed for the UNIShare web application. Each asset includes detailed specifications, placement locations, and placeholder status.

---

## 📋 Table of Contents

1. [Logo Variations](#logo-variations)
2. [Icons & Favicons](#icons--favicons)
3. [Hero & Landing Page Graphics](#hero--landing-page-graphics)
4. [Illustrations & Empty States](#illustrations--empty-states)
5. [Background Patterns](#background-patterns)
6. [Social Media & Meta Images](#social-media--meta-images)
7. [Email Templates](#email-templates)
8. [Implementation Checklist](#implementation-checklist)

---

## 1. Logo Variations

### 1.1 Main Logo (Full Color)
- **File Name:** `logo-main.png` / `logo-main.svg` (SVG preferred)
- **Size:** 512 x 512 px (Square) + Vector SVG
- **Usage:** Navbar, footer, admin dashboard, login/signup pages
- **Color Palette:**
  - Primary: Purple gradient (#a855f7 → #6366f1)
  - Accent: White text or transparent background
- **Design Elements:**
  - Should include "UNIShare" text
  - Could incorporate book/education motif
  - Modern, clean, student-friendly aesthetic
  - Readable at small sizes (32px)
- **Current Placeholder:** Text-based "📚 UNIShare"
- **Locations:**
  - `src/app/(student)/layout.tsx` - Navbar
  - `src/app/(auth)/login/page.tsx` - Login page header
  - `src/app/(auth)/signup/page.tsx` - Signup page header
  - `src/app/(admin)/admin/layout.tsx` - Admin navbar

---

### 1.2 Logo Icon Only (Square)
- **File Name:** `logo-icon.png` / `logo-icon.svg`
- **Size:** 256 x 256 px
- **Usage:** Mobile navbar, compact views, loading screens
- **Color Palette:** Purple gradient (#a855f7 → #6366f1)
- **Design Elements:**
  - Just the icon/symbol part (no text)
  - Works as a standalone mark
  - Recognizable even at 24px
- **Current Placeholder:** 📚 emoji
- **Locations:**
  - Mobile navigation collapsed state
  - Loading spinner icon
  - Push notification icon

---

### 1.3 Logo Horizontal (White Version)
- **File Name:** `logo-horizontal-white.png` / `logo-horizontal-white.svg`
- **Size:** 800 x 200 px (4:1 ratio)
- **Usage:** Dark backgrounds, footer, hero sections
- **Color Palette:** White (#ffffff) with optional gradient
- **Design Elements:**
  - Logo icon + "UNIShare" text side by side
  - Optimized for dark purple/indigo backgrounds
  - High contrast for readability
- **Current Placeholder:** White text "UNIShare"
- **Locations:**
  - Hero section on landing page
  - Dark-themed sections
  - Email header (dark theme)

---

### 1.4 Favicon Set
- **File Name:** `favicon.ico` + multiple PNG sizes
- **Sizes Required:**
  - 16 x 16 px (favicon.ico)
  - 32 x 32 px
  - 48 x 48 px
  - 64 x 64 px
  - 128 x 128 px
  - 180 x 180 px (Apple Touch Icon)
  - 192 x 192 px (Android)
  - 512 x 512 px (PWA)
- **Color Palette:** Purple (#a855f7) background, white symbol
- **Design Elements:**
  - Simple, recognizable at tiny sizes
  - Solid color background recommended
  - Clear symbol/letter (could be "U" or book icon)
- **Current Placeholder:** Default Next.js favicon
- **Locations:**
  - `public/favicon.ico`
  - `public/icon-*.png` (multiple sizes)
  - Browser tabs

---

## 2. Icons & Favicons

### 2.1 Progressive Web App (PWA) Icons
- **File Names:** `pwa-icon-192.png`, `pwa-icon-512.png`
- **Sizes:** 192 x 192 px, 512 x 512 px
- **Usage:** When app is installed on mobile/desktop
- **Color Palette:** Purple gradient background, white icon
- **Design Elements:**
  - Maskable icon (safe zone in center)
  - Works on any background color
  - Follows PWA icon guidelines
- **Current Placeholder:** None (needs to be added)
- **Locations:**
  - `public/pwa-icon-*.png`
  - Referenced in `manifest.json`

---

### 2.2 Open Graph / Social Preview Image
- **File Name:** `og-image.png`
- **Size:** 1200 x 630 px (Facebook/LinkedIn standard)
- **Usage:** Social media link previews
- **Color Palette:** Purple gradient background
- **Design Elements:**
  - "UNIShare" logo prominent
  - Tagline: "Student-driven academic organization platform"
  - Clean, modern design
  - Includes key visual (books, collaboration, students)
- **Current Placeholder:** Default Next.js OG image
- **Locations:**
  - `public/og-image.png`
  - Meta tags in layout.tsx

---

## 3. Hero & Landing Page Graphics

### 3.1 Landing Page Hero Illustration
- **File Name:** `hero-illustration.png` / `hero-illustration.svg`
- **Size:** 1200 x 800 px (3:2 ratio) - SVG preferred for animations
- **Usage:** Main landing page hero section
- **Color Palette:**
  - Purple (#a855f7), Indigo (#6366f1), Blue (#3b82f6)
  - White/light gray accents
  - Gradient backgrounds
- **Design Elements:**
  - Students collaborating with laptops
  - Floating course cards / notebooks
  - Modern, flat illustration style (not 3D)
  - Should feel energetic and academic
  - Optional: subtle animations (if SVG with layers)
- **Current Placeholder:** Gradient background with text only
- **Locations:**
  - `src/app/page.tsx` - Landing page hero

---

### 3.2 Dashboard Welcome Banner
- **File Name:** `dashboard-welcome.png`
- **Size:** 1920 x 400 px (wide banner format)
- **Usage:** First-time user dashboard greeting
- **Color Palette:** Light purple gradient (#faf5ff → #f3e8ff)
- **Design Elements:**
  - Welcoming, friendly illustration
  - Books, calendar, collaboration themes
  - Could include waving student character
  - Decorative, not too busy
- **Current Placeholder:** Purple gradient div
- **Locations:**
  - `src/app/(student)/dashboard/page.tsx` - Welcome section

---

## 4. Illustrations & Empty States

### 4.1 Empty Courses Illustration
- **File Name:** `empty-courses.svg`
- **Size:** 400 x 400 px (Square SVG)
- **Usage:** When user has no courses yet
- **Color Palette:** Purple/Indigo with gray accents
- **Design Elements:**
  - Empty folder or bookshelf
  - Friendly, encouraging vibe (not sad)
  - Simple line art style
  - Add course "+" button visual cue
- **Current Placeholder:** Purple circle with book emoji
- **Locations:**
  - `src/components/courses/empty-courses.tsx`

---

### 4.2 Empty Resources Illustration
- **File Name:** `empty-resources.svg`
- **Size:** 300 x 300 px (Square SVG)
- **Usage:** When course has no resource cards
- **Color Palette:** Blue/Teal
- **Design Elements:**
  - Empty document folder
  - Magnifying glass or search theme
  - "Add first resource" visual
- **Current Placeholder:** Gray circle with folder icon
- **Locations:**
  - `src/app/(student)/courses/[id]/page.tsx` - Empty resources

---

### 4.3 Waiting Approval Illustration
- **File Name:** `waiting-approval.svg`
- **Size:** 400 x 400 px (Square SVG)
- **Usage:** Pending user approval page
- **Color Palette:** Yellow/Amber (#f59e0b) with purple accents
- **Design Elements:**
  - Hourglass or clock theme
  - Student waiting (friendly, optimistic)
  - Admin review concept (checkmark)
- **Current Placeholder:** Yellow circle with hourglass emoji
- **Locations:**
  - `src/app/(auth)/waiting-approval/page.tsx`

---

### 4.4 No Notifications Illustration
- **File Name:** `empty-notifications.svg`
- **Size:** 300 x 300 px (Square SVG)
- **Usage:** When user has no notifications
- **Color Palette:** Gray with purple accents
- **Design Elements:**
  - Bell icon (crossed out or empty)
  - "All caught up!" feel
  - Relaxed, positive vibe
- **Current Placeholder:** Bell icon with text
- **Locations:**
  - Future notifications dropdown

---

### 4.5 404 Error Illustration
- **File Name:** `404-error.svg`
- **Size:** 500 x 500 px (Square SVG)
- **Usage:** Page not found error
- **Color Palette:** Purple gradient
- **Design Elements:**
  - "404" text integrated creatively
  - Lost student with map (friendly)
  - Books falling or floating
  - Whimsical, not frustrating
- **Current Placeholder:** Text-based 404
- **Locations:**
  - `src/app/not-found.tsx` (to be created)

---

### 4.6 Success/Completed Illustration
- **File Name:** `success-celebration.svg`
- **Size:** 300 x 300 px (Square SVG)
- **Usage:** Success messages, completed tasks
- **Color Palette:** Green (#10b981) with purple accents
- **Design Elements:**
  - Checkmark with confetti
  - Student celebrating
  - Trophy or ribbon
- **Current Placeholder:** Green checkmark emoji
- **Locations:**
  - Toast notifications
  - Success modals
  - Registration success

---

## 5. Background Patterns

### 5.1 Decorative Pattern Overlay
- **File Name:** `pattern-overlay.svg`
- **Size:** Tileable pattern (200 x 200 px tile)
- **Usage:** Background decoration for hero sections
- **Color Palette:** Purple with low opacity (#a855f7 @ 5%)
- **Design Elements:**
  - Geometric shapes (dots, lines, grids)
  - Subtle, not distracting
  - Tileable seamless pattern
- **Current Placeholder:** CSS-based dot pattern
- **Locations:**
  - Hero sections
  - Card headers
  - Auth page backgrounds

---

### 5.2 Course Card Decorative Elements
- **File Name:** `course-card-pattern.svg`
- **Size:** 300 x 100 px (3:1 ratio)
- **Usage:** Top of course cards (gradient header decoration)
- **Color Palette:** Varies by course color (8 variations)
- **Design Elements:**
  - Abstract shapes or waves
  - Adds visual interest to gradient headers
  - Doesn't cover text area
- **Current Placeholder:** Solid gradient
- **Locations:**
  - `src/components/courses/course-card.tsx` - Card header

---

## 6. Social Media & Meta Images

### 6.1 Twitter Card Image
- **File Name:** `twitter-card.png`
- **Size:** 1200 x 675 px (16:9)
- **Usage:** Twitter link previews
- **Color Palette:** Purple gradient
- **Design Elements:**
  - Logo + tagline
  - Key features visual
  - Clean, readable at thumbnail size
- **Current Placeholder:** Same as OG image
- **Locations:**
  - Meta tags

---

### 6.2 LinkedIn Preview Image
- **File Name:** `linkedin-preview.png`
- **Size:** 1200 x 627 px
- **Usage:** LinkedIn shares
- **Color Palette:** Professional purple/indigo
- **Design Elements:**
  - More professional tone
  - Logo + description
  - Student collaboration theme
- **Current Placeholder:** Same as OG image
- **Locations:**
  - Meta tags

---

## 7. Email Templates

### 7.1 Email Header Logo
- **File Name:** `email-logo.png`
- **Size:** 600 x 150 px (4:1)
- **Usage:** Top of all email templates
- **Color Palette:** Purple gradient
- **Design Elements:**
  - Horizontal logo
  - Email-safe (PNG, not SVG)
  - Works on white background
- **Current Placeholder:** Text "UNIShare"
- **Locations:**
  - `src/lib/email.ts` - All email templates

---

### 7.2 Email Footer Illustration
- **File Name:** `email-footer.png`
- **Size:** 600 x 200 px (3:1)
- **Usage:** Bottom decoration in emails
- **Color Palette:** Light purple gradient
- **Design Elements:**
  - Subtle decorative element
  - Books or education theme
  - Friendly sign-off visual
- **Current Placeholder:** None
- **Locations:**
  - Email templates footer section

---

## 8. Additional Assets

### 8.1 Loading Spinner/Animation
- **File Name:** `loading-spinner.svg` (animated SVG preferred)
- **Size:** 100 x 100 px
- **Usage:** Loading states throughout app
- **Color Palette:** Purple (#a855f7)
- **Design Elements:**
  - Smooth, looping animation
  - Book opening/closing OR
  - Circular spinner with brand style
- **Current Placeholder:** Default CSS spinner
- **Locations:**
  - All loading states
  - Button loading states

---

### 8.2 Collaboration Avatars Default
- **File Name:** `avatar-placeholder-*.png` (8 variations)
- **Size:** 128 x 128 px (Square)
- **Usage:** Default avatars for users without profile pictures
- **Color Palette:** 8 colors matching course colors
- **Design Elements:**
  - Simple, geometric patterns or initials
  - Friendly, diverse representations
- **Current Placeholder:** Dicebear API avatars
- **Locations:**
  - User profiles
  - Collaborator lists
  - Comments/contributions

---

## 9. Implementation Checklist

### Critical (Needed Immediately)
- [ ] **Logo Main** (navbar, auth pages) - `logo-main.svg`
- [ ] **Logo Icon** (mobile nav, loading) - `logo-icon.svg`
- [ ] **Favicon Set** (browser tabs) - `favicon.ico` + PNGs
- [ ] **Empty Courses Illustration** - `empty-courses.svg`
- [ ] **Hero Illustration** - `hero-illustration.svg`

### High Priority
- [ ] **OG Image** (social media) - `og-image.png`
- [ ] **Empty Resources Illustration** - `empty-resources.svg`
- [ ] **Waiting Approval Illustration** - `waiting-approval.svg`
- [ ] **Success Illustration** - `success-celebration.svg`
- [ ] **Email Header Logo** - `email-logo.png`

### Medium Priority
- [ ] **404 Error Illustration** - `404-error.svg`
- [ ] **Loading Spinner** - `loading-spinner.svg`
- [ ] **Dashboard Welcome Banner** - `dashboard-welcome.png`
- [ ] **Course Card Pattern** - `course-card-pattern.svg`
- [ ] **Empty Notifications** - `empty-notifications.svg`

### Low Priority (Nice to Have)
- [ ] **Email Footer Illustration** - `email-footer.png`
- [ ] **Pattern Overlay** - `pattern-overlay.svg`
- [ ] **PWA Icons** - `pwa-icon-*.png`
- [ ] **Twitter Card** - `twitter-card.png`
- [ ] **Avatar Placeholders** - `avatar-placeholder-*.png`

---

## 10. File Structure

Once assets are created, place them in:

```
public/
├── branding/
│   ├── logos/
│   │   ├── logo-main.svg
│   │   ├── logo-icon.svg
│   │   ├── logo-horizontal-white.svg
│   │   └── email-logo.png
│   ├── illustrations/
│   │   ├── hero-illustration.svg
│   │   ├── empty-courses.svg
│   │   ├── empty-resources.svg
│   │   ├── waiting-approval.svg
│   │   ├── success-celebration.svg
│   │   └── 404-error.svg
│   ├── patterns/
│   │   ├── pattern-overlay.svg
│   │   └── course-card-pattern.svg
│   └── social/
│       ├── og-image.png
│       ├── twitter-card.png
│       └── linkedin-preview.png
├── favicon.ico
├── icon-192.png
├── icon-512.png
└── apple-touch-icon.png
```

---

## 11. Design Guidelines

### Color Palette Reference

```css
/* Primary Brand Colors */
--purple-500: #a855f7;
--purple-600: #9333ea;
--purple-700: #7e22ce;

--indigo-500: #6366f1;
--indigo-600: #4f46e5;

/* Course Colors */
--blue: #3b82f6;
--green: #10b981;
--orange: #f97316;
--red: #ef4444;
--pink: #ec4899;
--teal: #14b8a6;
--yellow: #eab308;
```

### Typography
- **Font Family:** Inter (sans-serif)
- **Headings:** Bold (700-800)
- **Body:** Regular (400-500)

### Illustration Style
- **Type:** Flat, modern, 2D (avoid 3D/skeuomorphic)
- **Mood:** Friendly, energetic, academic
- **Age Group:** 18-25 (university students)
- **Vibe:** Collaborative, organized, helpful

---

## 12. Next Steps

1. **Review this document** and confirm asset specifications
2. **Create assets** using design tools (Figma, Illustrator, etc.)
3. **Export in correct formats** (SVG preferred for scalability)
4. **Place files** in `public/branding/` directory
5. **Update code** - Replace placeholder image paths
6. **Test** - Verify all images load correctly on all pages

---

## 13. Placeholder Locations Map

| Asset | Current Placeholder | File Location | Line Reference |
|-------|-------------------|---------------|----------------|
| Main Logo | 📚 Text | `src/app/(student)/layout.tsx` | Line ~25 |
| Login Logo | Text | `src/app/(auth)/login/page.tsx` | Line ~40 |
| Empty Courses | Emoji | `src/components/courses/empty-courses.tsx` | Line ~15 |
| Hero Illustration | Gradient | `src/app/page.tsx` | Line ~20 |
| Favicon | Default | `public/favicon.ico` | N/A |
| Email Logo | Text | `src/lib/email.ts` | Line ~30, ~90, ~160 |
| Success Icon | Emoji | Toast messages | Various |

*(This table will be updated as placeholders are added during enhancement)*

---

**End of Document**

*This is a living document. Update as new assets are identified or requirements change.*
