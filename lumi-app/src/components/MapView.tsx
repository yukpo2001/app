"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { type Place } from "../lib/TravelContext";

interface MapViewProps {
    places: Place[];
}

export const MapView = ({ places }: MapViewProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    useEffect(() => {
        if (!apiKey || !mapRef.current || !places || places.length === 0) return;

        const loader = new Loader({
            apiKey: apiKey,
            version: "weekly",
            libraries: ["places"]
        });

        loader.load().then(() => {
            if (!mapRef.current) return;

            const center = places[0].location
                ? { lat: places[0].location.lat, lng: places[0].location.lng }
                : { lat: 37.5665, lng: 126.9780 }; // Default Seoul

            const newMap = new google.maps.Map(mapRef.current, {
                center: center,
                zoom: 14,
                mapId: "LUMI_MAP_ID", // For premium styling if needed
                disableDefaultUI: true,
                zoomControl: true,
                styles: [
                    {
                        "featureType": "all",
                        "elementType": "labels.text.fill",
                        "stylers": [{ "color": "#7c93a3" }, { "lightness": "-10" }]
                    },
                    {
                        "featureType": "administrative.country",
                        "elementType": "geometry",
                        "stylers": [{ "visibility": "simplified" }, { "hue": "#ff0000" }]
                    }
                    // Simplified for brevity, can add more premium styles
                ]
            });

            setMap(newMap);

            const bounds = new google.maps.LatLngBounds();
            const pathCoords: google.maps.LatLngLiteral[] = [];

            places.forEach((place, index) => {
                const position = place.location 
                    ? { lat: place.location.lat, lng: place.location.lng } 
                    : null;
                
                if (position) {
                    bounds.extend(position);
                    pathCoords.push(position);

                    // Custom Marker with sequence number
                    const marker = new google.maps.Marker({
                        position: position,
                        map: newMap,
                        label: {
                            text: (index + 1).toString(),
                            color: "white",
                            fontWeight: "bold"
                        },
                        title: place.name,
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            fillColor: "#6366f1", // primary color
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: "#ffffff",
                            scale: 15,
                        }
                    });

                    const infoWindow = new google.maps.InfoWindow({
                        content: `<div style="padding: 8px; color: #1e293b;"><p style="font-weight: bold; margin-bottom: 4px;">${place.name}</p><p style="font-size: 11px;">${place.category}</p></div>`
                    });

                    marker.addListener("click", () => {
                        infoWindow.open(newMap, marker);
                    });
                }
            });

            // Draw Polyline (Connecting Path)
            if (pathCoords.length > 1) {
                new google.maps.Polyline({
                    path: pathCoords,
                    geodesic: true,
                    strokeColor: "#6366f1",
                    strokeOpacity: 0.8,
                    strokeWeight: 3,
                    map: newMap,
                });
            }

            if (!bounds.isEmpty()) {
                newMap.fitBounds(bounds);
            }
        });
    }, [apiKey, places]);

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

    return (
        <div className="w-full h-80 md:h-[450px] rounded-[2.5rem] overflow-hidden shadow-xl border border-white/20 mb-10 relative">
            <div ref={mapRef} className="w-full h-full" />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg text-xs font-bold text-primary flex items-center gap-2 z-10">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Lumi 최적 동선 시뮬레이션
            </div>
        </div>
    );
};
