"use client";

import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  Clipboard,
  Clock3,
  Compass,
  Filter,
  Flag,
  Heart,
  LayoutPanelTop,
  Map,
  MapPin,
  Moon,
  Navigation2,
  Plane,
  Plus,
  Route,
  Search,
  Share2,
  Sparkles,
  Star,
  Sun,
  Target,
  TrendingUp,
  Trophy,
  Upload,
  Users,
  Wand2,
  X,
} from "lucide-react";

type Season = "春" | "夏" | "秋" | "冬" | "雨季" | "通年";
type TimeSlot = "早朝" | "朝" | "昼" | "夕方" | "夜" | "いつでも";
type Companion = "ひとり" | "友達" | "恋人" | "家族" | "いつかの自分";
type Status = "visited" | "want" | "planned" | "dream" | "draft";
type OnceLevel = "normal" | "special" | "once-in-life";
type ShareType = "dna" | "bucket" | "next" | "hunter";
type ShareLayout = "story" | "wide";

type Coordinates = {
  lat: number;
  lng: number;
};

type Spot = {
  id: string;
  name: string;
  location: string;
  country: string;
  category: string;
  tags: string[];
  score: number;
  bestSeason: Season;
  bestSeasonRange: string;
  bestTime: TimeSlot;
  conditions: string[];
  nextChance: string;
  timingTip: string;
  timingEase: number;
  onceInLifeLevel: OnceLevel;
  recommendedWith: Companion;
  reason: string;
  memo: string;
  visitedDate: string;
  memoryTitle: string;
  emotion: string;
  weatherMood: string;
  photoStory: string;
  favoriteMoment: string;
  visibility: "private" | "share";
  albumTags: string[];
  status: Status;
  imageGradient: string;
  imageUrl: string;
  imageAlt: string;
  travelType: string;
  difficulty: number;
  estimatedCostLevel: number;
  purposeTags: string[];
  coords: Coordinates;
  saved: boolean;
};

type SpotDraft = Omit<Spot, "id" | "saved">;
type CountItem = { label: string; count: number };

const STORAGE_KEY = "zekkei-list-spots-v1";

const tags = [
  "星空",
  "海",
  "雲海",
  "紅葉",
  "雪",
  "滝",
  "夕日",
  "朝日",
  "島",
  "ドライブ",
  "カップル",
  "一生に一度",
  "オーロラ",
  "世界遺産",
  "砂漠",
  "花畑",
  "森",
  "海外",
  "日本",
];

const seasons: Season[] = ["春", "夏", "秋", "冬", "雨季", "通年"];
const times: TimeSlot[] = ["早朝", "朝", "昼", "夕方", "夜", "いつでも"];
const companions: Companion[] = ["ひとり", "友達", "恋人", "家族", "いつかの自分"];
const categories = ["星空", "海", "山", "島", "森", "雪景色", "世界遺産", "砂漠", "花畑", "ドライブ"];
const purposeTags = ["写真で残したい", "体験したい", "癒されたい", "挑戦したい", "記念日に行きたい", "人生を変えたい"];
const emotionTags = ["泣きそう", "癒された", "鳥肌", "青春", "静か", "最高", "また行きたい", "人生ベスト"];
const weatherMoods = ["快晴", "夕焼け", "星空", "雨上がり", "霧", "雪", "風が気持ちいい", "奇跡の天気"];

const statusTabs: { value: Status | "all"; label: string; short: string }[] = [
  { value: "all", label: "すべて", short: "All" },
  { value: "visited", label: "行った", short: "Visited" },
  { value: "want", label: "行きたい", short: "Want" },
  { value: "planned", label: "計画中", short: "Plan" },
  { value: "dream", label: "いつか絶対", short: "Dream" },
  { value: "draft", label: "あとで整理", short: "Draft" },
];

const statusLabels: Record<Status, string> = {
  visited: "行った",
  want: "行きたい",
  planned: "計画中",
  dream: "いつか絶対",
  draft: "あとで整理",
};

const levelLabels: Record<OnceLevel, string> = {
  normal: "normal",
  special: "special",
  "once-in-life": "once-in-life",
};

const gradients = [
  "from-[#07111f] via-[#214b7a] to-[#ffc07b]",
  "from-[#0077a7] via-[#53c6d6] to-[#fff2cf]",
  "from-[#173b2b] via-[#ba5d34] to-[#f5cd7b]",
  "from-[#25314a] via-[#9fb8c9] to-[#fff5d9]",
  "from-[#102c4e] via-[#f0f7ff] to-[#b9d7eb]",
  "from-[#114457] via-[#34a5b0] to-[#fed7aa]",
  "from-[#2a1748] via-[#6e7cff] to-[#ffd6a5]",
  "from-[#241326] via-[#be5a5a] to-[#ffe2a8]",
  "from-[#103a43] via-[#78d4c8] to-[#fff4d6]",
  "from-[#251f47] via-[#9e5eea] to-[#fff0ba]",
];

const photoLibrary = {
  stars: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=1400&q=85",
  beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85",
  cloudSea: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85",
  sunsetRoad: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=85",
  flower: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1400&q=85",
  snow: "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?auto=format&fit=crop&w=1400&q=85",
  forest: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=85",
  stream: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1400&q=85",
  desert: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1400&q=85",
  saltFlat: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85",
  aurora: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1400&q=85",
  santorini: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1400&q=85",
  ruins: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1400&q=85",
  balloon: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1400&q=85",
  canyon: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&w=1400&q=85",
};

const fallbackPhotos = Object.values(photoLibrary);

