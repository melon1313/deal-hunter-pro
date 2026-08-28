import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plane, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "登入 / 註冊｜FareDrop 機票降價通知" },
      { name: "description", content: "登入 FareDrop，管理你的機票降價追蹤清單與通知設定。" },
      { property: "og:title", content: "登入 / 註冊｜FareDrop" },
      { property: "og:description", content: "登入後即可建立與管理你的機票降價追蹤清單。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const credentialsSchema = z.object({
  email: z.string().trim().email({ message: "請輸入正確的 Email" }).max(255),
  password: z.string().min(8, { message: "密碼至少 8 個字元" }).max(72),
});

const signUpSchema = credentialsSchema.extend({
  displayName: z.string().trim().min(1, { message: "請輸入暱稱" }).max(50),
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "資料格式錯誤");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) {
      toast.error(
        error.message.includes("Invalid login")
          ? "Email 或密碼不正確"
          : error.message.includes("not confirmed")
            ? "請先到信箱點擊確認連結"
            : error.message,
      );
      return;
    }
    toast.success("歡迎回來！");
    navigate({ to: "/dashboard", replace: true });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    const parsed = signUpSchema.safeParse({ email, password, displayName });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "資料格式錯誤");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: parsed.data.displayName },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(
        error.message.includes("already registered")
          ? "這個 Email 已經註冊過了，請直接登入"
          : error.message,
      );
      return;
    }
    if (data.session) {
      navigate({ to: "/dashboard", replace: true });
      return;
    }
    setAwaitingConfirm(true);
    toast.success("確認信已寄出，請到信箱點擊連結完成註冊");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <Toaster />
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[image:var(--gradient-flare)]">
            <Plane className="size-5 text-primary-foreground" />
          </span>
          <span className="font-display text-lg font-bold">FareDrop</span>
        </Link>

        {awaitingConfirm ? (
          <div className="surface-card p-8 text-center">
            <h1 className="text-2xl font-bold">請到信箱完成確認</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              我們寄了一封確認信到 <span className="text-foreground">{email}</span>
              。點擊信中的連結後就能登入並開始建立追蹤清單。
            </p>
            <Button variant="glass" className="mt-6 w-full" onClick={() => setAwaitingConfirm(false)}>
              回到登入
            </Button>
          </div>
        ) : (
          <div className="surface-card p-8">
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">登入</TabsTrigger>
                <TabsTrigger value="signup">註冊</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="si-email">Email</Label>
                    <Input
                      id="si-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="si-password">密碼</Label>
                    <Input
                      id="si-password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <Button variant="hero" size="lg" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="animate-spin" />} 登入
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="su-name">暱稱</Label>
                    <Input
                      id="su-name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="旅人小明"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="su-email">Email</Label>
                    <Input
                      id="su-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="su-password">密碼</Label>
                    <Input
                      id="su-password"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="至少 8 個字元"
                      className="mt-2"
                    />
                  </div>
                  <Button variant="hero" size="lg" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="animate-spin" />} 建立帳號
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    註冊後我們會寄一封確認信到你的信箱。
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
