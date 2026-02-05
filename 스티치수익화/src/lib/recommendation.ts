import mockReviews from "@/data/mock_reviews.json";

export const getRecommendations = (keywords: string[]) => {
    // Simple keyword matching for demo purposes
    return mockReviews.filter(review =>
        keywords.some(kw => review.tags.some(tag => tag.toLowerCase() === kw.toLowerCase()))
    );
};
