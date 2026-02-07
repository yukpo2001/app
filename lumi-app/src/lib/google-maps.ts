"use server";

import { rankPlacesByTaste } from "./recommendation";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function getPlacesRecommendations(keyword: string, location?: { lat: number; lng: number }) {
    if (!GOOGLE_MAPS_API_KEY) {
        console.error("GOOGLE_MAPS_API_KEY is not defined");
        return [];
    }

    const url = "https://places.googleapis.com/v1/places:searchText";
    console.log(`Searching for: "${keyword}" at`, location || "global");

    try {
        const body: {
            textQuery: string;
            languageCode: string;
            maxResultCount: number;
            locationBias?: {
                circle: {
                    center: {
                        latitude: number;
                        longitude: number;
                    };
                    radius: number;
                };
            };
        } = {
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
                    radius: 10000.0 // 10km search radius for better mobile coverage
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
        let places = data.places || [];

        // Fallback: If no results, try a more general search without "hip" keywords
        if (places.length === 0 && keyword.includes("힙한")) {
            console.log("No results found for hip keywords, trying general fallback...");
            const fallbackKeyword = keyword.replace(/힙한\s*곳|힙한\s*핫플\s*맛집/g, "맛집").trim();
            const fallbackBody = { ...body, textQuery: fallbackKeyword };
            const fallbackResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
                    "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.nationalPhoneNumber,places.regularOpeningHours,places.googleMapsUri,places.photos,places.types,places.reviews"
                },
                body: JSON.stringify(fallbackBody),
            });
            if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json();
                places = fallbackData.places || [];
            }
        }

        const results = places.map((place: {
            id: string;
            displayName?: { text: string };
            types?: string[];
            rating?: number;
            reviews?: Array<{
                authorAttribution?: { displayName: string };
                text?: { text: string };
                rating: number;
                relativePublishTimeDescription: string;
            }>;
            formattedAddress?: string;
            nationalPhoneNumber?: string;
            regularOpeningHours?: { weekdayDescriptions: string[] };
            googleMapsUri: string;
            photos?: Array<{ name: string }>;
        }) => ({
            id: place.id,
            name: place.displayName?.text || "Unknown Place",
            category: place.types?.[0] || "Location",
            rating: place.rating || 0,
            review: place.reviews?.[0]?.text?.text || "실시간 리뷰 정보가 없습니다.",
            reviews: (place.reviews || []).map((r: {
                authorAttribution?: { displayName: string };
                text?: { text: string };
                rating: number;
                relativePublishTimeDescription: string;
            }) => ({
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
                : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800"
        }));

        return rankPlacesByTaste(results);
    } catch (error) {
        console.error("Error fetching places:", error);
        return [];
    }
}
