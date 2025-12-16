✅ EASIEST & MOST POPULAR (React / Next.js)
🎉 canvas-confetti (industry standard)

Lightweight, fast, and used everywhere.

Install
npm install canvas-confetti

Basic button → confetti
"use client";

import confetti from "canvas-confetti";

export default function ConfettiButton() {
const fire = () => {
confetti({
particleCount: 150,
spread: 70,
origin: { y: 0.6 },
});
};

return (
<button
      onClick={fire}
      className="px-4 py-2 rounded bg-black text-white"
    >
Celebrate 🎉
</button>
);
}

✔ Works perfectly in Next.js App Router
✔ No SSR issues
✔ Very low performance cost

✨ SMOOTHER / PRETTIER VERSION (burst + sides)
const fireConfetti = () => {
const defaults = {
spread: 360,
ticks: 60,
gravity: 0,
decay: 0.94,
startVelocity: 30,
colors: ["#ff0", "#0ff", "#f0f", "#0f0", "#00f"],
};

confetti({
...defaults,
particleCount: 80,
scalar: 1.2,
});

confetti({
...defaults,
particleCount: 40,
scalar: 0.75,
shapes: ["circle"],
});
};