const samples: Spot[] = [
  makeSample({
    id: "hateruma-stars",
    name: "波照間島の星空",
    location: "沖縄県・波照間島",
    country: "日本",
    category: "星空",
    tags: ["星空", "島", "一生に一度", "カップル", "日本"],
    score: 98,
    bestSeason: "夏",
    bestSeasonRange: "6月〜9月",
    bestTime: "夜",
    conditions: ["新月", "晴れ", "雲が少ない"],
    nextChance: "今月チャンスあり",
    timingTip: "新月前後3日間の、湿度が低い晴れた夜がおすすめ。",
    timingEase: 4,
    onceInLifeLevel: "once-in-life",
    recommendedWith: "恋人",
    reason: "日本最南端の島で、満天の星を見たい。",
    status: "dream",
    imageGradient: gradients[0],
    imageUrl: photoLibrary.stars,
    travelType: "Starry Sky Seeker",
    difficulty: 3,
    estimatedCostLevel: 3,
    purposeTags: ["写真で残したい", "記念日に行きたい"],
    coords: { lat: 24.058, lng: 123.783 },
  }),
  makeSample({
    id: "miyako-maehama",
    name: "宮古島の与那覇前浜",
    location: "沖縄県・宮古島",
    country: "日本",
    category: "海",
    tags: ["海", "島", "ドライブ", "カップル", "日本"],
    score: 94,
    bestSeason: "夏",
    bestSeasonRange: "5月〜10月",
    bestTime: "昼",
    conditions: ["晴れ", "干潮"],
    nextChance: "夏旅に最適",
    timingTip: "太陽が高い時間ほど海の透明感が出る。",
    timingEase: 5,
    onceInLifeLevel: "special",
    recommendedWith: "恋人",
    reason: "真っ白な砂浜と透明な海を見たい。",
    status: "planned",
    imageGradient: gradients[1],
    imageUrl: photoLibrary.beach,
    travelType: "Island Dreamer",
    difficulty: 2,
    estimatedCostLevel: 3,
    purposeTags: ["癒されたい", "写真で残したい"],
    coords: { lat: 24.735, lng: 125.268 },
  }),
  makeSample({
    id: "takeda-clouds",
    name: "竹田城跡の雲海",
    location: "兵庫県・朝来市",
    country: "日本",
    category: "雲海",
    tags: ["雲海", "朝日", "一生に一度", "日本"],
    score: 89,
    bestSeason: "秋",
    bestSeasonRange: "9月〜11月",
    bestTime: "早朝",
    conditions: ["霧", "晴れ"],
    nextChance: "秋の早朝が本番",
    timingTip: "前日に雨が降り、翌朝晴れる日を狙う。",
    timingEase: 3,
    onceInLifeLevel: "once-in-life",
    recommendedWith: "友達",
    reason: "天空の城のような景色を見たい。",
    status: "want",
    imageGradient: gradients[3],
    imageUrl: photoLibrary.cloudSea,
    travelType: "Hidden Japan Explorer",
    difficulty: 4,
    estimatedCostLevel: 2,
    purposeTags: ["挑戦したい", "写真で残したい"],
    coords: { lat: 35.3, lng: 134.829 },
  }),
  makeSample({
    id: "shimanami-sunset",
    name: "しまなみ海道の夕日",
    location: "広島県〜愛媛県",
    country: "日本",
    category: "ドライブ",
    tags: ["海", "島", "ドライブ", "夕日", "カップル", "日本"],
    score: 88,
    bestSeason: "秋",
    bestSeasonRange: "9月〜11月",
    bestTime: "夕方",
    conditions: ["晴れ"],
    nextChance: "週末ドライブ向き",
    timingTip: "日没1時間前から橋と海の色が変わる。",
    timingEase: 5,
    onceInLifeLevel: "special",
    recommendedWith: "恋人",
    reason: "海の上を走るように島を渡りたい。",
    status: "want",
    imageGradient: gradients[5],
    imageUrl: photoLibrary.sunsetRoad,
    travelType: "Sunset Collector",
    difficulty: 2,
    estimatedCostLevel: 2,
    purposeTags: ["体験したい", "記念日に行きたい"],
    coords: { lat: 34.249, lng: 133.103 },
  }),
  makeSample({
    id: "achi-stars",
    name: "阿智村の星空",
    location: "長野県・阿智村",
    country: "日本",
    category: "星空",
    tags: ["星空", "一生に一度", "日本"],
    score: 91,
    bestSeason: "冬",
    bestSeasonRange: "10月〜3月",
    bestTime: "夜",
    conditions: ["新月", "晴れ", "低月明かり"],
    nextChance: "新月週が狙い目",
    timingTip: "空気が澄む冬の新月に、街明かりを避ける。",
    timingEase: 4,
    onceInLifeLevel: "special",
    recommendedWith: "友達",
    reason: "日本有数の星空を、静かな夜に見上げたい。",
    status: "dream",
    imageGradient: gradients[6],
    imageUrl: photoLibrary.stars,
    travelType: "Starry Sky Seeker",
    difficulty: 2,
    estimatedCostLevel: 2,
    purposeTags: ["癒されたい", "写真で残したい"],
    coords: { lat: 35.443, lng: 137.747 },
  }),
  makeSample({
    id: "hitachi-nemophila",
    name: "国営ひたち海浜公園のネモフィラ",
    location: "茨城県・ひたちなか市",
    country: "日本",
    category: "花畑",
    tags: ["花畑", "海", "カップル", "日本"],
    score: 86,
    bestSeason: "春",
    bestSeasonRange: "4月中旬〜5月上旬",
    bestTime: "昼",
    conditions: ["晴れ"],
    nextChance: "春の短期集中",
    timingTip: "満開ピークの平日午前が、青の密度も人の少なさも良い。",
    timingEase: 4,
    onceInLifeLevel: "special",
    recommendedWith: "家族",
    reason: "空と丘が青でつながる景色を見たい。",
    status: "want",
    imageGradient: gradients[8],
    imageUrl: photoLibrary.flower,
    travelType: "Hidden Japan Explorer",
    difficulty: 1,
    estimatedCostLevel: 1,
    purposeTags: ["写真で残したい", "癒されたい"],
    coords: { lat: 36.401, lng: 140.591 },
  }),
  makeSample({
    id: "shirakawago-snow",
    name: "白川郷の雪景色",
    location: "岐阜県・白川村",
    country: "日本",
    category: "雪景色",
    tags: ["雪", "一生に一度", "家族", "日本"],
    score: 90,
    bestSeason: "冬",
    bestSeasonRange: "1月〜2月",
    bestTime: "夕方",
    conditions: ["雪"],
    nextChance: "冬のライトアップ時期",
    timingTip: "雪が積もった夕暮れは、合掌造りの灯りがいちばん映える。",
    timingEase: 3,
    onceInLifeLevel: "once-in-life",
    recommendedWith: "家族",
    reason: "合掌造りに雪が積もる景色を見たい。",
    status: "want",
    imageGradient: gradients[4],
    imageUrl: photoLibrary.snow,
    travelType: "Hidden Japan Explorer",
    difficulty: 3,
    estimatedCostLevel: 2,
    purposeTags: ["癒されたい", "写真で残したい"],
    coords: { lat: 36.257, lng: 136.907 },
  }),
  makeSample({
    id: "yakushima-forest",
    name: "屋久島の苔むす森",
    location: "鹿児島県・屋久島",
    country: "日本",
    category: "森",
    tags: ["森", "滝", "一生に一度", "日本"],
    score: 92,
    bestSeason: "春",
    bestSeasonRange: "3月〜6月",
    bestTime: "朝",
    conditions: ["雨上がり"],
    nextChance: "雨上がりの朝が本命",
    timingTip: "小雨の翌朝は苔の色が深く、森の湿度が美しい。",
    timingEase: 3,
    onceInLifeLevel: "once-in-life",
    recommendedWith: "ひとり",
    reason: "苔と森の奥に入って、時間が止まる感じを味わいたい。",
    status: "dream",
    imageGradient: gradients[2],
    imageUrl: photoLibrary.forest,
    travelType: "Hidden Japan Explorer",
    difficulty: 4,
    estimatedCostLevel: 3,
    purposeTags: ["体験したい", "人生を変えたい"],
    coords: { lat: 30.358, lng: 130.528 },
  }),
  makeSample({
    id: "oirase-stream",
    name: "奥入瀬渓流",
    location: "青森県・十和田市",
    country: "日本",
    category: "森",
    tags: ["滝", "紅葉", "森", "日本"],
    score: 85,
    bestSeason: "秋",
    bestSeasonRange: "10月中旬〜11月上旬",
    bestTime: "朝",
    conditions: ["雨上がり", "紅葉"],
    nextChance: "秋の朝散歩が最高",
    timingTip: "雨上がりは水量と苔の光り方がきれい。",
    timingEase: 4,
    onceInLifeLevel: "special",
    recommendedWith: "家族",
    reason: "渓流沿いを歩いて、紅葉と水音に浸りたい。",
    status: "want",
    imageGradient: gradients[2],
    imageUrl: photoLibrary.stream,
    travelType: "Hidden Japan Explorer",
    difficulty: 2,
    estimatedCostLevel: 2,
    purposeTags: ["癒されたい", "体験したい"],
    coords: { lat: 40.578, lng: 140.999 },
  }),
  makeSample({
    id: "tottori-dunes",
    name: "鳥取砂丘",
    location: "鳥取県・鳥取市",
    country: "日本",
    category: "砂漠",
    tags: ["砂漠", "夕日", "ドライブ", "日本"],
    score: 83,
    bestSeason: "秋",
    bestSeasonRange: "9月〜11月",
    bestTime: "夕方",
    conditions: ["晴れ"],
    nextChance: "夕焼け日に狙える",
    timingTip: "風紋が残る朝か、夕日で影が伸びる時間が美しい。",
    timingEase: 5,
    onceInLifeLevel: "normal",
    recommendedWith: "友達",
    reason: "日本で砂丘のスケールを体感したい。",
    status: "visited",
    imageGradient: gradients[7],
    imageUrl: photoLibrary.desert,
    travelType: "Sunset Collector",
    difficulty: 1,
    estimatedCostLevel: 1,
    purposeTags: ["体験したい", "写真で残したい"],
    coords: { lat: 35.54, lng: 134.231 },
  }),
  makeSample({
    id: "uyuni-salt-flat",
    name: "ウユニ塩湖",
    location: "ボリビア・ポトシ県",
    country: "ボリビア",
    category: "一生に一度",
    tags: ["海外", "一生に一度", "夕日", "星空"],
    score: 99,
    bestSeason: "雨季",
    bestSeasonRange: "1月〜3月",
    bestTime: "夕方",
    conditions: ["雨上がり", "無風"],
    nextChance: "雨季の鏡張りシーズン",
    timingTip: "薄く水が張り、風が止まる日没前後を狙う。",
    timingEase: 2,
    onceInLifeLevel: "once-in-life",
    recommendedWith: "いつかの自分",
    reason: "空と地面がひとつになる鏡張りを見たい。",
    status: "dream",
    imageGradient: gradients[8],
    imageUrl: photoLibrary.saltFlat,
    travelType: "World Wonder Seeker",
    difficulty: 5,
    estimatedCostLevel: 5,
    purposeTags: ["人生を変えたい", "写真で残したい"],
    coords: { lat: -20.133, lng: -67.489 },
  }),
  makeSample({
    id: "iceland-aurora",
    name: "アイスランドのオーロラ",
    location: "アイスランド・レイキャビク近郊",
    country: "アイスランド",
    category: "オーロラ",
    tags: ["オーロラ", "雪", "海外", "一生に一度"],
    score: 97,
    bestSeason: "冬",
    bestSeasonRange: "9月〜3月",
    bestTime: "夜",
    conditions: ["晴れ", "低月明かり"],
    nextChance: "冬の晴れた夜",
    timingTip: "月明かりが弱く、雲が少ない夜に郊外へ出る。",
    timingEase: 2,
    onceInLifeLevel: "once-in-life",
    recommendedWith: "恋人",
    reason: "空がゆっくり光る瞬間を見たい。",
    status: "dream",
    imageGradient: gradients[6],
    imageUrl: photoLibrary.aurora,
    travelType: "Aurora Chaser",
    difficulty: 5,
    estimatedCostLevel: 5,
    purposeTags: ["人生を変えたい", "記念日に行きたい"],
    coords: { lat: 64.146, lng: -21.942 },
  }),
  makeSample({
    id: "santorini-sunset",
    name: "サントリーニ島の夕日",
    location: "ギリシャ・サントリーニ島",
    country: "ギリシャ",
    category: "島",
    tags: ["海外", "島", "夕日", "カップル", "海"],
    score: 93,
    bestSeason: "夏",
    bestSeasonRange: "5月〜9月",
    bestTime: "夕方",
    conditions: ["晴れ"],
    nextChance: "夏の夕暮れ旅",
    timingTip: "日没90分前に場所を決め、白い街が染まる時間から楽しむ。",
    timingEase: 4,
    onceInLifeLevel: "special",
    recommendedWith: "恋人",
    reason: "白い街と海が夕日に染まるのを見たい。",
    status: "want",
    imageGradient: gradients[7],
    imageUrl: photoLibrary.santorini,
    travelType: "Couple Trip Planner",
    difficulty: 3,
    estimatedCostLevel: 4,
    purposeTags: ["記念日に行きたい", "写真で残したい"],
    coords: { lat: 36.393, lng: 25.461 },
  }),
  makeSample({
    id: "machu-picchu",
    name: "マチュピチュ",
    location: "ペルー・クスコ",
    country: "ペルー",
    category: "世界遺産",
    tags: ["海外", "世界遺産", "雲海", "一生に一度"],
    score: 96,
    bestSeason: "冬",
    bestSeasonRange: "5月〜9月",
    bestTime: "朝",
    conditions: ["晴れ", "霧"],
    nextChance: "乾季の朝が本命",
    timingTip: "朝霧が抜けて遺跡が現れる時間を狙う。",
    timingEase: 3,
    onceInLifeLevel: "once-in-life",
    recommendedWith: "友達",
    reason: "雲の上の遺跡を、自分の足で見に行きたい。",
    status: "dream",
    imageGradient: gradients[3],
    imageUrl: photoLibrary.ruins,
    travelType: "World Wonder Seeker",
    difficulty: 5,
    estimatedCostLevel: 5,
    purposeTags: ["挑戦したい", "人生を変えたい"],
    coords: { lat: -13.163, lng: -72.545 },
  }),
  makeSample({
    id: "tekapo-stars",
    name: "テカポ湖の星空",
    location: "ニュージーランド・テカポ",
    country: "ニュージーランド",
    category: "星空",
    tags: ["海外", "星空", "湖", "一生に一度"],
    score: 95,
    bestSeason: "冬",
    bestSeasonRange: "4月〜9月",
    bestTime: "夜",
    conditions: ["新月", "晴れ", "雲が少ない"],
    nextChance: "新月の夜が最高",
    timingTip: "南半球の冬は夜が長く、天の川を狙いやすい。",
    timingEase: 3,
    onceInLifeLevel: "once-in-life",
    recommendedWith: "いつかの自分",
    reason: "湖畔で南半球の星空を見たい。",
    status: "dream",
    imageGradient: gradients[0],
    imageUrl: photoLibrary.stars,
    travelType: "Starry Sky Seeker",
    difficulty: 4,
    estimatedCostLevel: 5,
    purposeTags: ["癒されたい", "写真で残したい"],
    coords: { lat: -44.004, lng: 170.477 },
  }),
  makeSample({
    id: "namib-desert",
    name: "ナミブ砂漠",
    location: "ナミビア・ソススフレイ",
    country: "ナミビア",
    category: "砂漠",
    tags: ["海外", "砂漠", "朝日", "一生に一度"],
    score: 94,
    bestSeason: "冬",
    bestSeasonRange: "5月〜9月",
    bestTime: "朝",
    conditions: ["晴れ"],
    nextChance: "乾季の朝日が狙い目",
    timingTip: "日の出直後、砂丘の影が伸びる時間が圧倒的。",
    timingEase: 2,
    onceInLifeLevel: "once-in-life",
    recommendedWith: "友達",
    reason: "世界最古級の砂漠で、赤い砂丘の朝日を見たい。",
    status: "dream",
    imageGradient: gradients[7],
    imageUrl: photoLibrary.desert,
    travelType: "World Wonder Seeker",
    difficulty: 5,
    estimatedCostLevel: 5,
    purposeTags: ["挑戦したい", "写真で残したい"],
    coords: { lat: -24.74, lng: 15.288 },
  }),
  makeSample({
    id: "grand-canyon",
    name: "グランドキャニオン",
    location: "アメリカ・アリゾナ州",
    country: "アメリカ",
    category: "世界遺産",
    tags: ["海外", "朝日", "夕日", "一生に一度"],
    score: 92,
    bestSeason: "春",
    bestSeasonRange: "4月〜6月 / 9月〜10月",
    bestTime: "夕方",
    conditions: ["晴れ"],
    nextChance: "春秋が快適",
    timingTip: "夕方は岩肌のレイヤーが濃く見え、写真も撮りやすい。",
    timingEase: 4,
    onceInLifeLevel: "special",
    recommendedWith: "家族",
    reason: "地球のスケールを体で感じたい。",
    status: "want",
    imageGradient: gradients[7],
    imageUrl: photoLibrary.canyon,
    travelType: "World Wonder Seeker",
    difficulty: 3,
    estimatedCostLevel: 4,
    purposeTags: ["体験したい", "人生を変えたい"],
    coords: { lat: 36.107, lng: -112.113 },
  }),
  makeSample({
    id: "cappadocia-balloons",
    name: "カッパドキアの気球",
    location: "トルコ・カッパドキア",
    country: "トルコ",
    category: "世界遺産",
    tags: ["海外", "朝日", "一生に一度", "カップル"],
    score: 93,
    bestSeason: "春",
    bestSeasonRange: "4月〜6月 / 9月〜10月",
    bestTime: "早朝",
    conditions: ["晴れ", "無風"],
    nextChance: "春秋の早朝",
    timingTip: "風が弱い日の夜明け前に出発し、朝焼けを待つ。",
    timingEase: 3,
    onceInLifeLevel: "once-in-life",
    recommendedWith: "恋人",
    reason: "朝焼けの空に気球が浮かぶ景色を見たい。",
    status: "planned",
    imageGradient: gradients[9],
    imageUrl: photoLibrary.balloon,
    travelType: "Couple Trip Planner",
    difficulty: 3,
    estimatedCostLevel: 4,
    purposeTags: ["記念日に行きたい", "写真で残したい"],
    coords: { lat: 38.643, lng: 34.829 },
  }),
  makeSample({
    id: "maldives-sea",
    name: "モルディブの海",
    location: "モルディブ",
    country: "モルディブ",
    category: "海",
    tags: ["海外", "海", "島", "カップル"],
    score: 95,
    bestSeason: "冬",
    bestSeasonRange: "11月〜4月",
    bestTime: "昼",
    conditions: ["晴れ", "干潮"],
    nextChance: "乾季の昼が最強",
    timingTip: "乾季の晴れた昼は、ラグーンの青がいちばん抜ける。",
    timingEase: 4,
    onceInLifeLevel: "special",
    recommendedWith: "恋人",
    reason: "水上ヴィラから信じられない青を見たい。",
    status: "dream",
    imageGradient: gradients[1],
    imageUrl: photoLibrary.beach,
    travelType: "Island Dreamer",
    difficulty: 3,
    estimatedCostLevel: 5,
    purposeTags: ["癒されたい", "記念日に行きたい"],
    coords: { lat: 3.202, lng: 73.22 },
  }),
  makeSample({
    id: "lampedusa-rabbits",
    name: "ランペドゥーザ島",
    location: "イタリア・ランペドゥーザ島",
    country: "イタリア",
    category: "海",
    tags: ["海外", "海", "島", "一生に一度"],
    score: 90,
    bestSeason: "夏",
    bestSeasonRange: "6月〜9月",
    bestTime: "昼",
    conditions: ["晴れ", "干潮"],
    nextChance: "夏の透明度狙い",
    timingTip: "風が弱い晴れの日は、船が浮いて見えるほど透明になる。",
    timingEase: 3,
    onceInLifeLevel: "special",
    recommendedWith: "友達",
    reason: "地中海の透明な海を見たい。",
    status: "want",
    imageGradient: gradients[1],
    imageUrl: photoLibrary.beach,
    travelType: "Island Dreamer",
    difficulty: 4,
    estimatedCostLevel: 4,
    purposeTags: ["写真で残したい", "癒されたい"],
    coords: { lat: 35.508, lng: 12.592 },
  }),
];

const emptyForm: SpotDraft = {
  name: "",
  location: "",
  country: "日本",
  category: "星空",
  tags: ["一生に一度"],
  score: 88,
  bestSeason: "通年",
  bestSeasonRange: "ベストな時期を探し中",
  bestTime: "いつでも",
  conditions: ["晴れ"],
  nextChance: "条件が揃えばいつでも",
  timingTip: "晴れた日を狙って、少し余裕のある旅程にする。",
  timingEase: 4,
  onceInLifeLevel: "special",
  recommendedWith: "いつかの自分",
  reason: "",
  memo: "",
  visitedDate: new Date().toISOString().slice(0, 10),
  memoryTitle: "",
  emotion: "最高",
  weatherMood: "快晴",
  photoStory: "",
  favoriteMoment: "",
  visibility: "private",
  albumTags: ["旅の記憶"],
  status: "visited",
  imageGradient: gradients[0],
  imageUrl: photoLibrary.stars,
  imageAlt: "追加した絶景写真",
  travelType: "Once-in-Life Hunter",
  difficulty: 2,
  estimatedCostLevel: 2,
  purposeTags: ["写真で残したい"],
  coords: { lat: 35.681, lng: 139.767 },
};

