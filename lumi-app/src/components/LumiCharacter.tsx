"use client";

import { motion } from "framer-motion";

interface LumiProps {
    cosplay?: "explorer" | "modern" | "healer";
}

export const LumiCharacter = ({ cosplay }: LumiProps) => {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-48 h-48 mx-auto mb-8"
        >
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                {/* Cat Ears */}
                <motion.path
                    d="M50 80 L30 30 L80 60"
                    fill="white"
                    stroke="oklch(0.7 0.1 280)"
                    strokeWidth="4"
                    animate={{ rotate: [-2, 2, -2] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                />
                <motion.path
                    d="M150 80 L170 30 L120 60"
                    fill="white"
                    stroke="oklch(0.7 0.1 280)"
                    strokeWidth="4"
                    animate={{ rotate: [2, -2, 2] }}
                    transition={{ repeat: Infinity, duration: 2.1 }}
                />

                {/* Cat Head */}
                <circle cx="100" cy="110" r="70" fill="white" stroke="oklch(0.7 0.1 280)" strokeWidth="4" />

                {/* Eyes */}
                <motion.circle
                    cx="75" cy="100" r="8" fill="oklch(0.15 0.01 250)"
                    animate={{ scaleY: [1, 0.1, 1] }}
                    transition={{ repeat: Infinity, duration: 4, times: [0, 0.05, 1] }}
                />
                <motion.circle
                    cx="125" cy="100" r="8" fill="oklch(0.15 0.01 250)"
                    animate={{ scaleY: [1, 0.1, 1] }}
                    transition={{ repeat: Infinity, duration: 4, times: [0, 0.05, 1] }}
                />

                {/* Nose & Whiskers */}
                <path d="M100 115 L95 125 L105 125 Z" fill="oklch(0.8 0.15 340)" />
                <path d="M60 120 L30 115 M60 130 L30 135" stroke="oklch(0.7 0.1 280)" strokeWidth="2" />
                <path d="M140 120 L170 115 M140 130 L170 135" stroke="oklch(0.7 0.1 280)" strokeWidth="2" />

                {/* Cosplay Items */}
                {cosplay === "explorer" && (
                    <g>
                        {/* Explorer Hat */}
                        <path d="M40 70 Q100 30 160 70 L160 85 Q100 100 40 85 Z" fill="oklch(0.5 0.1 50)" />
                        <rect x="70" y="65" width="60" height="5" fill="oklch(0.4 0.1 50)" />
                    </g>
                )}

                {cosplay === "modern" && (
                    <g>
                        {/* Designer Sunglasses */}
                        <rect x="60" y="95" width="25" height="15" rx="5" fill="black" opacity="0.8" />
                        <rect x="115" y="95" width="25" height="15" rx="5" fill="black" opacity="0.8" />
                        <path d="M85 102 L115 102" stroke="black" strokeWidth="2" />
                        {/* Scarf */}
                        <path d="M60 170 Q100 190 140 170" fill="none" stroke="oklch(0.6 0.2 300)" strokeWidth="10" />
                    </g>
                )}

                {cosplay === "healer" && (
                    <g>
                        {/* Flower Crown */}
                        <circle cx="70" cy="50" r="8" fill="pink" />
                        <circle cx="100" cy="40" r="8" fill="yellow" />
                        <circle cx="130" cy="50" r="8" fill="lightblue" />
                        <path d="M60 55 Q100 35 140 55" fill="none" stroke="lightgreen" strokeWidth="2" />
                    </g>
                )}

                {!cosplay && (
                    <g>
                        {/* Default Beret */}
                        <ellipse cx="100" cy="55" rx="45" ry="15" fill="oklch(0.7 0.1 280)" />
                        <circle cx="100" cy="40" r="5" fill="oklch(0.7 0.1 280)" />
                    </g>
                )}
            </svg>

            {/* Decorative Glow */}
            <div className={`absolute inset-0 blur-3xl -z-10 rounded-full scale-150 ${cosplay === "explorer" ? "bg-secondary/20" :
                    cosplay === "modern" ? "bg-primary/20" :
                        cosplay === "healer" ? "bg-accent/20" : "bg-primary/20"
                }`} />
        </motion.div>
    );
};
