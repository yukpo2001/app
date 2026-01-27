"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Check, Info, Sparkles, TrendingUp, Users } from "lucide-react";
import funnelData from "@/data/funnel_strategy_guide.json";
import caseData from "@/data/student_case_library.json";

export default function ResultPage() {
    const router = useRouter();
    const [answers, setAnswers] = useState<any>(null);
    const [recommendation, setRecommendation] = useState<any>(null);

    useEffect(() => {
        const saved = localStorage.getItem("diagnostic_result");
        if (!saved) {
            router.push("/");
            return;
        }
        const parsedAnswers = JSON.parse(saved);
        setAnswers(parsedAnswers);

        // 단순화된 추천 로직
        let bizType: "knowledge" | "service" | "product" = "knowledge";
        if (parsedAnswers.q2_1 === "product" || parsedAnswers.q2_2 === "ecommerce") {
            bizType = "product";
        } else if (parsedAnswers.q2_1 === "service" || parsedAnswers.q2_2 === "affiliate") {
            bizType = "service";
        }

        const funnel = funnelData[bizType];
        const matchedCase = caseData.find(c => c.profile.interest === bizType) || caseData[0];

        setRecommendation({
            type: bizType,
            title: funnel.title,
            stages: funnel.stages,
            case: matchedCase
        });
    }, [router]);

    if (!recommendation) return null;

    return (
        <div className="min-h-screen bg-[#050505] text-white px-4 py-20 overflow-x-hidden">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6">
                        <Sparkles className="w-4 h-4" />
                        <span>분석 완료: 당신의 비즈니스 유형을 찾았습니다</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
                        {recommendation.title}
                    </h1>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Card: Funnel Visualization */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 glass-card p-8 md:p-12 relative overflow-hidden"
                    >
                        <div className="flex items-center gap-3 mb-10 text-xl font-bold">
                            <TrendingUp className="text-blue-400" />
                            추천 세일즈 퍼널 전략
                        </div>

                        <div className="space-y-6 relative">
                            {/* Connector Line */}
                            <div className="absolute left-[31px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-500/50 to-purple-500/20" />

                            {recommendation.stages.map((stage: any, idx: number) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + idx * 0.1 }}
                                    className="flex gap-6 items-start relative z-10"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-2xl text-blue-400 shrink-0">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold mb-1">{stage.name}</h3>
                                        <p className="text-gray-400 leading-relaxed">{stage.content}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Sidebar: Case & CTA */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass-card p-8 border-blue-500/20 bg-blue-500/[0.02]"
                        >
                            <div className="flex items-center gap-3 mb-6 text-lg font-bold">
                                <Users className="text-blue-400" />
                                유사 성공 사례
                            </div>
                            <h4 className="text-white font-bold mb-2">{recommendation.case.title}</h4>
                            <p className="text-sm text-gray-400 leading-relaxed mb-6">
                                {recommendation.case.summary}
                            </p>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-sm text-blue-300">
                                추천 아이템: {recommendation.case.item}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="glass-card p-8"
                        >
                            <h3 className="text-lg font-bold mb-6">다음 단계 실행하기</h3>
                            <ul className="space-y-4 mb-8">
                                {[
                                    "맞춤형 상세 가이드북 받기",
                                    "1:1 비즈니스 코칭 신청",
                                    "실행 자동화 툴킷 확인"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                                        <Check className="w-4 h-4 text-green-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-4 bg-white text-black font-bold rounded-xl hover:scale-[1.02] transition-transform glow-shadow">
                                가이드북 무료 다운로드
                            </button>
                        </motion.div>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-12 text-center"
                >
                    <button
                        onClick={() => router.push("/")}
                        className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 mx-auto"
                    >
                        <Info className="w-4 h-4" />
                        진단 다시하기
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
