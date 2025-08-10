import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { LangSelector } from '@/components/lang-selector';
import { DarkModeSwitcher } from '@/components/dark-mode-switcher';
import { CartIcon } from '@/components/cart/CartIcon';
import { useAuth } from '@/lib/hooks/useAuth';
import { productService } from '@/lib/services';
import { useTranslation } from 'react-i18next';
import Logo from '@/assets/logo.png';
import { Home, Menu, Search, LogOut, User, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { debounce } from 'lodash';
import { useCallback, useEffect } from 'react';

export default function TopNavLayout({ children, className }) {
	const navigate = useNavigate();
	const { user, logout } = useAuth();
	const { t } = useTranslation();
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState([]);
	const [isSearchLoading, setIsSearchLoading] = useState(false);
	const [showSearchDropdown, setShowSearchDropdown] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	// Debounced search function
	const debouncedSearch = useCallback(
		debounce(async (query) => {
			if (!query.trim()) {
				setSearchResults([]);
				setShowSearchDropdown(false);
				return;
			}

			setIsSearchLoading(true);
			try {
				const response = await productService.getProducts({
					name: query,
					limit: 5 // Only show 5 results in dropdown
				});
				const products = response.data || [];
				setSearchResults(products);
				setShowSearchDropdown(products.length > 0);
			} catch (error) {
				console.error('Search error:', error);
				setSearchResults([]);
				setShowSearchDropdown(false);
			} finally {
				setIsSearchLoading(false);
			}
		}, 300),
		[]
	);

	// Cleanup debounced function
	useEffect(() => {
		return () => {
			debouncedSearch.cancel();
		};
	}, [debouncedSearch]);

	const handleSearchChange = (e) => {
		const value = e.target.value;
		setSearchQuery(value);
		debouncedSearch(value);
	};

	const handleSearchSubmit = (e) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
			setSearchQuery('');
			setShowSearchDropdown(false);
		}
	};

	const handleProductSelect = (productId) => {
		navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
		setSearchQuery('');
		setShowSearchDropdown(false);
	};

	const handleViewAllResults = () => {
		if (searchQuery.trim()) {
			navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
			setSearchQuery('');
			setShowSearchDropdown(false);
		}
	};

	const handleLogout = async () => {
		await logout();
		navigate('/login');
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (!event.target.closest('.search-container')) {
				setShowSearchDropdown(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Home */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center gap-2 p-2"
              >
                <img src={Logo} alt="Leaf" className="h-8 w-8" />
                <span className="font-bold text-xl hidden sm:inline">LEAF</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="hidden md:flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </div>

            {/* Global Search with Dropdown */}
            <div className="flex-1 max-w-md mx-4 relative search-container">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('searchProducts')}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10 pr-4"
                    onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                  />
                </div>
              </form>

              {/* Search Results Dropdown */}
              {showSearchDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
                  {isSearchLoading ? (
                    <div className="p-4 text-center text-muted-foreground">{t('searching')}...</div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleProductSelect(product.id)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-accent text-left transition-colors"
                        >
                          <div className="w-10 h-10 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <Search className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{product.name}</div>
                            <div className="text-xs text-muted-foreground">
                              ${parseFloat(product.price).toFixed(2)}
                              {product.brand && ` • ${product.brand}`}
                            </div>
                          </div>
                        </button>
                      ))}

                      {/* View All Results */}
                      <button
                        onClick={handleViewAllResults}
                        className="w-full flex items-center justify-center gap-2 p-3 border-t border-border hover:bg-accent text-primary transition-colors"
                      >
                        <span className="text-sm font-medium">{t('viewAllResults')}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      {t('noProductsFound')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Cart */}
              {user && <CartIcon />}

              {/* User Menu */}
              {user ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/profile')}
                    className="hidden sm:flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    {user.first_name || 'Profile'}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">{t('logout')}</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('logoutConfirmation')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('logoutRedirect')}</AlertDialogDescription>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={logout}>{t('logout')}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogHeader>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : (
                <Button onClick={() => navigate('/login')} size="sm">
                  Login
                </Button>
              )}

              {/* Settings */}
              <div className="flex items-center gap-1">
                <LangSelector />
                <DarkModeSwitcher />
              </div>

              {/* Mobile Menu */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t py-4 space-y-2">
              <Button
                variant="ghost"
                onClick={() => {
                  navigate('/');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full justify-start"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>

              {user && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate('/profile');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
