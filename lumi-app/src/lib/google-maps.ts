"use server";

import { rankPlacesByTaste } from "./recommendation";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function getPlacesRecommendations(keyword: string, location?: { lat: number; lng: number }) {
    if (!GOOGLE_MAPS_API_KEY) {
        console.error("GOOGLE_MAPS_API_KEY is not defined");
        return [];
    }

    try {
        const url = "https://places.googleapis.com/v1/places:searchText";

        // Helper function for the core search request
        async function performSearch(query: string, loc?: { lat: number; lng: number }) {
            console.log(`[API Call] Query: "${query}", Location:`, loc || "Global");

            const searchBody: any = {
                textQuery: query,
                languageCode: "ko",
                maxResultCount: 15,
            };

            if (loc) {
                searchBody.locationBias = {
                    circle: {
                        center: { latitude: loc.lat, longitude: loc.lng },
                        radius: 10000.0 // 10km radius
                    }
                };
            }

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY as string,
                    "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.nationalPhoneNumber,places.regularOpeningHours,places.googleMapsUri,places.photos,places.types,places.reviews,places.location"
                },
                body: JSON.stringify(searchBody),
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error(`Google API Error (${response.status}):`, errText);
                return null;
            }

            return await response.json();
        }

        // --- Step By Step Fallback Strategy ---

        // 1. Initial Search (Keyword + Local)
        let data = await performSearch(keyword, location);
        let places = data?.places || [];

        // 2. Fallback: Keyword alone (Global Search)
        if (places.length === 0 && location) {
            console.log("No local results for keyword. Retrying globally...");
            data = await performSearch(keyword, undefined);
            if (data?.places) places = data.places;
        }

        // 3. Fallback: General category + Local
        if (places.length === 0) {
            console.log("Still no results. Retrying with general category locally...");
            const generalKeyword = keyword.replace(/힙한\s*곳|힙한\s*핫플\s*맛집/g, "맛집").trim();
            data = await performSearch(generalKeyword, location);
            if (data?.places) places = data.places;
        }

        // 4. Final Fallback: General category alone
        if (places.length === 0) {
            console.log("Absolute zero. Retrying with general category globally...");
            const generalKeyword = keyword.replace(/힙한\s*곳|힙한\s*핫플\s*맛집/g, "맛집").trim();
            data = await performSearch(generalKeyword, undefined);
            if (data?.places) places = data.places;
        }

        if (places.length === 0) {
            console.warn("All fallback stages failed. No results found.");
            return [];
        }

        const results = places.map((place: any) => ({
            id: place.id,
            name: place.displayName?.text || "Unknown Place",
            category: place.types?.[0] || "Location",
            rating: place.rating || 0,
            review: place.reviews?.[0]?.text?.text || "실시간 리뷰 정보가 없습니다.",
            reviews: (place.reviews || []).map((r: any) => ({
                author: r.authorAttribution?.displayName,
                text: r.text?.text,
                rating: r.rating,
                publishTime: r.relativePublishTimeDescription
            })),
            tags: (place.types || []).slice(0, 3).map((t: string) => t.replace(/_/g, " ")),
            address: place.formattedAddress || "주소 정보 없음",
            phone: place.nationalPhoneNumber || "전화번호 정보 없음",
            hours: place.regularOpeningHours?.weekdayDescriptions?.[0] || "영업시간 정보 없음",
            mapUrl: place.googleMapsUri,
            imageUrl: place.photos?.[0]
                ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?key=${GOOGLE_MAPS_API_KEY}&maxWidthPx=800`
                : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
            location: place.location ? { lat: place.location.latitude, lng: place.location.longitude } : undefined
        }));

        return rankPlacesByTaste(results);
    } catch (error) {
        console.error("Critical error in getPlacesRecommendations:", error);
        return [];
    }
}

export async function getFollowUpRecommendation(currentPlace: any) {
    if (!GOOGLE_MAPS_API_KEY || !currentPlace.location) return null;

    // Define complementary categories
    const categories: Record<string, string> = {
        'restaurant': 'cafe',
        'food': 'cafe',
        'cafe': 'park',
        'park': 'bar',
        'tourist_attraction': 'cafe',
        'point_of_interest': 'cafe'
    };

    const targetCategory = categories[currentPlace.category] || 'cafe';
    const query = `${targetCategory} 힙한 곳`;

    const results = await getPlacesRecommendations(query, currentPlace.location);
    // Return the top-ranked complementary place (excluding the current one)
    return results.find(p => p.id !== currentPlace.id) || null;
}
