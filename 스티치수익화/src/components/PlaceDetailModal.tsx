"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Phone, Clock, ExternalLink, Star } from "lucide-react";

interface PlaceDetailModalProps {
    place: any;
    isOpen: boolean;
    onClose: () => void;
    t: (key: string) => string;
}

export const PlaceDetailModal = ({ place, isOpen, onClose, t }: PlaceDetailModalProps) => {
    if (!place) return null;

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
                                <div className="space-y-6 max-h-60 overflow-y-auto pr-4 custom-scrollbar">
                                    {place.reviews && place.reviews.length > 0 ? (
                                        place.reviews.map((rev: any, i: number) => (
                                            <div key={i} className="border-b border-black/5 last:border-0 pb-4 last:pb-0">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-bold text-gray-700">{rev.author}</span>
                                                    <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full shadow-sm">
                                                        <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                                                        <span className="text-[10px] font-bold">{rev.rating}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-500 leading-relaxed italic">
                                                    "{rev.text}"
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-400 italic text-center py-4">표시할 리뷰가 없습니다.</p>
                                    )}
                                </div>
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
