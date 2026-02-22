"use server";

import { rankPlacesByTaste, type Place } from "./recommendation";
import mockData from "../data/mock_reviews.json";

/**
 * Helper to wrap mock data with consistent structure
 */
function getMockFallback(message: string): Place[] {
    console.warn(`[Lumi Fallback] ${message}`);
    const results = (mockData as any[]).map(item => ({
        ...item,
        reviews: item.reviews || [],
        tasteScore: 10,
        lumiTip: `${message} 기분 좋은 하루 되세요! ✨`
    }));
    return rankPlacesByTaste(results);
}

export async function getPlacesRecommendations(keyword: string, location?: { lat: number; lng: number }): Promise<Place[]> {
    const API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // Stage 1: Check API Key
    if (!API_KEY) {
        return getMockFallback("환경 변수(API Key)가 설정되지 않아 샘플 데이터를 준비했어요.");
    }

    try {
        const url = "https://places.googleapis.com/v1/places:searchText";

        async function performSearch(query: string, loc?: { lat: number; lng: number }) {
            console.log(`[Lumi API] Attempting: "${query}"`, loc ? `at [${loc.lat}, ${loc.lng}]` : "(Global)");

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
                    "X-Goog-Api-Key": API_KEY as string,
                    "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.nationalPhoneNumber,places.regularOpeningHours,places.googleMapsUri,places.photos,places.types,places.reviews,places.location"
                },
                body: JSON.stringify(searchBody),
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error(`[Lumi API] Error (${response.status}):`, errText);
                return null;
            }

            const res = await response.json();
            return res.places || [];
        }

        // --- Progressive Fallback Execution ---
        let places: any[] = [];

        // 1. Primary: Keyword + Local
        places = await performSearch(keyword, location) || [];

        // 2. Fallback: Keyword Global
        if (places.length === 0 && location) {
            places = await performSearch(keyword) || [];
        }

        // 3. Fallback: Broader Category locally
        if (places.length === 0) {
            const broadKeyword = keyword.replace(/힙한\s*곳|힙한\s*핫플\s*맛집/g, "맛집").trim();
            if (broadKeyword !== keyword) {
                places = await performSearch(broadKeyword, location) || [];
            }
        }

        // 4. Fallback: Absolute defaults
        if (places.length === 0) {
            places = await performSearch("인기 맛집 카페", location) || [];
        }

        // --- Final Check & Transformation ---
        if (places.length === 0) {
            console.log(`[Lumi] No results found for "${keyword}". Triggering mock fallback.`);
            return getMockFallback(`'${keyword}'에 대한 검색 결과가 구글 지도에 없어서 Lumi의 시크릿 리스트를 특별히 준비했어요!`);
        }

        const filteredPlaces = places.slice(0, 10); // Limit to top 10 for performance

        const results = filteredPlaces.map((place: any) => ({
            id: place.id || Math.random().toString(36).substr(2, 9),
            name: place.displayName?.text || "Unknown Place",
            category: place.types?.[0] || "Location",
            rating: place.rating || 4.2, // Default rating if missing
            review: place.reviews?.[0]?.text?.text || "실시간 리뷰 정보가 없습니다.",
            reviews: (place.reviews || []).map((r: any) => ({
                author: r.authorAttribution?.displayName || "익명",
                text: r.text?.text || "",
                rating: r.rating || 5,
                publishTime: r.relativePublishTimeDescription || ""
            })),
            tags: (place.types || []).slice(0, 3).map((t: string) => t.replace(/_/g, " ")),
            address: place.formattedAddress || "주소 정보 없음",
            phone: place.nationalPhoneNumber || "전화번호 정보 없음",
            hours: place.regularOpeningHours?.weekdayDescriptions?.[0] || "영업시간 정보 없음",
            mapUrl: place.googleMapsUri || "#",
            imageUrl: place.photos?.[0]
                ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?key=${API_KEY}&maxWidthPx=800`
                : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
            location: place.location ? { lat: place.location.latitude, lng: place.location.longitude } : undefined
        }));

        console.log(`[Lumi] Successfully transformed ${results.length} places. Ranking now...`);
        return rankPlacesByTaste(results);
    } catch (error) {
        console.error("[Lumi] Critical error in search:", error);
        return getMockFallback("구글 시스템 연결이 불안정해서 Lumi가 아끼는 장소들로 대신 구성해봤어요!");
    }
}

export async function getFollowUpRecommendation(currentPlace: any) {
    const API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!API_KEY || !currentPlace.location) return null;

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

    try {
        const results = await getPlacesRecommendations(query, currentPlace.location);
        return results.find(p => p.id !== currentPlace.id) || null;
    } catch {
        return null;
    }
}
