"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Check } from "lucide-react";
import diagnosticFlow from "@/data/biz_science_flow.json";

export default function DiagnosePage() {
    const router = useRouter();
    const [currentId, setCurrentId] = useState("biz_industry");
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [history, setHistory] = useState<string[]>([]);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

    const currentQuestion = diagnosticFlow.find((q) => q.id === currentId);

    const handleSingleSelect = (value: string, nextId: string | null) => {
        const newAnswers = { ...answers, [currentId]: value };
        setAnswers(newAnswers);

        if (nextId) {
            setHistory([...history, currentId]);
            setCurrentId(nextId);
            setSelectedOptions([]);
        } else {
            localStorage.setItem("biz_science_result", JSON.stringify(newAnswers));
            router.push("/result");
        }
    };

    const toggleOption = (value: string) => {
        if (selectedOptions.includes(value)) {
            setSelectedOptions(selectedOptions.filter(v => v !== value));
        } else {
            if (currentQuestion?.maxSelections && selectedOptions.length >= currentQuestion.maxSelections) {
                return;
            }
            setSelectedOptions([...selectedOptions, value]);
        }
    };

    const handleNext = () => {
        if (selectedOptions.length === 0) return;

        const newAnswers = { ...answers, [currentId]: selectedOptions };
        setAnswers(newAnswers);

        const nextId = (currentQuestion?.options[0] as any)?.next || null;

        if (nextId) {
            setHistory([...history, currentId]);
            setCurrentId(nextId);
            setSelectedOptions([]);
        } else {
            localStorage.setItem("biz_science_result", JSON.stringify(newAnswers));
            router.push("/result");
        }
    };

    const handleBack = () => {
        if (history.length > 0) {
            const prevId = history[history.length - 1];
            setHistory(history.slice(0, -1));
            setCurrentId(prevId);
            setSelectedOptions(answers[prevId] ? (Array.isArray(answers[prevId]) ? answers[prevId] : []) : []);
        } else {
            router.push("/");
        }
    };

    if (!currentQuestion) return null;

    const progress = (diagnosticFlow.indexOf(currentQuestion) / diagnosticFlow.length) * 100;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative bg-[#050505]">
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
                        <h2 className="text-3xl font-bold mb-10 leading-tight whitespace-pre-wrap">
                            {currentQuestion.title}
                        </h2>

                        <div className="space-y-4">
                            {currentQuestion.options.map((option: any) => {
                                const isSelected = currentQuestion.type === "multiple_choice"
                                    ? selectedOptions.includes(option.value)
                                    : answers[currentId] === option.value;

                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            if (currentQuestion.type === "multiple_choice") {
                                                toggleOption(option.value);
                                            } else {
                                                handleSingleSelect(option.value, option.next);
                                            }
                                        }}
                                        className={`w-full p-6 text-left rounded-2xl border transition-all flex items-center justify-between group ${isSelected
                                                ? "border-blue-500 bg-blue-500/10"
                                                : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20"
                                            }`}
                                    >
                                        <span className={`text-lg transition-colors ${isSelected ? "text-white" : "text-gray-300 group-hover:text-white"}`}>
                                            {option.label}
                                        </span>
                                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${isSelected
                                                ? "border-blue-400 bg-blue-400"
                                                : "border-white/10 group-hover:border-blue-400 group-hover:bg-blue-400/10"
                                            }`}>
                                            {currentQuestion.type === "multiple_choice" ? (
                                                <Check className={`w-4 h-4 transition-colors ${isSelected ? "text-black" : "text-transparent group-hover:text-blue-400"}`} />
                                            ) : (
                                                <CheckCircle2 className={`w-4 h-4 transition-colors ${isSelected ? "text-black" : "text-transparent group-hover:text-blue-400"}`} />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {currentQuestion.type === "multiple_choice" && (
                            <button
                                onClick={handleNext}
                                disabled={selectedOptions.length === 0}
                                className="w-full mt-10 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-900/20"
                            >
                                다음 단계로 ({selectedOptions.length}/{currentQuestion.maxSelections})
                            </button>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

