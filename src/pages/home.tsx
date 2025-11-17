import { ShoppingChat } from "@/components/shop/ShoppingChat";
import { siteConfig } from "@/config";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/shopping-assistant-fo5Sg.png" alt="Logo" className="h-10 w-10" />
            <div>
              <h1 className="text-xl font-bold">{siteConfig.name}</h1>
              <p className="text-xs text-muted-foreground">{siteConfig.tagline}</p>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <ShoppingChat />
      </main>
    </div>
  );
}

