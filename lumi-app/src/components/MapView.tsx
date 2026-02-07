"use client";

import React from "react";
import { type Place } from "../lib/TravelContext";

interface MapViewProps {
    places: Place[];
}

export const MapView = ({ places }: MapViewProps) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!places || places.length === 0) {
        return (
            <div className="w-full h-64 bg-gray-100 rounded-[2rem] flex items-center justify-center text-gray-400 italic">
                장소를 추가하면 지도가 표시됩니다.
            </div>
        );
    }

    // Google Maps Embed API - Directions Mode
    // origin: first place, destination: last place, waypoints: intermediate places
    const origin = encodeURIComponent(places[0].address);
    const destination = encodeURIComponent(places[places.length - 1].address);

    let waypoints = "";
    if (places.length > 2) {
        waypoints = places
            .slice(1, -1)
            .map(p => encodeURIComponent(p.address))
            .join("|");
    }

    const mapUrl = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ""}&mode=driving`;

    return (
        <div className="w-full h-80 md:h-96 rounded-[2.5rem] overflow-hidden shadow-inner border border-gray-100 mb-10 relative">
            <iframe
                title="Google Maps Route"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={mapUrl}
                allowFullScreen
            />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm text-xs font-bold text-primary flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Lumi 최적 동선 시뮬레이션
            </div>
        </div>
    );
};
