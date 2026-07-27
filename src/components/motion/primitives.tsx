import { motion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DUR, fadeUp, lineUp, staggerParent, transition, viewportOnce } from "@/lib/motion";
import { useMotionEnabled } from "./use-motion-enabled";

type DivProps = HTMLMotionProps<"div">;

/** Fade + 40px translateY reveal when the element enters the viewport. */
export function Reveal({
  children,
  className,
  delay = 0,
  duration = DUR.base,
  as = "div",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  as?: "div" | "section" | "li" | "span";
} & Omit<DivProps, "children">) {
  const enabled = useMotionEnabled();
  const Comp = motion[as] as typeof motion.div;
  if (!enabled) {
    const Plain = as as "div";
    return <Plain className={className}>{children}</Plain>;
  }
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={transition(duration, delay)}
      style={{ willChange: "transform, opacity" }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Parent that staggers its <StaggerItem> children on viewport entry. */
export function Stagger({
  children,
  className,
  stagger = 0.08,
  delayChildren = 0,
  as = "div",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
  as?: "div" | "section" | "ul" | "footer";
} & Omit<DivProps, "children">) {
  const enabled = useMotionEnabled();
  const Comp = motion[as] as typeof motion.div;
  if (!enabled) {
    const Plain = as as "div";
    return <Plain className={className}>{children}</Plain>;
  }
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={staggerParent(stagger, delayChildren)}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "span" | "p" | "form";
} & Omit<DivProps, "children">) {
  const enabled = useMotionEnabled();
  const Comp = motion[as] as typeof motion.div;
  if (!enabled) {
    const Plain = as as "div";
    return <Plain className={className}>{children}</Plain>;
  }
  return (
    <Comp className={className} variants={fadeUp} style={{ willChange: "transform, opacity" }} {...rest}>
      {children}
    </Comp>
  );
}

/**
 * Heading revealed line-by-line from bottom to top.
 * Pass plain strings — one per visual line.
 */
export function RevealLines({
  lines,
  className,
  as: Tag = "h1",
  delay = 0,
  stagger = 0.1,
  inView = false,
}: {
  lines: string[];
  className?: string;
  as?: "h1" | "h2" | "h3";
  delay?: number;
  stagger?: number;
  inView?: boolean;
}) {
  const enabled = useMotionEnabled();
  if (!enabled) {
    return (
      <Tag className={className}>
        {lines.map((l, i) => (
          <span key={i} className="block">
            {l}
          </span>
        ))}
      </Tag>
    );
  }
  const animateProps = inView
    ? { whileInView: "visible" as const, viewport: viewportOnce }
    : { animate: "visible" as const };
  return (
    <Tag className={className}>
      <motion.span
        className="block"
        initial="hidden"
        variants={staggerParent(stagger, delay)}
        {...animateProps}
      >
        {lines.map((line, i) => (
          <span key={i} className="block overflow-hidden pb-[0.06em]">
            <motion.span
              className="block"
              variants={lineUp}
              style={{ willChange: "transform, opacity" }}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}

/** Card wrapper: lift + scale 1.02 + soft shadow on hover. */
export function HoverCard({
  children,
  className,
  ...rest
}: { children: ReactNode; className?: string } & Omit<DivProps, "children">) {
  const enabled = useMotionEnabled();
  if (!enabled) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={cn("will-change-transform", className)}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={transition(DUR.fast)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}