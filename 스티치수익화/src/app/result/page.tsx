"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { useTravel } from "@/lib/TravelContext";
import { Star, MapPin, ExternalLink, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { PlaceDetailModal } from "@/components/PlaceDetailModal";

export default function ResultPage() {
    const { t } = useLanguage();
    const { recommendations } = useTravel();
    const [selectedPlace, setSelectedPlace] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openDetail = (place: any) => {
        setSelectedPlace(place);
        setIsModalOpen(true);
    };

    return (
        <main className="min-h-screen py-20 px-4 max-w-6xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-12 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                {t("result.back")}
            </Link>

            <div className="mb-16">
                <h1 className="gradient-text mb-4">{t("result.title")}</h1>
                <p className="text-xl text-gray-500">{t("result.subtitle")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendations.length === 0 ? (
                    <div className="col-span-full py-20 text-center glass rounded-[2.5rem]">
                        <p className="text-gray-500 mb-6">추천 결과가 없습니다. 다시 시도해 주세요.</p>
                        <Link href="/diagnose" className="btn-secondary">이전으로 돌아가기</Link>
                    </div>
                ) : (
                    recommendations.map((item: any, idx: number) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => openDetail(item)}
                            className="glass rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all group cursor-pointer"
                        >
                            <div className="h-48 bg-gray-200 relative overflow-hidden">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur pb-1 px-3 rounded-full flex items-center gap-1 shadow-sm">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    <span className="text-xs font-bold">{item.rating}</span>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="flex gap-2 mb-4">
                                    {item.tags.map((tag: string) => (
                                        <span key={tag} className="text-[10px] font-bold tracking-wider uppercase text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{item.name}</h3>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <MapPin className="w-3 h-3 text-primary" />
                                        {item.address.split(" ").slice(0, 2).join(" ")}...
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock className="w-3 h-3 text-secondary" />
                                        {item.hours.split(",")[0]}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                                    <span className="text-xs font-bold text-primary group-hover:underline">{t("result.detail.more_info")}</span>
                                    <button className="text-primary p-2 bg-primary/5 hover:bg-primary/10 rounded-full transition-all">
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <PlaceDetailModal
                place={selectedPlace}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                t={t}
            />
        </main>
    );
}
