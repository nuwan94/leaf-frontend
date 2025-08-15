// Category images from customer index.jsx
import vegetablesImg from '@/assets/vegetables.png';
import fruitsImg from '@/assets/fruits.png';
import grainsImg from '@/assets/grains.png';
import dairyImg from '@/assets/dairy.png';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { LangSelector } from '@/components/lang-selector';
import { DarkModeSwitcher } from '@/components/dark-mode-switcher';
import { CartIcon } from '@/components/cart/CartIcon';
import { useAuth } from '@/lib/hooks/useAuth';
import productService from '@/lib/services/productService';
import { useTranslation } from 'react-i18next';
import Logo from '@/assets/logo.png';
import { Menu, Search, LogOut, User, ArrowRight, ChevronRight, Home } from 'lucide-react';
// CategoryPopoverMenu: fetches categories and renders popover with submenus if needed
function CategoryPopoverMenu({ navigate, t }) {
  // Map category names (lowercase) to imported images
  const categoryImageMap = {
    vegetables: vegetablesImg,
    fruits: fruitsImg,
    grains: grainsImg,
    dairy: dairyImg,
  };
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    productService.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          {t('categories') || 'Categories'}
        </Button>
      </PopoverTrigger>
  <PopoverContent side="bottom" align="start" className="p-0 min-w-[900px] max-w-[1200px] rounded-t-none shadow-2xl border-t-0 mt-2">
        <div
          className="flex flex-row gap-4 pt-0 pb-3 px-3 divide-x divide-border"
        >
          {categories.map((cat, idx) => {
            // Try to match category name to image
            const key = cat.category_name?.toLowerCase();
            const customImg = categoryImageMap[key];
            return (
              <div key={cat.category_id} className={cn("flex-1 w-full px-3 py-2", idx === 0 ? "pl-0" : "")}> 
                <div
                  className="font-semibold text-base mb-2 cursor-pointer hover:text-primary transition-colors flex items-center gap-2"
                  onClick={() => navigate(`/search?category=${cat.category_id}`)}
                  tabIndex={0}
                  role="button"
                >
                  <span className="flex items-center gap-2 flex-1 min-w-0">
                    {customImg ? (
                      <img
                        src={customImg}
                        alt={cat.category_name}
                        className="w-14 h-14 object-contain rounded bg-muted border flex-shrink-0"
                      />
                    ) : cat.image_url ? (
                      <img
                        src={`${import.meta.env.VITE_IMAGE_HOST_BASE_URL || 'http://localhost:8000'}${cat.image_url}`}
                        alt={cat.category_name}
                        className="w-14 h-14 object-cover rounded bg-muted border flex-shrink-0"
                      />
                    ) : (
                      <span className="w-14 h-14 rounded bg-muted border flex items-center justify-center text-muted-foreground text-xl flex-shrink-0">🏷️</span>
                    )}
                    <span className="truncate">{cat.category_name}</span>
                  </span>
                  <span className="flex items-center justify-center ml-2 flex-shrink-0">
                    <ChevronRight className="h-5 w-5" />
                  </span>
                </div>
                {Array.isArray(cat.children) && cat.children.length > 0 && (
                  <ul className="space-y-1">
                    {cat.children.map(sub => (
                      <li key={sub.category_id}>
                        <button
                          className="text-left w-full px-0 py-1 text-sm hover:text-primary hover:underline focus:outline-none flex items-center justify-between gap-2"
                          onClick={() => navigate(`/search?category=${sub.category_id}`)}
                        >
                          <span>{sub.category_name}</span>
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
import { cn } from '@/lib/utils';
import { debounce } from 'lodash';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';


// Multilevel Popover Submenu helpers
function PopoverSubMenu({ label, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative group"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-accent/30 text-left text-base font-medium"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        tabIndex={0}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span>{label}</span>
        <ChevronRight className="h-4 w-4 ml-2" />
      </button>
      {/* Submenu: remove pointer-events-none from wrapper, only pointer-events-auto on panel */}
      <div className={open ? "absolute inset-y-0 left-full flex" : "hidden"} style={{ minWidth: 0 }}>
        <div
          className="pointer-events-auto min-w-[180px] bg-background border border-border rounded-md shadow-lg z-50"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <div className="flex flex-col py-2">{children}</div>
        </div>
      </div>
    </div>
  );
}

function PopoverSubMenuItem({ children, onClick }) {
  return (
    <button
      className="w-full text-left px-4 py-2 hover:bg-accent/40 text-base"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
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
		navigate('/');
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
      <nav className="sticky top-0 z-50 border-b bg-background shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Category Menu */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center gap-2 p-2"
              >
                <img src={Logo} alt="Leaf" className="h-8 w-8" />
                <span className="font-bold text-xl hidden sm:inline">LEAF</span>
              </Button>

              {/* Category Popover Menu (dynamic) */}
              <CategoryPopoverMenu navigate={navigate} t={t} />
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
                                src={`${import.meta.env.VITE_IMAGE_HOST_BASE_URL || 'http://localhost:8000'}${product.image_url}`}
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

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/customer/orders')}
                    className="hidden sm:flex items-center gap-2"
                  >
                    <span className="h-4 w-4 inline-block">📦</span>
                    {t('orderHistory') || 'Order History'}
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
                          <AlertDialogAction variant='destructive' onClick={logout}>{t('logout')}</AlertDialogAction>
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
                      navigate('/customer/orders');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <span className="h-4 w-4 mr-2 inline-block">📦</span>
                    {t('orderHistory') || 'Order History'}
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
