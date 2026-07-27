"use client";

import { cn } from "@/lib/utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

interface ImageLightboxProps {
  images: string[];
  title: string;
  index: number;
  direction: 1 | -1;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "25%" : "-25%", opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: EASE } },
  exit: (dir: number) => ({
    x: dir > 0 ? "-25%" : "25%",
    opacity: 0,
    transition: { duration: 0.25, ease: EASE },
  }),
};

export function ImageLightbox({
  images,
  title,
  index,
  direction,
  onClose,
  onNext,
  onPrev,
}: ImageLightboxProps) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onNext();
      else if (e.key === "ArrowLeft") onPrev();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const showControls = images.length > 1;
  const progress = ((index + 1) / images.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-black/96 fixed inset-0 z-[100] flex flex-col backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — full view`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/75 via-black/35 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

      {/* Top bar */}
      <div
        className="relative z-10 flex shrink-0 items-center justify-between px-4 py-3 sm:px-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-0.5 rounded-2xl border border-white/10 bg-black/50 px-3 py-2 shadow-lg backdrop-blur-md">
          <span className="text-sm font-semibold text-white sm:text-base">
            {title}
          </span>
          {images.length > 1 && (
            <span className="font-mono text-[11px] text-white/65">
              {index + 1} / {images.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close full view"
          className="rounded-full border border-white/15 bg-black/55 p-2 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Image area */}
      <div className="relative min-h-0 flex-1 px-4 sm:px-16">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[index]}
              alt={`${title} — screenshot ${index + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {showControls && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              aria-label="Previous screenshot"
              className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-black/55 p-2.5 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-3"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              aria-label="Next screenshot"
              className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-black/55 p-2.5 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-3"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Progress bar */}
      {showControls && (
        <div
          className="relative z-10 h-0.5 w-full shrink-0 bg-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            className={cn("h-full bg-foreground")}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: EASE }}
          />
        </div>
      )}
    </motion.div>
  );
}
