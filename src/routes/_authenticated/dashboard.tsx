import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Bell, BellOff, LogOut, Plane, Trash2, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "我的追蹤清單｜FareDrop" },
      { name: "description", content: "管理你的機票降價追蹤航線、目標票價與通知設定。" },
      { property: "og:title", content: "我的追蹤清單｜FareDrop" },
      { property: "og:description", content: "管理你的機票降價追蹤航線與通知設定。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type Watch = {
  id: string;
  origin: string;
  destination: string;
  label: string | null;
  target_price: number;
  current_price: number | null;
  previous_price: number | null;
  notify_enabled: boolean;
};

const watchSchema = z.object({
  origin: z.string().trim().min(3).max(3, { message: "出發地請填 3 碼機場代碼" }),
  destination: z.string().trim().min(3).max(3, { message: "目的地請填 3 碼機場代碼" }),
  label: z.string().trim().max(40).optional(),
  target_price: z.number().int().positive().max(1000000),
});

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [origin, setOrigin] = useState("TPE");
  const [destination, setDestination] = useState("");
  const [label, setLabel] = useState("");
  const [target, setTarget] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, notify_email")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: watches = [], isLoading } = useQuery({
    queryKey: ["watches", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flight_watches")
        .select("id, origin, destination, label, target_price, current_price, previous_price, notify_enabled")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Watch[];
    },
  });

  const addWatch = useMutation({
    mutationFn: async () => {
      const parsed = watchSchema.safeParse({
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        label: label || undefined,
        target_price: Number(target),
      });
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "資料格式錯誤");
      const t = parsed.data.target_price;
      const { error } = await supabase.from("flight_watches").insert({
        user_id: user!.id,
        origin: parsed.data.origin,
        destination: parsed.data.destination,
        label: parsed.data.label ?? null,
        target_price: t,
        current_price: Math.round(t * 1.12),
        previous_price: Math.round(t * 1.35),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setDestination("");
      setLabel("");
      setTarget("");
      queryClient.invalidateQueries({ queryKey: ["watches"] });
      toast.success("已建立追蹤");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleNotify = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const { error } = await supabase
        .from("flight_watches")
        .update({ notify_enabled: value })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["watches"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const removeWatch = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("flight_watches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watches"] });
      toast.success("已刪除追蹤");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[image:var(--gradient-flare)]">
              <Plane className="size-5 text-primary-foreground" />
            </span>
            <span className="font-display text-lg font-bold">FareDrop</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:block">
              {profile?.display_name ?? user?.email}
            </span>
            <Button variant="glass" size="sm" onClick={handleSignOut}>
              <LogOut /> 登出
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[400px_1fr]">
        <form
          className="surface-card h-fit p-7"
          onSubmit={(e) => {
            e.preventDefault();
            addWatch.mutate();
          }}
        >
          <h1 className="text-2xl font-bold">新增追蹤航線</h1>
          <p className="mt-2 text-sm text-muted-foreground">票價跌破目標價時會通知你。</p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="origin">出發地</Label>
              <Input
                id="origin"
                value={origin}
                maxLength={3}
                onChange={(e) => setOrigin(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="dest">目的地</Label>
              <Input
                id="dest"
                value={destination}
                maxLength={3}
                placeholder="HND"
                onChange={(e) => setDestination(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="label">備註（選填）</Label>
            <Input
              id="label"
              value={label}
              maxLength={40}
              placeholder="東京跨年"
              onChange={(e) => setLabel(e.target.value)}
              className="mt-2"
            />
          </div>
          <div className="mt-4">
            <Label htmlFor="target">目標票價（NT$）</Label>
            <Input
              id="target"
              type="number"
              value={target}
              placeholder="9000"
              onChange={(e) => setTarget(e.target.value)}
              className="mt-2"
            />
          </div>
          <Button
            variant="hero"
            size="lg"
            className="mt-6 w-full"
            type="submit"
            disabled={addWatch.isPending}
          >
            建立追蹤
          </Button>
        </form>

        <section>
          <h2 className="text-2xl font-bold">我的追蹤清單</h2>
          {isLoading ? (
            <p className="mt-6 text-sm text-muted-foreground">載入中…</p>
          ) : watches.length === 0 ? (
            <div className="surface-card mt-6 p-10 text-center text-muted-foreground">
              還沒有追蹤航線，先從左邊新增第一條吧。
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {watches.map((w) => {
                const hit = (w.current_price ?? Infinity) <= w.target_price;
                return (
                  <div key={w.id} className="surface-card flex flex-wrap items-center gap-4 p-5">
                    <div className="min-w-40 flex-1">
                      <p className="font-display text-lg font-semibold">
                        {w.origin} → {w.destination}
                        {w.label ? (
                          <span className="ml-2 text-sm font-normal text-muted-foreground">
                            {w.label}
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        目標價 NT${w.target_price.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">
                        NT${(w.current_price ?? 0).toLocaleString()}
                      </p>
                      {w.previous_price ? (
                        <p className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                          <TrendingDown className="size-3" />
                          30 天前 NT${w.previous_price.toLocaleString()}
                        </p>
                      ) : null}
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
                    <div className="flex items-center gap-2">
                      {w.notify_enabled ? (
                        <Bell className="size-4 text-primary" />
                      ) : (
                        <BellOff className="size-4 text-muted-foreground" />
                      )}
                      <Switch
                        checked={w.notify_enabled}
                        onCheckedChange={(v) => toggleNotify.mutate({ id: w.id, value: v })}
                        aria-label="通知開關"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="刪除追蹤"
                      onClick={() => removeWatch.mutate(w.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
