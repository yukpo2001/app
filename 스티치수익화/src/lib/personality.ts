import userTastes from "../data/user_tastes.json";

export interface Persona {
    title: string;
    description: string;
    icon: string;
    color: string;
    cosplay: "explorer" | "modern" | "healer";
}

export const getTravelPersona = (): Persona => {
    const reviews = userTastes.reviews;

    // Simple heuristic-based persona detection
    let modernCount = 0;
    let localCount = 0;
    let cozyCount = 0;

    reviews.forEach(r => {
        const text = r.text.toLowerCase();
        if (text.includes("modern") || text.includes("깔끔") || text.includes("정갈")) modernCount++;
        if (text.includes("로컬") || text.includes("전통") || text.includes("숨은")) localCount++;
        if (text.includes("cozy") || text.includes("조용") || text.includes("여유")) cozyCount++;
    });

    if (localCount >= modernCount && localCount >= cozyCount) {
        return {
            title: "로컬 숨은 맛집 탐험가",
            description: "화려한 곳보다는 그 동네만의 숨겨진 보석 같은 장소를 찾는 것을 즐기시네요. Lumi가 진짜 로컬들만 아는 곳을 더 찾아드릴게요!",
            icon: "🌲",
            color: "secondary",
            cosplay: "explorer"
        };
    }

    if (modernCount >= cozyCount) {
        return {
            title: "모던 감성 사냥꾼",
            description: "깔끔하고 세련된 인테리어와 정갈한 메뉴를 선호하시는군요. Lumi와 함께 도시의 가장 감각적인 장소들을 정복해 봐요!",
            icon: "✨",
            color: "primary",
            cosplay: "modern"
        };
    }

    return {
        title: "여유로운 힐러",
        description: "조용하고 여유로운 분위기에서 힐링하는 시간을 중요하게 생각하시네요. Lumi가 당신만의 완벽한 휴식처를 추천해 드릴게요.",
        icon: "🍃",
        color: "accent",
        cosplay: "healer"
    };
};
