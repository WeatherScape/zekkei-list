"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  CalendarDays,
  BarChart3,
  Camera,
  Check,
  ChevronDown,
  Compass,
  Filter,
  Heart,
  Map,
  MapPin,
  Moon,
  Navigation2,
  Plus,
  Route,
  Search,
  Share2,
  Sparkles,
  Star,
  Sun,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

type Season = "春" | "夏" | "秋" | "冬" | "通年";
type TimeSlot = "朝" | "昼" | "夕方" | "夜" | "いつでも";
type Companion = "ひとり" | "友達" | "恋人" | "家族" | "いつか";
type Spot = {
  id: string;
  name: string;
  area: string;
  tags: string[];
  season: Season;
  time: TimeSlot;
  conditions: string[];
  companion: Companion;
  score: number;
  memo: string;
  saved: boolean;
  gradient: string;
  image?: string;
  imageAlt?: string;
  coords?: {
    lat: number;
    lng: number;
  };
};

const STORAGE_KEY = "zekkei-list-spots-v1";
const tags = ["星空", "海", "雲海", "紅葉", "雪", "滝", "夕日", "朝日", "島", "ドライブ", "カップル", "一生に一度"];
const seasons: Season[] = ["春", "夏", "秋", "冬", "通年"];
const times: TimeSlot[] = ["朝", "昼", "夕方", "夜", "いつでも"];
const conditions = ["新月", "晴れ", "雨上がり", "霧", "雪", "干潮", "満潮", "紅葉", "桜"];
const companions: Companion[] = ["ひとり", "友達", "恋人", "家族", "いつか"];
const gradients = [
  "from-[#07111f] via-[#214b7a] to-[#ffc07b]",
  "from-[#0077a7] via-[#53c6d6] to-[#fff2cf]",
  "from-[#173b2b] via-[#ba5d34] to-[#f5cd7b]",
  "from-[#25314a] via-[#9fb8c9] to-[#fff5d9]",
  "from-[#102c4e] via-[#f0f7ff] to-[#b9d7eb]",
  "from-[#114457] via-[#34a5b0] to-[#fed7aa]",
];

const photoLibrary = {
  stars: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=1400&q=85",
  beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85",
  autumn: "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?auto=format&fit=crop&w=1400&q=85",
  clouds: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85",
  snow: "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?auto=format&fit=crop&w=1400&q=85",
  bridge: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=85",
  waterfall: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1400&q=85",
  sunrise: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=85",
};

const fallbackPhotos = Object.values(photoLibrary);

const samples: Spot[] = [
  ["hateruma-stars", "波照間島の星空", "沖縄県・波照間島", ["星空", "島", "一生に一度", "カップル"], "夏", "夜", ["新月", "晴れ"], "恋人", 98, "日本最南端の島で、満天の星を見たい。", gradients[0], photoLibrary.stars, { lat: 24.058, lng: 123.783 }],
  ["yonaha-maehama", "与那覇前浜ビーチ", "沖縄県・宮古島", ["海", "島", "ドライブ", "カップル"], "夏", "昼", ["晴れ"], "恋人", 94, "真っ白な砂浜と透明な海を見たい。", gradients[1], photoLibrary.beach, { lat: 24.735, lng: 125.268 }],
  ["kamikochi-autumn", "上高地の紅葉", "長野県・松本市", ["紅葉", "朝日", "一生に一度"], "秋", "朝", ["晴れ", "霧"], "いつか", 91, "朝もやと紅葉の中を歩きたい。", gradients[2], photoLibrary.autumn, { lat: 36.247, lng: 137.637 }],
  ["takeda-clouds", "竹田城跡の雲海", "兵庫県・朝来市", ["雲海", "朝日", "一生に一度"], "秋", "朝", ["霧", "晴れ"], "友達", 89, "天空の城のような景色を見たい。", gradients[3], photoLibrary.clouds, { lat: 35.300, lng: 134.829 }],
  ["shirakawago-snow", "白川郷の雪景色", "岐阜県・白川村", ["雪", "一生に一度", "家族"], "冬", "夕方", ["雪"], "家族", 90, "合掌造りに雪が積もる景色を見たい。", gradients[4], photoLibrary.snow, { lat: 36.257, lng: 136.907 }],
  ["tsunoshima-bridge", "角島大橋", "山口県・下関市", ["海", "ドライブ", "夕日"], "夏", "昼", ["晴れ"], "友達", 86, "海の上を走るようなドライブをしたい。", gradients[5], photoLibrary.bridge, { lat: 34.353, lng: 130.881 }],
].map(([id, name, area, spotTags, season, time, spotConditions, companion, score, memo, gradient, image, coords]) => ({
  id,
  name,
  area,
  tags: spotTags,
  season,
  time,
  conditions: spotConditions,
  companion,
  score,
  memo,
  gradient,
  image,
  imageAlt: `${name}の絶景写真`,
  coords,
  saved: true,
})) as Spot[];

