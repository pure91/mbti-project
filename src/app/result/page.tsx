"use client";

import {useSearchParams} from "next/navigation";
import Link from "next/link";
import {Suspense, useEffect, useState} from "react";
import TraitBar from "@/app/components/TraitBar";
import toast, {Toaster} from "react-hot-toast";
import Image from "next/image";
import rawAnimalTypes from '@/app/data/animalTypes.json';
import {getCharacterProfile} from '@/utils/animalUtils';
import type {AnimalData, TraitKeys} from '@/types/animalTypes';

// json 원시 데이터 할당
const animalTypes = rawAnimalTypes as Record<string, AnimalData>;

/** URL 쿼리 파라미터를 통해 결과 표시(통계, 공유) */
function ResultContent() {
    const searchParams = useSearchParams();
    const type = searchParams.get("type") || "Unknown";
    const level = searchParams.get("level");

    // 통계 상태
    const [stats, setStats] = useState<{ totalCount: number; typeCount: number; levelCount: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 통계 조회
    useEffect(() => {
        if (!type || type === "Unknown") return;

        setLoading(true);
        fetch(`/api/stats/result/get?type=${type}${level !== undefined ? `&level=${level}` : ""}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setStats({totalCount: data.totalCount, typeCount: data.typeCount, levelCount: data.levelCount});
                }
            })
            .catch(() => setError("Failed to load stats"))
            .finally(() => setLoading(false));
    }, [type, level]);

    // 동물 데이터
    const animalData: AnimalData = animalTypes[type];

    // traits 키 배열
    const traitKeys: TraitKeys[] = ["I", "O", "R", "D", "E", "C", "S", "A"];

    // URL의 traits 전체 값 받아옴
    const resultTraits: Record<TraitKeys, number> = traitKeys.reduce((acc, key) => {
        acc[key] = Number(searchParams.get(key)) || 0;
        return acc;
    }, {} as Record<TraitKeys, number>);

    // 캐릭터 결정
    const characterProfile = animalData ? getCharacterProfile(resultTraits, animalData.types) : null;

    // 링크 복사 핸들러
    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            toast.success("복사 완료");
        }).catch((err) => {
            console.error("링크 복사 실패:", err);
            toast.error("복사에 실패했습니다.");
        });
    };

    // 로컬용 키 초기화
    useEffect(() => {
        const kakaoAppKey = process.env.NEXT_PUBLIC_KAKAO_SHARE;
        if (!kakaoAppKey) {
            console.log("app key missing");
            return;
        }

        if (typeof window !== "undefined" && window.Kakao) {
            if (!window.Kakao.isInitialized()) {
                window.Kakao.init(kakaoAppKey);
                console.log("app key init complete");
            }
        }
    }, []);

    // 카카오톡 공유 핸들러
    const handleKakaoShare = () => {
        if (window.Kakao && window.Kakao.isInitialized()) {
            window.Kakao.Link.sendDefault({
                objectType: "feed",
                content: {
                    title: `나의 유형은 ${type}`,
                    description: `⭐${characterProfile?.name}⭐`,
                    imageUrl: animalImageUrlForKakao,
                    link: {
                        mobileWebUrl: window.location.href,
                        webUrl: window.location.href,
                    },
                },
            });
        } else {
            toast.error("카카오톡 공유 기능을 사용할 수 없습니다.");
        }
    };

    // 페이스북 공유 핸들러
    const handleFaceBookShare = () => {
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://zootypes.com/share/${type}`)}`;
        window.open(shareUrl, "_blank");
    }

    // 트위터 공유 핸들러
    const handleTwitterShare = () => {
        const text = `나의 동물 성향은 ${type}타입의⭐${characterProfile?.name}⭐\n🐾${characterProfile?.description}\n\n결과 확인👉`;
        const url = encodeURIComponent(window.location.href);
        const tweetText = encodeURIComponent(text);
        const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${url}`;
        window.open(twitterUrl, "_blank");
    };

    // 모바일 공유 기능
    // const handleWebShare = async () => {
    //     if (!navigator.share) {
    //         toast("공유 기능이 지원되지 않는 환경이에요.\n링크를 복사하거나, 카카오톡으로 공유해 주세요.");
    //     } else {
    //         try {
    //             await navigator.share({
    //                 title: `나의 유형은 ${type}`,
    //                 text: `⭐ ${characterProfile?.name} ⭐`,
    //                 url: window.location.href,
    //             });
    //         } catch (err: unknown) {
    //             // 단순 공유 취소는 에러를 출력 X
    //             if (err instanceof Error) {
    //                 if (err.name !== 'AbortError') {
    //                     console.error(err);
    //                     toast.error("공유 실패😿");
    //                 }
    //             } else {
    //                 console.error("에러 발생:", err);
    //             }
    //         }
    //     }
    // }

    // 타입별 동물 이미지 매핑
    const animalImages: Record<string, string> = {
        IRES: "/images/hedgehog.png",
        IRCS: "/images/turtle.png",
        IDES: "/images/cat.png",
        IDCS: "/images/penguin.png",
        IREA: "/images/rabbit.png",
        IRCA: "/images/badger.png",
        IDEA: "/images/fox.png",
        IDCA: "/images/weasel.png",
        ORES: "/images/dog.png",
        ORCS: "/images/wolf.png",
        ODES: "/images/lion.png",
        ODCS: "/images/elephant.png",
        OREA: "/images/dolphin.png",
        ORCA: "/images/shark.png",
        ODEA: "/images/squirrel.png",
        ODCA: "/images/octopus.png",
        HUMAN: "/images/human.png",
    }

    // 이미지 URL
    const animalImageUrl = animalImages[type]; // 내부 이미지 (상대 경로)
    const animalImageUrlForKakao = typeof window !== "undefined" ? `${window.location.origin}${animalImageUrl}` : ""; // 카카오 공유용 (절대 경로)

    return (
        <div className="character-card-parent">
            <Toaster position="top-center"/>
            <div className="character-card">
                {type !== "HUMAN" ? <h1>🎉변신 성공🎉</h1> : <h1>☠️ 변신 실패 ☠️</h1>}
                <h2><span>{type}</span> 타입 ⭐{characterProfile?.name || "알 수 없음"}⭐</h2>
                <div>
                    <Image
                        src={animalImageUrl}
                        alt={`${type}이미지`}
                        width={200}
                        height={300}
                    />
                </div>


                <div className="trait-bar-container">
                    <div className="tooltip">
                        <TraitBar description="내향,외향" element="에너지 방향" leftLabel="I" rightLabel="O"
                                  leftValue={resultTraits.I} rightValue={resultTraits.O}/>
                        <TraitBar description="현실,추상" element="인식 기능" leftLabel="R" rightLabel="D"
                                  leftValue={resultTraits.R} rightValue={resultTraits.D}/>
                        <TraitBar description="감성,이성" element="판단 기능" leftLabel="E" rightLabel="C"
                                  leftValue={resultTraits.E} rightValue={resultTraits.C}/>
                        <TraitBar description="계획,적응" element="생활 방식" leftLabel="S" rightLabel="A"
                                  leftValue={resultTraits.S} rightValue={resultTraits.A}/>
                    </div>
                </div>
                <div className="stats-section">
                    {loading && <p>통계 불러오는 중...</p>}
                    {error && <p className="error">{error}</p>}
                    {stats && (
                        <p>
                            🔍 전체 <span className="first-color">{stats.totalCount}명</span> 중 <b>{type}</b> 타입은
                            <span
                                className="first-color"> {stats.typeCount}명 ({stats.totalCount > 0 ? ((stats.typeCount / stats.totalCount) * 100).toFixed(1) : 0}%)
                            </span>
                            <br/>
                            {type !== 'HUMAN' && (
                                <>
                                    🔍 당신은 <b>{type}</b> 타입 <span className="first-color">{stats.typeCount}명</span> 중
                                    <span
                                        className="second-color"> {stats.levelCount}명</span>인 <b>⭐{characterProfile?.name}⭐</b>
                                    <span
                                        className="second-color"> ({stats.typeCount > 0 ? ((stats.levelCount / stats.typeCount) * 100).toFixed(1) : 0}%)
                                    </span>
                                    <br/>
                                </>
                            )}
                        </p>
                    )}
                </div>

                <h3>{characterProfile?.description || "설명 없음"}의 특징</h3>
                <ul>
                    {characterProfile?.characteristics?.length ? (
                        characterProfile.characteristics.map((char, idx) => (
                            <li key={idx}>{char}</li>
                        ))
                    ) : (
                        <li>특성 정보가 없습니다.</li>
                    )}
                </ul>
                <div className="button-group">
                    {/*<button onClick={handleWebShare} className="share-btn native">*/}
                    {/* 모바일 공유*/}
                    {/*</button>*/}
                    <button onClick={handleCopyLink} className="share-btn link-copy">
                        링크 복사
                    </button>
                    <button onClick={handleKakaoShare} className="share-btn kakao">
                        카카오톡 공유
                    </button>
                    <button onClick={handleFaceBookShare} className="share-btn facebook">
                        페이스북 공유
                    </button>
                    <button onClick={handleTwitterShare} className="share-btn twitter">
                        트위터 공유
                    </button>
                    <Link href="/" className="home-link">
                        Home
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function Result() {
    return (
        <Suspense>
            <ResultContent/>
        </Suspense>
    );
}