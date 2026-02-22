"use client";
// Trigger redeploy for root directory change

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../lib/LanguageContext";
import { useTravel, type Place } from "../lib/TravelContext";
import { getPlacesRecommendationsAction, getGoogleMapsApiKey } from "../lib/actions";
import { LumiCharacter } from "../components/LumiCharacter";
import {
  MapPin, Utensils, Sparkles, Globe,
  Loader2, CheckCircle2, Star, ExternalLink,
  ArrowLeft, Navigation, Search, Info
} from "lucide-react";
import { PlaceDetailModal } from "../components/PlaceDetailModal";
import { getTravelPersona } from "../lib/personality";
import { ItineraryView } from "../components/ItineraryView";
import { VoiceNavigator } from "../components/VoiceNavigator";

type View = "landing" | "diagnose" | "result";

export default function Home() {
  const { language, setLanguage, t } = useLanguage();
  const { itinerary, addToItinerary, points } = useTravel();
  const persona = getTravelPersona();

  // App State
  const [view, setView] = useState<View>("landing");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [analysisText, setAnalysisText] = useState("");
  const [recommendations, setRecommendations] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [diagnoseStep, setDiagnoseStep] = useState(1);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  const [mapApiKey, setMapApiKey] = useState("");
  const [debugError, setDebugError] = useState("");
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isInAppBannerDismissed, setIsInAppBannerDismissed] = useState(false);

  // Fetch API Key on mount to avoid build-time env issues
  useEffect(() => {
    fetchApiKey();
    // 인앱 브라우저 감지
    const ua = navigator.userAgent;
    const inApp = /KAKAOTALK|Instagram|NAVER|FB_IAB|FBIOS|NaverApp|Line\/|Twitter|Snapchat|TikTok|Bytedance/i.test(ua);
    setIsInAppBrowser(inApp);
  }, []);

  const fetchApiKey = async () => {
    try {
      const key = await getGoogleMapsApiKey();
      if (key) setMapApiKey(key);
      else console.warn("[Lumi UI] API Key fetched but empty");
    } catch (e) {
      console.error("[Lumi UI] API Key fetch failed:", e);
      setDebugError("API Key Fetch Failed");
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "ko" ? "en" : "ko");
  };

  const startAnalysis = async (overrideKeyword?: string) => {
    const activeKeyword = overrideKeyword || keyword;
    if (!activeKeyword.trim()) return;

    setIsAnalyzing(true);
    setView("diagnose");
    setDiagnoseStep(1);

    const phrases = [
      "Lumi의 분석 엔진이 쌩쌩 돌아가고 있어요!",
      "구글 지도의 실시간 힙스팟 데이터를 수집 중입니다...",
      "yukpo2001님의 과거 리뷰에서 스타일 테마를 추출하고 있어요...",
      "5,500개의 유저 데이터와 yukpo2001님의 취향을 정교하게 매칭 중!",
      "거의 다 됐어요! 가장 힙하고 yukpo2001님 스타일인 곳들만 골라낼게요. ✨"
    ];

    let phraseIdx = 0;
    const interval = setInterval(() => {
      setAnalysisText(phrases[phraseIdx % phrases.length]);
      phraseIdx++;
    }, 1500);

    try {
      let currentLoc = location;

      // Only check location if user has explicitly opted in
      if (useCurrentLocation && !currentLoc) {
        setAnalysisText("현재 위치를 확인하고 있어요... (위치 권한을 확인해주세요)");
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            });
          });
          currentLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(currentLoc);
        } catch (error: any) {
          console.error("Geolocation failed:", error);
          let errorMsg = "현재 위치를 알 수 없어 광역 검색으로 전환합니다.";
          if (error.code === 1) {
            errorMsg = "위치 권한이 차단되어 광역 검색으로 진행합니다.";
          } else if (error.code === 3) {
            errorMsg = "위치 응답이 늦어 광역 검색으로 전환합니다.";
          }
          setAnalysisText(errorMsg);
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      console.log(`[Lumi UI] Starting recommendations for: ${activeKeyword}`);

      // Client-side Timeout Race (15s)
      const timeoutPromise = new Promise<Place[]>((_, reject) => {
        setTimeout(() => reject(new Error("Timeout: Server took too long (15s)")), 15000);
      });

      const searchKeyword = activeKeyword.trim() || "성수동 힙한 카페 맛집";

      const results = await Promise.race([
        getPlacesRecommendationsAction(searchKeyword, currentLoc || undefined),
        timeoutPromise
      ]);

      if (!results || results.length === 0) {
        console.warn("[Lumi UI] No results returned from API or Mock.");
      } else {
        console.log(`[Lumi UI] Received ${results.length} recommendations.`);
      }

      setRecommendations(results);
      setDiagnoseStep(2);
    } catch (error: any) {
      console.error("Analysis failed:", error);
      const errMsg = error.message || "알 수 없는 오류";
      setDebugError(errMsg);
      setAnalysisText(`오류가 발생했습니다: ${errMsg}`);

      // Force fallback (Mock) if server fails
      if (errMsg.includes("Timeout")) {
        alert("서버 응답이 지연되어 Lumi의 시크릿 리스트로 전환합니다.");
        // In a real scenario, we might want to call a client-side mock function here, 
        // but getPlacesRecommendationsAction already handles mocks on server. 
        // If that timed out, we might need a purely client-side fallback, but let's just reset for now.
        setIsAnalyzing(false);
        // Ideally we should have a client-side mock data fallback here.
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  // handleNearbySearch removed as it's now integrated into startAnalysis

  const handleFeatureAnalysis = (title: string) => {
    setKeyword(title);
    setView("diagnose");
    setDiagnoseStep(1);
  };

  const openDetail = (place: Place) => {
    setSelectedPlace(place);
    setIsModalOpen(true);
  };

  const handleGoToDiagnose = () => {
    setDiagnoseStep(1);
    setView("diagnose");
  };

  const handleGoToResult = () => {
    setView("result");
  };

  const handleGoToLanding = () => {
    setView("landing");
  };

  return (
    <main className="relative min-h-[100dvh] flex flex-col p-4 overflow-x-hidden">
      {/* 인앱 브라우저 경고 배너 */}
      {isInAppBrowser && !isInAppBannerDismissed && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 shadow-lg">
          <div className="max-w-2xl mx-auto flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">⚠️</span>
            <div className="flex-1">
              <p className="font-bold text-sm mb-0.5">인앱 브라우저에서는 일부 기능이 제한될 수 있어요</p>
              <p className="text-xs text-white/90">
                카카오톡·인스타그램 등 앱 내 브라우저는 Google 서비스 접근이 차단됩니다.
                <br />
                오른쪽 상단 <strong>⋮ → 기본 브라우저로 열기</strong>를 눌러주세요!
              </p>
            </div>
            <button
              onClick={() => setIsInAppBannerDismissed(true)}
              className="flex-shrink-0 text-white/80 hover:text-white text-xl leading-none p-1"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      {/* Language Toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={toggleLanguage}
        className="fixed top-8 right-8 z-50 flex items-center gap-2 btn-secondary py-2 px-4 text-sm"
      >
        <Globe className="w-4 h-4" />
        {language === "ko" ? "English" : "한국어"}
      </motion.button>

      <AnimatePresence mode="wait">
        {/* Landing View */}
        {view === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex flex-col items-center justify-center pt-24 pb-12"
          >
            <div className="max-w-4xl w-full text-center">
              <LumiCharacter cosplay={persona.cosplay} />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest text-primary uppercase bg-primary/10 border border-primary/20 rounded-full">
                  AI Journey Curator
                </span>
                <h1 className="gradient-text mb-6">{t("subtitle")}</h1>
                <p className="text-lg md:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
                  {t("description")}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={handleGoToDiagnose}
                    className="btn-primary flex items-center gap-2"
                  >
                    {t("start_btn")}
                    <Sparkles className="w-5 h-5" />
                  </button>
                  <button className="btn-secondary">{t("intro_btn")}</button>
                </div>
              </motion.div>
            </div>

            {/* How to Use Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-32 p-12 glass rounded-[3rem] text-center"
            >
              <h2 className="text-3xl font-bold mb-12">Lumi 이용 방법</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold mb-4 text-xl">1</div>
                  <h4 className="font-bold mb-2">원하는 테마 선택</h4>
                  <p className="text-sm text-gray-500">맛집, 카페, 명소 등 원하는 여행 테마를 선택하세요.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold mb-4 text-xl">2</div>
                  <h4 className="font-bold mb-2">Lumi의 AI 분석</h4>
                  <p className="text-sm text-gray-500">방대한 데이터를 바탕으로 사용자님의 취향을 정교하게 분석합니다.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold mb-4 text-xl">3</div>
                  <h4 className="font-bold mb-2">취향 저격 명소 탐방</h4>
                  <p className="text-sm text-gray-500">Lumi가 엄선한 힙한 장소들을 확인하고 나만의 코스를 완성하세요.</p>
                </div>
              </div>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl w-full"
            >
              {[
                { icon: Utensils, title: t("features.food"), color: "primary", type: "search" },
                { icon: Sparkles, title: t("features.activity"), color: "accent", type: "search" },
                { icon: MapPin, title: t("features.itinerary"), color: "secondary", type: "diagnose" }
              ].map((feature, idx) => (
                <div
                  key={idx}
                  onClick={() => feature.type === "search" ? handleFeatureAnalysis(feature.title) : handleGoToDiagnose()}
                  className="glass p-8 rounded-3xl group hover:scale-105 transition-transform cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-${feature.color}/10 group-hover:bg-${feature.color}/20 transition-colors`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Diagnose View */}
        {view === "diagnose" && (
          <motion.div
            key="diagnose"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex flex-col items-center justify-center py-12"
          >
            <AnimatePresence mode="wait">
              {diagnoseStep === 1 ? (
                <motion.div
                  key="diag1"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="glass p-12 rounded-[3rem] max-w-2xl w-full text-center"
                >
                  <LumiCharacter cosplay={persona.cosplay} />
                  <h2 className="text-3xl font-bold mb-4">Lumi에게 장소 물어보기</h2>
                  <p className="text-gray-500 mb-8">가고 싶은 지역이나 테마를 입력해 주세요. (예: 성수동 힙한 카페)</p>

                  <div className="relative mb-6">
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="어디로 떠나고 싶으신가요?"
                      className="w-full px-8 py-5 bg-white/50 border-2 border-primary/20 rounded-[2rem] focus:border-primary outline-none transition-all text-lg font-medium"
                      onKeyDown={(e) => e.key === 'Enter' && startAnalysis()}
                    />
                  </div>

                  {!isAnalyzing && (
                    <div className="flex items-center justify-center gap-2 mb-8 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                      <input
                        type="checkbox"
                        id="useLocation"
                        checked={useCurrentLocation}
                        onChange={(e) => setUseCurrentLocation(e.target.checked)}
                        className="w-5 h-5 accent-primary cursor-pointer"
                      />
                      <label htmlFor="useLocation" className="text-sm font-bold text-primary cursor-pointer flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        현재 내 주변 장소 우선 추천
                      </label>
                    </div>
                  )}

                  <button
                    onClick={() => startAnalysis()}
                    disabled={isAnalyzing || !keyword.trim()}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-5 text-lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>{analysisText || "분석 시작 중..."}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6" />
                        <span>분석 시작하기</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleGoToLanding}
                    className="mt-6 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    처음으로 돌아가기
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="diag2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass p-12 rounded-[3rem] max-w-2xl w-full text-center"
                >
                  <CheckCircle2 className="w-16 h-16 text-secondary mx-auto mb-6" />
                  <h2 className="text-3xl font-bold mb-4">분석 완료!</h2>
                  <p className="text-gray-500 mb-8">Lumi가 당신의 취향을 완벽하게 파악했어요.</p>

                  <button
                    onClick={handleGoToResult}
                    className="btn-primary"
                  >
                    결과 확인하기
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Result View */}
        {view === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="flex-1 w-full max-w-6xl mx-auto py-20 px-4"
          >
            <button
              onClick={handleGoToDiagnose}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-12 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("result.back")}
            </button>

            <div className="mb-16">
              <h1 className="gradient-text mb-4">{t("result.title")}</h1>
              <p className="text-xl text-gray-500 mb-8">yukpo2001님의 취향을 분석하여 Lumi가 직접 엄선한 추천 리스트입니다. ✨</p>

              {/* AI Persona Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass p-8 rounded-[2rem] border-l-8 border-primary flex flex-col md:flex-row items-center gap-8 mb-12 shadow-xl bg-white/40"
              >
                <div className="text-6xl">{persona.icon}</div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary px-3 py-1 bg-primary/10 rounded-full">Your Persona</span>
                    <span className="text-xs font-bold text-secondary flex items-center gap-1">
                      <Star className="w-3 h-3 fill-secondary" />
                      {points + 100} pts
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{persona.title}</h2>
                  <p className="text-gray-500 leading-relaxed">{persona.description}</p>
                </div>
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <div className="text-center px-6 py-3 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-[10px] text-primary font-bold uppercase mb-1">Bucket List</p>
                    <p className="text-xl font-black text-primary">{itinerary.length} Places</p>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendations.length === 0 ? (
                <div className="col-span-full py-20 text-center glass rounded-[2.5rem]">
                  <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">근처에서 힙한 곳을 찾지 못했어요</h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    현재 계신 곳 주변에는 아직 분석된 힙한 장소가 적을 수 있습니다.<br />
                    범위를 넓혀서 다시 찾아볼까요?
                  </p>
                  <div className="flex flex-col gap-4 items-center">
                    <button
                      onClick={() => startAnalysis(keyword)}
                      className="px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-lg"
                    >
                      다시 찾아보기
                    </button>
                    <p className="text-[10px] text-gray-400 mt-4">
                      ※ 장소가 계속 나타나지 않는다면 Vercel 설정에서 <b>GOOGLE_MAPS_API_KEY</b> 환경 변수를 확인해 주세요.
                    </p>
                  </div>
                </div>
              ) : (
                recommendations.map((item: Place, idx: number) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => openDetail(item)}
                    className="glass rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all group cursor-pointer"
                  >
                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur pb-1 px-3 rounded-full flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold">{item.rating}</span>
                      </div>
                    </div>

                    <div className="p-8">
                      <div className="flex gap-2 mb-4">
                        {item.tags.map((tag: string) => (
                          <span key={tag} className="text-[10px] font-bold tracking-wider uppercase text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{item.name}</h3>

                      <div className="flex flex-col gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToItinerary(item);
                          }}
                          disabled={itinerary.some(p => p.id === item.id)}
                          className={`w-full py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${itinerary.some(p => p.id === item.id)
                            ? "bg-gray-100 text-gray-400 cursor-default"
                            : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                            }`}
                        >
                          {itinerary.some(p => p.id === item.id) ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              장바구니 담김
                            </>
                          ) : (
                            <>
                              <MapPin className="w-4 h-4" />
                              일정에 추가하기
                            </>
                          )}
                        </button>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <span className="text-xs font-bold text-primary group-hover:underline">{t("result.detail.more_info")}</span>
                          <div className="text-primary p-2 bg-primary/5 hover:bg-primary/10 rounded-full transition-all">
                            <ExternalLink className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PlaceDetailModal
        place={selectedPlace as Place}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        t={t}
      />

      {/* Itinerary Overlay Portal-like logic */}
      <AnimatePresence>
        {showItinerary && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowItinerary(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[3rem]">
              <ItineraryView onClose={() => setShowItinerary(false)} apiKey={mapApiKey} />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Itinerary Button */}
      {view === "result" && itinerary.length > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowItinerary(true)}
          className="fixed bottom-10 right-10 z-50 p-6 bg-primary text-white rounded-full shadow-2xl flex items-center gap-3 overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mr-1 -mt-1 w-6 h-6 bg-secondary text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
            {itinerary.length}
          </div>
          <Navigation className="w-6 h-6" />
          <span className="font-bold underline">내 일정 최적화해서 보기</span>
        </motion.button>
      )}

      {/* Footer Branding */}
      {view === "landing" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          className="mt-auto py-10 text-center text-sm font-serif italic text-gray-400"
        >
          Design by Antigravity x Lumi’s Pick
        </motion.p>
      )}
      {/* Voice Guidance */}
      <VoiceNavigator lang={language as "ko" | "en"} />

      {/* Debug Indicator */}
      <div className="fixed bottom-4 left-4 z-[9999] bg-black/80 text-white text-[10px] p-2 rounded-lg opacity-50 hover:opacity-100 transition-opacity pointer-events-none">
        <p className="font-bold text-yellow-400">Lumi Debug v2.2</p>
        <p>API Key: {mapApiKey ? "Present (Runtime)" : "Missing"}</p>
        <p>Recs: {recommendations.length}</p>
        <p>View: {view}</p>
        {debugError && <p className="text-red-400 font-bold mt-1">Error: {debugError}</p>}
      </div>
    </main>
  );
}
