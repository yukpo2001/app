"use client";
// Trigger redeploy for root directory change

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../lib/LanguageContext";
import { useTravel, type Place } from "../lib/TravelContext";
import { getPlacesRecommendations } from "../lib/google-maps";
import { LumiCharacter } from "../components/LumiCharacter";
import {
  MapPin, Utensils, Sparkles, Globe,
  Loader2, CheckCircle2, Star, ExternalLink,
  ArrowLeft, Navigation
} from "lucide-react";
import { PlaceDetailModal } from "../components/PlaceDetailModal";
import { getTravelPersona } from "../lib/personality";
import { ItineraryView } from "../components/ItineraryView";

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
  const [showItinerary, setShowItinerary] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === "ko" ? "en" : "ko");
  };

  const startAnalysis = async (customLocation?: { lat: number; lng: number }, overrideKeyword?: string) => {
    const activeKeyword = overrideKeyword || keyword;
    if (!activeKeyword.trim() && !customLocation) return;

    setIsAnalyzing(true);
    setView("diagnose");
    setDiagnoseStep(1);

    const phrases = [
      "실시간 구글 지도 데이터를 불러오고 있어요...",
      "yukpo2001님의 과거 리뷰 스타일을 분석 중입니다...",
      "유저 리뷰들과 yukpo2001님의 취향을 매칭하고 있어요...",
      "당신의 취향을 Lumi가 완벽히 파악하는 중이에요!",
      "가장 힙하고 yukpo2001님이 좋아하실 곳을 선정 중입니다..."
    ];

    let phraseIdx = 0;
    const interval = setInterval(() => {
      setAnalysisText(phrases[phraseIdx % phrases.length]);
      phraseIdx++;
    }, 1200);

    try {
      const searchKeyword = activeKeyword.trim() || "성수동 힙한 카페 맛집"; // Better default fallback
      const results = await getPlacesRecommendations(searchKeyword, customLocation || location || undefined);
      setRecommendations(results);
      setDiagnoseStep(2);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  const handleNearbySearch = () => {
    if ("geolocation" in navigator) {
      setIsAnalyzing(true);
      setView("diagnose");
      setDiagnoseStep(1);
      setAnalysisText("현재 위치를 확인하고 있어요...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(loc);
          startAnalysis(loc, "내 주변 힙한 핫플 맛집"); // Specifically look for "hip hot places" nearby
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("위치 정보를 가져올 수 없습니다. 기본 검색으로 진행해 주세요.");
          setIsAnalyzing(false);
        }
      );
    } else {
      alert("이 브라우저는 위치 정보를 지원하지 않습니다.");
    }
  };

  const handleFeatureAnalysis = (title: string) => {
    setKeyword(title);
    if ("geolocation" in navigator) {
      setIsAnalyzing(true);
      setView("diagnose");
      setDiagnoseStep(1);
      setAnalysisText("현재 위치를 확인하고 있어요...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(loc);
          // Combine feature title with "힙한 곳" for better API results
          startAnalysis(loc, `${title} 힙한 곳`);
        },
        (error) => {
          console.error("Geolocation error:", error);
          // If geolocation fails, just go to search page with keyword set
          setView("diagnose");
          setDiagnoseStep(1);
          setIsAnalyzing(false);
        }
      );
    } else {
      setView("diagnose");
      setDiagnoseStep(1);
    }
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
    <main className="relative min-h-screen flex flex-col p-4 overflow-x-hidden">
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
            className="flex-1 flex flex-col items-center justify-center pt-20"
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
            className="flex-1 flex flex-col items-center justify-center"
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

                  {!isAnalyzing && (
                    <button
                      onClick={handleNearbySearch}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-4 text-secondary font-bold bg-secondary/10 hover:bg-secondary/20 rounded-[1.5rem] transition-all border border-secondary/20"
                    >
                      <MapPin className="w-5 h-5" />
                      <span>내 주변 힙한 곳 바로 찾기</span>
                    </button>
                  )}
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
                  <p className="text-gray-500 mb-6">추천 결과가 없습니다. 다시 시도해 주세요.</p>
                  <button onClick={handleGoToDiagnose} className="btn-secondary">이전으로 돌아가기</button>
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
            <div className="relative w-full max-w-5xl">
              <ItineraryView onClose={() => setShowItinerary(false)} />
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
    </main>
  );
}