const emptyForm = {
  name: "",
  area: "",
  memo: "",
  score: 88,
  season: "通年" as Season,
  time: "いつでも" as TimeSlot,
  conditions: [] as string[],
  tags: [] as string[],
  companion: "いつか" as Companion,
};

export default function Home() {
  const [spots, setSpots] = useState<Spot[]>(samples);
  const [loaded, setLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [season, setSeason] = useState<Season | "すべて">("すべて");
  const [time, setTime] = useState<TimeSlot | "すべて">("すべて");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSpots(JSON.parse(stored) as Spot[]);
      } catch {
        setSpots(samples);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(spots));
  }, [loaded, spots]);

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return spots.filter((spot) => {
      const tagOk = activeTags.length === 0 || activeTags.every((tag) => spot.tags.includes(tag));
      const seasonOk = season === "すべて" || spot.season === season;
      const timeOk = time === "すべて" || spot.time === time;
      const textOk = !text || [spot.name, spot.area, spot.memo, ...spot.tags, ...spot.conditions].join(" ").toLowerCase().includes(text);
      return tagOk && seasonOk && timeOk && textOk;
    });
  }, [activeTags, query, season, spots, time]);

  const ranked = useMemo(() => [...spots].sort((a, b) => b.score - a.score), [spots]);
  const onceCount = spots.filter((spot) => spot.tags.includes("一生に一度")).length;
  const averageScore = Math.round(spots.reduce((total, spot) => total + spot.score, 0) / Math.max(spots.length, 1));

  const addSpot = (spot: Omit<Spot, "id" | "saved" | "gradient">) => {
    setSpots((current) => [
      {
        ...spot,
        id: crypto.randomUUID(),
        saved: true,
        gradient: gradients[current.length % gradients.length],
        image: pickPhotoForTags(spot.tags, current.length),
        imageAlt: `${spot.name}の絶景写真`,
        coords: guessCoordinates(spot.area, spot.tags, current.length),
      },
      ...current,
    ]);
  };

  return (
    <main className="min-h-screen overflow-hidden">
      <Header onAdd={() => setModalOpen(true)} />
      <Hero onAdd={() => setModalOpen(true)} />

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          <Stat icon={<MapPin />} label="保存した絶景" value={spots.length} note="My bucket list" />
          <Stat icon={<Star />} label="一生に一度" value={onceCount} note="死ぬまでに見たい景色" />
          <Stat icon={<Sparkles />} label="平均スコア" value={averageScore} note="Zekkei Score" />
          <Stat icon={<CalendarDays />} label="夏の絶景" value={spots.filter((spot) => spot.season === "夏").length} note="best season" />
        </div>
        <div className="mt-4 overflow-hidden rounded-[2rem] bg-ink p-5 text-white shadow-glow md:p-6">
          <p className="mb-2 text-sm font-semibold text-white/58">Tag map</p>
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold">今のリストは、こんな旅の気分。</h2>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 8).map((tag) => {
                const count = spots.filter((spot) => spot.tags.includes(tag)).length;
                return count ? <Pill key={tag} label={`${tag} ${count}`} light /> : null;
              })}
            </div>
          </div>
        </div>
      </section>

      <MapAndInsights spots={spots} />

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold text-coral">Recommended timing</p>
            <h2 className="text-2xl font-bold tracking-normal text-ink sm:text-3xl">次に行くべき絶景</h2>
          </div>
          <Sun className="h-7 w-7 text-coral" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {ranked.slice(0, 3).map((spot, index) => (
            <article key={spot.id} className={`grain relative min-h-48 overflow-hidden rounded-[1.75rem] bg-gradient-to-br ${spot.gradient} p-5 text-white shadow-soft`}>
              <Image src={photoForSpot(spot, index)} alt={spot.imageAlt ?? `${spot.name}の絶景写真`} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-br from-black/66 via-black/20 to-black/34" />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white/72">{spot.conditions.includes("新月") ? "新月に行きたい" : `${spot.season}に狙いたい`}</p>
                    <h3 className="mt-2 text-2xl font-bold">{spot.name}</h3>
                  </div>
                  <Score score={spot.score} light />
                </div>
                <div className="mt-8 flex flex-wrap gap-2">
                  {[spot.area, spot.season, spot.time].map((item) => <Pill key={item} label={item} light />)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="list" className="mx-auto w-full max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-coral"><Sparkles className="h-4 w-4" />My Zekkei Dashboard</p>
            <h2 className="text-3xl font-semibold tracking-normal text-ink sm:text-4xl">人生で見たい景色を、季節で並べる。</h2>
          </div>
          <label className="glass-panel flex h-12 w-full items-center gap-3 rounded-full px-4 lg:max-w-sm">
            <Search className="h-5 w-5 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="スポット、メモ、条件で検索" className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-slate-400" />
          </label>
        </div>

        <div className="glass-panel rounded-[1.75rem] p-3">
          <div className="flex items-center gap-2 px-2 pb-3 pt-1 text-sm font-bold text-slate-600"><Filter className="h-4 w-4 text-coral" />Filter the dream</div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
            <FilterButton active={activeTags.length === 0} onClick={() => setActiveTags([])}>すべて</FilterButton>
            {tags.map((tag) => <FilterButton key={tag} active={activeTags.includes(tag)} onClick={() => setActiveTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag])}>{tag}</FilterButton>)}
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
                <Card key={spot.id} spot={spot} index={index} onToggle={() => setSpots((current) => current.map((item) => item.id === spot.id ? { ...item, saved: !item.saved } : item))} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <Empty onAdd={() => setModalOpen(true)} />
        )}
      </section>

      <Share spots={spots} top={ranked.slice(0, 3)} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} onAdd={addSpot} />
    </main>
  );
}

