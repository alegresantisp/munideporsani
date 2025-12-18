"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let isRegistered = false;

export const registerGsapBase = (): void => {
  if (typeof window === "undefined" || isRegistered) return;
  gsap.registerPlugin(ScrollTrigger);
  isRegistered = true;
};

type FadeUpOptions = {
  delay?: number;
};

export const fadeUp = (
  element: HTMLElement | null,
  options?: FadeUpOptions,
): void => {
  if (!element) return;
  gsap.fromTo(
    element,
    { autoAlpha: 0, y: 24 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      delay: options?.delay ?? 0,
    },
  );
};

export const registerScrollFadeUp = (selector: string): void => {
  if (typeof window === "undefined") return;
  registerGsapBase();

  gsap.utils.toArray<HTMLElement>(selector).forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 24 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      },
    );
  });
};


