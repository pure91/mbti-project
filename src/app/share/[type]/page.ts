import type {Metadata} from 'next';
import rawAnimalTypes from '@/app/data/animalTypes.json';
import {getCharacterProfile} from '@/utils/animalUtils';
import type {AnimalData} from '@/types/animalTypes';

const animalTypes = rawAnimalTypes as Record<string, AnimalData>;

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
};

export async function generateMetadata({params}: { params: { type: string } }): Promise<Metadata> {
    const type = params.type;
    const animalData = animalTypes[type];
    const imageUrl = `https://zootypes.com${animalImages[type] ?? "/images/animalAll.png"}`;
    const characterProfile = animalData?.types
        ? getCharacterProfile(
            {I: 0, O: 0, R: 0, D: 0, E: 0, C: 0, S: 0, A: 0},
            animalData.types
        )
        : null;

    return {
        title: `나의 유형은 ${type}`,
        description: `⭐${characterProfile?.name ?? "알 수 없음"}⭐ - ${characterProfile?.description ?? ""}`,
        openGraph: {
            title: `나의 유형은 ${type}`,
            description: `⭐${characterProfile?.name ?? "알 수 없음"}⭐ - ${characterProfile?.description ?? ""}`,
            images: [imageUrl],
            url: `https://zootypes.com/share/${type}`,
        },
    };
}