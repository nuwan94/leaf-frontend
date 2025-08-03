import { TopNavLayout } from '@/components/layouts/TopNavLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Star, Truck, Shield, Leaf } from 'lucide-react';

export default function CustomerHome() {
  const featuredProducts = [
    { id: 1, name: 'Fresh Tomatoes', price: '$4.99/kg', rating: 4.8, image: '/api/placeholder/200/200' },
    { id: 2, name: 'Organic Carrots', price: '$3.49/kg', rating: 4.9, image: '/api/placeholder/200/200' },
    { id: 3, name: 'Green Lettuce', price: '$2.99/head', rating: 4.7, image: '/api/placeholder/200/200' },
    { id: 4, name: 'Bell Peppers', price: '$5.99/kg', rating: 4.6, image: '/api/placeholder/200/200' },
  ];

  const features = [
    { icon: Leaf, title: 'Farm Fresh', description: 'Direct from local farms' },
    { icon: Truck, title: 'Fast Delivery', description: 'Same day delivery available' },
    { icon: Shield, title: 'Quality Guaranteed', description: '100% satisfaction guarantee' },
  ];

  return (
    <TopNavLayout>
      <div className="container mx-auto px-4 py-6 space-y-8 max-w-7xl">
        {/* Hero Section with Carousel */}
        <section className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Fresh Produce Delivered to Your Door
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              Shop the freshest fruits and vegetables from local farmers
            </p>
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              Shop Now
            </Button>
          </div>

          {/* Carousel */}
          <div className="max-w-4xl mx-auto">
            <Carousel>
              <CarouselItem>
                <img src="/api/placeholder/800x400" alt="Slide 1" className="w-full h-auto rounded-lg" />
              </CarouselItem>
              <CarouselItem>
                <img src="/api/placeholder/800x400" alt="Slide 2" className="w-full h-auto rounded-lg" />
              </CarouselItem>
              <CarouselItem>
                <img src="/api/placeholder/800x400" alt="Slide 3" className="w-full h-auto rounded-lg" />
              </CarouselItem>
            </Carousel>
          </div>
        </section>

        {/* Features */}
        <section>
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose Leaf?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center">
                <feature.icon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Button variant="outline">View All</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Leaf className="h-16 w-16 text-gray-400" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{product.name}</h3>
                  <div className="flex items-center mb-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-600">{product.price}</span>
                    <Button size="sm">Add to Cart</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </TopNavLayout>
  );
}
