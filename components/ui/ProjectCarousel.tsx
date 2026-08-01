"use client";

import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { useCarousel } from "@/hooks/useCarousel";
import { cn } from "@/lib/utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Monitor,
  Smartphone,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ProjectCarouselProps {
  images: string[];
  mobileImages?: string[];
  title: string;
}

const SLIDE_DURATION = 0.45;
const SLIDE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function ProjectCarousel({
  images,
  mobileImages,
  title,
}: ProjectCarouselProps) {
  if (images.length === 0) return null;

  return (
    <CarouselInner images={images} mobileImages={mobileImages} title={title} />
  );
}

function CarouselInner({ images, mobileImages, title }: ProjectCarouselProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const hasMobileView = Boolean(mobileImages && mobileImages.length > 0);
  const activeImages =
    viewMode === "mobile" && mobileImages ? mobileImages : images;

  const { index, next, prev, goTo, pause, resume, containerRef } = useCarousel(
    activeImages.length
  );
  const safeIndex = Math.min(index, activeImages.length - 1);

  const directionRef = useRef<1 | -1>(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const lightboxDirRef = useRef<1 | -1>(1);

  function handleViewModeSwitch(mode: "desktop" | "mobile") {
    if (mode === viewMode) return;
    goTo(0);
    setViewMode(mode);
  }

  function handleNext() {
    directionRef.current = 1;
    next();
  }

  function handlePrev() {
    directionRef.current = -1;
    prev();
  }

  function handleDot(n: number) {
    directionRef.current = n > safeIndex ? 1 : -1;
    goTo(n);
  }

  function handleLightboxNext() {
    lightboxDirRef.current = 1;
    next();
  }

  function handleLightboxPrev() {
    lightboxDirRef.current = -1;
    prev();
  }
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: SLIDE_DURATION, ease: SLIDE_EASE },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
      transition: { duration: SLIDE_DURATION, ease: SLIDE_EASE },
    }),
  };

  const showControls = activeImages.length > 1;

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden bg-black"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <AnimatePresence
        initial={false}
        custom={directionRef.current}
        mode="popLayout"
      >
        <motion.div
          key={`${viewMode}-${safeIndex}`}
          custom={directionRef.current}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <Image
            src={activeImages[safeIndex]}
            alt={`${title} — ${viewMode} screenshot ${safeIndex + 1}`}
            fill
            sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 767px) calc(100vw - 48px), calc(50vw - 40px)"
            className="object-contain"
            priority={safeIndex === 0}
          />
        </motion.div>
      </AnimatePresence>

      {showControls && (
        <>
          {/* Prev arrow */}
          <button
            onClick={handlePrev}
            aria-label="Previous screenshot"
            className={cn(
              "absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition-opacity duration-200 hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
              "sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Next arrow */}
          <button
            onClick={handleNext}
            aria-label="Next screenshot"
            className={cn(
              "absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition-opacity duration-200 hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
              "sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {activeImages.length <= 5 ? (
            /* Dot indicators — for 5 or fewer images */
            <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
              {activeImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleDot(i)}
                  aria-label={`Go to screenshot ${i + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                    i === safeIndex
                      ? "w-4 bg-white"
                      : "w-1.5 bg-white/50 hover:bg-white/75"
                  )}
                />
              ))}
            </div>
          ) : (
            /* Progress bar + counter — for 6+ images */
            <>
              <div className="absolute bottom-0 left-0 z-10 h-0.5 w-full bg-white/20">
                <motion.div
                  className="h-full bg-white"
                  animate={{
                    width: `${((safeIndex + 1) / activeImages.length) * 100}%`,
                  }}
                  transition={{ duration: SLIDE_DURATION, ease: SLIDE_EASE }}
                />
              </div>
              <span className="absolute bottom-2 right-2 z-10 rounded-full bg-black/60 px-2 py-0.5 font-mono text-[10px] tabular-nums text-white backdrop-blur-sm">
                {safeIndex + 1} / {activeImages.length}
              </span>
            </>
          )}
        </>
      )}

      {/* Desktop / Mobile view toggle — only rendered when mobileImages exist */}
      {hasMobileView && (
        <div className="absolute bottom-8 left-2 z-10 flex items-center rounded-full border border-white/20 bg-black/55 p-0.5 backdrop-blur-sm">
          <button
            onClick={() => handleViewModeSwitch("desktop")}
            aria-label="Desktop view"
            aria-pressed={viewMode === "desktop"}
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-all duration-200",
              viewMode === "desktop"
                ? "bg-white text-black shadow-sm"
                : "text-white/65 hover:text-white"
            )}
          >
            <Monitor className="h-2.5 w-2.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            onClick={() => handleViewModeSwitch("mobile")}
            aria-label="Mobile view"
            aria-pressed={viewMode === "mobile"}
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-all duration-200",
              viewMode === "mobile"
                ? "bg-white text-black shadow-sm"
                : "text-white/65 hover:text-white"
            )}
          >
            <Smartphone className="h-2.5 w-2.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>
      )}

      {/* Full-view expand button — always visible on mobile, hover-visible on desktop */}
      <button
        onClick={() => setLightboxOpen(true)}
        aria-label="View full image"
        className={cn(
          "absolute right-2 top-2 z-10 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition-all duration-200 hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
          "sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100"
        )}
      >
        <Maximize2 className="h-3.5 w-3.5" />
      </button>

      {/* Lightbox portal — renders at document.body to escape overflow/transform ancestors */}
      {lightboxOpen &&
        createPortal(
          <AnimatePresence>
            <ImageLightbox
              images={activeImages}
              title={title}
              index={safeIndex}
              direction={lightboxDirRef.current}
              onClose={() => setLightboxOpen(false)}
              onNext={handleLightboxNext}
              onPrev={handleLightboxPrev}
            />
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
