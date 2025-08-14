
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
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
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
  fetchProducts(1);
  setPage(1);
    } catch (err) {
      toast.error(err.message || 'Failed to update inventory');
    } finally {
      setSavingInventory(null);
    }
  };


  // Removed unused reset function

  const fetchProducts = async (pageToLoad = 1, searchValue = "") => {
    setLoading(true);
    try {
      const response = await farmerService.getProducts({ page: pageToLoad, limit: 12, filters: searchValue ? { name: searchValue } : {} });
      if (response.success && Array.isArray(response.data)) {
        if (pageToLoad === 1) {
          setProducts(response.data);
        } else {
          setProducts(prev => [...prev, ...response.data]);
        }
        setHasMore(response.pagination?.has_next ?? false);
      }
    } catch {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
    setPage(1);
  }, []);


  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
        hasMore &&
        !loading
      ) {
        const nextPage = page + 1;
        fetchProducts(nextPage);
        setPage(nextPage);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, hasMore, loading]);

  const handleDeleteProduct = async (productId) => {
    setDeletingId(productId);
    try {
      const response = await farmerService.deleteProduct(productId);
      if (response.success) {
        toast.success('Product deleted successfully!');
        fetchProducts(1);
        setPage(1);
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
  fetchProducts(1);
  setPage(1);
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  return (
    <SidebarLayout
      role="farmer"
      title={
        <>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
            {t('myProducts')}
          </h1>
        </>
      }
      subtitle={t('manageAndViewYourFarmProducts')}
    >
      {/* Floating Add New Product Button (FAB) */}
      <button
        className="fixed top-2 right-8 z-50 flex items-center justify-center gap-1.5 px-3 h-10 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/30"
        onClick={() => setShowAddModal(true)}
        aria-label={t('addNewProduct') || 'Add New Product'}
      >
        <PlusCircle className="h-5 w-5" />
        <span className="font-semibold text-sm hidden md:inline">{t('addNewProduct') || 'Add New Product'}</span>
      </button>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mt-4">
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
              <Card
                key={product.id}
                className={`p-0 flex flex-col rounded-lg shadow-sm overflow-hidden gap-2 
                  ${product.is_seasonal_deal ? 'border-2 border-orange-500 bg-orange-50 dark:bg-orange-900/30' : ''}
                  ${product.is_flash_deal ? 'border-2 border-pink-600 bg-pink-50 dark:bg-pink-900/30' : ''}
                  ${!product.is_seasonal_deal && !product.is_flash_deal ? 'border border-gray-200 bg-white dark:bg-gray-900' : ''}
                `}
              >
                {/* Image cover */}
                <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={`${import.meta.env.VITE_IMAGE_HOST_BASE_URL || 'http://localhost:8000'}${product.image_url}`}
                      alt={product.localized_name || product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                  {/* Deal badges */}
                  {(!!product.is_seasonal_deal || !!product.is_flash_deal) && (
                    <span className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold shadow 
                      ${product.is_seasonal_deal ? 'bg-orange-500 text-white' : ''}
                      ${product.is_flash_deal ? 'bg-pink-600 text-white' : ''}
                    `}>
                      {product.is_seasonal_deal ? 'Seasonal Deal' : ''}
                      {product.is_flash_deal ? 'Flash Deal' : ''}
                    </span>
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
                    {product.localized_names?.[i18n.language] || product.localized_name || product.name}
                  </div>
                  {product.category && (
                    <span className="inline-block px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full mb-1">
                      {product.category.name || 'Unknown Category'}
                    </span>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-300 mt-1">
                    <span className="font-bold text-lg flex items-center gap-1">
                      {t('Rs')} {(!!product.is_seasonal_deal || !!product.is_flash_deal) && discountPercent !== null ? (
                        <>
                          <span className="line-through text-gray-400 mr-1">{product.price}</span>
                          <span className="text-green-700 dark:text-green-400 font-bold">{product.discounted_price}</span>
                        </>
                      ) : (
                        product.price
                      )}
                      {product.amount_per_unit && product.unit && (
                        <span className="text-xs text-gray-500 ml-2 font-normal">/ {product.amount_per_unit} {product.unit}</span>
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
      {/* Infinite scroll loader */}
      {loading && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      {!hasMore && products.length > 0 && (
        <div className="flex justify-center py-4 text-gray-500 text-sm">No more products to load.</div>
      )}
      {/* Add New Product / Edit Product Modal */}
      <ProductForm
        open={!!showAddModal || !!editProduct}
        onOpenChange={() => {
          setShowAddModal(false);
          setEditProduct(null);
        }}
        onProductAdded={() => {
          fetchProducts(1);
          setPage(1);
        }}
        product={editProduct ? { ...editProduct, product_id: editProduct.id } : null}
      />
    </SidebarLayout>
  );
};

export default FarmerProducts;
