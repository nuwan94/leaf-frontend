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

export function ProductCatalog({
  className,
  filters = {},
  onFiltersChange,
  showFilters = false,
  categories = [],
  brands = [],
  ...props
}) {
  const { t } = useTranslation();
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
    if (onFiltersChange) {
      onFiltersChange({
        name: '',
        category_id: '',
        brand: '',
        min_price: '',
        max_price: '',
        limit: 16,
        sort_by: 'name',
        sort_order: 'asc'
      });
    }
    setCurrentPage(1);
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
      {/* Compact Header with Filters */}
      {showFilters && (
        <div className="space-y-3">
          {/* Single Row: All Filters Inline */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            {/* Left Side: All Filter Controls in One Row */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Filter */}
              <Select
                value={activeFilters.category_id || undefined}
                onValueChange={(value) => {
                  const newValue = value === 'all_categories' ? '' : value;
                  if (onFiltersChange) {
                    onFiltersChange({ ...activeFilters, category_id: newValue });
                  }
                }}
              >
                <SelectTrigger className="h-9 w-40 text-sm">
                  <SelectValue placeholder={t('selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_categories">{t('allCategories')}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Brand Filter */}
              <Select
                value={activeFilters.brand || undefined}
                onValueChange={(value) => {
                  const newValue = value === 'all_brands' ? '' : value;
                  if (onFiltersChange) {
                    onFiltersChange({ ...activeFilters, brand: newValue });
                  }
                }}
              >
                <SelectTrigger className="h-9 w-36 text-sm">
                  <SelectValue placeholder={t('selectBrand')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_brands">{t('allBrands')}</SelectItem>
                  {brands && Array.isArray(brands) && brands.map((brand, index) => (
                    <SelectItem key={`brand-${index}`} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Min Price */}
              <Input
                type="number"
                placeholder={t('minPrice')}
                value={activeFilters.min_price}
                onChange={(e) => {
                  const value = e.target.value;
                  if (onFiltersChange) {
                    onFiltersChange({ ...activeFilters, min_price: value });
                  }
                }}
                className="h-9 w-24 text-sm"
              />

              {/* Max Price */}
              <Input
                type="number"
                placeholder={t('maxPrice')}
                value={activeFilters.max_price}
                onChange={(e) => {
                  const value = e.target.value;
                  if (onFiltersChange) {
                    onFiltersChange({ ...activeFilters, max_price: value });
                  }
                }}
                className="h-9 w-24 text-sm"
              />

              {/* Sort Options */}
              <Select
                value={`${activeFilters.sort_by}_${activeFilters.sort_order}`}
                onValueChange={(value) => {
                  const [sort_by, sort_order] = value.split('_');
                  if (onFiltersChange) {
                    onFiltersChange({ ...activeFilters, sort_by, sort_order });
                  }
                }}
              >
                <SelectTrigger className="h-9 w-36 text-sm">
                  <SelectValue placeholder={t('sortBy')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name_asc">{t('nameAZ')}</SelectItem>
                  <SelectItem value="name_desc">{t('nameZA')}</SelectItem>
                  <SelectItem value="price_asc">{t('priceLowHigh')}</SelectItem>
                  <SelectItem value="price_desc">{t('priceHighLow')}</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters Button */}
              <Button variant="outline" onClick={clearFilters} className="h-9 text-sm px-3">
                {t('resetFilters')}
              </Button>
            </div>

            {/* Right Side: Results Info, Items Per Page, and View Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Results Count */}
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {t('showingResults', {
                  start: (currentPage - 1) * activeFilters.limit + 1,
                  end: Math.min(currentPage * activeFilters.limit, totalProducts),
                  total: totalProducts
                })}
              </span>

              {/* Items per page */}
              <Select
                value={activeFilters.limit.toString()}
                onValueChange={(value) => {
                  const limit = parseInt(value);
                  if (onFiltersChange) {
                    onFiltersChange({ ...activeFilters, limit });
                  }
                }}
              >
                <SelectTrigger className="h-9 w-24 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8 {t('perPage')}</SelectItem>
                  <SelectItem value="16">16 {t('perPage')}</SelectItem>
                  <SelectItem value="24">24 {t('perPage')}</SelectItem>
                  <SelectItem value="32">32 {t('perPage')}</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-9 w-9 p-0 rounded-r-none border-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-9 w-9 p-0 rounded-l-none border-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters Row */}
          {(activeFilters.category_id || activeFilters.brand || activeFilters.min_price || activeFilters.max_price || activeFilters.name) && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{t('activeFilters')}:</span>
              <div className="flex flex-wrap gap-1">
                {activeFilters.name && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => onFiltersChange({ ...activeFilters, name: '' })}
                  >
                    "{activeFilters.name}" ×
                  </Button>
                )}
                {activeFilters.category_id && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => onFiltersChange({ ...activeFilters, category_id: '' })}
                  >
                    {categories.find(c => c.id.toString() === activeFilters.category_id)?.name} ×
                  </Button>
                )}
                {activeFilters.brand && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => onFiltersChange({ ...activeFilters, brand: '' })}
                  >
                    {activeFilters.brand} ×
                  </Button>
                )}
                {(activeFilters.min_price || activeFilters.max_price) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      onFiltersChange({ ...activeFilters, min_price: '', max_price: '' });
                    }}
                  >
                    ${activeFilters.min_price || '0'} - ${activeFilters.max_price || '∞'} ×
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  {t('clearAll')}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

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
