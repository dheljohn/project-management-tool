import confetti from "canvas-confetti";

export function celebrateProject() {
  confetti({
    particleCount: 150,
    spread: 90,
    origin: { y: 0.7 },
  });
}
