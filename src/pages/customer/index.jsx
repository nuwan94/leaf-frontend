import TopNavLayout from '@/components/layouts/TopNavLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselDots,
} from '@/components/ui/carousel';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import bannerImage from '@/assets/banner1.jpg';

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
        action: 'Go to Login',
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
        description:
          'Please login to start shopping. You can browse products without logging in, but you need an account to make purchases.',
        action: 'Go to Login',
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
    { id: 1, name: 'Fresh Tomatoes', price: '$4.99/kg', rating: 4.8 },
    { id: 2, name: 'Organic Carrots', price: '$3.49/kg', rating: 4.9 },
    { id: 3, name: 'Green Lettuce', price: '$2.99/head', rating: 4.7 },
    { id: 4, name: 'Bell Peppers', price: '$5.99/kg', rating: 4.6 },
  ];

  const carouselSlides = [
    {
      id: 1,
      title: 'Fresh Produce Delivered to Your Door',
      subtitle: 'Shop the freshest fruits and vegetables from local farmers',
      cta: 'Shop Now',
      image: bannerImage,
    },
    {
      id: 2,
      title: 'Slide 2 Title',
      subtitle: 'This is the subtitle for slide 2.',
      cta: 'Call to Action 2',
      image: bannerImage,
    },
    {
      id: 3,
      title: 'Slide 3 Title',
      subtitle: 'This is the subtitle for slide 3.',
      cta: 'Call to Action 3',
      image: bannerImage,
    },
  ];

  return (
    <TopNavLayout>
      <div className="carousel-container">
        <Carousel>
          <CarouselContent>
            {carouselSlides.map((slide) => (
              <CarouselItem key={slide.id}>
                <div
                  className="h-72 w-full relative"
                  style={{
                    backgroundImage: `url(${slide.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                    <h2 className="text-2xl font-bold mb-2">{slide.title}</h2>
                    <p className="text-lg mb-4">{slide.subtitle}</p>
                    <Button size="lg" className="bg-green-600 hover:bg-green-700">
                      {slide.cta}
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselDots />
        </Carousel>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-8 max-w-7xl">
        {/* Featured Products */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Button variant="outline">View All</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{product.name}</h3>
                  <div className="flex items-center mb-2">
                    <span className="text-sm text-gray-600 ml-1">Rating: {product.rating}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-600">{product.price}</span>
                    <Button size="sm" onClick={() => handleAddToCart(product.name)}>
                      Add to Cart
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
              <AlertDialogDescription>{alertConfig.description}</AlertDialogDescription>
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
