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

        return { ...place, tasteScore: Math.round(score * 10) / 10 };
    }).sort((a, b) => (b.tasteScore || 0) - (a.tasteScore || 0));
};
