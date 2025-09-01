
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import SidebarLayout from '@/components/layouts/SidebarLayout.jsx';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Trash2, Pencil } from 'lucide-react';
import { farmerService } from '@/lib/services';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { DataTable } from '@/components/ui/data-table';
import ProductForm from '@/components/farmer/AddEditProduct.jsx';
import { useTranslation } from 'react-i18next';

const FarmerProducts = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
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
      await farmerService.updateInventory(productId, { quantity_available: qty }, user.id);
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

  const fetchProducts = async (pageIdx = 0, size = 10) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const response = await farmerService.getProducts({ farmerId: user.id, page: pageIdx + 1, limit: size });
      if (response.success && Array.isArray(response.data)) {
        setProducts(response.data);
        setTotalItems(response.pagination?.total ?? response.data.length);
      }
    } catch {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchProducts(pageIndex, pageSize);
  }, [user, pageIndex, pageSize]);


  // No infinite scroll for datagrid

  const handleDeleteProduct = async (productId) => {
    setDeletingId(productId);
    try {
      const response = await farmerService.deleteProduct(productId, user.id);
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
      await farmerService.updateProduct(productId, { is_active }, user?.id);
      fetchProducts(1);
      setPage(1);
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  // DataTable columns
  const columns = [
    {
      header: t('image'),
      accessorKey: 'image_url',
      width: 80,
      cell: ({ row }) => (
        <img
          src={row.original.image_url ? `${import.meta.env.VITE_IMAGE_HOST_BASE_URL || 'http://localhost:8000'}${row.original.image_url}` : '/uploads/products/default.jpg'}
          alt={row.original.localized_name || row.original.name}
          className="w-14 h-14 object-cover rounded border"
          onError={e => { e.target.onerror = null; e.target.src = '/uploads/products/default.jpg'; }}
        />
      ),
    },
    {
      header: t('productName'),
      accessorKey: 'localized_names',
      cell: ({ row }) => row.original.localized_names?.[i18n.language] || row.original.localized_name || row.original.name,
      width: 180,
    },
    {
      header: t('category'),
      accessorKey: 'category',
      cell: ({ row }) => row.original.category?.name || t('unknownCategory'),
      width: 120,
    },
    {
      header: t('price'),
      accessorKey: 'price',
      cell: ({ row }) => {
        const p = row.original;
        const discount = p.discounted_price && parseFloat(p.discounted_price) > 0 && parseFloat(p.discounted_price) < parseFloat(p.price);
        return (
          <span>
            {discount ? (
              <>
                <span className="line-through text-gray-400 mr-1">{p.price}</span>
                <span className="text-green-700 font-bold">{p.discounted_price}</span>
              </>
            ) : (
              p.price
            )}
            {p.amount_per_unit && p.unit && (
              <span className="text-xs text-gray-500 ml-1">/ {p.amount_per_unit} {p.unit}</span>
            )}
          </span>
        );
      },
      width: 120,
    },
    {
      header: t('qty'),
      accessorKey: 'quantity_available',
      width: 80,
    },
    {
      header: t('status'),
      accessorKey: 'is_active',
      cell: ({ row }) => (
        <Switch
          checked={row.original.is_active === 1}
          onCheckedChange={checked => handleStatusChange(row.original.id, checked ? 1 : 0)}
        />
      ),
      width: 80,
    },
    {
      header: t('actions'),
      accessorKey: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" variant="info" onClick={() => setEditProduct(row.original)}>
            <Pencil className="h-4 w-4 mr-1" /> {t('edit')}
          </Button>
          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white px-2 py-1" disabled={deletingId === row.original.id} onClick={() => handleDeleteProduct(row.original.id)}>
            {deletingId === row.original.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />} {t('delete')}
          </Button>
        </div>
      ),
      width: 160,
    },
  ];

  return (
    <SidebarLayout
      role="farmer"
      title={<span className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{t('myProducts')}</span>}
      subtitle={t('manageAndViewYourFarmProducts')}
    >
      <DataTable
        columns={columns}
        data={products}
        pageIndex={pageIndex}
        pageSize={pageSize}
        pageCount={Math.ceil(totalItems / pageSize)}
        totalItems={totalItems}
        onPaginationChange={({ pageIndex: newIdx, pageSize: newSize }) => {
          setPageIndex(newIdx);
          setPageSize(newSize);
        }}
        canAddRows={true}
        onAddRow={() => setShowAddModal(true)}
        addRowText={t('addNewProduct') || 'Add New Product'}
      />
      <ProductForm
        open={!!showAddModal || !!editProduct}
        onOpenChange={() => {
          setShowAddModal(false);
          setEditProduct(null);
        }}
        onProductAdded={() => {
          fetchProducts(pageIndex, pageSize);
        }}
        product={editProduct ? { ...editProduct, product_id: editProduct.id } : null}
      />
    </SidebarLayout>
  );
};

export default FarmerProducts;
