"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Check, Info, Sparkles, TrendingUp, Users, Brain, Target, MessageSquare, Palette, MousePointer2, Calendar } from "lucide-react";
import { getStrategies, StrategyResult } from "@/lib/strategyMapping";

export default function ResultPage() {
    const router = useRouter();
    const [answers, setAnswers] = useState<any>(null);
    const [strategies, setStrategies] = useState<Record<string, StrategyResult> | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem("biz_science_result");
        if (!saved) {
            router.push("/diagnose");
            return;
        }
        const parsedAnswers = JSON.parse(saved);
        setAnswers(parsedAnswers);

        const mappedStrategies = getStrategies({
            biz_industry: parsedAnswers.biz_industry,
            biz_problem: parsedAnswers.biz_problem,
            biz_resource: parsedAnswers.biz_resource,
            target_type: parsedAnswers.target_type,
        });
        setStrategies(mappedStrategies);
    }, [router]);

    if (!strategies) return null;

    const strategyIcons: Record<string, any> = {
        pricing: TrendingUp,
        event: Calendar,
        nudge: MousePointer2,
        design: Palette,
        messaging: Target,
        sns: MessageSquare
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white px-4 py-20 overflow-x-hidden">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6">
                        <Sparkles className="w-4 h-4" />
                        <span>전략 분석 완료: BizScience 맞춤 자문서</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
                        사장님을 위한 6대 연구원 전략
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        경영학 및 심리학 논문의 실증된 이론을 바탕으로<br />
                        현재 사장님의 상황에 가장 효과적인 액션 플랜을 도출했습니다.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(strategies).map(([key, strategy], idx) => {
                        const Icon = strategyIcons[key];
                        return (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-card p-8 border-white/10 hover:border-blue-500/30 transition-all group"
                            >
                                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
                                    <Icon className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                                    {strategy.title}
                                </h3>
                                <div className="flex items-center gap-2 text-xs font-mono text-gray-500 mb-4 bg-white/5 py-1 px-2 rounded w-fit">
                                    <Brain className="w-3 h-3" />
                                    {strategy.theory}
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                    {strategy.logic}
                                </p>
                                <div className="pt-4 border-t border-white/5">
                                    <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Actionable Guide</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-20 flex flex-col items-center gap-8"
                >
                    <div className="glass-card p-8 border-blue-500/20 bg-blue-500/[0.02] max-w-2xl w-full text-center">
                        <h3 className="text-xl font-bold mb-4">전략 연구원 총평</h3>
                        <p className="text-gray-400 leading-relaxed italic">
                            "사용자의 주된 페인포인트인 [{(answers as any)?.biz_problem}] 해결을 최우선 과제로 상정했습니다.
                            단순한 보상보다는 심리적 넛지와 신호 발송을 통해 자연스러운 유입과 전환을 유도하는 것이 핵심입니다."
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button className="px-10 py-4 bg-white text-black font-bold rounded-full text-lg hover:scale-105 transition-transform glow-shadow">
                            전체 전략 PDF 저장하기
                        </button>
                        <button
                            onClick={() => router.push("/diagnose")}
                            className="px-10 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white font-medium rounded-full text-lg hover:bg-white/10 transition-colors"
                        >
                            진단 다시하기
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

