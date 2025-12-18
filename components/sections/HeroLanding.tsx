/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { registerGsapBase } from "@/lib/gsap/gsapClient";
import type { HeroSlide } from "@/services/hero/hero.types";
import Link from "next/link";

interface HeroLandingProps {
  slides?: HeroSlide[];
}

export const HeroLanding: React.FC<HeroLandingProps> = ({ slides = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const slideRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Fallback slide if none provided
  const activeSlides = slides.length > 0 ? slides : [{
    id: "default",
    imageUrl: "/hero-san-isidro.jpg",
    title: "BIENVENIDOS\nSecretaría de Deportes",
    subtitle: "Impulsamos el desarrollo deportivo en todas sus formas, promoviendo una cultura activa y saludable para todos.",
    buttonText: "CONOCÉ MÁS",
    buttonLink: "#tramites",
    order: 0,
    active: true
  }];

  const currentSlide = activeSlides[currentIndex];

  useEffect(() => {
    registerGsapBase();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Reset state
      gsap.set(contentRef.current, { opacity: 0, y: 30 });
      
      // Animate In
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      
      tl.to(contentRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.2
      });

    }, containerRef);

    return () => ctx.revert();
  }, [currentIndex]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-slate-900"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/50 z-10" /> {/* Dark Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.6)_100%)] z-10" />
        
        <Image
          key={currentSlide.imageUrl} // Force re-render on change
          src={currentSlide.imageUrl}
          alt={currentSlide.title}
          fill
          className="object-cover animate-fade-in"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-20 flex h-full w-full items-center justify-center px-4 text-center">
        <div ref={contentRef} className="max-w-4xl space-y-6">
          <h1 className="whitespace-pre-line text-4xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl drop-shadow-lg">
            {currentSlide.title}
          </h1>
          
          {currentSlide.subtitle && (
            <p className="mx-auto max-w-2xl text-lg text-slate-200 md:text-xl drop-shadow-md">
              {currentSlide.subtitle}
            </p>
          )}

          {currentSlide.buttonText && (
            <div className="pt-4">
              <Link
                href={currentSlide.buttonLink || "#"}
                className="inline-flex items-center justify-center rounded-full bg-sky-500 px-8 py-3 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-sky-600 hover:scale-105 shadow-lg shadow-sky-500/30"
              >
                {currentSlide.buttonText}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20 md:left-8"
            aria-label="Anterior"
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20 md:right-8"
            aria-label="Siguiente"
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicators */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 gap-3">
          {activeSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1 rounded-full transition-all ${
                idx === currentIndex ? "w-8 bg-sky-500" : "w-4 bg-white/50 hover:bg-white"
              }`}
              aria-label={`Ir a slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Accessibility Icon (Mockup based on image) */}
      <div className="absolute bottom-8 right-8 z-30">
        <button className="rounded-full bg-sky-900/80 p-2 text-white hover:bg-sky-800 transition-colors">
           <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
           </svg>
        </button>
      </div>
    </section>
  );
};


