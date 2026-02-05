"use server";

import { rankPlacesByTaste } from "./recommendation";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function getPlacesRecommendations(keyword: string, location?: { lat: number; lng: number }) {
    if (!GOOGLE_MAPS_API_KEY) {
        console.error("GOOGLE_MAPS_API_KEY is not defined");
        return [];
    }

    const url = "https://places.googleapis.com/v1/places:searchText";

    try {
        const body: any = {
            textQuery: keyword,
            languageCode: "ko",
            maxResultCount: 6,
        };

        if (location) {
            body.locationBias = {
                circle: {
                    center: {
                        latitude: location.lat,
                        longitude: location.lng
                    },
                    radius: 5000.0 // 5km search radius
                }
            };
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
                "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.nationalPhoneNumber,places.regularOpeningHours,places.googleMapsUri,places.photos,places.types,places.reviews"
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`Google Places API error: ${response.statusText}`);
        }

        const data = await response.json();

        const results = (data.places || []).map((place: any) => ({
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
                ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?key=${GOOGLE_MAPS_API_KEY}&maxWidthGb=800`
                : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800"
        }));

        return rankPlacesByTaste(results);
    } catch (error) {
        console.error("Error fetching places:", error);
        return [];
    }
}
