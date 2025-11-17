import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

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
  const formatPrice = (price: number) => {
    return `₹${price.toFixed(2)}`;
  };

  const hasDiscount = product.discounted_price && product.discounted_price < product.price;

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
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
        <div className="flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="text-xl font-bold text-primary">
                {formatPrice(product.discounted_price)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="line-clamp-3">
          {product.description}
        </CardDescription>
        {product.brand && (
          <div className="text-sm text-muted-foreground">
            Brand: <span className="font-medium">{product.brand}</span>
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
