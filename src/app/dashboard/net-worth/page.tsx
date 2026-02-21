"use client";

import * as React from "react";
import { useAccounts } from "@/hooks/use-accounts";
import { useInvestments } from "@/hooks/use-investments";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { Asset, Liability } from "@/lib/types";
import { 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  Cell, 
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip
} from "recharts";
import { 
  PiggyBank, 
  Landmark, 
  TrendingUp, 
  TrendingDown,
  CreditCard, 
  ArrowUpRight,
  ArrowDownRight,
  MinusCircle,
  PlusCircle,
  DollarSign,
  Percent,
  Calendar,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  Info,
  Lock,
  Crown,
  MapPin,
  Home,
  Building,
  Navigation,
  Maximize2,
  Minimize2,
  Trash2,
  Edit2,
  Plus,
  Map,
  Compass
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { format, subMonths } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { addProperty, updateProperty, deleteProperty, getProperties } from "@/services/properties";
import type { Property } from "@/lib/types";

// Google Maps Script Loader
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Asset type icons and colors
const assetTypeConfig = {
  Cash: { icon: PiggyBank, color: "hsl(var(--chart-2))", bg: "bg-emerald-500/10" },
  Investment: { icon: TrendingUp, color: "hsl(var(--chart-4))", bg: "bg-blue-500/10" },
  Property: { icon: Home, color: "hsl(var(--chart-5))", bg: "bg-purple-500/10" },
  "Credit Card": { icon: CreditCard, color: "hsl(var(--chart-3))", bg: "bg-rose-500/10" },
  Loan: { icon: MinusCircle, color: "hsl(var(--chart-1))", bg: "bg-orange-500/10" },
};

// Generate real historical data from actual transactions
const generateHistoricalData = (accounts: any[], investments: any[], properties: Property[]) => {
  const now = new Date();
  const data = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(now, i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    // Calculate total assets
    const totalAssets = accounts
      .filter(a => a.type !== 'Credit Card')
      .reduce((sum, a) => {
        const historicalBalance = a.balanceHistory?.find((h: any) => 
          new Date(h.date) >= monthStart && new Date(h.date) <= monthEnd
        );
        return sum + (historicalBalance?.balance || a.balance);
      }, 0) + investments.reduce((sum, i) => sum + (i.currentValue || 0), 0) +
      properties.reduce((sum, p) => sum + (p.estimatedValue || p.purchasePrice || 0), 0);
    
    // Calculate total liabilities
    const totalLiabilities = accounts
      .filter(a => a.type === 'Credit Card')
      .reduce((sum, a) => {
        const historicalBalance = a.balanceHistory?.find((h: any) => 
          new Date(h.date) >= monthStart && new Date(h.date) <= monthEnd
        );
        return sum + (historicalBalance?.balance || a.balance);
      }, 0);
    
    data.push({
      month: format(date, 'MMM yyyy'),
      value: totalAssets - totalLiabilities,
      assets: totalAssets,
      liabilities: totalLiabilities,
    });
  }
  
  return data;
};

// Google Maps Component
function PropertyMap({ 
  properties, 
  onAddProperty,
  onEditProperty,
  onDeleteProperty,
  isPro 
}: { 
  properties: Property[];
  onAddProperty: () => void;
  onEditProperty: (property: Property) => void;
  onDeleteProperty: (id: string) => void;
  isPro: boolean;
}) {
  const [mapLoaded, setMapLoaded] = React.useState(false);
  const [selectedProperty, setSelectedProperty] = React.useState<Property | null>(null);
  const mapRef = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = React.useState<google.maps.Marker[]>([]);

  React.useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn("Google Maps API key is missing");
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  React.useEffect(() => {
    if (!mapLoaded || !mapRef.current || !isPro) return;

    // Initialize map
    const newMap = new google.maps.Map(mapRef.current, {
      center: { lat: 20.5937, lng: 78.9629 }, // Center of India
      zoom: 5,
      styles: [
        {
          featureType: "all",
          elementType: "labels",
          stylers: [{ visibility: "on" }]
        }
      ]
    });

    setMap(newMap);

    // Add markers for properties
    const newMarkers = properties.map(property => {
      const marker = new google.maps.Marker({
        position: { 
          lat: property.location?.lat || 20.5937, 
          lng: property.location?.lng || 78.9629 
        },
        map: newMap,
        title: property.name,
        animation: google.maps.Animation.DROP,
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="font-weight: bold; margin-bottom: 4px;">${property.name}</h3>
            <p style="margin: 2px 0;">${property.address || 'No address'}</p>
            <p style="margin: 2px 0;">Value: ₹${property.estimatedValue?.toLocaleString() || property.purchasePrice?.toLocaleString()}</p>
            ${property.propertyType ? `<p style="margin: 2px 0;">Type: ${property.propertyType}</p>` : ''}
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(newMap, marker);
        setSelectedProperty(property);
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Fit bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach(marker => bounds.extend(marker.getPosition()!));
      newMap.fitBounds(bounds);
    }

    return () => {
      newMarkers.forEach(marker => marker.setMap(null));
    };
  }, [mapLoaded, properties, isPro]);

  if (!isPro) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="p-6 text-center">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Property Maps Locked</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upgrade to Pro to visualize your properties on an interactive map and track their locations.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <Card className="bg-yellow-500/10 border-yellow-500/20">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Maps API Key Missing</h3>
          <p className="text-sm text-muted-foreground">
            Please add your Google Maps API key to enable property mapping.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Property Locations
            </CardTitle>
            <CardDescription>
              {properties.length} {properties.length === 1 ? 'property' : 'properties'} mapped
            </CardDescription>
          </div>
          <Button size="sm" onClick={onAddProperty}>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={mapRef} 
          className="w-full h-[400px]"
          style={{ display: mapLoaded ? 'block' : 'none' }}
        />
        {!mapLoaded && (
          <div className="h-[400px] flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Add/Edit Property Dialog
function PropertyDialog({ 
  open, 
  onOpenChange, 
  property,
  onSave 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  property?: Property | null;
  onSave: (propertyData: any) => Promise<void>;
}) {
  const [loading, setLoading] = React.useState(false);
  const [address, setAddress] = React.useState(property?.address || "");
  const [coordinates, setCoordinates] = React.useState(property?.location || { lat: 20.5937, lng: 78.9629 });
  const [searchInput, setSearchInput] = React.useState("");
  const autocompleteRef = React.useRef<google.maps.places.Autocomplete | null>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (window.google && searchRef.current) {
      autocompleteRef.current = new google.maps.places.Autocomplete(searchRef.current);
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.geometry?.location) {
          setAddress(place.formatted_address || "");
          setCoordinates({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
        }
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    
    const propertyData = {
      name: formData.get('name') as string,
      propertyType: formData.get('propertyType') as string,
      purchasePrice: parseFloat(formData.get('purchasePrice') as string) || 0,
      estimatedValue: parseFloat(formData.get('estimatedValue') as string) || 0,
      address: address,
      location: coordinates,
      squareFeet: parseFloat(formData.get('squareFeet') as string) || undefined,
      bedrooms: parseInt(formData.get('bedrooms') as string) || undefined,
      bathrooms: parseInt(formData.get('bathrooms') as string) || undefined,
      purchaseDate: formData.get('purchaseDate') as string,
      notes: formData.get('notes') as string,
    };

    await onSave(propertyData);
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{property ? 'Edit Property' : 'Add Property'}</DialogTitle>
          <DialogDescription>
            {property ? 'Update your property details and location.' : 'Add a new property with its location on the map.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Property Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={property?.name}
                placeholder="e.g., Home, Rental Property"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type</Label>
              <select
                id="propertyType"
                name="propertyType"
                defaultValue={property?.propertyType || 'residential'}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land</option>
                <option value="rental">Rental Property</option>
                <option value="vacation">Vacation Home</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Search Location</Label>
            <Input
              ref={searchRef}
              placeholder="Enter address to locate on map"
              defaultValue={address}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price (₹)</Label>
              <Input
                id="purchasePrice"
                name="purchasePrice"
                type="number"
                defaultValue={property?.purchasePrice}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedValue">Estimated Value (₹)</Label>
              <Input
                id="estimatedValue"
                name="estimatedValue"
                type="number"
                defaultValue={property?.estimatedValue}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="squareFeet">Square Feet</Label>
              <Input
                id="squareFeet"
                name="squareFeet"
                type="number"
                defaultValue={property?.squareFeet}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                name="bedrooms"
                type="number"
                defaultValue={property?.bedrooms}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                name="bathrooms"
                type="number"
                defaultValue={property?.bathrooms}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                defaultValue={property?.purchaseDate}
              />
            </div>
            <div className="space-y-2">
              <Label>Coordinates</Label>
              <div className="text-sm text-muted-foreground">
                Lat: {coordinates.lat.toFixed(6)}, Lng: {coordinates.lng.toFixed(6)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={property?.notes}
              placeholder="Additional details about the property..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : property ? 'Update Property' : 'Add Property'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Property Card Component
function PropertyCard({ 
  property, 
  onEdit, 
  onDelete 
}: { 
  property: Property; 
  onEdit: () => void; 
  onDelete: () => void;
}) {
  const { formatCurrency } = useCurrency();
  const currentValue = property.estimatedValue || property.purchasePrice || 0;
  const appreciation = property.purchasePrice 
    ? ((currentValue - property.purchasePrice) / property.purchasePrice) * 100 
    : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Home className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <CardTitle className="text-base">{property.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {property.address || 'Location not set'}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Value</span>
            <span className="font-semibold">{formatCurrency(currentValue)}</span>
          </div>
          
          {property.purchasePrice > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Purchase Price</span>
              <span className="text-sm">{formatCurrency(property.purchasePrice)}</span>
            </div>
          )}

          {appreciation !== 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Appreciation</span>
              <Badge className={appreciation > 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}>
                {appreciation > 0 ? '+' : ''}{appreciation.toFixed(1)}%
              </Badge>
            </div>
          )}

          {(property.squareFeet || property.bedrooms || property.bathrooms) && (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t">
              {property.squareFeet && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Area</p>
                  <p className="text-sm font-medium">{property.squareFeet} sq.ft</p>
                </div>
              )}
              {property.bedrooms && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Bedrooms</p>
                  <p className="text-sm font-medium">{property.bedrooms}</p>
                </div>
              )}
              {property.bathrooms && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Bathrooms</p>
                  <p className="text-sm font-medium">{property.bathrooms}</p>
                </div>
              )}
            </div>
          )}

          {property.location && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
              <Navigation className="h-3 w-3" />
              <span>Lat: {property.location.lat.toFixed(4)}, Lng: {property.location.lng.toFixed(4)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function NetWorthPage() {
  const { accounts, loading: accountsLoading } = useAccounts();
  const { investments, loading: investmentsLoading } = useInvestments();
  const { formatCurrency, currencySymbol } = useCurrency();
  const { isPro, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [showDetails, setShowDetails] = React.useState(true);
  const [timeRange, setTimeRange] = React.useState("6m");
  const [selectedView, setSelectedView] = React.useState("overview");
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [propertyDialogOpen, setPropertyDialogOpen] = React.useState(false);
  const [selectedProperty, setSelectedProperty] = React.useState<Property | null>(null);
  const [loadingProperties, setLoadingProperties] = React.useState(false);

  const loading = accountsLoading || investmentsLoading || authLoading || loadingProperties;

  // Load properties
  React.useEffect(() => {
    if (!isPro) return;
    
    const loadProperties = async () => {
      setLoadingProperties(true);
      try {
        const props = await getProperties();
        setProperties(props);
      } catch (error) {
        console.error("Error loading properties:", error);
      } finally {
        setLoadingProperties(false);
      }
    };
    
    loadProperties();
  }, [isPro]);

  // Calculate assets including properties
  const assets: Asset[] = React.useMemo(() => {
    const cashAssets = accounts
      .filter(a => a.type !== 'Credit Card')
      .map(a => ({ 
        id: a.id,
        name: a.provider || a.name,
        value: a.balance, 
        type: 'Cash' as const,
        accountType: a.type,
        institution: a.institution,
        lastUpdated: a.lastUpdated
      }));
    
    const investmentAssets = investments.map(i => ({ 
      id: i.id,
      name: i.name, 
      value: i.currentValue || 0, 
      type: 'Investment' as const,
      returns: i.returns,
      performance: i.performance,
      purchaseDate: i.purchaseDate
    }));

    const propertyAssets = properties.map(p => ({
      id: p.id,
      name: p.name,
      value: p.estimatedValue || p.purchasePrice || 0,
      type: 'Property' as const,
      location: p.location,
      address: p.address,
      propertyType: p.propertyType,
    }));

    return [...cashAssets, ...investmentAssets, ...propertyAssets];
  }, [accounts, investments, properties]);

  const liabilities: Liability[] = React.useMemo(() => {
    return accounts
      .filter(a => a.type === 'Credit Card')
      .map(a => ({ 
        id: a.id,
        name: a.provider || a.name, 
        value: a.balance, 
        type: 'Credit Card' as const,
        apr: a.apr,
        dueDate: a.dueDate,
        minimumPayment: a.minimumPayment,
        institution: a.institution
      }));
  }, [accounts]);

  const totalAssets = assets.reduce((acc, asset) => acc + asset.value, 0);
  const totalLiabilities = liabilities.reduce((acc, liab) => acc + liab.value, 0);
  const netWorth = totalAssets - totalLiabilities;
  
  const historicalData = React.useMemo(() => 
    generateHistoricalData(accounts, investments, properties), 
    [accounts, investments, properties]
  );
  
  const netWorthChange = React.useMemo(() => {
    if (historicalData.length < 2) return 0;
    const firstValue = historicalData[0].value;
    const lastValue = historicalData[historicalData.length - 1].value;
    return lastValue - firstValue;
  }, [historicalData]);

  const netWorthChangePercent = React.useMemo(() => {
    if (historicalData.length < 2 || historicalData[0].value === 0) return 0;
    return ((historicalData[historicalData.length - 1].value - historicalData[0].value) / Math.abs(historicalData[0].value)) * 100;
  }, [historicalData]);

  const assetAllocation = React.useMemo(() => {
    const allocation: Record<string, number> = {};
    assets.forEach(asset => {
      allocation[asset.type] = (allocation[asset.type] || 0) + asset.value;
    });
    return Object.entries(allocation).map(([type, value]) => ({
      type,
      value,
      percentage: totalAssets > 0 ? (value / totalAssets) * 100 : 0,
      ...assetTypeConfig[type as keyof typeof assetTypeConfig] || assetTypeConfig.Cash,
    })).sort((a, b) => b.value - a.value);
  }, [assets, totalAssets]);

  const topAssets = React.useMemo(() => {
    return [...assets].sort((a, b) => b.value - a.value).slice(0, 5);
  }, [assets]);

  const financialHealth = React.useMemo(() => {
    const savingsRate = totalAssets > 0 ? (totalAssets / (totalAssets + totalLiabilities)) * 100 : 0;
    const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
    const investmentRatio = totalAssets > 0 
      ? (assets.filter(a => a.type === 'Investment').reduce((sum, a) => sum + a.value, 0) / totalAssets) * 100 
      : 0;
    const propertyRatio = totalAssets > 0
      ? (assets.filter(a => a.type === 'Property').reduce((sum, a) => sum + a.value, 0) / totalAssets) * 100
      : 0;
    
    return {
      savingsRate,
      debtToAssetRatio,
      investmentRatio,
      propertyRatio,
      healthScore: Math.min(100, Math.max(0, 100 - debtToAssetRatio + savingsRate * 0.5)),
    };
  }, [assets, totalAssets, totalLiabilities]);

  const handleAddProperty = async (propertyData: any) => {
    try {
      await addProperty(propertyData);
      const updated = await getProperties();
      setProperties(updated);
      toast({
        title: "Success",
        description: "Property added successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add property",
      });
    }
  };

  const handleUpdateProperty = async (propertyData: any) => {
    if (!selectedProperty) return;
    try {
      await updateProperty(selectedProperty.id, propertyData);
      const updated = await getProperties();
      setProperties(updated);
      setSelectedProperty(null);
      toast({
        title: "Success",
        description: "Property updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update property",
      });
    }
  };

  const handleDeleteProperty = async (id: string) => {
    try {
      await deleteProperty(id);
      const updated = await getProperties();
      setProperties(updated);
      toast({
        title: "Success",
        description: "Property deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete property",
      });
    }
  };

  const exportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      netWorth,
      totalAssets,
      totalLiabilities,
      assets: assets.map(a => ({ name: a.name, type: a.type, value: a.value })),
      liabilities: liabilities.map(l => ({ name: l.name, type: l.type, value: l.value })),
      properties: properties.map(p => ({
        name: p.name,
        address: p.address,
        value: p.estimatedValue || p.purchasePrice,
        location: p.location,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `net-worth-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export complete",
      description: "Your net worth data has been exported",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-96 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="px-3 py-1">
                <DollarSign className="h-3 w-3 mr-1" />
                Net Worth Tracker
              </Badge>
              {isPro && (
                <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white border-0">
                  <Crown className="h-3 w-3 mr-1" />
                  Pro
                </Badge>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Your Financial Health
            </h1>
            <p className="text-muted-foreground mt-2">
              Track your assets, liabilities, properties, and overall net worth
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showDetails ? "Hide Details" : "Show Details"}
            </Button>
            {isPro && (
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  Total Assets
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {showDetails ? formatCurrency(totalAssets) : "••••••"}
                </p>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                    {assets.length} {assets.length === 1 ? 'item' : 'items'}
                  </Badge>
                  {isPro && assetAllocation.length > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Includes {properties.length} {properties.length === 1 ? 'property' : 'properties'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  Total Liabilities
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {showDetails ? formatCurrency(totalLiabilities) : "••••••"}
                </p>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                    {liabilities.length} {liabilities.length === 1 ? 'item' : 'items'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className={cn(
              "overflow-hidden bg-gradient-to-br",
              netWorth >= 0 
                ? "from-emerald-500/10 via-transparent to-emerald-500/5 border-emerald-500/20" 
                : "from-red-500/10 via-transparent to-red-500/5 border-red-500/20"
            )}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  Net Worth
                  {netWorth >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={cn(
                  "text-3xl font-bold",
                  netWorth >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                )}>
                  {showDetails ? formatCurrency(Math.abs(netWorth)) : "••••••"}
                  {netWorth < 0 && <span className="text-sm ml-1">(negative)</span>}
                </p>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      netWorth >= 0 
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                        : "bg-red-500/10 text-red-600 border-red-500/20"
                    )}
                  >
                    {netWorth >= 0 ? 'Positive' : 'Negative'}
                  </Badge>
                  {isPro && netWorthChange !== 0 && (
                    <span className={cn(
                      "text-xs",
                      netWorthChange > 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {netWorthChange > 0 ? '+' : ''}
                      {showDetails ? formatCurrency(netWorthChange) : '••'} ({netWorthChangePercent.toFixed(1)}%)
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Pro Features */}
        {isPro ? (
          <>
            {/* Net Worth Trend */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Net Worth Trend</CardTitle>
                    <CardDescription>Your financial journey over the last 6 months</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={cn(timeRange === "3m" && "bg-accent")}
                      onClick={() => setTimeRange("3m")}
                    >
                      3M
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={cn(timeRange === "6m" && "bg-accent")}
                      onClick={() => setTimeRange("6m")}
                    >
                      6M
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalData.slice(timeRange === "3m" ? -3 : -6)}>
                      <defs>
                        <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="month" 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        tickFormatter={(value) => `${currencySymbol}${(value / 1000).toFixed(0)}k`}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--popover-foreground))'
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="hsl(var(--primary))" 
                        fill="url(#netWorthGradient)"
                        strokeWidth={2}
                        name="Net Worth"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Property Map */}
            <PropertyMap
              properties={properties}
              onAddProperty={() => {
                setSelectedProperty(null);
                setPropertyDialogOpen(true);
              }}
              onEditProperty={(property) => {
                setSelectedProperty(property);
                setPropertyDialogOpen(true);
              }}
              onDeleteProperty={handleDeleteProperty}
              isPro={isPro}
            />

            {/* Asset Allocation and Top Assets */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Asset Allocation</CardTitle>
                  <CardDescription>How your assets are distributed</CardDescription>
                </CardHeader>
                <CardContent>
                  {assets.length > 0 ? (
                    <>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={assetAllocation}
                              dataKey="value"
                              nameKey="type"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              labelLine={false}
                              label={({ type, percentage }) => `${type} (${percentage.toFixed(1)}%)`}
                            >
                              {assetAllocation.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 space-y-2">
                        {assetAllocation.map((item) => (
                          <div key={item.type} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                              <span>{item.type}</span>
                            </div>
                            <span className="font-medium">{formatCurrency(item.value)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No assets to display</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Assets</CardTitle>
                  <CardDescription>Your largest holdings</CardDescription>
                </CardHeader>
                <CardContent>
                  {topAssets.length > 0 ? (
                    <div className="space-y-4">
                      {topAssets.map((asset, index) => {
                        const percentage = totalAssets > 0 ? (asset.value / totalAssets) * 100 : 0;
                        const Icon = asset.type === 'Investment' ? TrendingUp : 
                                    asset.type === 'Property' ? Home : PiggyBank;
                        const bgColor = asset.type === 'Investment' ? 'bg-blue-500/10' :
                                      asset.type === 'Property' ? 'bg-purple-500/10' :
                                      'bg-emerald-500/10';
                        const textColor = asset.type === 'Investment' ? 'text-blue-500' :
                                        asset.type === 'Property' ? 'text-purple-500' :
                                        'text-emerald-500';
                        
                        return (
                          <div key={asset.id || index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={cn("p-1.5 rounded-lg", bgColor)}>
                                  <Icon className={cn("h-4 w-4", textColor)} />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{asset.name}</p>
                                  <p className="text-xs text-muted-foreground">{asset.type}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">{formatCurrency(asset.value)}</p>
                                <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                              </div>
                            </div>
                            <Progress value={percentage} className="h-1.5" />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No assets to display</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Financial Health Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Financial Health Metrics</CardTitle>
                <CardDescription>Key indicators of your financial wellness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Savings Rate</span>
                      <span className="text-sm font-medium">{financialHealth.savingsRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={financialHealth.savingsRate} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Debt-to-Asset</span>
                      <span className="text-sm font-medium">{financialHealth.debtToAssetRatio.toFixed(1)}%</span>
                    </div>
                    <Progress value={financialHealth.debtToAssetRatio} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Investments</span>
                      <span className="text-sm font-medium">{financialHealth.investmentRatio.toFixed(1)}%</span>
                    </div>
                    <Progress value={financialHealth.investmentRatio} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Real Estate</span>
                      <span className="text-sm font-medium">{financialHealth.propertyRatio.toFixed(1)}%</span>
                    </div>
                    <Progress value={financialHealth.propertyRatio} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property List */}
            {properties.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Properties</CardTitle>
                  <CardDescription>Manage your real estate assets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {properties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        onEdit={() => {
                          setSelectedProperty(property);
                          setPropertyDialogOpen(true);
                        }}
                        onDelete={() => handleDeleteProperty(property.id)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Lists */}
            <Tabs value={selectedView} onValueChange={setSelectedView} className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="assets">All Assets</TabsTrigger>
                <TabsTrigger value="liabilities">All Liabilities</TabsTrigger>
              </TabsList>

              <TabsContent value="assets">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">All Assets</CardTitle>
                    <CardDescription>Complete list of your assets including properties</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {assets.length > 0 ? (
                      <div className="space-y-4">
                        {assets.map((asset, index) => {
                          const Icon = asset.type === 'Investment' ? TrendingUp : 
                                      asset.type === 'Property' ? Home : PiggyBank;
                          const bgColor = asset.type === 'Investment' ? 'bg-blue-500/10' :
                                        asset.type === 'Property' ? 'bg-purple-500/10' :
                                        'bg-emerald-500/10';
                          const textColor = asset.type === 'Investment' ? 'text-blue-500' :
                                          asset.type === 'Property' ? 'text-purple-500' :
                                          'text-emerald-500';
                          
                          return (
                            <div
                              key={asset.id || index}
                              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/30 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg", bgColor)}>
                                  <Icon className={cn("h-5 w-5", textColor)} />
                                </div>
                                <div>
                                  <p className="font-medium">{asset.name}</p>
                                  <p className="text-xs text-muted-foreground">{asset.type}</p>
                                </div>
                              </div>
                              <p className="font-semibold">{formatCurrency(asset.value)}</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No assets found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="liabilities">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">All Liabilities</CardTitle>
                    <CardDescription>Complete list of your liabilities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {liabilities.length > 0 ? (
                      <div className="space-y-4">
                        {liabilities.map((liability, index) => (
                          <div
                            key={liability.id || index}
                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-rose-500/10">
                                <CreditCard className="h-5 w-5 text-rose-500" />
                              </div>
                              <div>
                                <p className="font-medium">{liability.name}</p>
                                <p className="text-xs text-muted-foreground">{liability.type}</p>
                              </div>
                            </div>
                            <p className="font-semibold text-rose-500">{formatCurrency(liability.value)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No liabilities found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          /* Upgrade Banner for Free Users */
          <Card className="bg-gradient-to-r from-primary/5 to-purple-600/5 border-primary/20">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
                <div className="p-4 rounded-full bg-gradient-to-r from-primary to-purple-600 mb-6">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Unlock Advanced Insights</h3>
                <p className="text-muted-foreground mb-6">
                  Upgrade to Pro to access historical trends, property mapping, asset allocation analysis, financial health metrics, and export capabilities.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8 w-full">
                  <div className="text-center p-3">
                    <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Net Worth Trends</p>
                  </div>
                  <div className="text-center p-3">
                    <MapPin className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Property Maps</p>
                  </div>
                  <div className="text-center p-3">
                    <PieChart className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Asset Allocation</p>
                  </div>
                  <div className="text-center p-3">
                    <Download className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Export Data</p>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-purple-600"
                  onClick={() => router.push('/dashboard/upgrade')}
                >
                  <Crown className="h-5 w-5 mr-2" />
                  Upgrade to Pro
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Property Dialog */}
        <PropertyDialog
          open={propertyDialogOpen}
          onOpenChange={setPropertyDialogOpen}
          property={selectedProperty}
          onSave={selectedProperty ? handleUpdateProperty : handleAddProperty}
        />
      </div>
    </div>
  );
}