
import { useEffect, useState } from 'react';
import SidebarLayout from '@/components/layouts/SidebarLayout.jsx';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Trash2, Pencil, Save } from 'lucide-react';
import { farmerService } from '@/lib/services';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import ProductForm from '@/components/farmer/AddEditProduct.jsx';
import { useTranslation } from 'react-i18next';

const FarmerProducts = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Removed unused state: savingInventoryId, error, isLoading
  const [editProduct, setEditProduct] = useState(null);
  // For inline inventory editing
  const [inventoryEdits, setInventoryEdits] = useState({});
  const [savingInventory, setSavingInventory] = useState(null);
  // Inline inventory update handler
  const handleInventoryInput = (productId, value) => {
    setInventoryEdits((prev) => ({ ...prev, [productId]: value }));
  };

  const handleSaveInventory = async (productId) => {
    setSavingInventory(productId);
    try {
      const qty = Number(inventoryEdits[productId]);
      if (!Number.isFinite(qty) || qty < 0) {
        toast.error('Invalid quantity');
        setSavingInventory(null);
        return;
      }
      await farmerService.updateInventory(productId, { quantity_available: qty });
      toast.success('Inventory updated!');
      setInventoryEdits((prev) => ({ ...prev, [productId]: undefined }));
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to update inventory');
    } finally {
      setSavingInventory(null);
    }
  };


  // Removed unused reset function

  const fetchProducts = async () => {
    try {
      const response = await farmerService.getProducts();
      if (response.success && Array.isArray(response.data)) {
        setProducts(response.data);
      }
    } catch (err) {
      // Optionally handle error
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



  const handleStatusChange = async (productId, is_active) => {
    try {
      await farmerService.updateProduct(productId, { is_active });
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  return (
    <SidebarLayout role="farmer" title={t('myProducts')} subtitle={t('manageAndViewYourFarmProducts')}>
      <div className="">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
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
                      {t('Rs')} {(!!product.is_seasonal_deal || !!product.is_flash_deal) && discountPercent !== null ? (
                        <>
                          <span className="line-through text-gray-400 mr-1">{product.price}</span>
                          <span className="text-green-700 dark:text-green-400 font-bold">{product.discounted_price}</span>
                        </>
                      ) : (
                        product.price
                      )}
                    </span>
                    <span className="font-bold text-lg flex items-center gap-2">
                      {t('qty')}:
                      <input
                        type="number"
                        min="0"
                        className="w-16 px-1 py-0.5 border rounded text-center text-base bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                        value={
                          inventoryEdits[product.id] !== undefined
                            ? inventoryEdits[product.id]
                            : product.quantity_available
                        }
                        onChange={e => handleInventoryInput(product.id, e.target.value)}
                        disabled={savingInventory === product.id}
                      />
                      <button
                        className="ml-1 p-1 rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-60"
                        title="Save Inventory"
                        onClick={() => handleSaveInventory(product.id)}
                        disabled={savingInventory === product.id || inventoryEdits[product.id] === undefined || inventoryEdits[product.id] == product.quantity_available}
                        type="button"
                      >
                        {savingInventory === product.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </button>
                    </span>
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
          onOpenChange={() => {
            setShowAddModal(false);
            setEditProduct(null);
          }}
          onProductAdded={fetchProducts}
          product={editProduct ? { ...editProduct, product_id: editProduct.id } : null}
        />
      </div>
    </SidebarLayout>
  );
};

export default FarmerProducts;
