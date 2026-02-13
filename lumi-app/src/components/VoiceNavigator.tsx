"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useTravel, Place } from "../lib/TravelContext";
import { Volume2, VolumeX, Navigation } from "lucide-react";

interface VoiceNavigatorProps {
    lang: "ko" | "en";
}

export const VoiceNavigator = ({ lang }: VoiceNavigatorProps) => {
    const { itinerary } = useTravel();
    const [isActive, setIsActive] = useState(false);
    const [currentPos, setCurrentPos] = useState<google.maps.LatLngLiteral | null>(null);
    const [nextPlace, setNextPlace] = useState<Place | null>(null);
    const [lastSpokenId, setLastSpokenId] = useState<string | null>(null);

    // Haversine formula for distance in meters
    const getDistance = (p1: google.maps.LatLngLiteral, p2: google.maps.LatLngLiteral) => {
        const R = 6371e3; // Earth radius in meters
        const φ1 = p1.lat * Math.PI / 180;
        const φ2 = p2.lat * Math.PI / 180;
        const Δφ = (p2.lat - p1.lat) * Math.PI / 180;
        const Δλ = (p2.lng - p1.lng) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    const speak = useCallback((text: string) => {
        if (!window.speechSynthesis) return;

        // Stop any current speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === "ko" ? "ko-KR" : "en-US";
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
    }, [lang]);

    useEffect(() => {
        if (!isActive) return;

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const userLoc = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setCurrentPos(userLoc);

                // Find the nearest upcoming destination from the itinerary
                // For simplicity, we assume the itinerary is ordered 1 to N
                // and we look for the first place that hasn't been "reached" yet
                // Here we just find the closest one for demo purposes
                if (itinerary.length > 0) {
                    let closest: Place | null = null;
                    let minDist = Infinity;

                    itinerary.forEach(place => {
                        if (place.location) {
                            const d = getDistance(userLoc, place.location);
                            if (d < minDist) {
                                minDist = d;
                                closest = place;
                            }
                        }
                    });

                    setNextPlace(closest);

                    // Voice trigger: if within 50 meters and not spoken yet
                    if (closest && minDist < 50 && lastSpokenId !== (closest as Place).id) {
                        const message = lang === "ko"
                            ? `${(closest as Place).name}에 거의 도착했습니다.`
                            : `You are almost at ${(closest as Place).name}.`;
                        speak(message);
                        setLastSpokenId((closest as Place).id);
                    }
                }
            },
            (err) => console.error("Geolocation error", err),
            { enableHighAccuracy: true }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [isActive, itinerary, lang, speak, lastSpokenId]);

    const toggleVoice = () => {
        const nextState = !isActive;
        setIsActive(nextState);

        if (nextState) {
            const msg = lang === "ko" ? "음성 안내를 시작합니다." : "Starting voice guidance.";
            speak(msg);
        } else {
            window.speechSynthesis.cancel();
        }
    };

    return (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-3">
            {isActive && nextPlace && (
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                        <Navigation className="w-4 h-4 text-primary animate-pulse" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Next Stop</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800 truncate">{nextPlace.name}</p>
                    {currentPos && nextPlace.location && (
                        <p className="text-[10px] text-primary font-medium mt-1">
                            {Math.round(getDistance(currentPos, nextPlace.location))}m away
                        </p>
                    )}
                </div>
            )}

            <button
                onClick={toggleVoice}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${isActive
                        ? "bg-primary text-white scale-110 rotate-3 ring-4 ring-primary/20"
                        : "bg-white text-gray-400 hover:text-primary hover:scale-105"
                    }`}
            >
                {isActive ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
        </div>
    );
};
