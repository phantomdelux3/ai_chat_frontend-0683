import { ShoppingChat } from "@/components/shop/ShoppingChat";
import { siteConfig } from "@/config";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 md:h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <img src="/shopping-assistant-fo5Sg.png" alt="Logo" className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-base md:text-xl font-bold truncate">{siteConfig.name}</h1>
              <p className="text-xs text-muted-foreground truncate hidden sm:block">{siteConfig.tagline}</p>
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

