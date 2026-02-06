import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Phone, Clock, ExternalLink, Star, CheckCircle2, Award } from "lucide-react";
import { useTravel, type Place } from "../lib/TravelContext";

interface PlaceDetailModalProps {
    place: Place;
    isOpen: boolean;
    onClose: () => void;
    t: (key: string) => string;
}

export const PlaceDetailModal = ({ place, isOpen, onClose, t }: PlaceDetailModalProps) => {
    const { addPoints } = useTravel();
    const [isVisited, setIsVisited] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    if (!place) return null;

    const handleCertifyVisit = () => {
        setIsVisited(true);
        addPoints(50);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative glass w-full max-w-2xl bg-white rounded-[2rem] overflow-hidden shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors z-10"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>

                        <div className="h-64 relative overflow-hidden">
                            <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                            <div className="absolute bottom-6 left-8">
                                <div className="flex gap-2 mb-2">
                                    {place.tags.map((tag: string) => (
                                        <span key={tag} className="text-[10px] font-bold tracking-wider uppercase text-secondary bg-white/90 backdrop-blur px-2 py-0.5 rounded-full">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                                <h2 className="text-3xl font-bold">{place.name}</h2>
                            </div>
                        </div>

                        <div className="p-8 md:p-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <MapPin className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{t("result.detail.address")}</p>
                                            <p className="text-sm font-medium">{place.address}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                                            <Phone className="w-5 h-5 text-accent" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{t("result.detail.phone")}</p>
                                            <p className="text-sm font-medium">{place.phone}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                                            <Clock className="w-5 h-5 text-secondary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{t("result.detail.hours")}</p>
                                            <p className="text-sm font-medium">{place.hours}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center shrink-0">
                                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{t("result.detail.rating")}</p>
                                            <p className="text-sm font-bold text-lg">{place.rating} / 5.0</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50/50 p-6 rounded-3xl mb-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Star className="w-4 h-4 text-primary" />
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Real User Reviews</p>
                                </div>
                                <div className="space-y-6 max-h-40 overflow-y-auto pr-4 custom-scrollbar mb-6">
                                    {place.reviews && place.reviews.length > 0 ? (
                                        place.reviews.map((rev: { author: string; text: string; rating: number }, i: number) => (
                                            <div key={i} className="border-b border-black/5 last:border-0 pb-4 last:pb-0">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-bold text-gray-700">{rev.author}</span>
                                                    <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full shadow-sm">
                                                        <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                                                        <span className="text-[10px] font-bold">{rev.rating}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-500 leading-relaxed italic">
                                                    &quot;{rev.text}&quot;
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-400 italic text-center py-4">표시할 리뷰가 없습니다.</p>
                                    )}
                                </div>

                                {/* Lumi's Personalized Tip */}
                                {place.lumiTip && (
                                    <div className="relative mt-8 pt-8 border-t border-black/5 flex items-start gap-6">
                                        <div className="w-20 shrink-0">
                                            <img src="/lumi_avatar.png" alt="Lumi" className="w-full h-auto drop-shadow-md" onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                                // Fallback if avatar doesn't exist yet
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }} />
                                        </div>
                                        <div className="flex-1 bg-primary/10 border border-primary/20 p-5 rounded-2xl rounded-tl-none relative animate-in fade-in slide-in-from-left-4 duration-500">
                                            <div className="absolute -left-3 top-0 border-[12px] border-transparent border-t-primary/10 border-r-primary/10" />
                                            <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider flex items-center gap-1">
                                                <Star className="w-3 h-3" /> Lumi&apos;s Special Tip
                                            </p>
                                            <p className="text-sm font-medium text-primary/80 leading-relaxed">
                                                {place.lumiTip}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Visit Certification Section */}
                            <div className="mb-8 p-6 bg-secondary/5 rounded-3xl border border-secondary/10 relative overflow-hidden">
                                {showSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute inset-0 bg-secondary flex items-center justify-center z-10"
                                    >
                                        <div className="text-center text-white">
                                            <Award className="w-8 h-8 mx-auto mb-2" />
                                            <p className="font-bold">+50 Lumi Points 적립!</p>
                                        </div>
                                    </motion.div>
                                )}

                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Award className="w-5 h-5 text-secondary" />
                                        <p className="text-sm font-bold">방문 인증하고 포인트 받기</p>
                                    </div>
                                    <span className="text-[10px] font-black bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">+50 PTS</span>
                                </div>

                                <button
                                    onClick={handleCertifyVisit}
                                    disabled={isVisited}
                                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${isVisited
                                        ? "bg-gray-100 text-gray-400"
                                        : "bg-secondary text-white shadow-lg shadow-secondary/20 hover:scale-[1.02]"
                                        }`}
                                >
                                    {isVisited ? (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" />
                                            방문 인증 완료
                                        </>
                                    ) : (
                                        "이 장소 방문했어요!"
                                    )}
                                </button>
                                <p className="text-[10px] text-gray-400 mt-3 text-center">방문 완료 후 Lumi에게 후기를 들려주시면 추가 포인트가 지급됩니다.</p>
                            </div>

                            <a
                                href={place.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary w-full flex items-center justify-center gap-2 py-5 text-base shadow-lg shadow-primary/20"
                            >
                                {t("result.detail.view_map")}
                                <ExternalLink className="w-5 h-5" />
                            </a>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
