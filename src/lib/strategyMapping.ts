export interface DiagnosticAnswers {
    biz_industry: string;
    biz_problem: string;
    biz_resource: string[];
    target_type: string;
}

export interface StrategyResult {
    title: string;
    theory: string;
    logic: string;
}

export function getStrategies(answers: DiagnosticAnswers): Record<string, StrategyResult> {
    const strategies: Record<string, StrategyResult> = {};

    // 1. 가격 전략 (Pricing Strategy)
    if (answers.biz_problem === "price_sensitivity" || answers.target_type === "price_conscious") {
        strategies.pricing = {
            title: "가격 전략: 손실 회피 적용",
            theory: "전망 이론(Prospect Theory) [20], [45]",
            logic: "할인율 대신 '구매하지 않으면 잃게 되는 금액'을 강조하여 메시지를 구성하십시오."
        };
    } else {
        strategies.pricing = {
            title: "가격 전략: 앵커링 효과",
            theory: "준거 가격 효과(Reference Pricing) & 제한된 합리성 [23], [42]",
            logic: "최상단에 고가의 '미끼 상품'을 배치하여 주력 상품의 가격 정당성을 확보하십시오."
        };
    }

    // 2. 이벤트 전략 (Event Strategy)
    if (answers.biz_problem === "low_awareness" || answers.biz_problem === "low_retention") {
        strategies.event = {
            title: "이벤트 전략: 소셜 화폐 활용",
            theory: "약한 유대의 힘(Weak Ties) [61], [65]",
            logic: "건너 아는 지인을 통한 정보 확산을 유도하는 '친구 추천' 이벤트를 기획하십시오."
        };
    } else {
        strategies.event = {
            title: "이벤트 전략: 신호 발송",
            theory: "신호 이론(Signaling Theory) [5], [8]",
            logic: "불만족 시 100% 환불 등 판매자가 리스크를 부담하는 신호를 보내 품질 신뢰를 구축하십시오."
        };
    }

    // 3. 소비자 심리 유인 (Nudge & Psychology)
    strategies.nudge = {
        title: "소비자 심리 유인: 휴리스틱",
        theory: "빠르고 검소한 휴리스틱(Fast and Frugal Heuristics) [36], [51]",
        logic: "선택지를 3개로 단순화하고 'Best' 태그를 활용하여 결정 마비를 방지하십시오."
    };

    // 4. 상세페이지/디자인 가이드 (UX/UI)
    strategies.design = {
        title: "디자인 가이드: 행동 유도성",
        theory: "정보 시각화 [24] & 행동 유도성(Affordances) [9]",
        logic: "차트 정크를 제거하고 데이터 잉크 비율을 높인 직관적 버튼과 레이아웃을 배치하십시오."
    };

    // 5. 대표 메시지 (Messaging & Positioning)
    const resourceLabels: Record<string, string> = {
        cost_leadership: "가성비",
        quality: "품질",
        trust: "신뢰",
        design: "디자인"
    };
    const mainResource = resourceLabels[answers.biz_resource[0]] || "차별화";
    strategies.messaging = {
        title: "대표 메시지: 포지셔닝",
        theory: "포지셔닝(Positioning) [7], [18]",
        logic: `경쟁사가 없는 '${mainResource}' 중심의 단 하나의 단어를 선점하여 마인드 쉐어를 확보하십시오.`
    };

    // 6. SNS 게시물 가이드 (Content Strategy)
    strategies.sns = {
        title: "SNS 가이드: 체험 마케팅",
        theory: "체험 마케팅 [16] & 단순 노출 효과 [32]",
        logic: "제품의 특징보다 소비 시의 감각적 경험을 묘사하고 반복적 노출 스케줄을 유지하십시오."
    };

    return strategies;
}
