"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { LumiCharacter } from "@/components/LumiCharacter";
import { MapPin, Utensils, Sparkles, Globe } from "lucide-react";

export default function Home() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "ko" ? "en" : "ko");
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Language Toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={toggleLanguage}
        className="absolute top-8 right-8 flex items-center gap-2 btn-secondary py-2 px-4 text-sm"
      >
        <Globe className="w-4 h-4" />
        {language === "ko" ? "English" : "한국어"}
      </motion.button>

      {/* Hero Section */}
      <div className="max-w-4xl w-full text-center">
        <LumiCharacter />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest text-primary uppercase bg-primary/10 border border-primary/20 rounded-full">
            AI Journey Curator
          </span>
          <h1 className="gradient-text mb-6">
            {t("subtitle")}
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            {t("description")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/diagnose">
              <button className="btn-primary flex items-center gap-2">
                {t("start_btn")}
                <Sparkles className="w-5 h-5" />
              </button>
            </Link>
            <button className="btn-secondary">
              {t("intro_btn")}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl w-full"
      >
        {[
          { icon: Utensils, title: t("features.food"), color: "primary" },
          { icon: Sparkles, title: t("features.activity"), color: "accent" },
          { icon: MapPin, title: t("features.itinerary"), color: "secondary" }
        ].map((feature, idx) => (
          <div key={idx} className="glass p-8 rounded-3xl group hover:scale-105 transition-transform cursor-pointer">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-${feature.color}/10 group-hover:bg-${feature.color}/20 transition-colors`}>
              <feature.icon className={`w-6 h-6 text-${feature.color}`} />
            </div>
            <h3 className="text-xl font-bold">{feature.title}</h3>
          </div>
        ))}
      </motion.div>

      {/* Footer Branding */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.2 }}
        className="mt-20 text-sm font-serif italic text-gray-400"
      >
        Design by Antigravity x Lumi’s Pick
      </motion.p>
    </main>
  );
}
