"use client";

import { motion, useScroll, useTransform, useInView } from "motion/react";
import { useRef } from "react";
import { Upload, FileCheck, Zap, Package } from "lucide-react";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/ScrollReveal";
import { PROCESS_STEPS } from "@/lib/constants";

const icons = [Upload, FileCheck, Zap, Package];

function IconNode({ Icon, index }: { Icon: typeof Upload; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px 0px" });

  return (
    <div
      ref={ref}
      className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          delay: index * 0.1,
        }}
        className="w-16 h-16 rounded-2xl bg-card border border-gold/50 flex items-center justify-center shadow-lg shadow-gold/10"
      >
        <Icon className="w-7 h-7 text-gold" aria-hidden="true" />
      </motion.div>
    </div>
  );
}

export function ProcessSteps() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const lineHeight = useTransform(scrollYProgress, [0.1, 0.7], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/30 via-background to-card/30" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal className="text-center mb-20">
          <p className="text-gold text-sm font-medium uppercase tracking-wider mb-3">
            Simple Process
          </p>
          <h2 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            From Design to <span className="text-gradient-gold">Delivery</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Four steps. No runaround.
          </p>
        </ScrollReveal>

        {/* Steps */}
        <div className="relative">
          {/* Progress Line - Desktop */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2">
            <div className="absolute inset-0 bg-border" />
            <motion.div
              style={{ height: lineHeight }}
              className="absolute top-0 left-0 right-0 bg-gradient-to-b from-gold via-gold to-transparent"
            />
          </div>

          <StaggerContainer
            className="space-y-12 lg:space-y-0"
            staggerDelay={0.15}
          >
            {PROCESS_STEPS.map((step, index) => {
              const Icon = icons[index];
              const isEven = index % 2 === 0;

              return (
                <StaggerItem
                  key={step.step}
                  className={`relative lg:grid lg:grid-cols-2 lg:gap-16 ${
                    index !== PROCESS_STEPS.length - 1 ? "lg:mb-24" : ""
                  }`}
                >
                  {/* Content - alternating sides */}
                  <div
                    className={`${
                      isEven ? "lg:text-right lg:pr-16" : "lg:col-start-2 lg:pl-16"
                    }`}
                  >
                    <div className="p-8 rounded-2xl bg-card border border-border hover:border-gold/30 transition-[border-color] duration-300">
                      {/* Step Number */}
                      <div
                        className={`flex items-center gap-4 mb-4 ${
                          isEven ? "lg:justify-end" : ""
                        }`}
                      >
                        <span className="text-5xl font-bold text-gold/20">
                          0{step.step}
                        </span>
                      </div>

                      {/* Icon - Mobile */}
                      <div className="lg:hidden w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
                        <Icon className="w-7 h-7 text-gold" />
                      </div>

                      <h3 className="text-2xl font-semibold mb-3">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Icon Node - Desktop only (hidden via CSS) */}
                  <IconNode Icon={Icon} index={index} />
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
