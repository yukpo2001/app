"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import diagnosticFlow from "@/data/diagnostic_flow.json";

export default function DiagnosePage() {
    const router = useRouter();
    const [currentId, setCurrentId] = useState("q1");
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [history, setHistory] = useState<string[]>([]);

    const currentQuestion = diagnosticFlow.find((q) => q.id === currentId);

    const handleSelect = (value: string, nextId: string | null) => {
        const newAnswers = { ...answers, [currentId]: value };
        setAnswers(newAnswers);

        if (nextId) {
            setHistory([...history, currentId]);
            setCurrentId(nextId);
        } else {
            // 진단 완료 - 결과 페이지로 이동 (로컬 스트리지에 저장하거나 쿼리로 전달)
            localStorage.setItem("diagnostic_result", JSON.stringify(newAnswers));
            router.push("/result");
        }
    };

    const handleBack = () => {
        if (history.length > 0) {
            const prevId = history[history.length - 1];
            setHistory(history.slice(0, -1));
            setCurrentId(prevId);
        } else {
            router.push("/");
        }
    };

    if (!currentQuestion) return null;

    const progress = (diagnosticFlow.indexOf(currentQuestion) / diagnosticFlow.length) * 100;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative bg-[#050505]">
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-white/5">
                <motion.div
                    className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                />
            </div>

            <div className="max-w-2xl w-full">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-12 group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    이전 단계로
                </button>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="glass-card p-10 border-white/10"
                    >
                        <span className="text-blue-400 font-mono mb-4 block">Question {history.length + 1}</span>
                        <h2 className="text-3xl font-bold mb-10 leading-tight">
                            {currentQuestion.title}
                        </h2>

                        <div className="space-y-4">
                            {currentQuestion.options.map((option: any) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleSelect(option.value, option.next)}
                                    className="w-full p-6 text-left rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all flex items-center justify-between group"
                                >
                                    <span className="text-lg text-gray-300 group-hover:text-white">{option.label}</span>
                                    <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center group-hover:border-blue-400 group-hover:bg-blue-400/10 transition-all">
                                        <CheckCircle2 className="w-4 h-4 text-transparent group-hover:text-blue-400" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