function MapAndInsights({ spots }: { spots: Spot[] }) {
  const average = Math.round(spots.reduce((sum, spot) => sum + spot.score, 0) / Math.max(spots.length, 1));
  const topTags = topCounts(spots.flatMap((spot) => spot.tags)).slice(0, 5);
  const topSeasons = topCounts(spots.map((spot) => spot.season));
  const topTimes = topCounts(spots.map((spot) => spot.time));
  const topCompanions = topCounts(spots.map((spot) => spot.companion));
  const topTag = topTags[0]?.label ?? "絶景";
  const topSeason = topSeasons[0]?.label ?? "通年";
  const topTime = topTimes[0]?.label ?? "いつでも";
  const once = spots.filter((spot) => spot.tags.includes("一生に一度")).length;
  const sea = spots.filter((spot) => spot.tags.includes("海") || spot.tags.includes("島")).length;
  const night = spots.filter((spot) => spot.tags.includes("星空") || spot.time === "夜").length;
  const seasonal = spots.filter((spot) => spot.season !== "通年").length;
  const drive = spots.filter((spot) => spot.tags.includes("ドライブ")).length;
  const dna = [
    { label: "海と島", value: percent(sea, spots.length), tone: "bg-lagoon" },
    { label: "夜景・星空", value: percent(night, spots.length), tone: "bg-aurora" },
    { label: "季節狙い", value: percent(seasonal, spots.length), tone: "bg-coral" },
    { label: "一生もの", value: percent(once, spots.length), tone: "bg-ink" },
  ];
  const mood = buildMoodLabel({ sea, night, once, drive, topTag });

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-coral"><Map className="h-4 w-4" />Zekkei Map & DNA</p>
          <h2 className="text-3xl font-semibold tracking-normal text-ink sm:text-4xl">行きたい景色の偏りまで、美しく見える。</h2>
        </div>
        <div className="glass-panel rounded-full px-5 py-3 text-sm font-bold text-slate-600">
          {topSeason} / {topTime} / #{topTag}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <ZekkeiMap spots={spots} />
        <div className="grid gap-5">
          <div className="overflow-hidden rounded-[2rem] bg-ink p-5 text-white shadow-glow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-white/55">Your Zekkei DNA</p>
                <h3 className="text-3xl font-black tracking-normal">{mood}</h3>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3 text-right">
                <p className="text-3xl font-black">{average}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">avg score</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/62">
              {buildInsightSentence(topTag, topSeason, topTime, once, spots.length)}
            </p>
            <div className="mt-6 grid gap-3">
              {dna.map((item) => <DnaMeter key={item.label} {...item} />)}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <MiniInsight icon={<TrendingUp />} label="いま一番強い気分" value={`#${topTag}`} note={`${topTags[0]?.count ?? 0} spots`} />
            <MiniInsight icon={<Navigation2 />} label="旅の時間帯" value={topTime} note={`${topTimes[0]?.count ?? 0} spots`} />
            <MiniInsight icon={<Route />} label="誰と行きたい" value={topCompanions[0]?.label ?? "いつか"} note={`${topCompanions[0]?.count ?? 0} spots`} />
            <MiniInsight icon={<BarChart3 />} label="一生に一度率" value={`${percent(once, spots.length)}%`} note={`${once}/${spots.length} spots`} />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <DistributionCard title="Season Mix" items={topSeasons} total={spots.length} />
        <DistributionCard title="Tag Signal" items={topTags} total={spots.length} />
        <DistributionCard title="Time Mood" items={topTimes} total={spots.length} />
      </div>
    </section>
  );
}

