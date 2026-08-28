import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  BellRing,
  Check,
  LineChart,
  Plane,
  Radar,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";

import heroImage from "@/assets/hero-flight.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FareDrop｜機票降價通知服務" },
      {
        name: "description",
        content:
          "設定航線與目標票價，FareDrop 全天候監控上百家航空與訂票網站，降價立刻用 Email 與 LINE 通知你。",
      },
      { property: "og:title", content: "FareDrop｜機票降價通知服務" },
      {
        property: "og:description",
        content: "追蹤航線、設定目標價，票價一降立刻通知，讓你永遠買在低點。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

type Watch = {
  id: number;
  route: string;
  target: number;
  current: number;
  prev: number;
};

const seedWatches: Watch[] = [
  { id: 1, route: "TPE → NRT 東京", target: 9000, current: 8240, prev: 11200 },
  { id: 2, route: "TPE → BKK 曼谷", target: 8000, current: 8650, prev: 9100 },
  { id: 3, route: "TPE → CDG 巴黎", target: 28000, current: 25980, prev: 33400 },
];

const features = [
  {
    icon: Radar,
    title: "全天候比價監控",
    body: "每 15 分鐘掃描航空公司官網與主要 OTA，抓住只出現幾小時的促銷艙等。",
  },
  {
    icon: TrendingDown,
    title: "目標價自動觸發",
    body: "設定心中的價格，跌破門檻立即發出通知，不必自己天天開分頁查價。",
  },
  {
    icon: LineChart,
    title: "歷史價格曲線",
    body: "看得到過去 90 天的走勢與淡旺季區間，判斷現在到底是不是低點。",
  },
  {
    icon: BellRing,
    title: "多管道推播",
    body: "Email、LINE、Telegram 同步送達，並附上可直接下訂的原始連結。",
  },
];

const plans = [
  {
    name: "免費",
    price: "NT$0",
    note: "永久免費",
    perks: ["3 條追蹤航線", "每日一次價格檢查", "Email 通知"],
    cta: "免費開始",
    highlight: false,
  },
  {
    name: "旅人",
    price: "NT$149",
    note: "每月",
    perks: ["30 條追蹤航線", "每 15 分鐘檢查", "LINE / Telegram 即時通知", "90 天價格曲線"],
    cta: "開始 14 天試用",
    highlight: true,
  },
  {
    name: "團隊",
    price: "NT$690",
    note: "每月",
    perks: ["無上限追蹤", "多人共享清單", "差旅預算報表", "API 串接"],
    cta: "聯絡我們",
    highlight: false,
  },
];

function Landing() {
  const [origin, setOrigin] = useState("TPE");
  const [destination, setDestination] = useState("");
  const [target, setTarget] = useState("");
  const [email, setEmail] = useState("");
  const [watches, setWatches] = useState<Watch[]>(seedWatches);

  const savings = useMemo(
    () => watches.reduce((sum, w) => sum + Math.max(0, w.prev - w.current), 0),
    [watches],
  );

  function addWatch(e: React.FormEvent) {
    e.preventDefault();
    if (!destination.trim() || !target.trim() || !email.trim()) {
      toast.error("請填寫目的地、目標價與 Email");
      return;
    }
    if (!session) {
      toast.info("請先登入或註冊，就能把追蹤存進你的帳號");
      navigate({ to: "/auth" });
      return;
    }
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[image:var(--gradient-flare)]">
            <Plane className="size-5 text-primary-foreground" />
          </span>
          <span className="font-display text-lg font-bold">FareDrop</span>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">
            功能
          </a>
          <a href="#watchlist" className="transition-colors hover:text-foreground">
            追蹤清單
          </a>
          <a href="#pricing" className="transition-colors hover:text-foreground">
            方案
          </a>
        </nav>
        <Button variant="hero" size="sm" asChild>
          <a href="#watchlist">建立降價通知</a>
        </Button>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-10 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
            <div>
              <Badge className="mb-6 border-border bg-card/70 text-muted-foreground" variant="outline">
                <Bell className="mr-1 size-3" /> 已追蹤 12,480 條航線
              </Badge>
              <h1 className="text-4xl font-extrabold leading-[1.1] sm:text-6xl">
                機票<span className="text-flare">降價</span>的那一秒，
                <br />
                你會第一個知道。
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                設定想飛的航線與心中價格，FareDrop
                全天候監控上百家航空與訂票平台。票價跌破目標，立刻用 Email 與 LINE 通知你，附上可直接下訂的連結。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="hero" size="lg" asChild>
                  <a href="#watchlist">
                    免費建立追蹤 <ArrowRight />
                  </a>
                </Button>
                <Button variant="glass" size="lg" asChild>
                  <a href="#features">看看怎麼運作</a>
                </Button>
              </div>
              <div className="mt-10 grid max-w-md grid-cols-3 gap-6">
                {[
                  ["平均省下", "NT$4,120"],
                  ["監控來源", "180+"],
                  ["通知延遲", "< 60 秒"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="font-display text-2xl font-bold">{v}</p>
                    <p className="text-xs text-muted-foreground">{k}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <img
                src={heroImage}
                alt="日落時分從機翼看見的海洋與雲層"
                width={1600}
                height={1008}
                className="rounded-3xl object-cover shadow-[var(--shadow-lift)]"
              />
              <div className="surface-card absolute -bottom-6 -left-4 w-64 p-4 sm:left-6">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <TrendingDown className="size-4 text-success" /> TPE → NRT 降價了
                </div>
                <p className="mt-2 text-2xl font-bold">
                  NT$8,240{" "}
                  <span className="text-sm font-medium text-muted-foreground line-through">
                    11,200
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">3 分鐘前 · 長榮航空</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="max-w-2xl text-3xl font-bold sm:text-4xl">
            比你更勤勞的比價機器人，全年無休。
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="surface-card p-6">
                <f.icon className="size-6 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="watchlist" className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
            <form onSubmit={addWatch} className="surface-card h-fit p-7">
              <h2 className="text-2xl font-bold">建立降價通知</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                填入航線與目標價，我們就開始替你盯著。
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="origin">出發地</Label>
                  <Input
                    id="origin"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="TPE"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="dest">目的地</Label>
                  <Input
                    id="dest"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="HND"
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="target">目標票價（NT$）</Label>
                <Input
                  id="target"
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="9000"
                  className="mt-2"
                />
              </div>
              <div className="mt-4">
                <Label htmlFor="email">通知 Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2"
                />
              </div>
              <Button variant="hero" size="lg" className="mt-6 w-full" type="submit">
                開始追蹤
              </Button>
              <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5" /> 不寄送廣告信，隨時可取消追蹤
              </p>
            </form>

            <div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-2xl font-bold">你的追蹤清單</h2>
                <p className="text-sm text-muted-foreground">
                  目前累積省下{" "}
                  <span className="font-semibold text-success">
                    NT${savings.toLocaleString()}
                  </span>
                </p>
              </div>
              <div className="mt-6 space-y-4">
                {watches.map((w) => {
                  const hit = w.current <= w.target;
                  const diff = Math.round(((w.current - w.prev) / w.prev) * 100);
                  return (
                    <div
                      key={w.id}
                      className="surface-card flex flex-wrap items-center justify-between gap-4 p-5"
                    >
                      <div>
                        <p className="font-display text-lg font-semibold">{w.route}</p>
                        <p className="text-xs text-muted-foreground">
                          目標價 NT${w.target.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">NT${w.current.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          相較 30 天前 {diff}%
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          hit
                            ? "border-success/40 bg-success/10 text-success"
                            : "border-border bg-card/60 text-muted-foreground"
                        }
                      >
                        {hit ? "已達標" : "監控中"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold sm:text-4xl">簡單的方案</h2>
          <p className="mt-3 text-muted-foreground">省下一張機票的差價，就回本好幾年。</p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.name}
                className={
                  p.highlight
                    ? "surface-card p-7 shadow-[var(--shadow-glow)]"
                    : "surface-card p-7"
                }
              >
                {p.highlight && (
                  <Badge className="mb-4 bg-[image:var(--gradient-flare)] text-primary-foreground">
                    最受歡迎
                  </Badge>
                )}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-3 font-display text-4xl font-bold">{p.price}</p>
                <p className="text-xs text-muted-foreground">{p.note}</p>
                <ul className="mt-6 space-y-3 text-sm">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={p.highlight ? "hero" : "glass"}
                  className="mt-7 w-full"
                  asChild
                >
                  <a href="#watchlist">{p.cta}</a>
                </Button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground">
          <p>© 2026 FareDrop · 機票降價通知服務</p>
          <p>價格資料僅供參考，實際票價以航空公司公告為準。</p>
        </div>
      </footer>
    </div>
  );
}
