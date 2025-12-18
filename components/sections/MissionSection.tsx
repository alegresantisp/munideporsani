"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { registerGsapBase } from "@/lib/gsap/gsapClient";
import type { MissionContent } from "@/services/mission/mission.types";

interface Props {
  content: MissionContent;
}

export function MissionSection({ content }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    registerGsapBase();
    const ctx = gsap.context(() => {
      // Text Animation (Slide from left)
      gsap.fromTo(
        textRef.current,
        { autoAlpha: 0, x: -50 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Image Animation (Slide from right + Scale)
      gsap.fromTo(
        imageRef.current,
        { autoAlpha: 0, x: 50, scale: 0.95 },
        {
          autoAlpha: 1,
          x: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          delay: 0.2,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [content]);

  return (
    <section className="bg-white text-slate-900 py-16 px-4 overflow-hidden" ref={containerRef}>
      <div className="mx-auto max-w-6xl grid gap-8 md:grid-cols-[1.1fr_0.9fr] items-center">
        <div ref={textRef} className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{content.title}</h2>
          <div className="h-1 w-14 bg-sky-500" />

          <p className="text-lg leading-relaxed text-slate-700 whitespace-pre-line">{content.body}</p>
          {(content.author || content.organization || content.role) && (
            <div className="pt-6 text-slate-800 space-y-1">
              {content.author && <p className="font-semibold text-lg">{content.author}</p>}
              {content.role && <p className="text-sm text-slate-600">{content.role}</p>}
              {content.organization && <p className="text-sm font-semibold text-slate-700">{content.organization}</p>}
            </div>
          )}
        </div>
        <div ref={imageRef} className="relative h-[420px] w-full overflow-hidden rounded-2xl shadow-2xl bg-slate-100">
          {content.imageUrl ? (
            <Image src={content.imageUrl} alt={content.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">Sin imagen</div>
          )}
        </div>
      </div>
    </section>
  );
}