export default function Home() {
  const [spots, setSpots] = useState<Spot[]>(samples);
  const [loaded, setLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareSpot, setShareSpot] = useState<Spot | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [season, setSeason] = useState<Season | "すべて">("すべて");
  const [time, setTime] = useState<TimeSlot | "すべて">("すべて");
  const [status, setStatus] = useState<Status | "all">("all");
  const [query, setQuery] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as unknown;
        if (Array.isArray(parsed)) {
          setSpots(parsed.map((spot, index) => normalizeSpot(spot, index)));
        }
      } catch {
        setSpots(samples);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(spots));
      setSaveError("");
    } catch {
      setSaveError("写真データが大きすぎて保存できませんでした。画像を小さめにしてもう一度追加してください。");
    }
  }, [loaded, spots]);

  const analysis = useMemo(() => analyzeSpots(spots), [spots]);
  const recommendation = useMemo(() => buildRecommendation(spots), [spots]);
  const ranked = useMemo(() => [...spots].sort((a, b) => b.score - a.score), [spots]);

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return spots.filter((spot) => {
      const tagOk = activeTags.length === 0 || activeTags.every((tag) => spot.tags.includes(tag));
      const seasonOk = season === "すべて" || spot.bestSeason === season;
      const timeOk = time === "すべて" || spot.bestTime === time;
      const statusOk = status === "all" || spot.status === status;
      const textOk =
        !text ||
        [
          spot.name,
          spot.location,
          spot.country,
          spot.category,
          spot.reason,
          spot.memo,
          spot.travelType,
          ...spot.tags,
          ...spot.conditions,
          ...spot.purposeTags,
        ]
          .join(" ")
          .toLowerCase()
          .includes(text);
      return tagOk && seasonOk && timeOk && statusOk && textOk;
    });
  }, [activeTags, query, season, spots, status, time]);

  const addSpot = (draft: SpotDraft) => {
    setSpots((current) => [
      {
        ...draft,
        id: createId(),
        saved: true,
        imageAlt: `${draft.name}の絶景写真`,
        coords: draft.coords.lat || draft.coords.lng ? draft.coords : guessCoordinates(draft.location, draft.country, draft.tags, current.length),
      },
      ...current,
    ]);
  };

  const updateSpot = (id: string, patch: Partial<Spot>) => {
    setSpots((current) => current.map((spot) => (spot.id === id ? { ...spot, ...patch } : spot)));
    setSelectedSpot((current) => (current?.id === id ? { ...current, ...patch } : current));
  };

  const openShare = (spot?: Spot) => {
    setShareSpot(spot ?? null);
    setShareOpen(true);
  };

  const applyStarterPack = (packTags: string[]) => {
    setActiveTags(packTags);
    setSeason("すべて");
    setTime("すべて");
    setStatus("all");
    setQuery("");
    window.requestAnimationFrame(() => document.getElementById("list")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <main className="min-h-screen overflow-hidden pb-24 sm:pb-0">
      <Header onAdd={() => setModalOpen(true)} onShare={() => openShare()} />
      <Hero onAdd={() => setModalOpen(true)} onShare={() => openShare(recommendation.spot)} />

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-coral">
              <BarChart3 className="h-4 w-4" />
              My Zekkei Museum Summary
            </p>
            <h2 className="text-2xl font-black tracking-normal text-ink sm:text-3xl">あなたの旅の記憶が、ここに積み上がります。</h2>
          </div>
          <p className="max-w-md text-sm font-semibold leading-6 text-slate-500">行った絶景も、これから行きたい絶景も、写真・場所・感情でひとつにまとめられます。</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Stat icon={<MapPin />} label="訪れた絶景" value={analysis.memoryCount} note="行った景色" />
          <Stat icon={<Trophy />} label="記録した写真" value={analysis.photoCount} note="自分だけのMuseum" />
          <Stat icon={<Star />} label="今年の旅ログ" value={analysis.thisYearCount} note="今年のまとめ" />
          <Stat icon={<Sparkles />} label="思い出スコア" value={analysis.averageScore} note="Memory Score" />
        </div>
        {saveError && <p className="mt-4 rounded-2xl bg-coral/10 px-4 py-3 text-sm font-bold text-coral">{saveError}</p>}
      </section>

      <MemoryGallery spots={spots} analysis={analysis} onOpen={setSelectedSpot} onAdd={() => setModalOpen(true)} onShare={() => openShare()} />
      <MuseumSharePreview spots={spots} analysis={analysis} spot={recommendation.spot} onShare={() => openShare(recommendation.spot)} />
      <YearRecapSection spots={spots} analysis={analysis} onOpen={setSelectedSpot} onShare={() => openShare(recommendation.spot)} />
      <NextRecommendationCard recommendation={recommendation} onOpen={() => setSelectedSpot(recommendation.spot)} onShare={() => openShare(recommendation.spot)} />
      <MapAndInsights spots={spots} analysis={analysis} />

      <section id="list" className="mx-auto w-full max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-coral">
              <Sparkles className="h-4 w-4" />
              Memory Dashboard / 旅の記憶ダッシュボード
            </p>
            <h2 className="text-3xl font-semibold tracking-normal text-ink sm:text-4xl">行った景色も、行きたい景色もここで整理する。</h2>
          </div>
          <label className="glass-panel flex h-12 w-full items-center gap-3 rounded-full px-4 lg:max-w-sm">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="場所、感情、思い出で検索"
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        <StatusTabs status={status} spots={spots} onChange={setStatus} />

        <div className="glass-panel mt-4 rounded-[1.75rem] p-3">
          <div className="flex items-center gap-2 px-2 pb-3 pt-1 text-sm font-bold text-slate-600">
            <Filter className="h-4 w-4 text-coral" />
            景色を絞り込む
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
            <FilterButton active={activeTags.length === 0} onClick={() => setActiveTags([])}>
              すべて
            </FilterButton>
            {tags.map((tag) => (
              <FilterButton
                key={tag}
                active={activeTags.includes(tag)}
                onClick={() => setActiveTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]))}
              >
                {tag}
              </FilterButton>
            ))}
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <Select label="季節" value={season} options={["すべて", ...seasons]} onChange={(value) => setSeason(value as Season | "すべて")} />
            <Select label="時間帯" value={time} options={["すべて", ...times]} onChange={(value) => setTime(value as TimeSlot | "すべて")} />
          </div>
        </div>

        {filtered.length ? (
          <motion.div layout className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((spot, index) => (
                <ZekkeiCard
                  key={spot.id}
                  spot={spot}
                  index={index}
                  onOpen={() => setSelectedSpot(spot)}
                  onToggleSaved={() => updateSpot(spot.id, { saved: !spot.saved })}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <Empty onAdd={() => setModalOpen(true)} />
        )}
      </section>

      <StarterPacksSection onPick={applyStarterPack} onAdd={() => setModalOpen(true)} onShare={() => openShare()} />
      <ShareSection spots={spots} top={ranked.slice(0, 3)} analysis={analysis} onShare={() => openShare()} />
      <AddZekkeiModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onAdd={addSpot} />
      <ZekkeiDetailModal spot={selectedSpot} onClose={() => setSelectedSpot(null)} onUpdate={updateSpot} onShare={(spot) => openShare(spot)} />
      <ShareCardModal isOpen={shareOpen} onClose={() => setShareOpen(false)} spots={spots} analysis={analysis} recommendation={recommendation} featuredSpot={shareSpot} />
      <MobileBottomDock onAdd={() => setModalOpen(true)} onShare={() => openShare()} />
    </main>
  );
}

function makeSample(
  spot: Omit<Spot, "memo" | "imageAlt" | "saved" | "visitedDate" | "memoryTitle" | "emotion" | "weatherMood" | "photoStory" | "favoriteMoment" | "visibility" | "albumTags"> & {
    memo?: string;
    visitedDate?: string;
    memoryTitle?: string;
    emotion?: string;
    weatherMood?: string;
    photoStory?: string;
    favoriteMoment?: string;
    visibility?: "private" | "share";
    albumTags?: string[];
  },
) {
  return {
    ...spot,
    status: "visited" as Status,
    memo: spot.memo ?? spot.reason,
    visitedDate: spot.visitedDate ?? sampleDateFromId(spot.id),
    memoryTitle: spot.memoryTitle ?? `${spot.name}で見た、忘れたくない光`,
    emotion: spot.emotion ?? pickByIndex(emotionTags, spot.id.length),
    weatherMood: spot.weatherMood ?? pickByIndex(weatherMoods, spot.id.length),
    photoStory: spot.photoStory ?? spot.reason,
    favoriteMoment: spot.favoriteMoment ?? `${spot.bestTime}に景色の色が変わった瞬間`,
    visibility: spot.visibility ?? "private",
    albumTags: spot.albumTags ?? ["旅の記憶", spot.country, spot.category],
    imageAlt: `${spot.name}の絶景写真`,
    saved: true,
  };
}

function Header({ onAdd, onShare }: { onAdd: () => void; onShare: () => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/45 bg-white/72 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-white shadow-soft">
            <Compass className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-base font-bold tracking-normal text-ink">Zekkei List</span>
            <span className="hidden text-xs font-medium text-slate-500 sm:block">自分だけの旅の記憶Museum</span>
          </span>
        </a>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
          <a href="#gallery">記憶を見る</a>
          <a href="#share">共有カード</a>
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={onShare} aria-label="共有カードを開く" className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink shadow-soft ring-1 ring-slate-200">
            <Share2 className="h-4 w-4" />
          </button>
          <button onClick={onAdd} className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">写真を追加</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function MemoryGallery({
  spots,
  analysis,
  onOpen,
  onAdd,
  onShare,
}: {
  spots: Spot[];
  analysis: Analysis;
  onOpen: (spot: Spot) => void;
  onAdd: () => void;
  onShare: () => void;
}) {
  const memories = spots.filter((spot) => spot.status === "visited").sort((a, b) => b.score - a.score);
  const featured = memories[0] ?? spots[0];
  const tiles = memories.length ? memories.slice(0, 7) : spots.slice(0, 7);

  return (
    <section id="gallery" className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-coral">
            <Heart className="h-4 w-4" />
            Memory Gallery
          </p>
          <h2 className="text-3xl font-black tracking-normal text-ink sm:text-4xl">自分が撮った絶景だけの、旅の記憶美術館。</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={onShare} className="hidden h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-black text-ink shadow-soft ring-1 ring-slate-200 sm:inline-flex">
            <Share2 className="h-4 w-4" />
            Memoriesを共有
          </button>
          <button onClick={onAdd} className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-black text-white shadow-soft">
            <Upload className="h-4 w-4" />
            写真を追加
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <button onClick={() => onOpen(featured)} className="group grain relative min-h-[520px] overflow-hidden rounded-[2.25rem] bg-ink p-6 text-left text-white shadow-glow">
          <PhotoFill src={featured.imageUrl} alt={featured.imageAlt} className="transition duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/18 via-black/12 to-black/78" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex justify-between gap-4">
              <Pill label="Best Memory" light />
              <Score score={featured.score} light />
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-white/65">{featured.visitedDate} / {featured.emotion}</p>
              <h3 className="text-4xl font-black leading-tight tracking-normal sm:text-5xl">{featured.memoryTitle}</h3>
              <p className="mt-4 max-w-xl text-sm font-semibold leading-7 text-white/70">{featured.photoStory}</p>
            </div>
          </div>
        </button>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
          {tiles.slice(1).map((spot, index) => (
            <button
              key={spot.id}
              onClick={() => onOpen(spot)}
              className={`group relative overflow-hidden rounded-[1.75rem] bg-ink text-left text-white shadow-soft ${index === 0 ? "min-h-[250px] sm:col-span-2 lg:col-span-1" : "min-h-[210px]"}`}
            >
              <PhotoFill src={spot.imageUrl} alt={spot.imageAlt} className="transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/12 via-black/0 to-black/72" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-xs font-bold text-white/62">{spot.visitedDate} / {spot.weatherMood}</p>
                <p className="mt-1 line-clamp-2 text-lg font-black">{spot.name}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-[1.75rem] bg-white p-4 shadow-soft ring-1 ring-slate-200/70 sm:grid-cols-4">
        <MemoryMini label="一番多い感情" value={analysis.topEmotion} />
        <MemoryMini label="天気の記憶" value={analysis.topWeatherMood} />
        <MemoryMini label="旅タイプ" value={analysis.travelType} />
        <MemoryMini label="今年の写真" value={`${analysis.thisYearCount}枚`} />
      </div>
    </section>
  );
}

function MemoryMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] bg-slate-50 p-4 ring-1 ring-slate-100">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 truncate text-xl font-black text-ink">{value}</p>
    </div>
  );
}

function MuseumSharePreview({ spots, analysis, spot, onShare }: { spots: Spot[]; analysis: Analysis; spot: Spot; onShare: () => void }) {
  const topTags = analysis.topTags.slice(0, 3);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-coral">
            <Share2 className="h-4 w-4" />
            Share Preview / 思い出カード
          </p>
          <h2 className="text-3xl font-black tracking-normal text-ink sm:text-4xl">My Zekkei Museumを、ストーリーに載せたくなる1枚へ。</h2>
          <p className="mt-4 max-w-xl text-sm font-semibold leading-7 text-slate-500">
            記録した絶景数、旅タイプ、一番多い感情、Best Memoryを自動でまとめます。スクショするだけで、あなたの旅の記憶カードになります。
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button onClick={onShare} className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-black text-white shadow-soft">
              <LayoutPanelTop className="h-4 w-4" />
              思い出カードを作る
            </button>
            <a href="#gallery" className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-black text-ink shadow-soft ring-1 ring-slate-200">
              <Heart className="h-4 w-4 text-coral" />
              記憶を見る
            </a>
          </div>
        </div>

        <button onClick={onShare} className="group mx-auto w-full max-w-sm text-left lg:ml-auto">
          <div className="relative min-h-[560px] overflow-hidden rounded-[2.25rem] bg-ink p-6 text-white shadow-glow transition group-hover:-translate-y-1">
            <PhotoFill src={spot.imageUrl} alt={spot.imageAlt} className="opacity-58 transition group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-br from-ink/94 via-ink/66 to-coral/38" />
            <div className="absolute right-0 top-8 h-44 w-44 rounded-full bg-lagoon/30 blur-3xl" />
            <div className="relative z-10 flex min-h-[512px] flex-col justify-between">
              <div>
                <div className="mb-8 flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-white/52">Zekkei List</p>
                  <Sparkles className="h-5 w-5 text-coral" />
                </div>
                <p className="text-sm font-bold text-white/58">My Zekkei Museum</p>
                <h3 className="mt-3 text-4xl font-black leading-tight tracking-normal">私の旅の記憶美術館</h3>
                <p className="mt-4 text-sm font-semibold leading-6 text-white/68">忘れたくない景色、{spots.length}個。Best Memoryは「{spot.name}」。</p>
              </div>
              <div>
                <div className="grid grid-cols-2 gap-3">
                  <ShareMetric label="記録した絶景" value={`${analysis.memoryCount}`} />
                  <ShareMetric label="思い出Score" value={`${analysis.averageScore}`} />
                  <ShareMetric label="多い感情" value={analysis.topEmotion} />
                  <ShareMetric label="今年の旅" value={`${analysis.thisYearCount}`} />
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {topTags.map((tag) => (
                    <span key={tag.label} className="rounded-full bg-white/12 px-3 py-1.5 text-xs font-black ring-1 ring-white/10">#{tag.label}</span>
                  ))}
                </div>
                <div className="mt-5 rounded-[1.35rem] bg-white/12 p-4 backdrop-blur-xl">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Best Memory</p>
                  <p className="mt-2 text-lg font-black">{spot.name}</p>
                  <p className="mt-1 text-xs font-semibold text-white/52">{spot.visitedDate} / {spot.emotion}</p>
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>
    </section>
  );
}

