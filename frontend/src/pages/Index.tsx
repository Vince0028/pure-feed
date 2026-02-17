import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Zap, ChevronUp, ChevronDown } from "lucide-react";
import { FeedCard } from "@/components/FeedCard";
import { mockPosts, ContentType } from "@/data/mockPosts";

type FilterTab = "articles" | "shorts" | "videos";

const Index = () => {
  const [filter, setFilter] = useState<FilterTab>("shorts");
  const [activeIndex, setActiveIndex] = useState(0);
  const [shuffleKey, setShuffleKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const touchStartY = useRef(0);

  const filteredPosts = useMemo(() => {
    const tabToType: Record<FilterTab, ContentType> = {
      articles: "article",
      shorts: "short",
      videos: "video",
    };
    const typed = mockPosts.filter((p) => p.contentType === tabToType[filter]);
    if (shuffleKey > 0) {
      return [...typed].sort(() => Math.random() - 0.5);
    }
    return typed;
  }, [filter, shuffleKey]);

  // Reset index when filter or shuffle changes
  useEffect(() => {
    setActiveIndex(0);
  }, [filter, shuffleKey]);

  // Tap active tab to refresh (like TikTok)
  const handleTabClick = (tab: FilterTab) => {
    if (tab === filter) {
      setShuffleKey((k) => k + 1);
    } else {
      setFilter(tab);
    }
  };

  const goTo = useCallback(
    (dir: "up" | "down") => {
      if (isScrolling.current) return;
      const next = dir === "down" ? activeIndex + 1 : activeIndex - 1;
      if (next < 0 || next >= filteredPosts.length) return;
      isScrolling.current = true;
      setActiveIndex(next);
      setTimeout(() => {
        isScrolling.current = false;
      }, 600);
    },
    [activeIndex]
  );

  // Wheel scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 30) return;
      goTo(e.deltaY > 0 ? "down" : "up");
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [goTo]);

  // Touch swipe
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const start = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const end = (e: TouchEvent) => {
      const diff = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(diff) < 50) return;
      goTo(diff > 0 ? "down" : "up");
    };
    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchend", end, { passive: true });
    return () => {
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchend", end);
    };
  }, [goTo]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "j") goTo("down");
      if (e.key === "ArrowUp" || e.key === "k") goTo("up");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goTo]);

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden bg-background">
      {/* Scrolling container */}
      <motion.div
        className="h-full w-full"
        animate={{ y: `-${activeIndex * 100}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {filteredPosts.map((post, i) => (
          <div key={post.id} className="h-screen w-full">
            <FeedCard post={post} isActive={i === activeIndex} />
          </div>
        ))}
      </motion.div>

      {/* Filter tabs */}
      <div className="fixed top-10 sm:top-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 rounded-lg border border-border/30 bg-background/70 backdrop-blur-md p-0.5">
        {(["articles", "shorts", "videos"] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
              filter === tab
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground/70"
            }`}
          >
            {tab === "articles" ? "Articles" : tab === "shorts" ? "Shorts" : "Videos"}
          </button>
        ))}
      </div>

      {/* Side navigation dots — hidden on mobile */}
      <div className="hidden sm:flex fixed right-4 top-1/2 -translate-y-1/2 z-50 flex-col items-center gap-2">
        {filteredPosts.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (!isScrolling.current) {
                isScrolling.current = true;
                setActiveIndex(i);
                setTimeout(() => { isScrolling.current = false; }, 600);
              }
            }}
            className={`rounded-full transition-all duration-300 ${
              i === activeIndex
                ? "h-5 w-1.5 bg-foreground/70"
                : "h-1.5 w-1.5 bg-muted-foreground/25 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>

      {/* Bottom bar — logo, nav arrows, counter */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-3 py-2 sm:px-5 sm:py-3 bg-background/80 backdrop-blur-md border-t border-border/20">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-foreground/8">
            <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-foreground/70" />
          </div>
          <span className="text-sm sm:text-base font-semibold tracking-tight">
            <span className="text-gradient-primary">NoFluff</span>
            <span className="text-muted-foreground font-normal">.ai</span>
          </span>
        </div>

        {/* Nav arrows */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => goTo("up")}
            disabled={activeIndex === 0}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-border/40 bg-background/50 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-20"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <span className="text-[10px] font-mono text-muted-foreground/60 hidden sm:inline">scroll or swipe</span>
          <button
            onClick={() => goTo("down")}
            disabled={activeIndex === filteredPosts.length - 1}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-border/40 bg-background/50 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-20"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* Post counter */}
        <div className="flex items-center gap-1.5 rounded-md border border-border/30 bg-background/50 px-2.5 py-1 sm:px-3 sm:py-1.5">
          <span className="text-[10px] sm:text-xs font-mono text-foreground/70 font-medium">{activeIndex + 1}</span>
          <span className="text-[10px] sm:text-xs font-mono text-muted-foreground">/ {filteredPosts.length}</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
