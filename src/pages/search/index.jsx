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

  // Get initial search query from URL
  const initialQuery = searchParams.get('q') || '';

  return (
    <TopNavLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('back')}
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t('searchProducts')}</h1>
            {initialQuery && (
              <p className="text-muted-foreground">
                {t('searchResultsFor')} "{initialQuery}"
              </p>
            )}
          </div>
        </div>

        {/* Product Catalog */}
        <ProductCatalog
          filters={{ name: initialQuery }}
        />
      </div>
    </TopNavLayout>
  );
}
