import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Store, Heart, Clock, Sparkles, ClipboardList, ArrowRight, Inbox } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSection, Empty, toneForStatus } from "@/components/admin/kit";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { getRecommended } from "@/lib/marketplace/catalog";
import {
  useCatalog,
  useFavorites,
  useRecentlyViewed,
  useMarketplaceInquiries,
} from "@/lib/marketplace/store";
import { formatDate } from "@/components/marketplace/shared";

export function MarketplaceSection() {
  const catalog = useCatalog();
  const { ids: favIds, isSaved, toggle } = useFavorites();
  const { ids: recentIds } = useRecentlyViewed();
  const { inquiries } = useMarketplaceInquiries();

  const saved = useMemo(
    () => catalog.filter((l) => favIds.includes(l.id)),
    [catalog, favIds],
  );
  const recentlyViewed = useMemo(() => {
    const byId = new Map(catalog.map((l) => [l.id, l]));
    return recentIds.map((id) => byId.get(id)).filter(Boolean);
  }, [catalog, recentIds]);
  const recommended = useMemo(() => getRecommended(catalog, {}, 3), [catalog]);
  const browse = useMemo(() => getRecommended(catalog, {}, 6), [catalog]);

  return (
    <div className="space-y-6">
      <PanelSection
        title="Marketplace"
        description="Browse, save and inquire on approved FRAN-X assets and business opportunities."
        action={
          <Button asChild size="sm">
            <Link to="/marketplace">Open Marketplace <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        }
      >
        <Tabs defaultValue="browse">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="browse"><Store className="h-4 w-4" /> Browse</TabsTrigger>
            <TabsTrigger value="saved"><Heart className="h-4 w-4" /> Saved</TabsTrigger>
            <TabsTrigger value="recent"><Clock className="h-4 w-4" /> Recently viewed</TabsTrigger>
            <TabsTrigger value="recommended"><Sparkles className="h-4 w-4" /> Recommended</TabsTrigger>
            <TabsTrigger value="inquiries"><ClipboardList className="h-4 w-4" /> My Inquiries</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-5">
            <CardGrid listings={browse} isSaved={isSaved} toggle={toggle} />
            <div className="mt-5 text-center">
              <Button asChild variant="outline">
                <Link to="/marketplace">Browse all listings <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-5">
            {saved.length ? (
              <CardGrid listings={saved} isSaved={isSaved} toggle={toggle} />
            ) : (
              <EmptyState
                icon={<Heart className="h-6 w-6" />}
                title="No saved opportunities yet"
                cta={<Button asChild size="sm"><Link to="/marketplace">Browse Marketplace</Link></Button>}
              />
            )}
          </TabsContent>

          <TabsContent value="recent" className="mt-5">
            {recentlyViewed.length ? (
              <CardGrid listings={recentlyViewed as typeof catalog} isSaved={isSaved} toggle={toggle} />
            ) : (
              <EmptyState
                icon={<Clock className="h-6 w-6" />}
                title="Nothing viewed yet"
                cta={<Button asChild size="sm"><Link to="/marketplace">Browse Marketplace</Link></Button>}
              />
            )}
          </TabsContent>

          <TabsContent value="recommended" className="mt-5">
            <CardGrid listings={recommended} isSaved={isSaved} toggle={toggle} />
          </TabsContent>

          <TabsContent value="inquiries" className="mt-5">
            {inquiries.length ? (
              <ul className="space-y-3">
                {inquiries.map((i) => (
                  <li key={i.id} className="rounded-xl border border-border bg-surface/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono text-xs text-primary">{i.id}</p>
                      <Badge variant="outline" className={toneForStatus(i.status)}>{i.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm font-medium">{i.listingTitle}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{i.message}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDate(i.createdAt)} · contact via {i.contactMethod}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={<Inbox className="h-6 w-6" />}
                title="No marketplace inquiries yet"
                cta={<Button asChild size="sm"><Link to="/marketplace">Browse Marketplace</Link></Button>}
              />
            )}
          </TabsContent>
        </Tabs>
      </PanelSection>
    </div>
  );
}

function CardGrid({
  listings,
  isSaved,
  toggle,
}: {
  listings: ReturnType<typeof useCatalog>;
  isSaved: (id: string) => boolean;
  toggle: (id: string) => void;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((l) => (
        <ListingCard key={l.id} listing={l} saved={isSaved(l.id)} onToggleSave={() => toggle(l.id)} />
      ))}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface/30 p-10 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-border text-muted-foreground">
        {icon}
      </span>
      <p className="mt-3 font-medium">{title}</p>
      <div className="mt-4">{cta}</div>
    </div>
  );
}
