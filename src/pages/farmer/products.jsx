import { useEffect, useState } from 'react';
import SidebarLayout from '@/components/layouts/SidebarLayout.jsx';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Camera, CheckCircle2, Loader2, PlusCircle, Trash2, Pencil } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { farmerService } from '@/lib/services';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import ProductForm from '@/components/farmer/AddEditProduct.jsx';

const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  price: z.string().min(1, 'Price is required'),
  category_id: z.string().min(1, 'Category is required'),
  status: z.enum(['active', 'inactive']).default('active'),
});

const FarmerProducts = () => {
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [inventoryState, setInventoryState] = useState({});
  const [savingInventoryId, setSavingInventoryId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [productImages, setProductImages] = useState({}); // Track image changes per product
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: '',
      category_id: '',
      status: 'active',
      image: null,
    },
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await farmerService.getProducts();
      if (response.success && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setError(response.message || 'Failed to load products');
      }
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (productId) => {
    setDeletingId(productId);
    try {
      const response = await farmerService.deleteProduct(productId);
      if (response.success) {
        toast.success('Product deleted successfully!');
        fetchProducts();
      } else {
        toast.error(response.message || 'Failed to delete product');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  const handleInventoryChange = (productId, field, value) => {
    setInventoryState((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  // Add function to handle image change
  const handleImageChange = (productId, file) => {
    setProductImages((prev) => ({
      ...prev,
      [productId]: file,
    }));
  };

  const handleSaveInventory = async (productId) => {
    setSavingInventoryId(productId);
    const product = products.find((p) => p.id === productId);
    const state = inventoryState[productId] || {};
    const imageFile = productImages[productId];

    const name = state.name !== undefined ? state.name : product.name;
    const quantity_available =
      state.quantity_available !== undefined
        ? parseInt(state.quantity_available)
        : product.quantity_available;
    const price = state.price !== undefined ? parseFloat(state.price) : product.price;

    try {
      // Check if we have image changes
      if (imageFile) {
        // Use FormData for image updates with other changes
        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('image', imageFile);

        // Update product with image and name
        await farmerService.updateProduct(productId, formData);

        // Update inventory separately
        await farmerService.updateInventory(productId, { quantity_available });

        // Clear the image from state after successful upload
        setProductImages((prev) => {
          const newState = { ...prev };
          delete newState[productId];
          return newState;
        });
      } else {
        // Handle regular inventory, price, and name updates without image
        await farmerService.updateProduct(productId, { name, price });
        await farmerService.updateInventory(productId, { quantity_available });
      }

      toast.success('Product updated!');
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to update product');
    } finally {
      setSavingInventoryId(null);
    }
  };

  const handleStatusChange = async (productId, is_active) => {
    setSavingInventoryId(productId);
    try {
      await farmerService.updateProduct(productId, { is_active });
      setInventoryState((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          is_active,
        },
      }));
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setSavingInventoryId(null);
    }
  };

  return (
    <SidebarLayout role="farmer" title="My Products" subtitle="Manage and view your farm products">
      <div className="">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Add Product Card */}
          <div
            className="relative p-4 flex flex-col gap-2 items-center justify-center border-2 border-dashed border-primary rounded-lg min-h-[220px] cursor-pointer hover:bg-primary/5 transition"
            style={{ minHeight: '220px' }}
            onClick={() => setShowAddModal(true)}
          >
            <PlusCircle className="h-8 w-8 text-primary mb-2" />
            <h2 className="text-lg font-semibold text-primary mb-1">Add New Product</h2>
            <div className="text-sm text-primary/80 mb-1 text-center">
              Click to add a new product to your catalog
            </div>
          </div>
          {/* Existing product cards */}
          {products.map((product) => {
            // Calculate discount percentage if discounted_price exists and is less than price
            let discountPercent = null;
            if (
              product.discounted_price &&
              parseFloat(product.discounted_price) > 0 &&
              parseFloat(product.discounted_price) < parseFloat(product.price)
            ) {
              discountPercent = Math.round(
                (100 * (parseFloat(product.price) - parseFloat(product.discounted_price)) / parseFloat(product.price))
              );
            }
            return (
              <Card key={product.id} className="p-0 flex flex-col border border-gray-200 rounded-lg shadow-sm bg-white dark:bg-gray-900 overflow-hidden gap-2">
                {/* Image cover */}
                <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={`${import.meta.env.VITE_IMAGE_HOST_BASE_URL || 'http://localhost:8000'}${product.image_url}`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                  {discountPercent !== null && (
                    <span className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
                      -{discountPercent}%
                    </span>
                  )}
                </div>
                {/* Info section */}
                <div className="px-3 py-2 flex flex-col gap-1 flex-1">
                  <div className="font-semibold text-base text-gray-900 dark:text-gray-100 truncate">
                    {product.name}
                  </div>
                  {product.category && (
                    <span className="inline-block px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full mb-1">
                      {product.category.name || 'Unknown Category'}
                    </span>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-300 mt-1">
                    <span className="font-bold text-lg">
                      Rs. {(!!product.is_seasonal_deal || !!product.is_flash_deal) && discountPercent !== null ? (
                        <>
                          <span className="line-through text-gray-400 mr-1">{product.price}</span>
                          <span className="text-green-700 dark:text-green-400 font-bold">{product.discounted_price}</span>
                        </>
                      ) : (
                        product.price
                      )}
                    </span>
                    <span className="font-bold text-lg">Qty: {product.quantity_available}</span>
                  </div>
                </div>
                {/* Actions row */}
                <div className="px-3 py-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={product.is_active === 1}
                      onCheckedChange={(checked) => handleStatusChange(product.id, checked ? 1 : 0)}
                      id={`status-switch-${product.id}`}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      {product.is_active === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() => setEditProduct(product)}
                    >
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1"
                      disabled={deletingId === product.id}
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      {deletingId === product.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-1" />
                      )}{' '}
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        {/* Add New Product / Edit Product Modal */}
        <ProductForm
          open={!!showAddModal || !!editProduct}
          onOpenChange={(val) => {
            setShowAddModal(false);
            setEditProduct(null);
            reset({
              name: '',
              price: '',
              category_id: '',
              status: 'active',
              image: null,
            });
          }}
          onProductAdded={fetchProducts}
          product={editProduct ? { ...editProduct, product_id: editProduct.id } : null}
        />
      </div>
    </SidebarLayout>
  );
};

export default FarmerProducts;
