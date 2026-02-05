"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { useTravel } from "@/lib/TravelContext";
import { getPlacesRecommendations } from "@/lib/google-maps";
import { LumiCharacter } from "@/components/LumiCharacter";
import { Search, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";

export default function DiagnosePage() {
    const { t } = useLanguage();
    const { setRecommendations } = useTravel();
    const [step, setStep] = useState(1);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [analysisText, setAnalysisText] = useState("");

    const startAnalysis = async () => {
        if (!keyword.trim()) return;

        setIsAnalyzing(true);
        const phrases = [
            "실시간 구글 지도 데이터를 불러오고 있어요...",
            "유저 리뷰들을 꼼꼼히 분석하고 있습니다...",
            "당신의 취향을 Lumi가 파악하는 중이에요!",
            "가장 힙하고 평점 좋은 곳을 선정하고 있어요..."
        ];

        let phraseIdx = 0;
        const interval = setInterval(() => {
            setAnalysisText(phrases[phraseIdx % phrases.length]);
            phraseIdx++;
        }, 1200);

        try {
            const results = await getPlacesRecommendations(keyword);
            setRecommendations(results);
            setStep(2);
        } catch (error) {
            console.error("Analysis failed:", error);
        } finally {
            clearInterval(interval);
            setIsAnalyzing(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4">
            <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="glass p-12 rounded-[3rem] max-w-2xl w-full text-center"
                    >
                        <LumiCharacter />
                        <h2 className="text-3xl font-bold mb-4">Lumi에게 장소 물어보기</h2>
                        <p className="text-gray-500 mb-8">가고 싶은 지역이나 테마를 입력해 주세요. (예: 성수동 힙한 카페)</p>

                        <div className="relative mb-6">
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="어디로 떠나고 싶으신가요?"
                                className="w-full px-8 py-5 bg-white/50 border-2 border-primary/20 rounded-[2rem] focus:border-primary outline-none transition-all text-lg font-medium"
                                onKeyDown={(e) => e.key === 'Enter' && startAnalysis()}
                            />
                        </div>

                        <button
                            onClick={startAnalysis}
                            disabled={isAnalyzing || !keyword.trim()}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-5 text-lg"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span>{analysisText || "분석 시작 중..."}</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-6 h-6" />
                                    <span>분석 시작하기</span>
                                </>
                            )}
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass p-12 rounded-[3rem] max-w-2xl w-full text-center"
                    >
                        <CheckCircle2 className="w-16 h-16 text-secondary mx-auto mb-6" />
                        <h2 className="text-3xl font-bold mb-4">분석 완료!</h2>
                        <p className="text-gray-500 mb-8">Lumi가 당신의 취향을 완벽하게 파악했어요.</p>

                        <Link href="/result" className="btn-primary inline-block">
                            결과 확인하기
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