function ZekkeiMap({ spots }: { spots: Spot[] }) {
  const mapped = spots.map((spot, index) => ({ spot, point: mapPoint(coordsForSpot(spot, index)) }));
  const top = [...spots].sort((a, b) => b.score - a.score)[0];

  return (
    <div className="relative min-h-[520px] overflow-hidden rounded-[2.25rem] bg-[#0c1222] p-5 text-white shadow-glow sm:p-6">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(22,184,199,0.24),transparent_36%),radial-gradient(circle_at_75%_18%,rgba(255,139,104,0.26),transparent_22rem)]" />
      <div className="absolute inset-5 rounded-[1.75rem] border border-white/10" />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-white/55">Visual location</p>
          <h3 className="text-3xl font-black tracking-normal">Zekkei Map</h3>
        </div>
        <div className="rounded-2xl bg-white/10 px-4 py-3 text-right backdrop-blur-xl">
          <p className="text-2xl font-black">{spots.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">pins</p>
        </div>
      </div>

      <div className="absolute inset-x-7 bottom-7 top-28 rounded-[2rem] bg-white/[0.06] ring-1 ring-white/10">
        <div className="absolute left-[40%] top-[6%] h-[74%] w-[20%] rotate-[20deg] rounded-[55%] bg-white/[0.08] blur-sm" />
        <div className="absolute left-[34%] top-[12%] h-[72%] w-[16%] rotate-[18deg] rounded-[50%] border border-white/10" />
        <div className="absolute left-[46%] top-[24%] h-[54%] w-[14%] rotate-[22deg] rounded-[50%] border border-white/10" />
        <div className="absolute left-[31%] top-[58%] h-[22%] w-[18%] rotate-[18deg] rounded-[50%] border border-white/10" />
        <div className="absolute left-[20%] top-[78%] h-[12%] w-[20%] -rotate-[12deg] rounded-[50%] border border-white/10" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />

        {mapped.map(({ spot, point }, index) => (
          <div key={spot.id} className="group absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: `${point.x}%`, top: `${point.y}%` }}>
            <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral/30 blur-md" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink shadow-glow ring-4 ring-white/20">
              <span className="text-xs font-black">{index + 1}</span>
            </div>
            <div className="pointer-events-none absolute bottom-11 left-1/2 hidden w-52 -translate-x-1/2 rounded-2xl bg-white p-3 text-ink shadow-soft group-hover:block">
              <p className="text-xs font-bold text-slate-400">{spot.area}</p>
              <p className="mt-1 text-sm font-black">{spot.name}</p>
              <p className="mt-1 text-xs font-semibold text-coral">Score {spot.score}</p>
            </div>
          </div>
        ))}
      </div>

      {top && (
        <div className="absolute bottom-10 left-10 right-10 z-20 rounded-[1.5rem] border border-white/12 bg-white/10 p-4 backdrop-blur-xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Current north star</p>
          <div className="mt-2 flex items-center justify-between gap-4">
            <div>
              <p className="text-xl font-black">{top.name}</p>
              <p className="text-sm font-semibold text-white/56">{top.area}</p>
            </div>
            <Score score={top.score} light />
          </div>
        </div>
      )}
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

function MiniInsight({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) {
  return (
    <div className="glass-panel rounded-[1.5rem] p-4">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-ink shadow-soft [&_svg]:h-5 [&_svg]:w-5">{icon}</div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 truncate text-2xl font-black text-ink">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-400">{note}</p>
    </div>
  );
}

function DistributionCard({ title, items, total }: { title: string; items: { label: string; count: number }[]; total: number }) {
  return (
    <div className="glass-panel rounded-[1.75rem] p-5">
      <p className="mb-4 flex items-center gap-2 text-sm font-black text-ink"><BarChart3 className="h-4 w-4 text-coral" />{title}</p>
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

function topCounts(values: string[]) {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function percent(value: number, total: number) {
  return Math.round((value / Math.max(total, 1)) * 100);
}

function buildMoodLabel({ sea, night, once, drive, topTag }: { sea: number; night: number; once: number; drive: number; topTag: string }) {
  if (sea >= night && sea >= once) return "Island Blue Collector";
  if (night >= sea && night >= once) return "New Moon Dreamer";
  if (once >= sea && once >= night) return "Once-in-Life Hunter";
  if (drive > 1) return "Scenic Drive Mood";
  return `${topTag} Seeker`;
}

function buildInsightSentence(topTag: string, topSeason: string, topTime: string, once: number, total: number) {
  return `あなたの絶景リストは「${topSeason}の${topTime}」と「#${topTag}」に強く反応中。一生に一度枠は${once}/${total}で、かなり本気のBucket Listです。`;
}

function coordsForSpot(spot: Spot, index = 0) {
  return spot.coords ?? guessCoordinates(spot.area, spot.tags, index);
}

function guessCoordinates(area: string, spotTags: string[], index = 0) {
  const presets = [
    { key: "北海道", lat: 43.064, lng: 141.346 },
    { key: "沖縄", lat: 26.212, lng: 127.681 },
    { key: "長野", lat: 36.648, lng: 138.195 },
    { key: "岐阜", lat: 35.391, lng: 136.722 },
    { key: "兵庫", lat: 34.691, lng: 135.183 },
    { key: "山口", lat: 34.186, lng: 131.471 },
    { key: "東京", lat: 35.681, lng: 139.767 },
    { key: "京都", lat: 35.011, lng: 135.768 },
  ];
  const matched = presets.find((item) => area.includes(item.key));
  if (matched) return { lat: matched.lat, lng: matched.lng };
  if (spotTags.includes("島") || spotTags.includes("海")) return { lat: 30 + index * 0.4, lng: 130 + index * 0.8 };
  return { lat: 34.8 + index * 0.8, lng: 136.5 + index * 0.7 };
}

function mapPoint(coords: { lat: number; lng: number }) {
  return {
    x: clamp(((coords.lng - 122) / 24) * 100, 7, 93),
    y: clamp(((46 - coords.lat) / 22) * 100, 7, 93),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function Header({ onAdd }: { onAdd: () => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/45 bg-white/70 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-white shadow-soft"><Compass className="h-5 w-5" /></span>
          <span><span className="block text-base font-bold tracking-normal text-ink">Zekkei List</span><span className="hidden text-xs font-medium text-slate-500 sm:block">Bucket list for breathtaking views</span></span>
        </a>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex"><a href="#list">List</a><a href="#share">Share</a></nav>
        <button onClick={onAdd} className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"><Plus className="h-4 w-4" /><span className="hidden sm:inline">絶景を追加</span></button>
      </div>
    </header>
  );
}

function Hero({ onAdd }: { onAdd: () => void }) {
  return (
    <section className="relative mx-auto grid min-h-[760px] w-full max-w-7xl items-center gap-8 px-4 pb-10 pt-28 sm:px-6 lg:grid-cols-[0.93fr_1.07fr] lg:px-8">
      <div className="relative z-10 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-soft backdrop-blur-xl"><Sparkles className="h-4 w-4 text-coral" />死ぬまでに見たい景色を、ひとつずつ。</motion.div>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-bold leading-[1.05] tracking-normal text-ink sm:text-6xl lg:text-7xl">Zekkei List</motion.h1>
        <p className="mt-5 text-2xl font-semibold leading-relaxed text-slate-800 sm:text-3xl">人生で見たい絶景を、忘れない。</p>
        <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">星空、海、雲海、紅葉、雪景色。行きたい景色を季節・時間帯・条件で整理する絶景マイリスト。</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <button onClick={onAdd} className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-ink px-7 text-sm font-bold text-white shadow-glow transition hover:-translate-y-0.5"><Plus className="h-5 w-5" />絶景を追加する</button>
          <a href="#list" className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/75 px-7 text-sm font-bold text-ink shadow-soft backdrop-blur-xl transition hover:-translate-y-0.5"><Camera className="h-5 w-5" />マイリストを見る</a>
        </div>
      </div>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative min-h-[520px]">
        <div className="hero-sky grain absolute inset-0 rounded-[2.25rem] shadow-glow" />
        <Image src={photoLibrary.stars} alt="満天の星空の絶景写真" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="rounded-[2.25rem] object-cover" />
        <div className="absolute inset-0 rounded-[2.25rem] bg-gradient-to-br from-ink/80 via-ink/20 to-coral/24" />
        <div className="absolute inset-x-8 bottom-8 z-10 rounded-[1.75rem] border border-white/40 bg-white/20 p-5 text-white shadow-soft backdrop-blur-xl sm:inset-x-12 sm:p-6">
          <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold text-white/78">Next dream view</p><h2 className="mt-1 text-2xl font-bold">波照間島の星空</h2></div><Score score={98} light /></div>
          <div className="mt-5 flex flex-wrap gap-2">{["新月の日に行きたい", "一生に一度", "カップル", "夏の夜"].map((tag) => <Pill key={tag} label={tag} light />)}</div>
        </div>
        <div className="absolute right-4 top-5 z-10 hidden w-48 rounded-[1.5rem] border border-white/50 bg-white/25 p-4 text-white shadow-soft backdrop-blur-xl sm:block"><Moon className="mb-4 h-5 w-5" /><p className="text-xs font-semibold text-white/75">Best condition</p><p className="mt-1 text-lg font-bold">New moon + clear sky</p></div>
      </motion.div>
    </section>
  );
}

function Stat({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: number; note: string }) {
  return <div className="glass-panel rounded-[1.75rem] p-5"><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-white [&_svg]:h-5 [&_svg]:w-5">{icon}</div><p className="text-sm font-semibold text-slate-500">{label}</p><div className="mt-1 flex items-end justify-between gap-3"><p className="text-4xl font-bold tracking-normal text-ink">{value}</p><p className="pb-1 text-right text-xs font-semibold text-slate-400">{note}</p></div></div>;
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`h-10 shrink-0 rounded-full px-4 text-sm font-bold transition ${active ? "bg-ink text-white shadow-soft" : "bg-white/70 text-slate-600 ring-1 ring-slate-200 hover:bg-white"}`}>{children}</button>;
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="flex items-center justify-between gap-3 rounded-2xl bg-white/65 px-4 py-3 ring-1 ring-white/80"><span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</span><span className="relative"><select value={value} onChange={(event) => onChange(event.target.value)} className="appearance-none rounded-full bg-ink py-2 pl-4 pr-9 text-sm font-bold text-white outline-none">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" /></span></label>;
}

function pickPhotoForTags(spotTags: string[], index = 0) {
  if (spotTags.includes("星空")) return photoLibrary.stars;
  if (spotTags.includes("海") || spotTags.includes("島")) return photoLibrary.beach;
  if (spotTags.includes("紅葉")) return photoLibrary.autumn;
  if (spotTags.includes("雲海")) return photoLibrary.clouds;
  if (spotTags.includes("雪")) return photoLibrary.snow;
  if (spotTags.includes("滝")) return photoLibrary.waterfall;
  if (spotTags.includes("夕日") || spotTags.includes("朝日")) return photoLibrary.sunrise;
  if (spotTags.includes("ドライブ")) return photoLibrary.bridge;
  return fallbackPhotos[index % fallbackPhotos.length];
}

function photoForSpot(spot: Spot, index = 0) {
  return spot.image ?? pickPhotoForTags(spot.tags, index);
}

function Card({ spot, index, onToggle }: { spot: Spot; index: number; onToggle: () => void }) {
  const image = photoForSpot(spot, index);

  return (
    <motion.article layout initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ delay: Math.min(index * 0.04, 0.24) }} className="group overflow-hidden rounded-[2rem] bg-white shadow-soft ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-glow">
      <div className={`grain relative h-72 bg-gradient-to-br ${spot.gradient} p-5 text-white`}>
        <Image src={image} alt={spot.imageAlt ?? `${spot.name}の絶景写真`} fill sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/28 via-black/10 to-black/66" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_28rem)]" />
        <div className="relative z-10 flex items-start justify-between gap-3"><div className="flex flex-wrap gap-2">{spot.tags.slice(0, 3).map((tag) => <Pill key={tag} label={tag} light />)}</div><button aria-label="保存状態を切り替える" onClick={onToggle} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/18 text-white backdrop-blur-xl ring-1 ring-white/25"><Heart className={`h-5 w-5 ${spot.saved ? "fill-current text-coral" : ""}`} /></button></div>
        <div className="absolute bottom-5 left-5 right-5 z-10"><div className="mb-4 flex items-end justify-between gap-3"><div><p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-white/75"><MapPin className="h-4 w-4" />{spot.area}</p><h3 className="text-3xl font-bold leading-tight">{spot.name}</h3></div><Score score={spot.score} light /></div></div>
      </div>
      <div className="p-5"><div className="grid grid-cols-2 gap-3"><Info icon={<CalendarDays />} label="Season" value={spot.season} /><Info icon={<Sun />} label="Time" value={spot.time} /><Info icon={<Moon />} label="Condition" value={spot.conditions.join(" / ")} /><Info icon={<Users />} label="With" value={spot.companion} /></div><p className="mt-5 min-h-12 text-sm font-medium leading-6 text-slate-600">{spot.memo}</p><div className="mt-5 flex flex-wrap gap-2">{[...spot.tags.slice(3), ...spot.conditions].map((tag) => <Pill key={tag} label={tag} />)}</div></div>
    </motion.article>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100"><div className="mb-2 flex items-center gap-1.5 text-slate-400 [&_svg]:h-3.5 [&_svg]:w-3.5">{icon}<span className="text-[10px] font-bold uppercase tracking-[0.12em]">{label}</span></div><p className="truncate text-sm font-bold text-ink">{value}</p></div>;
}

function Pill({ label, light }: { label: string; light?: boolean }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${light ? "bg-white/18 text-white ring-white/25" : "bg-slate-100 text-slate-600 ring-slate-200"}`}>{label}</span>;
}

function Score({ score, light }: { score: number; light?: boolean }) {
  const c = 2 * Math.PI * 17;
  return <div className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${light ? "bg-white/18 text-white ring-white/30" : "bg-white text-ink ring-slate-200"} ring-1 backdrop-blur-xl`}><svg className="absolute h-16 w-16 -rotate-90" viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="none" stroke={light ? "rgba(255,255,255,0.2)" : "rgba(15,23,42,0.08)"} strokeWidth="3" /><circle cx="20" cy="20" r="17" fill="none" stroke={light ? "#ffffff" : "#ff8b68"} strokeLinecap="round" strokeWidth="3" strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} /></svg><div className="relative text-center"><p className="text-lg font-black leading-none">{score}</p><p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.12em] opacity-75">score</p></div></div>;
}

function Modal({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd: (spot: Omit<Spot, "id" | "saved" | "gradient">) => void }) {
  const [form, setForm] = useState(emptyForm);
  const toggle = (key: "conditions" | "tags", value: string) => setForm((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.area.trim()) return;
    onAdd({ name: form.name.trim(), area: form.area.trim(), memo: form.memo.trim() || "この景色を、自分の目で見に行きたい。", score: form.score, season: form.season, time: form.time, conditions: form.conditions.length ? form.conditions : ["晴れ"], tags: form.tags.length ? form.tags : ["一生に一度"], companion: form.companion });
    setForm(emptyForm);
    onClose();
  };
  return (
    <AnimatePresence>{isOpen && <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/55 p-3 backdrop-blur-sm sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}><motion.form onSubmit={submit} onMouseDown={(event) => event.stopPropagation()} initial={{ opacity: 0, y: 42, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.98 }} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white shadow-glow"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/88 px-5 py-4 backdrop-blur-xl sm:px-7"><div><p className="text-sm font-bold text-coral">Add to bucket list</p><h2 className="text-2xl font-bold text-ink">絶景を追加する</h2></div><button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600"><X className="h-5 w-5" /></button></div><div className="grid gap-5 p-5 sm:p-7"><div className="grid gap-4 sm:grid-cols-2"><Text label="スポット名" value={form.name} placeholder="例：阿智村の星空" onChange={(value) => setForm((current) => ({ ...current, name: value }))} required /><Text label="エリア" value={form.area} placeholder="例：長野県・阿智村" onChange={(value) => setForm((current) => ({ ...current, area: value }))} required /></div><label><span className="mb-2 block text-sm font-bold text-slate-700">旅行メモ</span><textarea value={form.memo} onChange={(event) => setForm((current) => ({ ...current, memo: event.target.value }))} placeholder="誰と、どんなタイミングで、何を見たい？" rows={4} className="w-full resize-none rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-ink outline-none transition focus:border-coral focus:bg-white" /></label><label><span className="mb-2 flex items-center justify-between text-sm font-bold text-slate-700">Zekkei Score<span className="text-2xl font-black text-coral">{form.score}</span></span><input type="range" min="0" max="100" value={form.score} onChange={(event) => setForm((current) => ({ ...current, score: Number(event.target.value) }))} className="w-full accent-[#ff8b68]" /></label><div className="grid gap-4 sm:grid-cols-3"><FieldSelect label="ベスト季節" value={form.season} options={seasons} onChange={(value) => setForm((current) => ({ ...current, season: value as Season }))} /><FieldSelect label="時間帯" value={form.time} options={times} onChange={(value) => setForm((current) => ({ ...current, time: value as TimeSlot }))} /><FieldSelect label="誰と" value={form.companion} options={companions} onChange={(value) => setForm((current) => ({ ...current, companion: value as Companion }))} /></div><Choice label="条件" options={conditions} selected={form.conditions} onToggle={(value) => toggle("conditions", value)} /><Choice label="タグ" options={tags} selected={form.tags} onToggle={(value) => toggle("tags", value)} /></div><div className="sticky bottom-0 flex gap-3 border-t border-slate-100 bg-white/90 p-5 backdrop-blur-xl sm:px-7"><button type="button" onClick={onClose} className="h-12 flex-1 rounded-full bg-slate-100 px-5 text-sm font-bold text-slate-700">キャンセル</button><button type="submit" className="h-12 flex-[1.4] rounded-full bg-ink px-5 text-sm font-bold text-white shadow-soft">リストに追加</button></div></motion.form></motion.div>}</AnimatePresence>
  );
}

function Text({ label, value, placeholder, onChange, required }: { label: string; value: string; placeholder: string; onChange: (value: string) => void; required?: boolean }) {
  return <label><span className="mb-2 block text-sm font-bold text-slate-700">{label}</span><input value={value} required={required} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-ink outline-none transition focus:border-coral focus:bg-white" /></label>;
}

function FieldSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label><span className="mb-2 block text-sm font-bold text-slate-700">{label}</span><span className="relative block"><select value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full appearance-none rounded-full border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-bold text-ink outline-none transition focus:border-coral focus:bg-white">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /></span></label>;
}

function Choice({ label, options, selected, onToggle }: { label: string; options: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return <fieldset><legend className="mb-2 text-sm font-bold text-slate-700">{label}</legend><div className="flex flex-wrap gap-2">{options.map((option) => { const active = selected.includes(option); return <button key={option} type="button" onClick={() => onToggle(option)} className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-bold transition ${active ? "bg-ink text-white shadow-soft" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{active && <Check className="h-4 w-4" />}{option}</button>; })}</div></fieldset>;
}

function Share({ spots, top }: { spots: Spot[]; top: Spot[] }) {
  const once = spots.filter((spot) => spot.tags.includes("一生に一度")).length;
  const highlights = Array.from(new Set(spots.flatMap((spot) => spot.tags))).slice(0, 8);
  return (
    <section id="share" className="px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-ink p-4 text-white shadow-glow sm:p-6 lg:p-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 sm:p-8">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white/80"><Share2 className="h-4 w-4" />Screenshot ready</p>
              <h2 className="text-4xl font-black tracking-normal sm:text-5xl">My Zekkei List</h2>
              <p className="mt-3 max-w-xl text-base leading-7 text-white/62">人生で見たい絶景を、忘れない。</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-64">
              <div className="rounded-[1.5rem] bg-white/10 p-4"><p className="text-4xl font-black">{spots.length}</p><p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/50">saved views</p></div>
              <div className="rounded-[1.5rem] bg-white/10 p-4"><p className="text-4xl font-black">{once}</p><p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/50">once in life</p></div>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {top.map((spot, index) => (
              <div key={spot.id} className={`grain relative min-h-80 overflow-hidden rounded-[2rem] bg-gradient-to-br ${spot.gradient} p-5 shadow-soft`}>
                <Image src={photoForSpot(spot, index)} alt={spot.imageAlt ?? `${spot.name}の絶景写真`} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/24 via-black/10 to-black/70" />
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <Score score={spot.score} light />
                  <div>
                    <div className="mb-3 flex flex-wrap gap-2">{spot.tags.slice(0, 2).map((tag) => <Pill key={tag} label={tag} light />)}</div>
                    <p className="text-sm font-semibold text-white/70">{spot.area}</p>
                    <h3 className="mt-1 text-2xl font-black">{spot.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap gap-2">{highlights.map((tag) => <span key={tag} className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white/78 ring-1 ring-white/10">#{tag}</span>)}</div>
        </div>
      </div>
    </section>
  );
}

function Empty({ onAdd }: { onAdd: () => void }) {
  return <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-panel mt-8 rounded-[2rem] p-8 text-center"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-white"><Search className="h-6 w-6" /></div><h3 className="text-2xl font-bold text-ink">条件に合う絶景がありません</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">新しい絶景を追加するか、フィルターを少しゆるめてみてください。</p><button onClick={onAdd} className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-bold text-white shadow-soft"><Plus className="h-4 w-4" />絶景を追加する</button></motion.div>;
}
