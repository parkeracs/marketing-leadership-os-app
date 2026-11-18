import { BottomNav, Sidebar } from "@/components/Nav";
import { SearchPalette } from "@/components/SearchPalette";
import { TrailRecorder } from "@/components/ReadingTrail";
import { DemoBanner } from "@/components/DemoBanner";
import { COLLECTIONS, DEMO_MODE, NAV_KEYS, docsIn } from "@/lib/vault";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const items = [
    { href: "/", label: "Home", icon: "home" },
    // Sections with no content (e.g. Martech in the demo) are left out of the navigation.
    // Principles always stays: when empty, its page explains what goes there.
    ...NAV_KEYS.flatMap((k) => {
      const count = docsIn(k).length;
      if (count === 0 && k !== "principles") return [];
      return [{ href: `/${k}`, label: COLLECTIONS[k].label, icon: k, count: count || undefined }];
    }),
  ];
  return (
    <>
      {DEMO_MODE && <DemoBanner />}
      <div className="shell">
        <Sidebar items={items} demo={DEMO_MODE} />
        <main className="main">{children}</main>
      </div>
      <BottomNav items={items} demo={DEMO_MODE} />
      <SearchPalette />
      <TrailRecorder />
    </>
  );
}
