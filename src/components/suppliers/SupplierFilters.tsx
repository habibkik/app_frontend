import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { industries, countries, certifications } from "@/data/suppliers";

export interface SupplierFilters {
  industries: string[];
  countries: string[];
  certifications: string[];
  verifiedOnly: boolean;
  minRating: number;
  maxMinOrder: number;
}

interface SupplierFiltersProps {
  filters: SupplierFilters;
  onFiltersChange: (filters: SupplierFilters) => void;
  resultCount: number;
}

export const defaultFilters: SupplierFilters = {
  industries: [],
  countries: [],
  certifications: [],
  verifiedOnly: false,
  minRating: 0,
  maxMinOrder: 50000,
};

function FilterContent({ 
  filters, 
  onFiltersChange 
}: { 
  filters: SupplierFilters; 
  onFiltersChange: (filters: SupplierFilters) => void;
}) {
  const toggleArrayFilter = (
    key: "industries" | "countries" | "certifications",
    value: string
  ) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: updated });
  };

  return (
    <div className="space-y-4">
      <Accordion type="multiple" defaultValue={["industry", "location", "verification"]} className="w-full">
        {/* Verified Filter */}
        <AccordionItem value="verification">
          <AccordionTrigger className="text-sm font-medium">
            Verification
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={filters.verifiedOnly}
                onCheckedChange={(checked) =>
                  onFiltersChange({ ...filters, verifiedOnly: !!checked })
                }
              />
              <Label htmlFor="verified" className="text-sm cursor-pointer">
                Verified suppliers only
              </Label>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Industry Filter */}
        <AccordionItem value="industry">
          <AccordionTrigger className="text-sm font-medium">
            Industry
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {industries.map((industry) => (
                <div key={industry} className="flex items-center space-x-2">
                  <Checkbox
                    id={`industry-${industry}`}
                    checked={filters.industries.includes(industry)}
                    onCheckedChange={() => toggleArrayFilter("industries", industry)}
                  />
                  <Label
                    htmlFor={`industry-${industry}`}
                    className="text-sm cursor-pointer"
                  >
                    {industry}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Location Filter */}
        <AccordionItem value="location">
          <AccordionTrigger className="text-sm font-medium">
            Location
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {countries.map((country) => (
                <div key={country.code} className="flex items-center space-x-2">
                  <Checkbox
                    id={`country-${country.code}`}
                    checked={filters.countries.includes(country.code)}
                    onCheckedChange={() => toggleArrayFilter("countries", country.code)}
                  />
                  <Label
                    htmlFor={`country-${country.code}`}
                    className="text-sm cursor-pointer"
                  >
                    {country.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Rating Filter */}
        <AccordionItem value="rating">
          <AccordionTrigger className="text-sm font-medium">
            Minimum Rating
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <Slider
                value={[filters.minRating]}
                onValueChange={([value]) =>
                  onFiltersChange({ ...filters, minRating: value })
                }
                max={5}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Any</span>
                <span className="font-medium text-foreground">
                  {filters.minRating > 0 ? `${filters.minRating}+ stars` : "Any rating"}
                </span>
                <span>5.0</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Min Order Filter */}
        <AccordionItem value="minOrder">
          <AccordionTrigger className="text-sm font-medium">
            Max Minimum Order
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <Slider
                value={[filters.maxMinOrder]}
                onValueChange={([value]) =>
                  onFiltersChange({ ...filters, maxMinOrder: value })
                }
                max={50000}
                step={1000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$0</span>
                <span className="font-medium text-foreground">
                  Up to ${filters.maxMinOrder.toLocaleString()}
                </span>
                <span>$50,000</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Certifications Filter */}
        <AccordionItem value="certifications">
          <AccordionTrigger className="text-sm font-medium">
            Certifications
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {certifications.map((cert) => (
                <div key={cert} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cert-${cert}`}
                    checked={filters.certifications.includes(cert)}
                    onCheckedChange={() => toggleArrayFilter("certifications", cert)}
                  />
                  <Label
                    htmlFor={`cert-${cert}`}
                    className="text-sm cursor-pointer"
                  >
                    {cert}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export function SupplierFiltersPanel({ filters, onFiltersChange, resultCount }: SupplierFiltersProps) {
  const activeFilterCount =
    filters.industries.length +
    filters.countries.length +
    filters.certifications.length +
    (filters.verifiedOnly ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.maxMinOrder < 50000 ? 1 : 0);

  const clearFilters = () => onFiltersChange(defaultFilters);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-24 bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Filters</h3>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto py-1 px-2 text-xs"
                onClick={clearFilters}
              >
                Clear all
              </Button>
            )}
          </div>
          <FilterContent filters={filters} onFiltersChange={onFiltersChange} />
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                {resultCount} suppliers found
              </SheetDescription>
            </SheetHeader>
            <Separator className="my-4" />
            <FilterContent filters={filters} onFiltersChange={onFiltersChange} />
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={clearFilters}
              >
                Clear all filters
              </Button>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
