import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface ListingPreviewModalProps {
  open: boolean;
  onClose: () => void;
  platform: string;
  listing: {
    title: string;
    description: string;
    price: number;
    currency: string;
    images: string[];
  } | null;
}

export function ListingPreviewModal({ open, onClose, platform, listing }: ListingPreviewModalProps) {
  if (!listing) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Preview on <Badge variant="outline">{platform}</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {listing.images.length > 0 && (
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
            </div>
          )}
          {listing.images.length === 0 && (
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground text-sm">No image</p>
            </div>
          )}
          <div>
            <h3 className="font-semibold">{listing.title}</h3>
            <p className="text-lg font-bold text-primary mt-1">
              {listing.currency} {listing.price.toFixed(2)}
            </p>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-4">{listing.description}</p>
          <p className="text-xs text-muted-foreground italic">
            This is a mockup preview. Actual appearance may vary on {platform}.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
