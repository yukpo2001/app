"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface Place {
    id: string;
    name: string;
    category: string;
    rating: number;
    review: string;
    reviews: Array<{ author: string; text: string; rating: number }>;
    tags: string[];
    address: string;
    phone: string;
    hours: string;
    mapUrl: string;
    imageUrl: string;
    tasteScore?: number;
    lumiTip?: string;
}

interface TravelContextType {
    recommendations: Place[];
    setRecommendations: (recommendations: Place[]) => void;
    itinerary: Place[];
    setItinerary: (itinerary: Place[]) => void;
    addToItinerary: (place: Place) => void;
    removeFromItinerary: (id: string) => void;
    points: number;
    addPoints: (amount: number) => void;
    shareLink: () => string;
}

const TravelContext = createContext<TravelContextType | undefined>(undefined);

export function TravelProvider({ children }: { children: ReactNode }) {
    const [recommendations, setRecommendations] = useState<Place[]>([]);
    const [itinerary, setItinerary] = useState<Place[]>([]);
    const [points, setPoints] = useState(0);

    // Load from URL on mount
    useEffect(() => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            try {
                const data = JSON.parse(decodeURIComponent(hash));
                if (Array.isArray(data)) {
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setItinerary(data);
                }
            } catch (e) {
                console.error("Failed to parse shared itinerary", e);
            }
        }
    }, []);

    const addToItinerary = (place: Place) => {
        if (!itinerary.find(p => p.id === place.id)) {
            setItinerary([...itinerary, place]);
        }
    };

    const removeFromItinerary = (id: string) => {
        setItinerary(itinerary.filter(p => p.id !== id));
    };

    const addPoints = (amount: number) => {
        setPoints(prev => prev + amount);
    };

    const shareLink = () => {
        const data = JSON.stringify(itinerary);
        const url = `${window.location.origin}${window.location.pathname}#${encodeURIComponent(data)}`;
        return url;
    };

    return (
        <TravelContext.Provider value={{
            recommendations,
            setRecommendations,
            itinerary,
            setItinerary,
            addToItinerary,
            removeFromItinerary,
            points,
            addPoints,
            shareLink
        }}>
            {children}
        </TravelContext.Provider>
    );
}

export function useTravel() {
    const context = useContext(TravelContext);
    if (context === undefined) {
        throw new Error("useTravel must be used within a TravelProvider");
    }
    return context;
}
