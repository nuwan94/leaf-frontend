import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import TopNavLayout from '@/components/layouts/TopNavLayout';
import { ProductCard } from '@/components/ProductCard';
import { customerService } from '@/lib/services';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import banner1 from '@/assets/banner1.jpg';
import vegetables from '@/assets/vegetables.png';
import fruits from '@/assets/fruits.png';
import grains from '@/assets/grains.png';
import dairy from '@/assets/dairy.png';
import { Card } from '@/components/ui/card.jsx';

export default function CustomerDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch featured/recent products for home page
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await customerService.getProducts({ limit: 12, is_featured: 1 });
        const productsData = response.data || response.products || [];
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <TopNavLayout>
      {/* Hero Section */}
      <div
        className="relative bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 overflow-hidden"
        style={{
          backgroundImage: `url(${banner1})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60"></div>

        <div className="relative container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">
              Fresh Produce Market
            </h1>
            <p className="text-lg text-white/90 mb-8 drop-shadow-md">
              Discover the freshest fruits, vegetables, and farm products directly from local
              farmers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/search')}
                className="flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
              >
                <Sparkles className="h-5 w-5" />
                Browse All Products
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Vegetables', id: 1, image: vegetables },
              { name: 'Fruits', id: 2, image: fruits },
              { name: 'Grains', id: 3, image: grains },
              { name: 'Dairy', id: 4, image: dairy },
            ].map((category) => (
              <Card
                key={category.id}
                className="h-64 flex flex-col items-center justify-center gap-2 bg-background hover:bg-accent cursor-pointer"
                onClick={() => navigate(`/search?category=${category.id}`)}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-contain transition-transform duration-300 ease-in-out hover:scale-105"
                />
                <span className="font-medium">{category.name}</span>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Featured Products</h2>
            <p className="text-muted-foreground">Fresh picks from our farmers</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/search')}
            className="flex items-center gap-2"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-muted rounded-lg aspect-[4/3] mb-2"></div>
                <div className="space-y-1">
                  <div className="bg-muted rounded h-3 w-3/4"></div>
                  <div className="bg-muted rounded h-3 w-1/2"></div>
                  <div className="bg-muted rounded h-6 w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">No products available at the moment.</div>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
        )}
      </div>
    </TopNavLayout>
  );
}
