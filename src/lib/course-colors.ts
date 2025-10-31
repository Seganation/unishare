/**
 * Course Color System
 * Used throughout the app for color-coding courses
 * Based on UNIShare Design System
 */

export const courseColors = {
  "#a855f7": {
    // Purple
    name: "Purple",
    bg: "bg-purple-500",
    hover: "hover:bg-purple-600",
    text: "text-purple-600",
    lightBg: "bg-purple-50",
    border: "border-purple-200",
    gradient: "from-purple-500 to-purple-600",
    ring: "ring-purple-200",
    hex: "#a855f7",
  },
  "#3b82f6": {
    // Blue
    name: "Blue",
    bg: "bg-blue-500",
    hover: "hover:bg-blue-600",
    text: "text-blue-600",
    lightBg: "bg-blue-50",
    border: "border-blue-200",
    gradient: "from-blue-500 to-blue-600",
    ring: "ring-blue-200",
    hex: "#3b82f6",
  },
  "#10b981": {
    // Green
    name: "Green",
    bg: "bg-green-500",
    hover: "hover:bg-green-600",
    text: "text-green-600",
    lightBg: "bg-green-50",
    border: "border-green-200",
    gradient: "from-green-500 to-green-600",
    ring: "ring-green-200",
    hex: "#10b981",
  },
  "#f97316": {
    // Orange
    name: "Orange",
    bg: "bg-orange-500",
    hover: "hover:bg-orange-600",
    text: "text-orange-600",
    lightBg: "bg-orange-50",
    border: "border-orange-200",
    gradient: "from-orange-500 to-orange-600",
    ring: "ring-orange-200",
    hex: "#f97316",
  },
  "#ef4444": {
    // Red
    name: "Red",
    bg: "bg-red-500",
    hover: "hover:bg-red-600",
    text: "text-red-600",
    lightBg: "bg-red-50",
    border: "border-red-200",
    gradient: "from-red-500 to-red-600",
    ring: "ring-red-200",
    hex: "#ef4444",
  },
  "#ec4899": {
    // Pink
    name: "Pink",
    bg: "bg-pink-500",
    hover: "hover:bg-pink-600",
    text: "text-pink-600",
    lightBg: "bg-pink-50",
    border: "border-pink-200",
    gradient: "from-pink-500 to-pink-600",
    ring: "ring-pink-200",
    hex: "#ec4899",
  },
  "#14b8a6": {
    // Teal
    name: "Teal",
    bg: "bg-teal-500",
    hover: "hover:bg-teal-600",
    text: "text-teal-600",
    lightBg: "bg-teal-50",
    border: "border-teal-200",
    gradient: "from-teal-500 to-teal-600",
    ring: "ring-teal-200",
    hex: "#14b8a6",
  },
  "#6366f1": {
    // Indigo
    name: "Indigo",
    bg: "bg-indigo-500",
    hover: "hover:bg-indigo-600",
    text: "text-indigo-600",
    lightBg: "bg-indigo-50",
    border: "border-indigo-200",
    gradient: "from-indigo-500 to-indigo-600",
    ring: "ring-indigo-200",
    hex: "#6366f1",
  },
} as const;

export type CourseColor = keyof typeof courseColors;

export const courseColorOptions: CourseColor[] = [
  "#a855f7", // Purple
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f97316", // Orange
  "#ef4444", // Red
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#6366f1", // Indigo
];

/**
 * Get course color classes by hex value
 * Returns default purple if color not found
 */
export function getCourseColor(hex: string) {
  return courseColors[hex as CourseColor] ?? courseColors["#a855f7"];
}
