import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ProductCard } from '@/components/ProductCard';
import { productService } from '@/lib/services';
import { Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function ProductCatalog({
  className,
  filters = {},
  onFiltersChange,
  categories = [],
  brands = [],
  ...props
}) {
  const { t } = useTranslation();
    const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Memoize filters to prevent infinite re-renders
  const activeFilters = useMemo(() => ({
    name: '',
    category_id: '',
    brand: '',
    min_price: '',
    max_price: '',
    limit: 16,
    sort_by: 'name',
    sort_order: 'asc',
    ...filters
  }), [filters]);

  // Fetch products with current filters and pagination
  const fetchProducts = useCallback(async (page = 1, params = new URLSearchParams()) => {
    setIsLoading(true);
    setError(null);

    try {
      // Only include non-empty filter values, but preserve 0 values for price fields
      params = new URLSearchParams({
        ...Object.fromEntries(
          Object.entries(activeFilters).filter(([key, value]) => {
            // For price fields, include them if they're numbers (including 0) or non-empty strings
            if (key === 'min_price' || key === 'max_price') {
              return value !== '' && value !== null && value !== undefined;
            }
            // For other fields, exclude empty values
            return value !== '';
          })
        ),
        page
      });

      const response = await productService.getProducts(params);

      setProducts(response.data || response.products || []);

      // Handle pagination data structure
      if (response.pagination) {
        // Use the pagination object from API response
        setCurrentPage(response.pagination.current_page || page);
        setTotalPages(response.pagination.total_pages || 1);
        setTotalProducts(response.pagination.total_items || 0);
      } else {
        // Fallback for different API response structure
        setCurrentPage(response.current_page || page);
        setTotalPages(response.total_pages || Math.ceil((response.total || response.data?.length || 0) / activeFilters.limit) || 1);
        setTotalProducts(response.total || response.data?.length || 0);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilters]);

  // Fetch products when filters change
  useEffect(() => {
    // Build query params from activeFilters
    const params = new URLSearchParams();
    if (activeFilters.page) params.append('page', activeFilters.page);
    if (activeFilters.limit) params.append('limit', activeFilters.limit);
    if (activeFilters.category_id) params.append('category_id', activeFilters.category_id);
    if (activeFilters.name) params.append('name', activeFilters.name);
    if (activeFilters.min_price) params.append('min_price', activeFilters.min_price);
    if (activeFilters.max_price) params.append('max_price', activeFilters.max_price);
    if (activeFilters.brand) params.append('brand', activeFilters.brand);
    if (activeFilters.farmer_id) params.append('farmer_id', activeFilters.farmer_id);

    fetchProducts(1, params);
  }, [fetchProducts, activeFilters]);

  // Clear all filters
  const clearFilters = () => {
    navigate('/search'); // Reset to default search page
  };

  // Handle pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchProducts(page);
    }
  };

  return (
    <div className={cn("space-y-4", className)} {...props}>
      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{error}</p>
            <Button
              variant="outline"
              onClick={() => fetchProducts(currentPage)}
              className="w-full mt-4"
            >
              {t('tryAgain')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Products Grid/List */}
      {!isLoading && !error && (
        <>
          {products.length > 0 ? (
            <div className={cn(
              viewMode === 'grid'
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
                : "space-y-4"
            )}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  className={cn(
                    "transition-all duration-200 hover:shadow-lg",
                    viewMode === 'list' ? 'flex flex-row' : ''
                  )}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">{t('noProductsFound')}</p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  {t('clearFilters')}
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            {t('previous')}
          </Button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            {t('next')}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
