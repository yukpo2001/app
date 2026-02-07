"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Trash2, Sparkles, Navigation, Loader2, Map as MapIcon } from "lucide-react";
import { useTravel, type Place } from "../lib/TravelContext";
import { optimizeRoute } from "../lib/recommendation";
import { MapView } from "./MapView";

export const ItineraryView = ({ onClose }: { onClose: () => void }) => {
    const { itinerary, removeFromItinerary, setItinerary, shareLink } = useTravel();
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [weather, setWeather] = useState("Sunny");

    const handleOptimize = async () => {
        setIsOptimizing(true);
        // Simulate real-time weather/congestion check
        const weatherTypes = ["Sunny", "Rain", "Clouds"];
        const detectedWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        setWeather(detectedWeather);

        setTimeout(() => {
            const optimized = optimizeRoute(itinerary, detectedWeather);
            setItinerary(optimized);
            setIsOptimizing(false);
        }, 1500);
    };

    // Sort itinerary logic: simple sort by category (Food -> Activity -> Rest/Cafe)
    // We use the itinerary directly now since it will be optimized/sorted by our logic
    const displayItinerary = itinerary;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-6 md:p-8 rounded-[3rem] w-full"
        >
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <Navigation className="w-8 h-8 text-primary" />
                        Lumi의 추천 동선
                    </h2>
                    <div className="flex items-center gap-2">
                        <p className="text-gray-500 italic">카테고리와 날씨({weather})를 고려한 최적 코스입니다. ✨</p>
                        <button
                            onClick={handleOptimize}
                            disabled={isOptimizing}
                            className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-primary/20 transition-all ml-4"
                        >
                            {isOptimizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            실시간 동선 재조정
                        </button>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            const link = shareLink();
                            navigator.clipboard.writeText(link);
                            alert("공유 링크가 클립보드에 복사되었습니다! 친구에게 보내보세요. 🔗");
                        }}
                        className="btn-secondary px-6 flex items-center gap-2"
                    >
                        <Sparkles className="w-4 h-4" />
                        친구와 공유하기
                    </button>
                    <button onClick={onClose} className="btn-secondary px-6">돌아가기</button>
                </div>
            </div>

            <MapView places={displayItinerary} />

            {itinerary.length === 0 ? (
                <div className="py-20 text-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 mb-4 text-lg">아직 담긴 장소가 없습니다.</p>
                    <p className="text-sm text-gray-400">마음에 드는 장소를 일정에 추가해 보세요!</p>
                </div>
            ) : (
                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:via-secondary/20 before:to-accent/20">
                    {displayItinerary.map((item: Place, idx: number) => (
                        <div key={item.id} className="relative flex items-center gap-8 pl-10">
                            {/* Dot */}
                            <div className="absolute left-0 w-10 h-10 rounded-full bg-white border-4 border-primary shadow-lg flex items-center justify-center z-10">
                                <span className="text-xs font-black text-primary">{idx + 1}</span>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex-1 bg-white/60 p-6 rounded-[2rem] border border-gray-100 flex gap-6 hover:shadow-xl transition-all"
                            >
                                <img src={item.imageUrl} alt={item.name} className="w-24 h-24 rounded-2xl object-cover" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1 block">{item.category}</span>
                                            <h3 className="font-bold text-lg">{item.name}</h3>
                                        </div>
                                        <button
                                            onClick={() => removeFromItinerary(item.id)}
                                            className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-primary" />
                                            {item.address.split(" ").slice(0, 2).join(" ")}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-secondary" />
                                            추천 방문시간: {idx === 0 ? "오전 11:30" : idx === 1 ? "오후 1:30" : "오후 3:00"}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    ))}

                    <div className="pt-10 flex justify-center">
                        <button className="btn-primary flex items-center gap-2 px-10 py-5 text-lg">
                            <Sparkles className="w-6 h-6" />
                            이 일정대로 확정하기
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};
