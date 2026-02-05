"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface Place {
    id: string;
    name: string;
    category: string;
    rating: number;
    review: string;
    tags: string[];
    address: string;
    phone: string;
    hours: string;
    mapUrl: string;
    imageUrl: string;
}

interface TravelContextType {
    recommendations: Place[];
    setRecommendations: (recommendations: Place[]) => void;
}

const TravelContext = createContext<TravelContextType | undefined>(undefined);

export function TravelProvider({ children }: { children: ReactNode }) {
    const [recommendations, setRecommendations] = useState<Place[]>([]);

    return (
        <TravelContext.Provider value={{ recommendations, setRecommendations }}>
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
