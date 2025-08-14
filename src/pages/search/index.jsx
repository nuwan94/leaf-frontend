import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ProductCatalog } from '@/components/ProductCatalog';
import { ArrowLeft } from 'lucide-react';
import TopNavLayout from '@/components/layouts/TopNavLayout';

export default function SearchPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get initial search query and filters from URL
  const initialFilters = {
    name: searchParams.get('q') || '',
    category_id: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    brand: searchParams.get('brand') || '',
    farmer_id: searchParams.get('farmer_id') || '',
    page: searchParams.get('page') || 1,
    limit: searchParams.get('limit') || 16,
  };

  return (
    <TopNavLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('back')}
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t('searchProducts')}</h1>
            {initialFilters.name && (
              <p className="text-muted-foreground">
                {t('searchResultsFor')} "{initialFilters.name}"
              </p>
            )}
          </div>
        </div>

        {/* Product Catalog */}
        <ProductCatalog
          filters={initialFilters}
        />
      </div>
    </TopNavLayout>
  );
}
