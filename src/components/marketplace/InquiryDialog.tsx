import { useState } from "react";
import { MessageCircle, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SITE, listingWhatsAppUrl, listingEmailUrl } from "@/lib/site";
import { useMarketplaceInquiries } from "@/lib/marketplace/store";
import type { ContactMethod, MarketplaceListing } from "@/lib/marketplace/types";

export function InquiryDialog({
  listing,
  trigger,
}: {
  listing: MarketplaceListing;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { addInquiry } = useMarketplaceInquiries();

  const contact = (method: ContactMethod) => {
    addInquiry({
      listingId: listing.id,
      listingTitle: listing.title,
      name: "—",
      email: SITE.email,
      phone: SITE.whatsappDisplay,
      message: `Inquiry initiated via ${method} from the Marketplace.`,
      contactMethod: method,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact the seller</DialogTitle>
          <DialogDescription>
            Reach out about <span className="font-medium text-foreground">{listing.title}</span> directly
            via WhatsApp or email. All inquiries are routed to the FRAN-X team.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-3">
          <a
            href={listingWhatsAppUrl(listing.title)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => contact("WhatsApp")}
            className="flex items-center gap-3 rounded-xl border border-border bg-[#25D366]/10 p-4 transition-colors hover:border-[#25D366]/50 hover:bg-[#25D366]/15"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#25D366] text-white">
              <MessageCircle className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium">Chat on WhatsApp</span>
              <span className="block truncate text-sm text-muted-foreground">{SITE.whatsappDisplay}</span>
            </span>
            <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
          </a>

          <a
            href={listingEmailUrl(listing.title)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => contact("Email")}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface/40 p-4 transition-colors hover:border-primary/50"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
              <Mail className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium">Send an email</span>
              <span className="block truncate text-sm text-muted-foreground">{SITE.email}</span>
            </span>
            <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
          </a>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
