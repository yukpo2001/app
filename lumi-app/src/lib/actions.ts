"use server";

import { getPlacesRecommendations as getRecommendations } from "./google-maps";

export async function getPlacesRecommendationsAction(keyword: string, location?: { lat: number; lng: number }) {
    console.log(`[Lumi Server Action] Searching for: ${keyword} at ${location ? JSON.stringify(location) : "default"}`);

    try {
        const results = await getRecommendations(keyword, location);

        // Results are already ranked in google-maps.ts or we can rank them again here if needed
        // Since google-maps.ts returns ranked results (or mock data), we just return it
        return results;
    } catch (error) {
        console.error("[Lumi Server Action] Failed to fetch recommendations:", error);
        return [];
    }
}

export async function getGoogleMapsApiKey() {
    return process.env.GOOGLE_MAPS_API_KEY || "";
}
