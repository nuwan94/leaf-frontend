import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ProductCard } from '@/components/ProductCard';
import { productService } from '@/lib/services';
import { Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProductCatalog({ className, initialFilters = {}, ...props }) {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  // Filter state - merge with initial filters
  const [filters, setFilters] = useState({
    name: '',
    category_id: '',
    brand: '',
    min_price: '',
    max_price: '',
    limit: 16,
    sort_by: 'name',
    sort_order: 'asc',
    ...initialFilters // Apply initial filters from props
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Fetch products with current filters and pagination
  const fetchProducts = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        ...filters,
        page,
        // Only include non-empty filter values
        ...Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value !== '')
        )
      };

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
        setTotalPages(response.total_pages || Math.ceil((response.total || response.data?.length || 0) / filters.limit) || 1);
        setTotalProducts(response.total || response.data?.length || 0);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Fetch categories and brands on component mount
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          productService.getCategories(),
          productService.getBrands()
        ]);

        // Handle the actual API response structure for categories
        const categoriesData = categoriesRes.data || [];
        const mappedCategories = categoriesData.map(cat => ({
          id: cat.category_id,
          name: cat.category_name
        }));
        setCategories(mappedCategories);

        // Handle brands API - it returns array of strings
        const brandsData = brandsRes.data || [];
        setBrands(brandsData);
      } catch (err) {
        console.error('Error fetching filter data:', err);
        setCategories([]);
        setBrands([]);
      }
    };

    fetchFilterData();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchProducts(page);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      name: '',
      category_id: '',
      brand: '',
      min_price: '',
      max_price: '',
      limit: 16,
      sort_by: 'name',
      sort_order: 'asc'
    });
    setCurrentPage(1);
  };

  return (
    <div className={cn("space-y-4", className)} {...props}>
      {/* Compact Header with Filters */}
      <div className="space-y-3">
        {/* Single Row: All Filters Inline */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Left Side: All Filter Controls in One Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Filter */}
            <Select
              value={filters.category_id || undefined}
              onValueChange={(value) => handleFilterChange('category_id', value === 'all_categories' ? '' : value)}
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
              value={filters.brand || undefined}
              onValueChange={(value) => handleFilterChange('brand', value === 'all_brands' ? '' : value)}
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
              value={filters.min_price}
              onChange={(e) => handleFilterChange('min_price', e.target.value)}
              className="h-9 w-24 text-sm"
            />

            {/* Max Price */}
            <Input
              type="number"
              placeholder={t('maxPrice')}
              value={filters.max_price}
              onChange={(e) => handleFilterChange('max_price', e.target.value)}
              className="h-9 w-24 text-sm"
            />

            {/* Sort Options */}
            <Select
              value={`${filters.sort_by}_${filters.sort_order}`}
              onValueChange={(value) => {
                const [sort_by, sort_order] = value.split('_');
                setFilters(prev => ({ ...prev, sort_by, sort_order }));
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
                start: (currentPage - 1) * filters.limit + 1,
                end: Math.min(currentPage * filters.limit, totalProducts),
                total: totalProducts
              })}
            </span>

            {/* Items per page */}
            <Select
              value={filters.limit.toString()}
              onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
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
        {(filters.category_id || filters.brand || filters.min_price || filters.max_price || filters.name) && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t('activeFilters')}:</span>
            <div className="flex flex-wrap gap-1">
              {filters.name && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleFilterChange('name', '')}
                >
                  "{filters.name}" ×
                </Button>
              )}
              {filters.category_id && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleFilterChange('category_id', '')}
                >
                  {categories.find(c => c.id.toString() === filters.category_id)?.name} ×
                </Button>
              )}
              {filters.brand && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleFilterChange('brand', '')}
                >
                  {filters.brand} ×
                </Button>
              )}
              {(filters.min_price || filters.max_price) && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => {
                    handleFilterChange('min_price', '');
                    handleFilterChange('max_price', '');
                  }}
                >
                  ${filters.min_price || '0'} - ${filters.max_price || '∞'} ×
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
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3"
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
