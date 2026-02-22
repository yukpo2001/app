"use client";

import React, { useEffect, useRef, useState } from "react";
import { type Place } from "../lib/TravelContext";

interface MapViewProps {
    places: Place[];
    apiKey?: string;
}

declare global {
    interface Window {
        google: any;
        initLumiMap: () => void;
        gm_authFailure: () => void;
    }
}

export const MapView = ({ places, apiKey: propApiKey }: MapViewProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapError, setMapError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // API 키 결정: prop > 환경변수
    const apiKey = propApiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    useEffect(() => {
        if (!apiKey) {
            setMapError("API 키가 없습니다.");
            setIsLoading(false);
            return;
        }
        if (!places || places.length === 0) {
            setIsLoading(false);
            return;
        }

        // Google Maps 인증 실패 핸들러
        window.gm_authFailure = () => {
            console.error("[Lumi] Google Maps Auth Failure.");
            setMapError("Google Maps 인증 실패: API 키 또는 결제 계정을 확인하세요.");
            setIsLoading(false);
        };

        const initMap = () => {
            if (!mapRef.current || !window.google) return;

            try {
                const google = window.google;

                const center = places[0]?.location
                    ? { lat: places[0].location.lat, lng: places[0].location.lng }
                    : { lat: 37.5665, lng: 126.9780 };

                const map = new google.maps.Map(mapRef.current, {
                    center,
                    zoom: 14,
                    disableDefaultUI: true,
                    zoomControl: true,
                    mapTypeControl: false,
                    styles: [
                        { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
                        { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9d3e0" }] },
                        { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
                        { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5f5e0" }] },
                    ],
                });

                const bounds = new google.maps.LatLngBounds();
                const pathCoords: { lat: number; lng: number }[] = [];

                places.forEach((place, index) => {
                    if (!place.location) return;

                    const position = { lat: place.location.lat, lng: place.location.lng };
                    bounds.extend(position);
                    pathCoords.push(position);

                    // 커스텀 마커 (번호 표시)
                    const marker = new google.maps.Marker({
                        position,
                        map,
                        label: {
                            text: (index + 1).toString(),
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "13px",
                        },
                        title: place.name,
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            fillColor: "#6366f1",
                            fillOpacity: 1,
                            strokeWeight: 2.5,
                            strokeColor: "#ffffff",
                            scale: 16,
                        },
                    });

                    const infoWindow = new google.maps.InfoWindow({
                        content: `<div style="padding:10px;color:#1e293b;min-width:120px;">
                            <p style="font-weight:bold;margin-bottom:4px;font-size:14px;">${place.name}</p>
                            <p style="font-size:11px;color:#64748b;">${place.category || ""}</p>
                        </div>`,
                    });

                    marker.addListener("click", () => {
                        infoWindow.open(map, marker);
                    });
                });

                // 동선 라인
                if (pathCoords.length > 1) {
                    new google.maps.Polyline({
                        path: pathCoords,
                        geodesic: true,
                        strokeColor: "#6366f1",
                        strokeOpacity: 0.85,
                        strokeWeight: 3,
                        map,
                    });
                }

                if (!bounds.isEmpty()) {
                    map.fitBounds(bounds);
                    // 너무 과도하게 줌인 되지 않도록
                    const listener = google.maps.event.addListener(map, "idle", () => {
                        if (map.getZoom() > 16) map.setZoom(16);
                        google.maps.event.removeListener(listener);
                    });
                }

                setIsLoading(false);
                setMapError(null);
            } catch (err) {
                console.error("[Lumi MapView] Error initializing map:", err);
                setMapError("지도를 불러오는 중 오류가 발생했습니다.");
                setIsLoading(false);
            }
        };

        // 이미 Google Maps 스크립트가 로드된 경우
        if (window.google && window.google.maps) {
            initMap();
            return;
        }

        // 이미 스크립트 태그가 추가된 경우 (중복 방지)
        const existingScript = document.getElementById("google-maps-script");
        if (existingScript) {
            // 스크립트가 로드 완료되길 기다림
            const checkReady = setInterval(() => {
                if (window.google && window.google.maps) {
                    clearInterval(checkReady);
                    initMap();
                }
            }, 100);
            setTimeout(() => clearInterval(checkReady), 10000);
            return;
        }

        // 새로운 script 태그로 Google Maps 로드
        window.initLumiMap = initMap;

        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initLumiMap&language=ko`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
            setMapError("Google Maps 스크립트 로드 실패. 네트워크 또는 API 키를 확인하세요.");
            setIsLoading(false);
        };
        document.head.appendChild(script);

        return () => {
            window.gm_authFailure = () => {};
        };
    }, [apiKey, places]);

    // API 키 없음
    if (!apiKey) {
        return (
            <div className="w-full h-64 bg-red-50 border-2 border-dashed border-red-200 rounded-[2rem] flex flex-col items-center justify-center text-red-400 p-8 text-center">
                <p className="font-bold mb-2">Google Maps API 키 누락</p>
                <p className="text-xs">환경 변수 설정을 확인해 주세요.</p>
            </div>
        );
    }

    // 장소 없음
    if (!places || places.length === 0) {
        return (
            <div className="w-full h-64 bg-gray-100 rounded-[2rem] flex items-center justify-center text-gray-400 italic">
                장소를 추가하면 지도가 표시됩니다.
            </div>
        );
    }

    return (
        <div className="w-full h-80 md:h-[450px] rounded-[2.5rem] overflow-hidden shadow-xl border border-white/20 mb-10 relative">
            {/* 로딩 표시 */}
            {isLoading && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10 rounded-[2.5rem]">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-500 font-medium">지도 불러오는 중...</p>
                    </div>
                </div>
            )}
            {/* 에러 표시 */}
            {mapError && (
                <div className="absolute inset-0 bg-red-50 flex flex-col items-center justify-center z-10 rounded-[2.5rem] p-6 text-center">
                    <p className="font-bold text-red-500 mb-2">지도 로드 실패</p>
                    <p className="text-xs text-red-400">{mapError}</p>
                </div>
            )}
            <div ref={mapRef} className="w-full h-full" />
            {!isLoading && !mapError && (
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg text-xs font-bold text-primary flex items-center gap-2 z-10">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    Lumi 최적 동선 시뮬레이션
                </div>
            )}
        </div>
    );
};
