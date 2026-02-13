---
name: google_maps
description: Comprehensive guidelines for Google Maps API integration, including Embed, JavaScript, and Places APIs.
namespace: skillssmp.library.maps
version: 1.0.0
---

# Google Maps Integration Skill (SkillsSMP)

This skill provides the standard for integrating Google Maps across **Antigravity** projects, ensuring a consistent and high-quality location-based experience.

## CORE PRINCIPLES

1.  **API Selection:**
    *   Use **Google Maps Embed API (Directions Mode)** for static route displays (e.g., in `MapView.tsx`).
    *   Use **Google Maps JavaScript API** for interactive features requiring real-time updates or complex overlays.
    *   Use **Google Places API** for location search, auto-complete, and fetching verified spot details.

2.  **Environment Configuration:**
    *   Always use `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` for client-side API calls.
    *   Ensure the API key is properly restricted in the Google Cloud Console (HTTP referrers, API restrictions).

3.  **Visual Standards:**
    *   Maps should be container-rounded (e.g., `rounded-[2.5rem]`) and have subtle shadows to match the Antigravity aesthetic.
    *   Always include a personalized overlay (e.g., "Lumi 최적 동선 시뮬레이션") when the map is active.

## INTERACTION RULES

1.  **Contextual Maps:** If a user mentions a location or a sequence of location-based tasks, proactively suggest displaying them on a map.
2.  **Coordinate Priority:** When rendering spots, prioritize `lat`/`lng` coordinates over text-based addresses to ensure pinpoint accuracy.
3.  **Fallback Handling:** Always implement a fallback UI (like the one in `MapView.tsx`) if the API key is missing or the map fails to load.

## LIBRARY REFERENCES

- `skillssmp.library.maps.embed`: Rules for usage of the Embed API.
- `skillssmp.library.maps.places`: Rules for using Places API for search and verification.
- `skillssmp.library.ux.map_overlays`: Standard UI components for map overlays.
