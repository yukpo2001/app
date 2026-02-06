import userTastes from "@/data/user_tastes.json";

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

export const rankPlacesByTaste = (places: Place[]) => {
    const keywords = userTastes.style_keywords.map(kw => kw.toLowerCase());
    const userReviewTexts = userTastes.reviews.map(r => r.text.toLowerCase());

    return places.map(place => {
        let score = 0;

        // 1. Tag matching (Exact or partial)
        place.tags.forEach(tag => {
            const normalizedTag = tag.toLowerCase();
            if (keywords.some(kw => normalizedTag.includes(kw) || kw.includes(normalizedTag))) {
                score += 2;
            }
        });

        // 2. Review content matching (keywords)
        const allReviewsText = place.reviews.map(r => r.text).join(" ").toLowerCase();
        keywords.forEach(kw => {
            if (allReviewsText.includes(kw)) {
                score += 1.5;
            }
        });

        // 3. User similarity (Lexical overlap)
        // Bonus for places whose reviews contain common descriptive adjectives used by the user
        userReviewTexts.forEach(userTxt => {
            if (!userTxt) return;
            // Extract some descriptive words (heuristic: words $> 3$ chars)
            const words = userTxt.split(/\s+/).filter(w => w.length > 3);
            const matches = words.filter(w => allReviewsText.includes(w));
            score += matches.length * 0.05;
        });

        // 4. Generate Lumi's Tip
        let tip = "여기는 yukpo2001님이 좋아하실 만한 분위기에요!";
        if (score > 10) {
            tip = "완전 yukpo2001님 스타일! 평소 좋아하시는 정갈하고 깔끔한 분위기가 가득해요. ✨";
        } else if (allReviewsText.includes("친절") || allReviewsText.includes("서비스")) {
            tip = "친절한 서비스로 유명한 곳이에요. yukpo2001님이 중요하게 생각하시는 부분이죠! 😊";
        } else if (allReviewsText.includes("조용") || allReviewsText.includes("여유")) {
            tip = "조용하게 시간을 보내기 좋은 곳이에요. 혼자만의 시간을 선호하시는 취향에 딱! 🍃";
        } else if (allReviewsText.includes("힙한") || allReviewsText.includes("감성")) {
            tip = "요즘 힙한 감성이 가득한 곳이에요. yukpo2001님의 세련된 감각과 잘 어울려요! 💖";
        }

        return { ...place, tasteScore: Math.round(score * 10) / 10, lumiTip: tip };
    }).sort((a, b) => (b.tasteScore || 0) - (a.tasteScore || 0));
};

export const optimizeRoute = (itinerary: Place[], weather: string) => {
    // Weather-based optimization logic
    // If it rains, prioritize indoor categories (restaurant, cafe)
    // If it's sunny, prioritize outdoor categories (park, tourist_attraction)

    const isBadWeather = ["Rain", "Snow", "Clouds"].includes(weather);

    return [...itinerary].sort((a, b) => {
        const indoorCategories = ["restaurant", "cafe", "museum", "shopping_mall"];
        const aIsIndoor = indoorCategories.includes(a.category);
        const bIsIndoor = indoorCategories.includes(b.category);

        if (isBadWeather) {
            if (aIsIndoor && !bIsIndoor) return -1;
            if (!aIsIndoor && bIsIndoor) return 1;
        } else {
            if (!aIsIndoor && bIsIndoor) return -1;
            if (aIsIndoor && bIsIndoor) return 1;
        }
        return 0;
    });
};
