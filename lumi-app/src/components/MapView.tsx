"use client";

import React from "react";
import { type Place } from "../lib/TravelContext";

interface MapViewProps {
    places: Place[];
}

export const MapView = ({ places }: MapViewProps) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return (
            <div className="w-full h-64 bg-red-50 border-2 border-dashed border-red-200 rounded-[2rem] flex flex-col items-center justify-center text-red-400 p-8 text-center">
                <p className="font-bold mb-2">Google Maps API 키를 찾을 수 없습니다.</p>
                <p className="text-xs">.env.local 파일에 NEXT_PUBLIC_GOOGLE_MAPS_API_KEY가 설정되어 있는지 확인해 주세요.</p>
            </div>
        );
    }

    if (!places || places.length === 0) {
        return (
            <div className="w-full h-64 bg-gray-100 rounded-[2rem] flex items-center justify-center text-gray-400 italic">
                장소를 추가하면 지도가 표시됩니다.
            </div>
        );
    }

    // Helper to get location string (prioritizes lat,lng coordinates over address)
    const getLocString = (p: Place) => {
        if (p.location && p.location.lat && p.location.lng) {
            return `${p.location.lat},${p.location.lng}`;
        }
        return p.address;
    };

    // Google Maps Embed API - Directions Mode
    const origin = encodeURIComponent(getLocString(places[0]));
    const destination = encodeURIComponent(getLocString(places[places.length - 1]));

    let waypoints = "";
    if (places.length > 2) {
        waypoints = places
            .slice(1, -1)
            .map(p => encodeURIComponent(getLocString(p)))
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
