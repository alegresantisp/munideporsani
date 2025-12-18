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

const AnimatedTitle = ({ text, className }: { text: string; className?: string }) => {
  const lines = text.split("\n");
  
  return (
    <h1 className={className}>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex} className="block">
          {line.split("").map((char, charIndex) => (
            <span
              key={`${lineIndex}-${charIndex}`}
              className="hero-char inline-block opacity-0 translate-y-8"
              style={{ minWidth: char === " " ? "0.3em" : "auto" }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
};

export const HeroLanding: React.FC<HeroLandingProps> = ({ slides = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
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
      // Reset elements
      gsap.set(".hero-char", { opacity: 0, y: 50, rotateX: -90 });
      gsap.set(".hero-subtitle", { opacity: 0, y: 20 });
      gsap.set(".hero-btn", { opacity: 0, scale: 0.9 });
      gsap.set(imageRef.current, { scale: 1.1 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Image Zoom In effect
      gsap.to(imageRef.current, {
        scale: 1,
        duration: 10,
        ease: "none",
      });

      // Text Animation
      tl.to(".hero-char", {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.8,
        stagger: 0.02,
        ease: "back.out(1.7)",
      })
      .to(".hero-subtitle", {
        opacity: 1,
        y: 0,
        duration: 0.8,
      }, "-=0.4")
      .to(".hero-btn", {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.5)",
      }, "-=0.6");

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
        <div className="absolute inset-0 bg-black/40 z-10" /> {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
        
        <Image
          ref={imageRef}
          key={currentSlide.imageUrl} // Force re-render on change
          src={currentSlide.imageUrl}
          alt={currentSlide.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-20 flex h-full w-full items-center justify-center px-4 text-center">
        <div ref={contentRef} className="max-w-5xl space-y-8">
          <AnimatedTitle 
            text={currentSlide.title} 
            className="text-4xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl drop-shadow-2xl"
          />
          
          {currentSlide.subtitle && (
            <p className="hero-subtitle mx-auto max-w-2xl text-lg text-slate-100 md:text-2xl font-light drop-shadow-lg leading-relaxed">
              {currentSlide.subtitle}
            </p>
          )}

          {currentSlide.buttonText && (
            <div className="hero-btn pt-6">
              <Link
                href={currentSlide.buttonLink || "#"}
                className="inline-flex items-center justify-center rounded-full bg-sky-500 px-8 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-sky-400 hover:scale-105 hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] shadow-lg shadow-sky-900/50"
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
            className="absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/5 p-4 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110 md:left-8 group"
            aria-label="Anterior"
          >
            <svg className="h-8 w-8 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/5 p-4 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110 md:right-8 group"
            aria-label="Siguiente"
          >
            <svg className="h-8 w-8 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicators */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-12 left-1/2 z-30 flex -translate-x-1/2 gap-4">
          {activeSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentIndex ? "w-12 bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.8)]" : "w-4 bg-white/30 hover:bg-white/60"
              }`}
              aria-label={`Ir a slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Accessibility Icon (Mockup based on image) */}
      <div className="absolute bottom-8 right-8 z-30">
        <button className="rounded-full bg-sky-900/80 p-3 text-white hover:bg-sky-800 transition-all hover:scale-110 shadow-lg">
           <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
           </svg>
        </button>
      </div>
    </section>
  );
};


