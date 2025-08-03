import { TopNavLayout } from '@/components/layouts/TopNavLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Star, Truck, Shield, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function CustomerHome() {
  const navigate = useNavigate();
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', description: '', action: '' });

  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isLoggedIn = !!user;

  const handleAddToCart = (productName) => {
    if (!isLoggedIn) {
      setAlertConfig({
        title: 'Login Required',
        description: `Please login to add ${productName} to your cart. You'll be redirected to the login page.`,
        action: 'Go to Login'
      });
      setAlertOpen(true);
      return;
    }
    // Handle add to cart for logged-in users
    console.log(`Added ${productName} to cart`);
    // You can add actual cart logic here
  };

  const handleShopNow = () => {
    if (!isLoggedIn) {
      setAlertConfig({
        title: 'Login Required',
        description: 'Please login to start shopping. You can browse products without logging in, but you need an account to make purchases.',
        action: 'Go to Login'
      });
      setAlertOpen(true);
      return;
    }
    // Handle shop now for logged-in users
    console.log('Navigate to shop page');
  };

  const handleAlertAction = () => {
    setAlertOpen(false);
    navigate('/login');
  };

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
        {/* Welcome message for non-logged users */}
        {!isLoggedIn && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-blue-800 dark:text-blue-200 text-center">
              Welcome to Leaf Marketplace! Browse our fresh produce.
              <Button variant="link" className="p-0 ml-1 h-auto text-blue-600 hover:text-blue-700" onClick={() => navigate('/login')}>
                Login or Sign up
              </Button>
              to start shopping.
            </p>
          </div>
        )}

        {/* Hero Section with Carousel */}
        <section className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Fresh Produce Delivered to Your Door
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              Shop the freshest fruits and vegetables from local farmers
            </p>
            <Button size="lg" className="bg-green-600 hover:bg-green-700" onClick={handleShopNow}>
              {isLoggedIn ? 'Shop Now' : 'Login to Shop'}
            </Button>
          </div>

          {/* Carousel */}
          <div className="max-w-4xl mx-auto">
            <Carousel>
              <CarouselContent>
                <CarouselItem>
                  <div className="p-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center h-48">
                    <div className="text-center">
                      <Leaf className="h-16 w-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold">Fresh from Farms</h3>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="p-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center h-48">
                    <div className="text-center">
                      <Truck className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold">Fast Delivery</h3>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="p-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center h-48">
                    <div className="text-center">
                      <Shield className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold">Quality Assured</h3>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
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
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product.name)}
                      variant={isLoggedIn ? "default" : "outline"}
                    >
                      {isLoggedIn ? 'Add to Cart' : 'Login to Buy'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Alert Dialog */}
        <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {alertConfig.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleAlertAction}>
                {alertConfig.action}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TopNavLayout>
  );
}
