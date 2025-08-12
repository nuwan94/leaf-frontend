import { useEffect, useState } from 'react';
import SidebarLayout from '@/components/layouts/SidebarLayout.jsx';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle, Trash2, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { farmerService } from '@/lib/services';
import { toast } from 'sonner';

const categories = [
  { id: 1, name: 'Vegetables' },
  { id: 2, name: 'Fruits' },
  { id: 3, name: 'Grains' },
  { id: 4, name: 'Other' },
];

const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  price: z.string().min(1, 'Price is required'),
  quantity: z.string().min(1, 'Quantity is required'),
  category_id: z.string().min(1, 'Category is required'),
  status: z.enum(['active', 'inactive']).default('active'),
});

const FarmerProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [inventoryState, setInventoryState] = useState({});
  const [savingInventoryId, setSavingInventoryId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: '',
      quantity: '',
      category_id: '',
      status: 'active',
    },
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
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

  const onAddProduct = async (data) => {
    setIsSubmitting(true);
    try {
      const productData = {
        ...data,
        price: parseFloat(data.price),
        quantity: parseInt(data.quantity),
        category_id: parseInt(data.category_id),
      };
      const response = await farmerService.addProduct(productData);
      if (response.success) {
        toast.success('Product added successfully!');
        setShowAddModal(false);
        reset();
        fetchProducts();
      } else {
        toast.error(response.message || 'Failed to add product');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

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
    setInventoryState(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const handleInventoryAdjust = (productId, field, delta) => {
    const current = inventoryState[productId]?.[field] ?? products.find(p => p.id === productId)[field];
    const newValue = Math.max(0, parseInt(current || 0) + delta);
    handleInventoryChange(productId, field, newValue);
  };

  const handleSaveInventory = async (productId) => {
    setSavingInventoryId(productId);
    const product = products.find(p => p.id === productId);
    const state = inventoryState[productId] || {};
    const quantity_available = state.quantity_available !== undefined ? parseInt(state.quantity_available) : product.quantity_available;
    const reorder_level = state.reorder_level !== undefined ? parseInt(state.reorder_level) : (product.reorder_level || 0);
    try {
      const response = await farmerService.updateInventory(productId, { quantity_available, reorder_level });
      if (response.success) {
        toast.success('Inventory updated!');
        fetchProducts();
      } else {
        toast.error(response.message || 'Failed to update inventory');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update inventory');
    } finally {
      setSavingInventoryId(null);
    }
  };

  return (
    <SidebarLayout
      role="farmer"
      title="My Products"
      subtitle="Manage and view your farm products"
    >
      <div className="max-w-6xl mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Products</h2>
          <Button onClick={() => setShowAddModal(true)} variant="primary" className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Add Product
          </Button>
        </div>

        {/* Add Product Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent>
            <DialogHeader>
              <h2 className="text-lg font-semibold">Add New Product</h2>
            </DialogHeader>
            <form onSubmit={handleSubmit(onAddProduct)} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" {...register('name')} placeholder="e.g. Tomatoes" />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="category_id">Category *</Label>
                <select id="category_id" {...register('category_id')} className="w-full border rounded px-2 py-1">
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.category_id && <p className="text-xs text-red-500">{errors.category_id.message}</p>}
              </div>
              <div>
                <Label htmlFor="price">Price (Rs.) *</Label>
                <Input id="price" type="number" step="0.01" {...register('price')} placeholder="e.g. 120.00" />
                {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
              </div>
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input id="quantity" type="number" {...register('quantity')} placeholder="e.g. 50" />
                {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <select id="status" {...register('status')} className="w-full border rounded px-2 py-1">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)} className="mr-2">Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Product'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-600">Loading products...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-center">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-center">
            <p className="text-yellow-700 text-sm">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map(product => (
              <Card key={product.id} className="relative p-4 flex flex-col gap-2">
                {/* Status label top right */}
                <span className={`absolute top-4 right-4 px-2 py-1 rounded text-xs font-medium shadow-sm ${product.is_active === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{product.is_active ? 'Active' : 'Inactive'}</span>
                {/* Delete button top right, next to status */}
                <button
                  className="absolute top-4 right-24 text-red-500 hover:text-red-700"
                  title="Delete Product"
                  disabled={deletingId === product.id}
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  {deletingId === product.id ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                </button>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{product.name}</h2>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Price: Rs. {product.price}</div>
                {/* Inventory controls - no background/border, just inline inputs */}
                <div className="flex gap-4 items-center mt-1">
                  <div className="flex flex-col gap-0.5">
                    <Label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Qty</Label>
                    <Input
                      type="number"
                      className="w-16 px-2 py-1 text-center"
                      value={inventoryState[product.id]?.quantity_available ?? product.quantity_available}
                      onChange={e => handleInventoryChange(product.id, 'quantity_available', e.target.value)}
                      min={0}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <Label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Reorder</Label>
                    <Input
                      type="number"
                      className="w-16 px-2 py-1 text-center"
                      value={inventoryState[product.id]?.reorder_level ?? product.reorder_level ?? 0}
                      onChange={e => handleInventoryChange(product.id, 'reorder_level', e.target.value)}
                      min={0}
                    />
                  </div>
                  <Button
                    size="sm"
                    className="w-fit bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 px-3 py-1 mt-5"
                    disabled={savingInventoryId === product.id}
                    onClick={() => handleSaveInventory(product.id)}
                  >
                    {savingInventoryId === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />} Save
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default FarmerProducts;

