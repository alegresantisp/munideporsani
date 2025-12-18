"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { registerGsapBase } from "@/lib/gsap/gsapClient";

interface HeroTaglineProps {
  text: string;
  subline?: string;
}

export function HeroTagline({ text, subline }: HeroTaglineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    registerGsapBase();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        }
      });

      // Label animation (Line expands + Text fades in)
      tl.fromTo(".hero-label-line", 
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, ease: "power3.inOut" }
      )
      .fromTo(".hero-label-text",
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
        "-=0.4"
      );

      // Tagline chars animation (3D Flip up)
      tl.fromTo(".hero-tag-char",
        { autoAlpha: 0, y: 50, rotateX: -90, z: -50 },
        { 
          autoAlpha: 1, 
          y: 0, 
          rotateX: 0, 
          z: 0,
          duration: 1, 
          ease: "elastic.out(1, 0.75)", 
          stagger: 0.03 
        },
        "-=0.2"
      );

      // Subline animation
      tl.fromTo(".hero-subline",
        { autoAlpha: 0, y: 20, filter: "blur(10px)" },
        { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "power2.out" },
        "-=0.8"
      );

    }, containerRef);
    return () => ctx.revert();
  }, [text, subline]);

  const chars = text.split("");

  return (
    <section className="bg-slate-900 text-white py-24 px-4 overflow-hidden">
      <div className="mx-auto max-w-5xl text-center" ref={containerRef}>
        
        <div className="mb-8 flex flex-col items-center justify-center gap-2">
          <span className="hero-label-text text-xs font-bold uppercase tracking-[0.4em] text-sky-400">
            Deportes San Isidro
          </span>
          <div className="hero-label-line h-px w-24 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
        </div>

        <div className="text-2xl md:text-3xl font-semibold leading-snug flex flex-wrap justify-center gap-x-1 gap-y-2 [perspective:1000px]">
          {chars.map((c, idx) => (
            <span 
              key={idx} 
              className="hero-tag-char inline-block origin-bottom"
              style={{ minWidth: c === " " ? "0.3em" : "auto" }}
            >
              {c === " " ? "\u00A0" : c}
            </span>
          ))}
        </div>
        
        {subline && (
          <p className="hero-subline mt-8 text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
            {subline}
          </p>
        )}
      </div>
    </section>
  );
}
