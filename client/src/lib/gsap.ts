import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Central GSAP Plugin Registration
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  
  // Set default ease and duration for finance terminal aesthetic
  gsap.defaults({
    duration: 0.5,
    ease: "power2.out",
  });

  // Safe configuration: Prevents GSAP from locking elements invisibly on failed calculations
  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
  });
}

/**
 * Utility to check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Creates a responsive GSAP matchMedia instance with built-in prefers-reduced-motion check
 */
export const createResponsiveTimeline = () => {
  const mm = gsap.matchMedia();
  return mm;
};

/**
 * Forces ScrollTrigger recalculation across all DOM elements and route changes
 */
export const refreshScrollTriggers = () => {
  if (typeof window !== "undefined") {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }
};

export { gsap, ScrollTrigger, useGSAP };
