/** @type {import('tailwindcss').Config} */

const roles = ["background", "accent", "primary", "secondary", "foreground"];
const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const colors = {};
roles.forEach((role) => {
  colors[role] = {};
  steps.forEach((step) => {
    colors[role][step] = `oklch(var(--${role}-${step}) / <alpha-value>)`;
  });
});

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors,
      fontFamily: {
        sans: ["var(--font-body)"],
        body: ["var(--font-body)"],
        heading: ["var(--font-heading)"],
        display: ["var(--font-heading)"],
        serif: ["var(--font-heading)"],
        label: ["var(--font-label)"],
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.6s ease-out both",
        fadeIn: "fadeIn 0.5s ease-out both",
        scaleIn: "scaleIn 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};