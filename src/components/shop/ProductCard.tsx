import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  price: number;
  discounted_price: number;
  url: string;
  image: string;
  description: string;
  brand?: string;
  category?: string;
  score?: number;
  rank?: number;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatPrice = (price: number) => {
    return `₹${price.toFixed(2)}`;
  };

  const hasDiscount = product.discounted_price && product.discounted_price !== product.price;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square relative overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.title}
          className="object-cover w-full h-full"
          onError={(e) => {
            e.currentTarget.src = '/shopping-assistant-fo5Sg.png';
          }}
        />
      </div>
      <CardHeader className="space-y-3 pb-3">
        <CardTitle className="text-base font-semibold line-clamp-2 leading-tight">
          {product.title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(product.discounted_price)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {product.description && (
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {isExpanded ? (
                <>
                  Hide Details <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Show Details <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
            {isExpanded && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>
        )}
        {product.brand && (
          <div className="text-sm text-muted-foreground">
            Brand: <span className="font-medium text-foreground">{product.brand}</span>
          </div>
        )}
        <Button asChild className="w-full">
          <a href={product.url} target="_blank" rel="noopener noreferrer">
            View Product <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
