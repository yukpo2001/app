"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BarChart3, Target, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-20 text-center relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] -z-10 animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] -z-10 animate-float delay-300" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl"
      >
        <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium tracking-wider text-blue-400 uppercase bg-blue-400/10 border border-blue-400/20 rounded-full">
          AI-Powered Business Diagnosis
        </span>
        <h1 className="text-5xl md:text-7xl font-bold mb-8 gradient-text tracking-tight">
          당신에게 최적화된<br />비즈니스 로드맵을 찾으세요
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          자본, 경험, 역량을 분석하여 현재 당신이 가장 빠르게 성과를 낼 수 있는 
          비즈니스 아이템과 맞춤형 세일즈 퍼널 전략을 제안합니다.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/diagnose">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-black font-bold rounded-full text-lg flex items-center gap-2 glow-shadow"
            >
              3분 만에 진단 시작하기
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
          <button className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white font-medium rounded-full text-lg hover:bg-white/10 transition-colors">
            서비스 소개 자세히 보기
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl"
      >
        {[
          { icon: Target, title: "맞춤형 아이템", desc: "사용자의 역량에 따른 최적 매칭" },
          { icon: Zap, title: "세일즈 퍼널", desc: "검증된 전략으로 구축하는 수익화 여정" },
          { icon: BarChart3, title: "시장성 검증", desc: "실제 데이터 기반 성공 사례 제시" }
        ].map((feature, idx) => (
          <div key={idx} className="glass-card p-8 text-left hover:border-white/20 transition-all group">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform">
              <feature.icon className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