function YearRecapSection({ spots, analysis, onOpen, onShare }: { spots: Spot[]; analysis: Analysis; onOpen: (spot: Spot) => void; onShare: () => void }) {
  const year = new Date().getFullYear();
  const memories = analysis.thisYearMemories.length ? analysis.thisYearMemories : spots.filter((spot) => spot.status === "visited").slice(0, 4);
  const best = memories[0] ?? spots[0];

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2.25rem] bg-white p-5 shadow-soft ring-1 ring-slate-200/70 sm:p-6 lg:p-7">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-coral">
              <CalendarDays className="h-4 w-4" />
              {year} Recap / 今年一年のまとめ
            </p>
            <h2 className="text-3xl font-black tracking-normal text-ink sm:text-4xl">今年見た景色を、年末に見返したくなる形で。</h2>
          </div>
          <button onClick={onShare} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-black text-white shadow-soft">
            <Share2 className="h-4 w-4" />
            今年の思い出カード
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <button onClick={() => best && onOpen(best)} className="relative min-h-[320px] overflow-hidden rounded-[1.75rem] bg-ink p-5 text-left text-white shadow-soft">
            {best && <PhotoFill src={best.imageUrl} alt={best.imageAlt} />}
            <div className="absolute inset-0 bg-gradient-to-b from-black/18 via-black/8 to-black/78" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <Pill label="今年のBest Memory" light />
              <div>
                <p className="mb-1 text-sm font-bold text-white/65">{best?.visitedDate ?? `${year}`}</p>
                <h3 className="text-3xl font-black leading-tight">{best?.memoryTitle ?? "今年の絶景を追加しよう"}</h3>
                <p className="mt-3 line-clamp-3 text-sm font-semibold leading-6 text-white/68">{best?.photoStory ?? "今年の旅の写真を1枚追加すると、ここに美しくまとまります。"}</p>
              </div>
            </div>
          </button>

          <div className="grid gap-3 sm:grid-cols-2">
            <RecapMetric label="今年記録した絶景" value={`${analysis.thisYearCount}`} note="visited this year" />
            <RecapMetric label="一番多い感情" value={analysis.topEmotion} note="emotion palette" />
            <RecapMetric label="よく残した景色" value={analysis.topTags[0]?.label ?? "絶景"} note="top tag" />
            <RecapMetric label="旅タイプ" value={analysis.travelType} note="museum style" />
            <div className="sm:col-span-2 grid gap-3">
              {memories.slice(0, 3).map((spot) => (
                <button key={spot.id} onClick={() => onOpen(spot)} className="flex items-center gap-3 rounded-[1.25rem] bg-slate-50 p-3 text-left ring-1 ring-slate-100 transition hover:bg-white hover:shadow-soft">
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-ink">
                    <PhotoFill src={spot.imageUrl} alt={spot.imageAlt} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black text-ink">{spot.name}</span>
                    <span className="mt-1 block truncate text-xs font-bold text-slate-400">{spot.visitedDate} / {spot.emotion}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RecapMetric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-100">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 truncate text-2xl font-black text-ink">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-400">{note}</p>
    </div>
  );
}

function StarterPacksSection({ onPick, onAdd, onShare }: { onPick: (tags: string[]) => void; onAdd: () => void; onShare: () => void }) {
  const packs = [
    { title: "星空の記憶", copy: "夜・新月・鳥肌", tags: ["星空"], gradient: "from-[#111827] via-[#3544a4] to-[#f7c77b]" },
    { title: "海の記憶", copy: "青・島・癒された", tags: ["海", "島"], gradient: "from-[#006b8f] via-[#20bdd1] to-[#fff0c8]" },
    { title: "世界旅の記憶", copy: "海外・一生もの・人生ベスト", tags: ["海外"], gradient: "from-[#2a1748] via-[#7b61ff] to-[#ffcf91]" },
    { title: "週末旅の記憶", copy: "日本・森・また行きたい", tags: ["日本"], gradient: "from-[#173b2b] via-[#2e8b76] to-[#f8d889]" },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-coral">
            <Wand2 className="h-4 w-4" />
            Curate your museum
          </p>
          <h2 className="text-2xl font-black tracking-normal text-ink sm:text-3xl">写真を見返す気持ちよさで、旅の記憶を選ぶ。</h2>
        </div>
        <button onClick={onAdd} className="hidden h-11 shrink-0 items-center gap-2 rounded-full bg-ink px-5 text-sm font-black text-white shadow-soft sm:inline-flex">
          <Plus className="h-4 w-4" />
          写真を追加
        </button>
      </div>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
        {packs.map((pack) => (
          <button
            key={pack.title}
            onClick={() => onPick(pack.tags)}
            className={`grain min-w-[236px] rounded-[1.75rem] bg-gradient-to-br ${pack.gradient} p-5 text-left text-white shadow-soft transition hover:-translate-y-1 sm:min-w-0`}
          >
            <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/18 backdrop-blur-xl ring-1 ring-white/18">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="text-xl font-black">{pack.title}</p>
            <p className="mt-2 text-sm font-semibold text-white/68">{pack.copy}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {pack.tags.map((tag) => (
                <Pill key={tag} label={tag} light />
              ))}
            </div>
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 rounded-[1.75rem] bg-white p-4 shadow-soft ring-1 ring-slate-200/70 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-sm font-black text-ink">今日のMemory Mission</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">スマホに眠っている絶景写真を1枚だけ追加して、感情をひとつ添える。これだけで旅の記憶美術館が始まります。</p>
        </div>
        <button onClick={onShare} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-coral px-5 text-sm font-black text-white shadow-soft">
          <Share2 className="h-4 w-4" />
          My Museumを作る
        </button>
      </div>
    </section>
  );
}

function Hero({ onAdd, onShare }: { onAdd: () => void; onShare: () => void }) {
  return (
    <section className="relative mx-auto grid min-h-[700px] w-full max-w-7xl items-center gap-8 px-4 pb-10 pt-24 sm:min-h-[760px] sm:px-6 sm:pt-28 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
      <div className="relative z-10 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-soft backdrop-blur-xl"
        >
          <Sparkles className="h-4 w-4 text-coral" />
          あなた専用の、旅の記憶美術館。
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold leading-[1.05] tracking-normal text-ink min-[380px]:text-5xl sm:text-6xl lg:text-7xl">
          Zekkei List
        </motion.h1>
        <p className="mt-5 text-2xl font-semibold leading-relaxed text-slate-800 sm:text-3xl">スマホに眠っている絶景写真を、自分だけのMuseumに。</p>
        <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
          行った絶景、行きたい絶景、忘れたくない景色をひとつに。まずは1枚追加するだけで、あなたのZekkei Museumが始まります。
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {["まずは1枚でOK", "行った景色を残す", "行きたい景色も集める"].map((item) => (
            <Pill key={item} label={item} />
          ))}
        </div>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <button onClick={onAdd} className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-ink px-7 text-sm font-bold text-white shadow-glow transition hover:-translate-y-0.5">
            <Plus className="h-5 w-5" />
            自分のMuseumを作る
          </button>
          <button onClick={onShare} className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/75 px-7 text-sm font-bold text-ink shadow-soft backdrop-blur-xl transition hover:-translate-y-0.5">
            <Share2 className="h-5 w-5" />
            My Museumを共有する
          </button>
        </div>
        <button onClick={onAdd} className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-coral/12 px-5 text-sm font-black text-coral ring-1 ring-coral/20">
          <Upload className="h-4 w-4" />
          絶景写真を1枚追加
        </button>
      </div>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative min-h-[430px] sm:min-h-[520px]">
        <div className="hero-sky grain absolute inset-0 rounded-[2.25rem] shadow-glow" />
        <PhotoFill src={photoLibrary.stars} alt="満天の星空の絶景写真" className="rounded-[2.25rem]" priority />
        <div className="absolute inset-0 rounded-[2.25rem] bg-gradient-to-br from-ink/82 via-ink/20 to-coral/24" />
        <div className="absolute inset-x-4 bottom-5 z-10 rounded-[1.75rem] border border-white/40 bg-white/20 p-4 text-white shadow-soft backdrop-blur-xl sm:inset-x-12 sm:bottom-8 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white/78">Favorite memory</p>
              <h2 className="mt-1 text-2xl font-bold">波照間島で見た星の夜</h2>
            </div>
            <Score score={98} light />
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <MiniTiming icon={<Moon />} label="新月前後3日" />
            <MiniTiming icon={<CalendarDays />} label="6月〜9月" />
            <MiniTiming icon={<Sun />} label="晴れた夜" />
          </div>
        </div>
        <div className="absolute right-4 top-5 z-10 hidden w-52 rounded-[1.5rem] border border-white/50 bg-white/25 p-4 text-white shadow-soft backdrop-blur-xl sm:block">
          <Wand2 className="mb-4 h-5 w-5" />
          <p className="text-xs font-semibold text-white/75">Story card</p>
          <button onClick={onShare} className="mt-2 text-left text-lg font-bold">思い出カードを作る</button>
        </div>
      </motion.div>
    </section>
  );
}

function Stat({ icon, label, value, note, suffix = "" }: { icon: ReactNode; label: string; value: number; note: string; suffix?: string }) {
  return (
    <div className="glass-panel rounded-[1.75rem] p-5">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-white [&_svg]:h-5 [&_svg]:w-5">{icon}</div>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="text-4xl font-bold tracking-normal text-ink">
          {value}
          {suffix && <span className="text-2xl">{suffix}</span>}
        </p>
        <p className="pb-1 text-right text-xs font-semibold text-slate-400">{note}</p>
      </div>
    </div>
  );
}

function NextRecommendationCard({ recommendation, onOpen, onShare }: { recommendation: Recommendation; onOpen: () => void; onShare: () => void }) {
  const spot = recommendation.spot;
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grain relative overflow-hidden rounded-[2.5rem] bg-ink p-4 text-white shadow-glow sm:p-6 lg:p-8">
        <PhotoFill src={spot.imageUrl} alt={spot.imageAlt} className="opacity-64" />
        <div className="absolute inset-0 bg-gradient-to-br from-ink/94 via-ink/64 to-coral/40" />
        <div className="absolute right-8 top-8 h-48 w-48 rounded-full bg-lagoon/30 blur-3xl" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-bold text-white/78">
              <Navigation2 className="h-4 w-4" />
              Best Memory / 今いちばん大切な記憶
            </p>
            <h2 className="text-4xl font-black tracking-normal sm:text-5xl">{spot.name}</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">一番心に残っている写真は、{spot.emotion}の記憶として残っています。{spot.favoriteMoment}を、いつでも見返せる場所に。</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[spot.bestSeasonRange, spot.bestTime, ...spot.conditions.slice(0, 3)].map((item) => (
                <Pill key={item} label={item} light />
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/14 bg-white/12 p-5 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white/58">思い出の濃さ</p>
                <p className="mt-1 text-5xl font-black">{recommendation.predicted}%</p>
              </div>
              <Score score={spot.score} light />
            </div>
            <BestTimingPanel spot={spot} dark compact />
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button onClick={onOpen} className="h-12 rounded-full bg-white text-sm font-black text-ink shadow-soft">思い出を見る</button>
              <button onClick={onShare} className="h-12 rounded-full bg-coral text-sm font-black text-white shadow-soft">共有カード</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MapAndInsights({ spots, analysis }: { spots: Spot[]; analysis: Analysis }) {
  const topTags = analysis.topTags.slice(0, 5);
  const topTag = topTags[0]?.label ?? "絶景";
  const topSeason = analysis.topSeasons[0]?.label ?? "通年";
  const topTime = analysis.topTimes[0]?.label ?? "いつでも";
  const dna = [
    { label: "海と島", value: analysis.seaRate, tone: "bg-lagoon" },
    { label: "夜景・星空", value: analysis.nightRate, tone: "bg-aurora" },
    { label: "季節狙い", value: analysis.seasonalRate, tone: "bg-coral" },
    { label: "一生もの", value: analysis.onceRate, tone: "bg-white" },
  ];

  return (
    <section id="map" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-coral">
            <Map className="h-4 w-4" />
            Memory Map & Palette / 場所と感情のマップ
          </p>
          <h2 className="text-3xl font-semibold tracking-normal text-ink sm:text-4xl">行った場所と、その時の感情まで美しく見える化。</h2>
        </div>
        <div className="glass-panel rounded-full px-5 py-3 text-sm font-bold text-slate-600">
          {topSeason} / {topTime} / #{topTag}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.12fr_0.88fr]">
        <WorldZekkeiMap spots={spots} />
        <div className="grid gap-5">
          <div className="overflow-hidden rounded-[2rem] bg-ink p-5 text-white shadow-glow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-white/55">Emotion Palette</p>
                <h3 className="text-3xl font-black tracking-normal">{analysis.travelType}</h3>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3 text-right">
                <p className="text-3xl font-black">{analysis.averageScore}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">avg score</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/62">{analysis.insight}</p>
            <div className="mt-6 grid gap-3">
              {dna.map((item) => (
                <DnaMeter key={item.label} {...item} />
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <MiniInsight icon={<TrendingUp />} label="多い感情" value={analysis.topEmotion} note={`${analysis.memoryCount} memories`} />
            <MiniInsight icon={<Navigation2 />} label="天気の記憶" value={analysis.topWeatherMood} note="photo mood" />
            <MiniInsight icon={<Route />} label="今年見た絶景" value={`${analysis.thisYearCount}`} note={analysis.thisYearMemories[0]?.name ?? "写真を追加"} />
            <MiniInsight icon={<BarChart3 />} label="また見返したい" value={`${analysis.dreams.length}`} note="favorite views" />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-4">
        <DistributionCard title="Memory Season / よく残す季節" items={analysis.topSeasons} total={spots.length} />
        <DistributionCard title="Tag Signal / よく残している景色" items={analysis.topTags} total={spots.length} />
        <DistributionCard title="Photo Time / よく撮る時間帯" items={analysis.topTimes} total={spots.length} />
        <BucketProgress analysis={analysis} />
      </div>
    </section>
  );
}

function WorldZekkeiMap({ spots }: { spots: Spot[] }) {
  const mapped = spots.map((spot, index) => ({ spot, point: worldPoint(spot.coords), index }));
  const top = [...spots].sort((a, b) => b.score - a.score)[0];

  return (
    <div className="relative min-h-[560px] overflow-hidden rounded-[2.25rem] bg-[#0c1222] p-5 text-white shadow-glow sm:p-6">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(22,184,199,0.24),transparent_36%),radial-gradient(circle_at_75%_18%,rgba(255,139,104,0.26),transparent_22rem)]" />
      <div className="absolute inset-5 rounded-[1.75rem] border border-white/10" />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-white/55">Visual location / 場所の記憶</p>
          <h3 className="text-3xl font-black tracking-normal">Memory Map</h3>
        </div>
        <div className="rounded-2xl bg-white/10 px-4 py-3 text-right backdrop-blur-xl">
          <p className="text-2xl font-black">{spots.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">memories</p>
        </div>
      </div>

      <div className="absolute inset-x-5 bottom-7 top-28 rounded-[2rem] bg-white/[0.06] ring-1 ring-white/10 sm:inset-x-7">
        <WorldBlobs />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />

        {mapped.map(({ spot, point, index }) => (
          <button
            key={spot.id}
            className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            aria-label={`${spot.name}の位置`}
          >
            <span className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral/30 blur-md" />
            <span className={`relative flex h-9 w-9 items-center justify-center rounded-full shadow-glow ring-4 ring-white/20 ${spot.status === "visited" ? "bg-lagoon text-white" : "bg-white text-ink"}`}>
              <span className="text-xs font-black">{index + 1}</span>
            </span>
            <span className="pointer-events-none absolute bottom-11 left-1/2 hidden w-56 -translate-x-1/2 rounded-2xl bg-white p-3 text-left text-ink shadow-soft group-hover:block">
              <span className="block text-xs font-bold text-slate-400">{spot.country} / {spot.location}</span>
              <span className="mt-1 block text-sm font-black">{spot.name}</span>
              <span className="mt-1 block text-xs font-semibold text-coral">Score {spot.score} / {spot.nextChance}</span>
            </span>
          </button>
        ))}
      </div>

      {top && (
        <div className="absolute bottom-10 left-8 right-8 z-20 rounded-[1.5rem] border border-white/12 bg-white/10 p-4 backdrop-blur-xl sm:left-10 sm:right-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">今いちばん大切な記憶</p>
          <div className="mt-2 flex items-center justify-between gap-4">
            <div>
              <p className="text-xl font-black">{top.memoryTitle}</p>
              <p className="text-sm font-semibold text-white/56">{top.country} / {top.visitedDate}</p>
            </div>
            <Score score={top.score} light />
          </div>
        </div>
      )}
    </div>
  );
}

function WorldBlobs() {
  return (
    <>
      <div className="absolute left-[8%] top-[18%] h-[28%] w-[24%] -rotate-12 rounded-[45%] bg-white/[0.08] blur-sm" />
      <div className="absolute left-[23%] top-[48%] h-[30%] w-[17%] rotate-12 rounded-[45%] bg-white/[0.07] blur-sm" />
      <div className="absolute left-[44%] top-[20%] h-[20%] w-[16%] rotate-6 rounded-[45%] bg-white/[0.08] blur-sm" />
      <div className="absolute left-[53%] top-[34%] h-[32%] w-[18%] -rotate-6 rounded-[45%] bg-white/[0.075] blur-sm" />
      <div className="absolute left-[70%] top-[28%] h-[26%] w-[18%] rotate-12 rounded-[45%] bg-white/[0.08] blur-sm" />
      <div className="absolute left-[76%] top-[66%] h-[12%] w-[16%] -rotate-12 rounded-[50%] bg-white/[0.07] blur-sm" />
    </>
  );
}

function StatusTabs({ status, spots, onChange }: { status: Status | "all"; spots: Spot[]; onChange: (status: Status | "all") => void }) {
  return (
    <div className="glass-panel -mx-1 flex gap-2 overflow-x-auto rounded-[1.75rem] p-2 sm:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible">
      {statusTabs.map((tab) => {
        const count = tab.value === "all" ? spots.length : spots.filter((spot) => spot.status === tab.value).length;
        const active = status === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`flex min-w-[136px] items-center justify-between rounded-[1.25rem] px-4 py-3 text-left transition lg:min-w-0 ${active ? "bg-ink text-white shadow-soft" : "bg-white/60 text-slate-600 hover:bg-white"}`}
          >
            <span>
              <span className="block text-sm font-black">{tab.label}</span>
              <span className={`text-[10px] font-bold uppercase tracking-[0.14em] ${active ? "text-white/45" : "text-slate-400"}`}>{tab.short}</span>
            </span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-black ${active ? "bg-white/14" : "bg-slate-100 text-ink"}`}>{count}</span>
          </button>
        );
      })}
    </div>
  );
}

function ZekkeiCard({ spot, index, onOpen, onToggleSaved }: { spot: Spot; index: number; onOpen: () => void; onToggleSaved: () => void }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: Math.min(index * 0.035, 0.22) }}
      onClick={onOpen}
      className="group cursor-pointer overflow-hidden rounded-[2rem] bg-white shadow-soft ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-glow"
    >
      <div className={`grain relative h-80 bg-gradient-to-br ${spot.imageGradient} p-5 text-white`}>
        <PhotoFill src={spot.imageUrl} alt={spot.imageAlt} className="transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/32 via-black/10 to-black/74" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_28rem)]" />
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Pill label={statusLabels[spot.status]} light />
            {spot.tags.slice(0, 2).map((tag) => (
              <Pill key={tag} label={tag} light />
            ))}
          </div>
          <button
            aria-label="保存状態を切り替える"
            onClick={(event) => {
              event.stopPropagation();
              onToggleSaved();
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/18 text-white backdrop-blur-xl ring-1 ring-white/25"
          >
            <Heart className={`h-5 w-5 ${spot.saved ? "fill-current text-coral" : ""}`} />
          </button>
        </div>
        <div className="absolute bottom-5 left-5 right-5 z-10">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-white/75">
                <MapPin className="h-4 w-4" />
                {spot.country} / {spot.location}
              </p>
              <h3 className="text-3xl font-bold leading-tight">{spot.memoryTitle}</h3>
            </div>
            <Score score={spot.score} light />
          </div>
        </div>
      </div>
      <div className="p-5">
        <MemoryMetaPanel spot={spot} />
        <p className="mt-5 min-h-12 text-sm font-medium leading-6 text-slate-600">{spot.photoStory}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {[spot.emotion, spot.weatherMood, ...spot.albumTags.slice(0, 2)].map((tag) => (
            <Pill key={tag} label={tag} />
          ))}
        </div>
      </div>
    </motion.article>
  );
}

function BestTimingPanel({ spot, dark = false, compact = false }: { spot: Spot; dark?: boolean; compact?: boolean }) {
  const text = dark ? "text-white" : "text-ink";
  const sub = dark ? "text-white/55" : "text-slate-400";
  const tile = dark ? "bg-white/10 ring-white/10" : "bg-slate-50 ring-slate-100";
  return (
    <div className={`rounded-[1.35rem] ${dark ? "bg-white/[0.06]" : "bg-white"} ${compact ? "p-0" : "p-4 ring-1 ring-slate-100"}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className={`flex items-center gap-2 text-sm font-black ${text}`}>
          <Sparkles className="h-4 w-4 text-coral" />
          Best Timing
        </p>
        <span className={`text-xs font-black ${dark ? "text-coral" : "text-coral"}`}>{stars(spot.timingEase)}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <TimingTile icon={<CalendarDays />} label="Season" value={spot.bestSeasonRange} tile={tile} sub={sub} text={text} />
        <TimingTile icon={<Clock3 />} label="Time" value={spot.bestTime} tile={tile} sub={sub} text={text} />
        <TimingTile icon={<Target />} label="Chance" value={spot.nextChance} tile={tile} sub={sub} text={text} />
      </div>
      {!compact && <p className={`mt-4 text-sm font-semibold leading-6 ${dark ? "text-white/70" : "text-slate-600"}`}>{spot.timingTip}</p>}
      {compact && <p className={`mt-3 line-clamp-2 text-xs font-semibold leading-5 ${dark ? "text-white/62" : "text-slate-500"}`}>{spot.timingTip}</p>}
    </div>
  );
}

function MemoryMetaPanel({ spot }: { spot: Spot }) {
  return (
    <div className="rounded-[1.35rem] bg-white p-4 ring-1 ring-slate-100">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-black text-ink">
          <Heart className="h-4 w-4 text-coral" />
          Memory
        </p>
        <span className="text-xs font-black text-coral">{spot.emotion}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <TimingTile icon={<CalendarDays />} label="Date" value={spot.visitedDate} tile="bg-slate-50 ring-slate-100" sub="text-slate-400" text="text-ink" />
        <TimingTile icon={<Sun />} label="Mood" value={spot.weatherMood} tile="bg-slate-50 ring-slate-100" sub="text-slate-400" text="text-ink" />
        <TimingTile icon={<Users />} label="With" value={spot.recommendedWith} tile="bg-slate-50 ring-slate-100" sub="text-slate-400" text="text-ink" />
      </div>
    </div>
  );
}

function TimingTile({ icon, label, value, tile, sub, text }: { icon: ReactNode; label: string; value: string; tile: string; sub: string; text: string }) {
  return (
    <div className={`min-w-0 rounded-2xl p-3 ring-1 ${tile}`}>
      <div className={`mb-2 flex items-center gap-1.5 ${sub} [&_svg]:h-3.5 [&_svg]:w-3.5`}>
        {icon}
        <span className="text-[9px] font-bold uppercase tracking-[0.12em]">{label}</span>
      </div>
      <p className={`truncate text-xs font-black sm:text-sm ${text}`}>{value}</p>
    </div>
  );
}

function ZekkeiDetailModal({
  spot,
  onClose,
  onUpdate,
  onShare,
}: {
  spot: Spot | null;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<Spot>) => void;
  onShare: (spot: Spot) => void;
}) {
  return (
    <AnimatePresence>
      {spot && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-3 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            onMouseDown={(event) => event.stopPropagation()}
            initial={{ opacity: 0, y: 42, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white shadow-glow"
          >
            <div className="relative min-h-[360px] overflow-hidden rounded-t-[2rem] text-white">
              <PhotoFill src={spot.imageUrl} alt={spot.imageAlt} />
              <div className="absolute inset-0 bg-gradient-to-b from-black/34 via-black/14 to-black/76" />
              <button onClick={onClose} className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/18 backdrop-blur-xl ring-1 ring-white/25">
                <X className="h-5 w-5" />
              </button>
              <div className="absolute bottom-6 left-5 right-5 z-10 sm:left-8 sm:right-8">
                <div className="mb-4 flex flex-wrap gap-2">
                  <Pill label={statusLabels[spot.status]} light />
                  <Pill label={levelLabels[spot.onceInLifeLevel]} light />
                  {spot.tags.slice(0, 4).map((tag) => (
                    <Pill key={tag} label={tag} light />
                  ))}
                </div>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="mb-2 text-sm font-semibold text-white/72">{spot.country} / {spot.location}</p>
                    <h2 className="text-4xl font-black tracking-normal sm:text-5xl">{spot.memoryTitle}</h2>
                  </div>
                  <Score score={spot.score} light />
                </div>
              </div>
            </div>
            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_0.8fr]">
              <div className="grid gap-5">
                <MemoryMetaPanel spot={spot} />
                <div className="rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-100">
                  <p className="mb-2 text-sm font-black text-ink">写真に残したかった瞬間</p>
                  <p className="text-sm font-semibold leading-7 text-slate-600">{spot.photoStory}</p>
                  <p className="mt-4 text-sm leading-7 text-slate-500">{spot.favoriteMoment}</p>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <Info icon={<Users />} label="With" value={spot.recommendedWith} />
                  <Info icon={<Flag />} label="Category" value={spot.category} />
                  <Info icon={<Plane />} label="Cost" value={`Level ${spot.estimatedCostLevel}`} />
                  <Info icon={<Target />} label="Difficulty" value={`Level ${spot.difficulty}`} />
                </div>
                <div className="rounded-[1.5rem] bg-ink p-5 text-white shadow-soft">
                  <p className="text-sm font-bold text-white/55">Emotion Palette</p>
                  <p className="mt-1 text-2xl font-black">{spot.travelType}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[spot.emotion, spot.weatherMood, ...spot.albumTags, ...spot.tags].slice(0, 6).map((item) => (
                      <Pill key={item} label={item} light />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => onShare(spot)} className="h-12 rounded-full bg-coral px-4 text-sm font-black text-white shadow-soft">
                    Memoriesで共有
                  </button>
                  <button onClick={() => onUpdate(spot.id, { status: "visited" })} className="h-12 rounded-full bg-ink px-4 text-sm font-black text-white shadow-soft">
                    思い出にする
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(["visited", "want", "planned", "dream", "draft"] as Status[]).map((item) => (
                    <button
                      key={item}
                      onClick={() => onUpdate(spot.id, { status: item })}
                      className={`h-11 rounded-full px-3 text-xs font-black ${spot.status === item ? "bg-ink text-white" : "bg-slate-100 text-slate-600"}`}
                    >
                      {statusLabels[item]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AddZekkeiModal({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd: (spot: SpotDraft) => void }) {
  const [form, setForm] = useState<SpotDraft>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setPhotoError("");
  }, [isOpen]);

  const computedScore = useMemo(() => scoreDraft(form), [form]);

  const toggle = (key: "conditions" | "tags" | "purposeTags", value: string) => {
    setForm((current) => ({
      ...current,
      [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value],
    }));
  };

  const handlePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setPhotoError("");
    try {
      const dataUrl = await compressImage(file);
      setForm((current) => ({ ...current, imageUrl: dataUrl, imageAlt: `${current.name || "追加した絶景"}の写真` }));
    } catch {
      setPhotoError("写真を読み込めませんでした。別の画像で試してください。");
    } finally {
      setUploading(false);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.memoryTitle.trim() || !form.location.trim()) return;
    const safeTags = form.tags.length ? form.tags : ["一生に一度"];
    const safeConditions = form.conditions.length ? form.conditions : ["晴れ"];
    const safeName = form.name.trim() || form.memoryTitle.trim();
    onAdd({
      ...form,
      name: safeName,
      location: form.location.trim(),
      country: form.country.trim() || "日本",
      reason: form.reason.trim() || form.photoStory.trim() || "この景色を、自分の目で見て、忘れたくなかった。",
      memo: form.memo.trim() || form.favoriteMoment.trim() || "写真を見るたび、その場所の空気まで思い出せる。",
      memoryTitle: form.memoryTitle.trim(),
      photoStory: form.photoStory.trim() || form.memo.trim() || "この写真を見ると、旅の空気まで戻ってくる。",
      favoriteMoment: form.favoriteMoment.trim() || `${form.bestTime}に景色の色が変わった瞬間`,
      score: computedScore,
      tags: safeTags,
      conditions: safeConditions,
      status: form.status || "visited",
      imageGradient: gradients[Math.floor(Math.random() * gradients.length)],
      imageUrl: form.imageUrl || pickPhotoForTags(safeTags, 0),
      travelType: inferTravelType(safeTags, form.category, form.onceInLifeLevel, form.recommendedWith),
      coords: guessCoordinates(form.location, form.country, safeTags, 0),
      nextChance: form.nextChance || buildNextChance(form.bestSeason, safeConditions),
      timingTip: form.timingTip || buildTimingTip(form.bestSeasonRange, form.bestTime, safeConditions),
    });
    setForm(emptyForm);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/55 p-3 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.form
            onSubmit={submit}
            onMouseDown={(event) => event.stopPropagation()}
            initial={{ opacity: 0, y: 42, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white shadow-glow"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/90 px-5 py-4 backdrop-blur-xl sm:px-7">
              <div>
                <p className="text-sm font-bold text-coral">Museumに飾る絶景を追加</p>
                <h2 className="text-2xl font-bold text-ink">忘れたくない景色を1枚残す</h2>
              </div>
              <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_0.75fr]">
              <div className="grid gap-5">
                <PhotoUploader src={form.imageUrl} uploading={uploading} error={photoError} onChange={handlePhoto} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Text label="写真タイトル" value={form.memoryTitle} placeholder="例：星が降ってきた夜" onChange={(value) => setForm((current) => ({ ...current, memoryTitle: value }))} required />
                  <Text label="日付" value={form.visitedDate} placeholder="例：2026-05-09" onChange={(value) => setForm((current) => ({ ...current, visitedDate: value }))} />
                  <Text label="スポット名" value={form.name} placeholder="例：阿智村の星空" onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
                  <Text label="場所" value={form.location} placeholder="例：長野県・阿智村" onChange={(value) => setForm((current) => ({ ...current, location: value }))} required />
                  <Text label="国・地域" value={form.country} placeholder="例：日本 / ボリビア" onChange={(value) => setForm((current) => ({ ...current, country: value }))} />
                  <FieldSelect label="カテゴリ" value={form.category} options={categories} onChange={(value) => setForm((current) => ({ ...current, category: value }))} />
                </div>

                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">写真のストーリー</span>
                  <textarea
                    value={form.photoStory}
                    onChange={(event) => setForm((current) => ({ ...current, photoStory: event.target.value, reason: event.target.value }))}
                    placeholder="一言だけでもOK。この写真を見ると、どんな空気や気持ちを思い出す？"
                    rows={3}
                    className="w-full resize-none rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-ink outline-none transition focus:border-coral focus:bg-white"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">いちばん好きな瞬間</span>
                  <textarea
                    value={form.favoriteMoment}
                    onChange={(event) => setForm((current) => ({ ...current, favoriteMoment: event.target.value, memo: event.target.value }))}
                    placeholder="光が変わった瞬間、誰かが笑った瞬間、風の匂いなど"
                    rows={3}
                    className="w-full resize-none rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-ink outline-none transition focus:border-coral focus:bg-white"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-3">
                  <FieldSelect label="感情" value={form.emotion} options={emotionTags} onChange={(value) => setForm((current) => ({ ...current, emotion: value }))} />
                  <FieldSelect label="天気・空気" value={form.weatherMood} options={weatherMoods} onChange={(value) => setForm((current) => ({ ...current, weatherMood: value }))} />
                  <FieldSelect label="一緒に行った人" value={form.recommendedWith} options={companions} onChange={(value) => setForm((current) => ({ ...current, recommendedWith: value as Companion }))} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldSelect label="撮った季節" value={form.bestSeason} options={seasons} onChange={(value) => setForm((current) => ({ ...current, bestSeason: value as Season, nextChance: buildNextChance(value as Season, current.conditions) }))} />
                  <FieldSelect label="撮った時間帯" value={form.bestTime} options={times} onChange={(value) => setForm((current) => ({ ...current, bestTime: value as TimeSlot }))} />
                </div>

                <Choice label="写真タグ" options={tags} selected={form.tags} onToggle={(value) => toggle("tags", value)} />
                <Choice label="思い出タグ" options={purposeTags} selected={form.purposeTags} onToggle={(value) => toggle("purposeTags", value)} />
              </div>

              <div className="grid content-start gap-4">
                <MemoryFormPreview form={form} score={computedScore} />
                <div className="sticky top-24 rounded-[2rem] bg-ink p-5 text-white shadow-glow">
                  <p className="mb-2 text-sm font-bold text-white/55">Memory Score</p>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-6xl font-black">{computedScore}</p>
                      <p className="mt-2 text-sm font-semibold text-white/58">{inferTravelType(form.tags, form.category, form.onceInLifeLevel, form.recommendedWith)}</p>
                    </div>
                    <Score score={computedScore} light />
                  </div>
                  <div className="mt-5 grid gap-3">
                    <Range label="思い出の濃さ" value={form.score} onChange={(value) => setForm((current) => ({ ...current, score: value }))} />
                    <Range label="写真の気持ちよさ" value={form.timingEase} min={1} max={5} onChange={(value) => setForm((current) => ({ ...current, timingEase: value }))} />
                    <Range label="旅の特別感" value={form.difficulty} min={1} max={5} onChange={(value) => setForm((current) => ({ ...current, difficulty: value }))} />
                    <Range label="また見返したさ" value={form.estimatedCostLevel} min={1} max={5} onChange={(value) => setForm((current) => ({ ...current, estimatedCostLevel: value }))} />
                  </div>
                  <div className="mt-5 grid gap-3">
                    <Segment label="思い出レベル" value={form.onceInLifeLevel} options={["normal", "special", "once-in-life"]} onChange={(value) => setForm((current) => ({ ...current, onceInLifeLevel: value as OnceLevel }))} />
                    <Segment label="保存先" value={form.status} options={["visited", "want", "planned", "dream", "draft"]} labels={statusLabels} onChange={(value) => setForm((current) => ({ ...current, status: value as Status }))} />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex gap-3 border-t border-slate-100 bg-white/90 p-5 backdrop-blur-xl sm:px-7">
              <button type="button" onClick={onClose} className="h-12 flex-1 rounded-full bg-slate-100 px-5 text-sm font-bold text-slate-700">
                キャンセル
              </button>
              <button type="submit" className="h-12 flex-[1.4] rounded-full bg-ink px-5 text-sm font-bold text-white shadow-soft">
                思い出に追加
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PhotoUploader({ src, uploading, error, onChange }: { src: string; uploading: boolean; error: string; onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className="group relative block cursor-pointer overflow-hidden rounded-[1.75rem] bg-ink text-white shadow-soft">
      <div className="relative h-52">
        <PhotoFill src={src} alt="アップロード写真プレビュー" className="opacity-72 transition group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-br from-ink/70 via-ink/24 to-coral/30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/18 backdrop-blur-xl ring-1 ring-white/20">
            {uploading ? <Sparkles className="h-6 w-6 animate-pulse" /> : <Upload className="h-6 w-6" />}
          </div>
          <p className="text-lg font-black">{uploading ? "写真を圧縮中..." : "好きな写真を追加"}</p>
          <p className="mt-1 text-xs font-semibold text-white/62">端末内だけに保存。スクショ映えする1枚にできます。</p>
        </div>
      </div>
      <input type="file" accept="image/*" onChange={onChange} className="sr-only" />
      {error && <p className="bg-coral/90 px-4 py-3 text-sm font-bold">{error}</p>}
    </label>
  );
}

function MemoryFormPreview({ form, score }: { form: SpotDraft; score: number }) {
  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-soft ring-1 ring-slate-200/70">
      <div className="relative h-56 bg-ink text-white">
        <PhotoFill src={form.imageUrl} alt={form.imageAlt} className="opacity-82" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/4 to-black/76" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-xs font-bold text-white/65">入力中のプレビュー</p>
            <h3 className="line-clamp-2 text-2xl font-black">{form.memoryTitle || "写真タイトルを入れるとここに表示"}</h3>
            <p className="mt-1 text-xs font-semibold text-white/58">{form.location || "場所未設定"} / {form.emotion}</p>
          </div>
          <Score score={score} light />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 p-3">
        <MemoryMini label="保存先" value={statusLabels[form.status]} />
        <MemoryMini label="天気" value={form.weatherMood} />
        <MemoryMini label="誰と" value={form.recommendedWith} />
      </div>
    </div>
  );
}

function ShareCardModal({
  isOpen,
  onClose,
  spots,
  analysis,
  recommendation,
  featuredSpot,
}: {
  isOpen: boolean;
  onClose: () => void;
  spots: Spot[];
  analysis: Analysis;
  recommendation: Recommendation;
  featuredSpot: Spot | null;
}) {
  const [type, setType] = useState<ShareType>("dna");
  const [layout, setLayout] = useState<ShareLayout>("story");
  const [copied, setCopied] = useState(false);
  const spot = featuredSpot ?? recommendation.spot;

  const copyShareText = async () => {
    const text = `My Zekkei Museum: ${analysis.travelType}\n記録した絶景写真: ${analysis.photoCount}枚\n一番心に残った景色: ${spot.name}\n行った絶景を、忘れない。 #ZekkeiList`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My Zekkei Museum", text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
    } catch {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-3 backdrop-blur-sm sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div
            onMouseDown={(event) => event.stopPropagation()}
            initial={{ opacity: 0, y: 42, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] bg-white shadow-glow"
          >
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/90 px-5 py-4 backdrop-blur-xl sm:px-7">
              <div>
                <p className="text-sm font-bold text-coral">Memory card</p>
                <h2 className="text-2xl font-bold text-ink">思い出共有カード</h2>
              </div>
              <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[0.72fr_1fr]">
              <div className="grid content-start gap-4">
                <Segment label="カードタイプ" value={type} options={["dna", "bucket", "next", "hunter"]} labels={{ dna: "My Zekkei Museum", bucket: "旅の記憶美術館", next: "Best Memory", hunter: "Memory Collector" }} onChange={(value) => setType(value as ShareType)} light={false} />
                <Segment label="サイズ" value={layout} options={["story", "wide"]} labels={{ story: "Instagram Story", wide: "X / Wide" }} onChange={(value) => setLayout(value as ShareLayout)} light={false} />
                <div className="rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-100">
                  <p className="text-sm font-black text-ink">スクショのコツ</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                    余白ごと撮ると、InstagramストーリーやXでそのまま映える比率になります。写真が主役なので、そのまま旅の記憶投稿として使えます。
                  </p>
                </div>
                <button onClick={copyShareText} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-black text-white shadow-soft">
                  <Clipboard className="h-4 w-4" />
                  {copied ? "コピーしました" : "共有文をコピー"}
                </button>
              </div>
              <div className="flex min-h-[620px] items-center justify-center overflow-hidden rounded-[2rem] bg-slate-100 p-4 sm:p-6">
                <ShareCard type={type} layout={layout} spots={spots} analysis={analysis} spot={spot} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ShareCard({
  type,
  layout,
  spots,
  analysis,
  spot,
}: {
  type: ShareType;
  layout: ShareLayout;
  spots: Spot[];
  analysis: Analysis;
  spot: Spot;
}) {
  const top = [...spots].sort((a, b) => b.score - a.score).slice(0, 4);
  const story = layout === "story";
  const title =
    type === "dna"
      ? "My Zekkei Museum"
      : type === "bucket"
        ? "旅の記憶美術館"
        : type === "next"
          ? "一番心に残った景色"
          : "Memory Collector";

  return (
    <div className={`relative overflow-hidden bg-ink text-white shadow-glow ${story ? "h-[640px] w-full max-w-[360px] rounded-[2rem] p-5 sm:h-[720px] sm:max-w-[405px] sm:rounded-[2.25rem] sm:p-7" : "min-h-[420px] w-full max-w-[760px] rounded-[2rem] p-5 sm:p-7"}`}>
      <PhotoFill src={spot.imageUrl} alt={spot.imageAlt} className="opacity-55" />
      <div className="absolute inset-0 bg-gradient-to-br from-ink/94 via-ink/70 to-coral/42" />
      <div className="absolute -right-20 top-10 h-60 w-60 rounded-full bg-lagoon/30 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-coral/25 blur-3xl" />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <div className="mb-7 flex items-center justify-between gap-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/55">Zekkei List</p>
            <Sparkles className="h-5 w-5 text-coral" />
          </div>
          <p className="text-sm font-bold text-white/58">{title}</p>
          <h3 className={`${story ? "mt-3 text-4xl sm:text-5xl" : "mt-2 text-3xl sm:text-4xl"} font-black leading-[1.02] tracking-normal`}>
            {type === "hunter" ? analysis.travelType : type === "next" ? spot.memoryTitle : analysis.travelType}
          </h3>
          <p className="mt-4 text-sm font-semibold leading-6 text-white/68">
            {type === "next" ? spot.photoStory : `行った絶景を、忘れない。${analysis.photoCount}枚の写真でできた私だけの旅の記憶美術館。`}
          </p>
        </div>

        <div>
          {type === "bucket" ? (
            <div className={`grid gap-3 ${story ? "grid-cols-1" : "grid-cols-4"}`}>
              {top.slice(0, story ? 3 : 4).map((item, index) => (
                <div key={item.id} className="rounded-[1.25rem] bg-white/12 p-3 backdrop-blur-xl">
                  <p className="text-xs font-black text-coral">0{index + 1}</p>
                  <p className="mt-1 line-clamp-1 text-sm font-black">{item.name}</p>
                  <p className="mt-1 text-xs font-semibold text-white/45">{item.bestSeasonRange}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className={`grid gap-2 sm:gap-3 ${story ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
              <ShareMetric label="記録した絶景数" value={`${analysis.memoryCount}`} />
              <ShareMetric label="平均Score" value={`${analysis.averageScore}`} />
              <ShareMetric label="多い感情" value={analysis.topEmotion} />
              <ShareMetric label="今年の旅" value={`${analysis.thisYearCount}`} />
            </div>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            {analysis.topTags.slice(0, story ? 3 : 5).map((tag) => (
              <span key={tag.label} className="rounded-full bg-white/12 px-3 py-1.5 text-xs font-black ring-1 ring-white/10">#{tag.label}</span>
            ))}
          </div>
          <div className="mt-5 rounded-[1.35rem] bg-white/12 p-4 backdrop-blur-xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Favorite memory</p>
            <div className="mt-2 flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-black">{spot.name}</p>
                <p className="text-xs font-semibold text-white/52">{spot.visitedDate} / {spot.emotion}</p>
              </div>
              <Score score={spot.score} light />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShareMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] bg-white/12 p-2.5 backdrop-blur-xl sm:p-3">
      <p className="text-xl font-black sm:text-2xl">{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">{label}</p>
    </div>
  );
}

function ShareSection({ spots, top, analysis, onShare }: { spots: Spot[]; top: Spot[]; analysis: Analysis; onShare: () => void }) {
  return (
    <section id="share" className="px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-ink p-4 text-white shadow-glow sm:p-6 lg:p-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 sm:p-8">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white/80">
                <Share2 className="h-4 w-4" />
                Screenshot ready
              </p>
              <h2 className="text-4xl font-black tracking-normal sm:text-5xl">My Zekkei Museum</h2>
              <p className="mt-3 max-w-xl text-base leading-7 text-white/62">行った絶景を、忘れない。{spots.length}個の記憶と{analysis.photoCount}枚の写真から見えた旅の記憶タイプは「{analysis.travelType}」。</p>
            </div>
            <button onClick={onShare} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-black text-ink shadow-soft">
              <LayoutPanelTop className="h-4 w-4" />
              思い出カードを開く
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {top.map((spot, index) => (
              <div key={spot.id} className={`grain relative min-h-80 overflow-hidden rounded-[2rem] bg-gradient-to-br ${spot.imageGradient} p-5 shadow-soft`}>
                <PhotoFill src={spot.imageUrl} alt={spot.imageAlt} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/24 via-black/10 to-black/70" />
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <Score score={spot.score} light />
                  <div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <Pill label={`No.${index + 1}`} light />
                      {spot.tags.slice(0, 2).map((tag) => (
                        <Pill key={tag} label={tag} light />
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-white/70">{spot.country} / {spot.location}</p>
                    <h3 className="mt-1 text-2xl font-black">{spot.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileBottomDock({ onAdd, onShare }: { onAdd: () => void; onShare: () => void }) {
  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 rounded-[1.5rem] border border-white/70 bg-white/82 p-2 shadow-glow backdrop-blur-2xl sm:hidden">
      <div className="grid grid-cols-4 gap-1">
        <DockButton icon={<Sparkles />} label="記憶" onClick={() => jump("gallery")} />
        <DockButton icon={<Map />} label="Map" onClick={() => jump("map")} />
        <button onClick={onAdd} className="flex min-h-14 flex-col items-center justify-center rounded-[1.15rem] bg-ink px-2 text-xs font-black text-white shadow-soft">
          <Plus className="mb-1 h-5 w-5" />
          写真
        </button>
        <DockButton icon={<Share2 />} label="共有" onClick={onShare} />
      </div>
    </div>
  );
}

function DockButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex min-h-14 flex-col items-center justify-center rounded-[1.15rem] px-2 text-xs font-black text-slate-600 transition active:bg-slate-100 [&_svg]:mb-1 [&_svg]:h-5 [&_svg]:w-5">
      {icon}
      {label}
    </button>
  );
}

function PhotoFill({ src, alt, className = "", priority = false }: { src: string; alt: string; className?: string; priority?: boolean }) {
  return (
    <div
      role="img"
      aria-label={alt}
      data-priority={priority ? "true" : undefined}
      className={`absolute inset-0 bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url("${src}")` }}
    />
  );
}

function MiniTiming({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="rounded-2xl bg-white/12 px-3 py-2 text-sm font-black text-white backdrop-blur-xl ring-1 ring-white/10">
      <span className="flex items-center gap-2 [&_svg]:h-4 [&_svg]:w-4">{icon}{label}</span>
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className={`h-10 shrink-0 rounded-full px-4 text-sm font-bold transition ${active ? "bg-ink text-white shadow-soft" : "bg-white/70 text-slate-600 ring-1 ring-slate-200 hover:bg-white"}`}>
      {children}
    </button>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl bg-white/65 px-4 py-3 ring-1 ring-white/80">
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</span>
      <span className="relative">
        <select value={value} onChange={(event) => onChange(event.target.value)} className="appearance-none rounded-full bg-ink py-2 pl-4 pr-9 text-sm font-bold text-white outline-none">
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
      </span>
    </label>
  );
}

function Text({ label, value, placeholder, onChange, required }: { label: string; value: string; placeholder: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <input
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-ink outline-none transition focus:border-coral focus:bg-white"
      />
    </label>
  );
}

function FieldSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <span className="relative block">
        <select value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full appearance-none rounded-full border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-bold text-ink outline-none transition focus:border-coral focus:bg-white">
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </span>
    </label>
  );
}

function Choice({ label, options, selected, onToggle }: { label: string; options: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-bold text-slate-700">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button key={option} type="button" onClick={() => onToggle(option)} className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-bold transition ${active ? "bg-ink text-white shadow-soft" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {active && <Check className="h-4 w-4" />}
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function Segment({
  label,
  value,
  options,
  labels,
  onChange,
  light = true,
}: {
  label: string;
  value: string;
  options: string[];
  labels?: Record<string, string>;
  onChange: (value: string) => void;
  light?: boolean;
}) {
  return (
    <div>
      <p className={`mb-2 text-sm font-bold ${light ? "text-white/62" : "text-slate-700"}`}>{label}</p>
      <div className={`grid gap-2 ${options.length > 3 ? "grid-cols-2" : "grid-cols-3"}`}>
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`min-h-10 rounded-2xl px-3 py-2 text-xs font-black transition ${active ? (light ? "bg-white text-ink" : "bg-ink text-white") : light ? "bg-white/10 text-white/70" : "bg-slate-100 text-slate-600"}`}
            >
              {labels?.[option] ?? option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Range({ label, value, min = 1, max = 100, onChange }: { label: string; value: number; min?: number; max?: number; onChange: (value: number) => void }) {
  return (
    <label>
      <span className="mb-2 flex items-center justify-between text-xs font-bold text-white/62">
        {label}
        <span className="text-white">{value}</span>
      </span>
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-[#ff8b68]" />
    </label>
  );
}

function Info({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
      <div className="mb-2 flex items-center gap-1.5 text-slate-400 [&_svg]:h-3.5 [&_svg]:w-3.5">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-[0.12em]">{label}</span>
      </div>
      <p className="truncate text-sm font-bold text-ink">{value}</p>
    </div>
  );
}

function Pill({ label, light }: { label: string; light?: boolean }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${light ? "bg-white/18 text-white ring-white/25" : "bg-slate-100 text-slate-600 ring-slate-200"}`}>{label}</span>;
}

function Score({ score, light }: { score: number; light?: boolean }) {
  const c = 2 * Math.PI * 17;
  return (
    <div className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${light ? "bg-white/18 text-white ring-white/30" : "bg-white text-ink ring-slate-200"} ring-1 backdrop-blur-xl`}>
      <svg className="absolute h-16 w-16 -rotate-90" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="17" fill="none" stroke={light ? "rgba(255,255,255,0.2)" : "rgba(15,23,42,0.08)"} strokeWidth="3" />
        <circle cx="20" cy="20" r="17" fill="none" stroke={light ? "#ffffff" : "#ff8b68"} strokeLinecap="round" strokeWidth="3" strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} />
      </svg>
      <div className="relative text-center">
        <p className="text-lg font-black leading-none">{score}</p>
        <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.12em] opacity-75">score</p>
      </div>
    </div>
  );
}

function DnaMeter({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-bold text-white/62">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.max(value, 8)}%` }} />
      </div>
    </div>
  );
}

function MiniInsight({ icon, label, value, note }: { icon: ReactNode; label: string; value: string; note: string }) {
  return (
    <div className="glass-panel rounded-[1.5rem] p-4">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-ink shadow-soft [&_svg]:h-5 [&_svg]:w-5">{icon}</div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 truncate text-2xl font-black text-ink">{value}</p>
      <p className="mt-1 truncate text-xs font-bold text-slate-400">{note}</p>
    </div>
  );
}

function DistributionCard({ title, items, total }: { title: string; items: CountItem[]; total: number }) {
  return (
    <div className="glass-panel rounded-[1.75rem] p-5">
      <p className="mb-4 flex items-center gap-2 text-sm font-black text-ink">
        <BarChart3 className="h-4 w-4 text-coral" />
        {title}
      </p>
      <div className="grid gap-3">
        {items.slice(0, 4).map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-sm font-bold text-slate-600">
              <span>{item.label}</span>
              <span>{item.count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-ink" style={{ width: `${Math.max(percent(item.count, total), 8)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BucketProgress({ analysis }: { analysis: Analysis }) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] bg-ink p-5 text-white shadow-glow">
      <p className="mb-4 flex items-center gap-2 text-sm font-black">
        <BadgeCheck className="h-4 w-4 text-coral" />
        Memory Progress
      </p>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-5xl font-black">{analysis.visitedRate}%</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/45">memories</p>
        </div>
        <p className="pb-2 text-right text-sm font-semibold text-white/58">{analysis.memoryCount}個の絶景を記録済み</p>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-coral" style={{ width: `${Math.max(analysis.visitedRate, 4)}%` }} />
      </div>
    </div>
  );
}

function Empty({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-panel mt-8 overflow-hidden rounded-[2rem] p-5 text-center sm:p-8">
      <div className="mx-auto mb-5 grid max-w-md grid-cols-3 gap-3">
        {[photoLibrary.stars, photoLibrary.beach, photoLibrary.forest].map((src, index) => (
          <div key={src} className={`relative overflow-hidden rounded-[1.25rem] bg-ink shadow-soft ${index === 1 ? "h-32" : "mt-5 h-24"}`}>
            <PhotoFill src={src} alt="サンプル絶景写真" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/8 to-black/42" />
          </div>
        ))}
      </div>
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-white">
        <Upload className="h-6 w-6" />
      </div>
      <h3 className="text-2xl font-black text-ink">まだMuseumは空です。</h3>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
        まずはスマホに眠っている絶景写真を1枚追加してみましょう。場所・日付・感情を添えるだけで、旅の記憶が美しく残ります。
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <button onClick={onAdd} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-bold text-white shadow-soft">
          <Plus className="h-4 w-4" />
          絶景写真を1枚追加
        </button>
        <a href="#gallery" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-ink shadow-soft ring-1 ring-slate-200">
          <Search className="h-4 w-4" />
          サンプルを見る
        </a>
      </div>
    </motion.div>
  );
}

type Analysis = {
  averageScore: number;
  visited: number;
  visitedRate: number;
  memoryCount: number;
  photoCount: number;
  thisYearCount: number;
  topEmotion: string;
  topWeatherMood: string;
  onceCount: number;
  onceRate: number;
  seaRate: number;
  nightRate: number;
  seasonalRate: number;
  topTags: CountItem[];
  topSeasons: CountItem[];
  topTimes: CountItem[];
  topCategory: string;
  categoryCount: number;
  topTime: string;
  travelType: string;
  insight: string;
  thisYear: Spot[];
  thisYearMemories: Spot[];
  nearby: Spot[];
  dreams: Spot[];
};

type Recommendation = {
  spot: Spot;
  reason: string;
  predicted: number;
};

function analyzeSpots(spots: Spot[]): Analysis {
  const averageScore = Math.round(spots.reduce((total, spot) => total + spot.score, 0) / Math.max(spots.length, 1));
  const visited = spots.filter((spot) => spot.status === "visited").length;
  const memories = spots.filter((spot) => spot.status === "visited");
  const currentYear = new Date().getFullYear().toString();
  const thisYearMemories = memories.filter((spot) => spot.visitedDate.startsWith(currentYear));
  const onceCount = spots.filter((spot) => spot.onceInLifeLevel === "once-in-life" || spot.tags.includes("一生に一度")).length;
  const sea = spots.filter((spot) => spot.tags.includes("海") || spot.tags.includes("島")).length;
  const night = spots.filter((spot) => spot.tags.includes("星空") || spot.tags.includes("オーロラ") || spot.bestTime === "夜").length;
  const seasonal = spots.filter((spot) => spot.bestSeason !== "通年").length;
  const topTags = topCounts(spots.flatMap((spot) => spot.tags));
  const topSeasons = topCounts(spots.map((spot) => spot.bestSeason));
  const topTimes = topCounts(spots.map((spot) => spot.bestTime));
  const topCategories = topCounts(spots.map((spot) => spot.category));
  const topEmotions = topCounts(memories.map((spot) => spot.emotion));
  const topWeatherMoods = topCounts(memories.map((spot) => spot.weatherMood));
  const travelType = inferDominantTravelType(spots);
  const topTag = topTags[0]?.label ?? "絶景";
  const topSeason = topSeasons[0]?.label ?? "通年";
  const topTime = topTimes[0]?.label ?? "いつでも";

  return {
    averageScore,
    visited,
    visitedRate: percent(visited, spots.length),
    memoryCount: memories.length,
    photoCount: spots.filter((spot) => Boolean(spot.imageUrl)).length,
    thisYearCount: thisYearMemories.length,
    topEmotion: topEmotions[0]?.label ?? "最高",
    topWeatherMood: topWeatherMoods[0]?.label ?? "快晴",
    onceCount,
    onceRate: percent(onceCount, spots.length),
    seaRate: percent(sea, spots.length),
    nightRate: percent(night, spots.length),
    seasonalRate: percent(seasonal, spots.length),
    topTags,
    topSeasons,
    topTimes,
    topCategory: topCategories[0]?.label ?? "絶景",
    categoryCount: topCategories[0]?.count ?? 0,
    topTime,
    travelType,
    insight: `あなたの絶景メモリーは「${topEmotions[0]?.label ?? "最高"}」と「#${topTag}」が強め。写真を見返すたび、${topSeason}の${topTime}に戻れる旅の記憶美術館です。`,
    thisYear: spots.filter((spot) => spot.bestSeason !== "通年" && spot.status !== "visited").sort((a, b) => b.score - a.score).slice(0, 3),
    thisYearMemories: thisYearMemories.sort((a, b) => b.score - a.score).slice(0, 4),
    nearby: spots.filter((spot) => spot.country === "日本" && spot.estimatedCostLevel <= 2).slice(0, 3),
    dreams: spots.filter((spot) => spot.status === "dream" || spot.onceInLifeLevel === "once-in-life").sort((a, b) => b.score - a.score).slice(0, 4),
  };
}

function buildRecommendation(spots: Spot[]): Recommendation {
  const counts = topCounts(spots.flatMap((spot) => spot.tags));
  const has = (tag: string) => (counts.find((item) => item.label === tag)?.count ?? 0) > 1;
  const notVisited = spots.filter((spot) => spot.status !== "visited");
  const candidates = notVisited.length ? notVisited : spots;
  const rules = [
    { tags: ["星空"], words: "星空・夜・一生に一度", match: (spot: Spot) => spot.tags.includes("星空") },
    { tags: ["海", "島"], words: "海・島・カップル", match: (spot: Spot) => spot.tags.includes("海") || spot.tags.includes("島") },
    { tags: ["雪", "オーロラ"], words: "雪・オーロラ・冬", match: (spot: Spot) => spot.tags.includes("雪") || spot.tags.includes("オーロラ") },
    { tags: ["一生に一度"], words: "一生に一度・世界遺産", match: (spot: Spot) => spot.onceInLifeLevel === "once-in-life" || spot.tags.includes("世界遺産") },
    { tags: ["カップル"], words: "カップル・夕日・島", match: (spot: Spot) => spot.tags.includes("カップル") || spot.tags.includes("夕日") },
  ];
  const rule = rules.find((item) => item.tags.some(has));
  const spot = [...candidates]
    .filter((candidate) => (rule ? rule.match(candidate) : true))
    .sort((a, b) => b.score + b.timingEase * 2 - (a.score + a.timingEase * 2))[0] ?? candidates[0] ?? samples[0];
  const words = rule?.words ?? spot.tags.slice(0, 3).join("・");
  return {
    spot,
    reason: `あなたは“${words}”系の絶景を多く保存しています。次は ${spot.bestSeasonRange} / ${spot.bestTime} / ${spot.conditions.slice(0, 2).join("・")} のタイミングで ${spot.name} が刺さりそう。`,
    predicted: clamp(Math.round((spot.score + spot.timingEase * 8 + (spot.onceInLifeLevel === "once-in-life" ? 6 : 0)) / 1.18), 76, 99),
  };
}

function topCounts(values: string[]) {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "ja"));
}

function inferDominantTravelType(spots: Spot[]) {
  const type = topCounts(spots.map((spot) => spot.travelType))[0]?.label;
  if (type) return type;
  return "Once-in-Life Hunter";
}

function inferTravelType(spotTags: string[], category: string, level: OnceLevel, companion: Companion) {
  if (spotTags.includes("オーロラ")) return "Aurora Chaser";
  if (spotTags.includes("星空")) return "Starry Sky Seeker";
  if (spotTags.includes("海") || spotTags.includes("島")) return "Island Dreamer";
  if (spotTags.includes("夕日")) return "Sunset Collector";
  if (spotTags.includes("海外") || spotTags.includes("世界遺産")) return "World Wonder Seeker";
  if (companion === "恋人") return "Couple Trip Planner";
  if (level === "once-in-life") return "Once-in-Life Hunter";
  if (category === "森" || spotTags.includes("日本")) return "Hidden Japan Explorer";
  return "Once-in-Life Hunter";
}

function normalizeSpot(value: unknown, index: number): Spot {
  if (!isRecord(value)) return samples[index % samples.length];
  const legacyArea = stringValue(value.area) || stringValue(value.location) || "まだ見ぬ場所";
  const spotTags = stringArray(value.tags, ["一生に一度"]);
  const season = seasonValue(value.bestSeason ?? value.season);
  const time = timeValue(value.bestTime ?? value.time);
  const country = stringValue(value.country) || inferCountry(legacyArea, spotTags);
  const name = stringValue(value.name) || "名前のない絶景";
  const score = numberValue(value.score, 88);
  const coords = coordsValue(value.coords) ?? guessCoordinates(legacyArea, country, spotTags, index);
  const level = onceLevelValue(value.onceInLifeLevel, spotTags.includes("一生に一度") ? "once-in-life" : "special");
  const companion = companionValue(value.recommendedWith ?? value.companion);
  const category = stringValue(value.category) || inferCategory(spotTags);
  const imageUrl = stringValue(value.imageUrl) || stringValue(value.image) || pickPhotoForTags(spotTags, index);

  return {
    id: stringValue(value.id) || createId(),
    name,
    location: legacyArea,
    country,
    category,
    tags: spotTags,
    score,
    bestSeason: season,
    bestSeasonRange: stringValue(value.bestSeasonRange) || defaultSeasonRange(season),
    bestTime: time,
    conditions: stringArray(value.conditions, ["晴れ"]),
    nextChance: stringValue(value.nextChance) || buildNextChance(season, stringArray(value.conditions, ["晴れ"])),
    timingTip: stringValue(value.timingTip) || buildTimingTip(defaultSeasonRange(season), time, stringArray(value.conditions, ["晴れ"])),
    timingEase: clamp(numberValue(value.timingEase, 4), 1, 5),
    onceInLifeLevel: level,
    recommendedWith: companion,
    reason: stringValue(value.reason) || stringValue(value.memo) || "この景色を、自分の目で見て、忘れたくなかった。",
    memo: stringValue(value.memo) || "ベストタイミングを逃さず、いつか必ず行く。",
    visitedDate: stringValue(value.visitedDate) || sampleDateFromId(name),
    memoryTitle: stringValue(value.memoryTitle) || `${name}で見た、忘れたくない光`,
    emotion: stringValue(value.emotion) || "最高",
    weatherMood: stringValue(value.weatherMood) || stringArray(value.conditions, ["快晴"])[0] || "快晴",
    photoStory: stringValue(value.photoStory) || stringValue(value.reason) || stringValue(value.memo) || "写真を見るたび、その場所の空気まで思い出せる。",
    favoriteMoment: stringValue(value.favoriteMoment) || `${time}に景色の色が変わった瞬間`,
    visibility: stringValue(value.visibility) === "share" ? "share" : "private",
    albumTags: stringArray(value.albumTags, ["旅の記憶", country, category]),
    status: statusValue(value.status),
    imageGradient: stringValue(value.imageGradient) || stringValue(value.gradient) || gradients[index % gradients.length],
    imageUrl,
    imageAlt: stringValue(value.imageAlt) || `${name}の絶景写真`,
    travelType: stringValue(value.travelType) || inferTravelType(spotTags, category, level, companion),
    difficulty: clamp(numberValue(value.difficulty, 2), 1, 5),
    estimatedCostLevel: clamp(numberValue(value.estimatedCostLevel, country === "日本" ? 2 : 5), 1, 5),
    purposeTags: stringArray(value.purposeTags, ["写真で残したい"]),
    coords,
    saved: booleanValue(value.saved, true),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function stringArray(value: unknown, fallback: string[]) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : fallback;
}

function coordsValue(value: unknown): Coordinates | null {
  if (!isRecord(value)) return null;
  const lat = numberValue(value.lat, Number.NaN);
  const lng = numberValue(value.lng, Number.NaN);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

function seasonValue(value: unknown): Season {
  return seasons.includes(value as Season) ? (value as Season) : "通年";
}

function timeValue(value: unknown): TimeSlot {
  if (value === "朝") return "朝";
  return times.includes(value as TimeSlot) ? (value as TimeSlot) : "いつでも";
}

function companionValue(value: unknown): Companion {
  if (value === "いつか") return "いつかの自分";
  return companions.includes(value as Companion) ? (value as Companion) : "いつかの自分";
}

function statusValue(value: unknown): Status {
  return ["visited", "want", "planned", "dream", "draft"].includes(String(value)) ? (value as Status) : "visited";
}

function onceLevelValue(value: unknown, fallback: OnceLevel): OnceLevel {
  return ["normal", "special", "once-in-life"].includes(String(value)) ? (value as OnceLevel) : fallback;
}

function inferCategory(spotTags: string[]) {
  return categories.find((category) => spotTags.includes(category)) ?? "一生に一度";
}

function inferCountry(location: string, spotTags: string[]) {
  if (spotTags.includes("海外")) return "海外";
  if (location.includes("ボリビア")) return "ボリビア";
  if (location.includes("アイスランド")) return "アイスランド";
  if (location.includes("ギリシャ")) return "ギリシャ";
  if (location.includes("ペルー")) return "ペルー";
  return "日本";
}

function defaultSeasonRange(season: Season) {
  const ranges: Record<Season, string> = {
    春: "3月〜5月",
    夏: "6月〜9月",
    秋: "9月〜11月",
    冬: "12月〜2月",
    雨季: "雨季の晴れ間",
    通年: "通年",
  };
  return ranges[season];
}

function buildNextChance(season: Season, spotConditions: string[]) {
  if (spotConditions.includes("新月")) return "次の新月週がチャンス";
  if (season === "春") return "春の短いピークを狙う";
  if (season === "夏") return "夏旅に最適";
  if (season === "秋") return "秋の晴れた朝夕";
  if (season === "冬") return "冬の澄んだ日が本命";
  if (season === "雨季") return "雨季の無風日";
  return "条件が揃えばいつでも";
}

function buildTimingTip(range: string, time: TimeSlot, spotConditions: string[]) {
  return `${range}の${time}に、${spotConditions.slice(0, 2).join(" / ")}の条件を狙うと美しく見えやすい。`;
}

function pickPhotoForTags(spotTags: string[], index = 0) {
  if (spotTags.includes("オーロラ")) return photoLibrary.aurora;
  if (spotTags.includes("星空")) return photoLibrary.stars;
  if (spotTags.includes("海") || spotTags.includes("島")) return photoLibrary.beach;
  if (spotTags.includes("紅葉")) return photoLibrary.stream;
  if (spotTags.includes("雲海")) return photoLibrary.cloudSea;
  if (spotTags.includes("雪")) return photoLibrary.snow;
  if (spotTags.includes("滝")) return photoLibrary.stream;
  if (spotTags.includes("花畑")) return photoLibrary.flower;
  if (spotTags.includes("砂漠")) return photoLibrary.desert;
  if (spotTags.includes("世界遺産")) return photoLibrary.ruins;
  if (spotTags.includes("夕日") || spotTags.includes("朝日") || spotTags.includes("ドライブ")) return photoLibrary.sunsetRoad;
  return fallbackPhotos[index % fallbackPhotos.length];
}

function scoreDraft(form: SpotDraft) {
  const levelBoost = form.onceInLifeLevel === "once-in-life" ? 8 : form.onceInLifeLevel === "special" ? 4 : 0;
  const tagBoost = Math.min(form.tags.length, 5) * 1.2;
  const conditionBoost = Math.min(form.conditions.length, 4) * 1.1;
  const purposeBoost = Math.min(form.purposeTags.length, 3);
  return clamp(Math.round(form.score * 0.82 + levelBoost + tagBoost + conditionBoost + purposeBoost), 1, 100);
}

function guessCoordinates(location: string, country: string, spotTags: string[], index = 0): Coordinates {
  const presets = [
    { key: "沖縄", lat: 26.212, lng: 127.681 },
    { key: "波照間", lat: 24.058, lng: 123.783 },
    { key: "宮古", lat: 24.735, lng: 125.268 },
    { key: "長野", lat: 36.648, lng: 138.195 },
    { key: "岐阜", lat: 35.391, lng: 136.722 },
    { key: "兵庫", lat: 34.691, lng: 135.183 },
    { key: "広島", lat: 34.385, lng: 132.455 },
    { key: "愛媛", lat: 33.841, lng: 132.766 },
    { key: "茨城", lat: 36.341, lng: 140.446 },
    { key: "鹿児島", lat: 31.596, lng: 130.557 },
    { key: "青森", lat: 40.824, lng: 140.74 },
    { key: "鳥取", lat: 35.504, lng: 134.238 },
    { key: "北海道", lat: 43.064, lng: 141.346 },
    { key: "東京", lat: 35.681, lng: 139.767 },
    { key: "ボリビア", lat: -20.133, lng: -67.489 },
    { key: "アイスランド", lat: 64.146, lng: -21.942 },
    { key: "ギリシャ", lat: 36.393, lng: 25.461 },
    { key: "ペルー", lat: -13.163, lng: -72.545 },
    { key: "ニュージーランド", lat: -44.004, lng: 170.477 },
    { key: "ナミビア", lat: -24.74, lng: 15.288 },
    { key: "アメリカ", lat: 36.107, lng: -112.113 },
    { key: "トルコ", lat: 38.643, lng: 34.829 },
    { key: "モルディブ", lat: 3.202, lng: 73.22 },
    { key: "イタリア", lat: 35.508, lng: 12.592 },
  ];
  const target = `${country} ${location}`;
  const matched = presets.find((item) => target.includes(item.key));
  if (matched) return { lat: matched.lat, lng: matched.lng };
  if (spotTags.includes("海外")) return { lat: 8 + index * 5, lng: -40 + index * 12 };
  return { lat: 34.8 + index * 0.8, lng: 136.5 + index * 0.7 };
}

function worldPoint(coords: Coordinates) {
  return {
    x: clamp(((coords.lng + 180) / 360) * 100, 5, 95),
    y: clamp(((85 - coords.lat) / 170) * 100, 7, 93),
  };
}

function percent(value: number, total: number) {
  return Math.round((value / Math.max(total, 1)) * 100);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function stars(value: number) {
  return `${"★".repeat(clamp(Math.round(value), 1, 5))}${"☆".repeat(5 - clamp(Math.round(value), 1, 5))}`;
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `zekkei-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function pickByIndex(items: string[], seed: number) {
  return items[Math.abs(seed) % items.length] ?? items[0];
}

function sampleDateFromId(seed: string) {
  const base = 2021 + (seed.length % 5);
  const month = String((seed.charCodeAt(0) % 12) + 1).padStart(2, "0");
  const day = String((seed.charCodeAt(seed.length - 1) % 27) + 1).padStart(2, "0");
  return `${base}-${month}-${day}`;
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const image = new window.Image();
      image.onerror = () => reject(new Error("image failed"));
      image.onload = () => {
        const max = 1400;
        const scale = Math.min(1, max / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("canvas failed"));
          return;
        }
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
