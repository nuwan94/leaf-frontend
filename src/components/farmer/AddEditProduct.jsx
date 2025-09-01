import { Button } from '@/components/ui/button';
import { Drawer, DrawerBody, DrawerFooter, DrawerHeader } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LocalizedFieldGroup from '@/components/ui/LocalizedFieldGroup';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { farmerService, productService } from '@/lib/services';
import { useUser } from '@/lib/UserContext.js';
import { zodResolver } from '@hookform/resolvers/zod';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronRight, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

const unitOptions = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'l', label: 'Liter (l)' },
  { value: 'ml', label: 'Milliliter (ml)' },
  { value: 'lb', label: 'Pound (lb)' },
  { value: 'packets', label: 'Packets' },
  { value: 'pieces', label: 'Pieces' },
];

const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  localized_names: z
    .object({
      en: z
        .string()
        .nullable()
        .transform((val) => val ?? ''),
      si: z
        .string()
        .nullable()
        .transform((val) => val ?? ''),
      ta: z
        .string()
        .nullable()
        .transform((val) => val ?? ''),
    })
    .optional(),
  price: z.string().min(1, 'Price is required'),
  category_id: z.string().min(1, 'Category is required'),
  unit: z.string().min(1, 'Unit is required'),
  amount_per_unit: z
    .string()
    .min(1, 'Amount per unit is required')
    .refine((val) => parseFloat(val) > 0, {
      message: 'Amount per unit must be greater than 0',
    }),
  status: z.enum(['active', 'inactive']).default('active'),
  is_seasonal_deal: z.boolean().default(false),
  is_flash_deal: z.boolean().default(false),
  discounted_price: z.string().refine(
    (val, ctx) => {
      const parent = ctx?.parent || {};
      const isSeasonal = parent.is_seasonal_deal;
      const isFlash = parent.is_flash_deal;
      if (isSeasonal || isFlash) {
        return val && parseFloat(val) > 0;
      }
      return true;
    },
    {
      message: 'Discounted price is required and must be greater than 0 when deal is selected',
    }
  ),
});

// Multi-level category dropdown using Radix DropdownMenu
function CategoryDropdown({ categories, value, onChange, error }) {
  // Find selected label for display
  function findCategoryName(categories, id) {
    for (const cat of categories) {
      if (String(cat.category_id) === String(id)) return cat.category_name;
      if (cat.children) {
        const found = findCategoryName(cat.children, id);
        if (found) return found;
      }
    }
    return '';
  }

  // Recursive rendering for menu
  function renderMenu(items) {
    return items.map((cat) => {
      const hasChildren = cat.children && Array.isArray(cat.children) && cat.children.length > 0;
      if (hasChildren) {
        return (
          <DropdownMenu.Sub key={cat.category_id}>
            <DropdownMenu.SubTrigger className="flex items-center justify-between w-full px-2 py-1 cursor-pointer hover:bg-accent rounded">
              <span>{cat.category_name}</span>
              <ChevronRight className="w-4 h-4 ml-2" />
            </DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent className="ml-2 bg-popover border rounded shadow-md min-w-[180px]">
              {renderMenu(cat.children)}
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        );
      } else {
        return (
          <DropdownMenu.Item
            key={cat.category_id}
            onSelect={() => onChange(String(cat.category_id))}
            className={
              'px-2 py-1 cursor-pointer hover:bg-accent rounded ' +
              (String(value) === String(cat.category_id) ? 'bg-accent text-accent-foreground' : '')
            }
          >
            {cat.category_name}
          </DropdownMenu.Item>
        );
      }
    });
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={
            'w-full border rounded px-3 py-2 text-left bg-background ' +
            (error ? 'border-red-500' : 'border-input')
          }
        >
          {value ? findCategoryName(categories, value) : 'Select category'}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="bg-popover border rounded shadow-md min-w-[220px] p-1">
        {renderMenu(categories)}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

function ProductForm({ open, onOpenChange, onProductAdded, product, drawerSide = 'right' }) {
  const { user } = useUser();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);

  // Set up default values for add/edit
  const defaultValues = React.useMemo(
    () =>
      product
        ? {
            localized_names: product.name_json
              ? JSON.parse(product.name_json)
              : { en: product.name || '', si: '', ta: '' },
            localized_descriptions: product.description_json
              ? JSON.parse(product.description_json)
              : { en: product.description || '', si: '', ta: '' },
            price: product.price ? String(product.price) : '',
            category_id: product.category_id ? String(product.category_id) : '',
            unit: product.unit || '',
            amount_per_unit: product.amount_per_unit ? String(product.amount_per_unit) : '1',
            status: product.status || (product.is_active ? 'active' : 'inactive'),
            image: null,
            is_seasonal_deal: !!product.is_seasonal_deal,
            is_flash_deal: !!product.is_flash_deal,
            discounted_price: product.discounted_price ? String(product.discounted_price) : '',
          }
        : {
            localized_names: { en: '', si: '', ta: '' },
            localized_descriptions: { en: '', si: '', ta: '' },
            price: '',
            category_id: '',
            unit: '',
            amount_per_unit: '1',
            status: 'active',
            image: null,
            is_seasonal_deal: false,
            is_flash_deal: false,
            discounted_price: '',
          },
    [product]
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors: formErrors },
    watch,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open && !product) {
      reset({
        name: '',
        price: '',
        category_id: '',
        unit: '',
        status: 'active',
        image: null,
        is_seasonal_deal: false,
        is_flash_deal: false,
        discounted_price: '',
      });
    }
  }, [open, product, reset]);

  useEffect(() => {
    if (product) {
      // Reset form with product data when editing
      reset(defaultValues);
    }
  }, [product, reset, defaultValues]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const categories = await productService.getCategories();
        if (Array.isArray(categories)) {
          setCategories(categories);
          // After categories are loaded, set category_id if editing
          if (product && product.category_id) {
            setValue('category_id', String(product.category_id));
          }
        }
      } catch {
        // Optionally handle error
      }
    }
    fetchCategories();
  }, [product, setValue]);

  const onSubmit = async (data) => {
    console.log('Submitting product form', { data, product });
    setIsSubmitting(true);
    setErrors({});
    try {
      // Only check for changes in edit mode
      if (product && product.product_id) {
        // Compare all relevant fields using name_json/description_json if present
        const origNames = product.name_json
          ? JSON.parse(product.name_json)
          : { en: product.name || '', si: '', ta: '' };
        const origDescs = product.description_json
          ? JSON.parse(product.description_json)
          : { en: product.description || '', si: '', ta: '' };
        const changed =
          JSON.stringify(data.localized_names) !== JSON.stringify(origNames) ||
          JSON.stringify(data.localized_descriptions) !== JSON.stringify(origDescs) ||
          data.price !== String(product.price ?? '') ||
          data.category_id !== String(product.category_id ?? '') ||
          data.unit !== (product.unit || '') ||
          data.amount_per_unit !== String(product.amount_per_unit ?? '1') ||
          data.status !== (product.status || (product.is_active ? 'active' : 'inactive')) ||
          data.is_seasonal_deal !== !!product.is_seasonal_deal ||
          data.is_flash_deal !== !!product.is_flash_deal ||
          data.discounted_price !== String(product.discounted_price ?? '') ||
          !!selectedImage;
        if (!changed) {
          toast.info('No changes to save.');
          setIsSubmitting(false);
          onOpenChange(false);
          return;
        }
      }
      const formData = new FormData();
      formData.append('localized_names', JSON.stringify(data.localized_names));
      formData.append('localized_descriptions', JSON.stringify(data.localized_descriptions));
      formData.append('price', parseFloat(data.price));
      formData.append('category_id', parseInt(data.category_id));
      formData.append('unit', data.unit);
      formData.append('amount_per_unit', parseFloat(data.amount_per_unit));
      formData.append('status', data.status);
      formData.append('is_seasonal_deal', data.is_seasonal_deal ? 1 : 0);
      formData.append('is_flash_deal', data.is_flash_deal ? 1 : 0);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      if ((data.is_seasonal_deal || data.is_flash_deal) && data.discounted_price) {
        formData.append('discounted_price', parseFloat(data.discounted_price));
      }
      let response;
      if (product && product.product_id) {
        // Edit mode
        response = await farmerService.updateProduct(product.product_id, formData, user?.id);
      } else {
        // Add mode
        response = await farmerService.addProduct(formData, user?.id);
      }
      if (response.success) {
        toast.success(product ? 'Product updated successfully!' : 'Product added successfully!');
        reset();
        setSelectedImage(null);
        onOpenChange(false);
        if (onProductAdded) onProductAdded();
      } else {
        setErrors(response.errors || {});
        toast.error(
          response.message || (product ? 'Failed to update product' : 'Failed to add product')
        );
      }
    } catch (err) {
      toast.error(err.message || (product ? 'Failed to update product' : 'Failed to add product'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only one deal can be checked at a time
  const handleSeasonalDealChange = (checked) => {
    setValue('is_seasonal_deal', checked);
    if (checked) setValue('is_flash_deal', false);
  };
  const handleFlashDealChange = (checked) => {
    setValue('is_flash_deal', checked);
    if (checked) setValue('is_seasonal_deal', false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} side={drawerSide}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
        <DrawerHeader>
          <h2 className="text-lg font-semibold">{product ? 'Edit Product' : t('addNewProduct')}</h2>
        </DrawerHeader>
        <DrawerBody>
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex flex-col gap-8 w-full flex-1 min-h-0">
              {/* Image and upload */}
              <div className="flex flex-col items-center md:items-start">
                {/* Active switch card above image */}
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <div className="border rounded-lg p-4 flex items-center gap-4 min-w-[180px] bg-white dark:bg-gray-950 shadow-sm mb-4 w-full">
                      <Switch
                        id="is_active"
                        checked={field.value === 'active'}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? 'active' : 'inactive')
                        }
                      />
                      <div>
                        <div className="font-medium">Active</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Product is visible and available for sale
                        </div>
                      </div>
                    </div>
                  )}
                />
                <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden rounded-lg mb-3 min-h-[120px] max-h-[220px] border-2 border-gray-300 dark:border-gray-700">
                  {selectedImage || (product && product.image_url) ? (
                    <img
                      src={
                        selectedImage
                          ? URL.createObjectURL(selectedImage)
                          : `${import.meta.env.VITE_IMAGE_HOST_BASE_URL || 'http://localhost:8000'}${product.image_url}`
                      }
                      alt={product?.name || 'Product'}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `${import.meta.env.VITE_IMAGE_HOST_BASE_URL || 'http://localhost:8000'}/uploads/products/default.jpg`;
                      }}
                    />
                  ) : (
                    <img
                      src={`${import.meta.env.VITE_IMAGE_HOST_BASE_URL || 'http://localhost:8000'}/uploads/products/default.jpg`}
                      alt="No Image"
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                <Input
                  id="image"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setSelectedImage(file);
                  }}
                />
                {selectedImage && (
                  <p className="text-xs text-green-600 mt-1">Selected: {selectedImage.name}</p>
                )}
              </div>
              {/* Form fields, single column layout */}
              <div className="flex flex-col gap-6 pr-2">
                <section className="rounded-lg bg-blue-50 dark:bg-blue-900 p-6 mb-2 border">
                  <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">
                    Basic Info
                  </h3>
                  <div className="flex flex-col gap-6">
                    <LocalizedFieldGroup
                      label={t('productName')}
                      name="localized_names"
                      register={register}
                      errors={formErrors.localized_names || {}}
                      required={true}
                      placeholders={{
                        en: 'English name',
                        si: 'සිංහල නම',
                        ta: 'தமிழ் பெயர்',
                      }}
                    />
                    <LocalizedFieldGroup
                      label={t('productDescription')}
                      name="localized_descriptions"
                      register={register}
                      errors={formErrors.localized_descriptions || {}}
                      required={false}
                      textarea={true}
                      placeholders={{
                        en: 'English description',
                        si: 'සිංහල විස්තරය',
                        ta: 'தமிழ் விளக்கம்',
                      }}
                    />
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="category_id" className="mb-1">
                        Category *
                      </Label>
                      <CategoryDropdown
                        categories={categories}
                        value={watch('category_id')}
                        onChange={(value) =>
                          setValue('category_id', value, { shouldDirty: true, shouldTouch: true })
                        }
                        error={formErrors.category_id || errors?.category_id}
                      />
                      {(formErrors.category_id || errors?.category_id) && (
                        <p className="text-xs text-red-500 mt-1">
                          {formErrors.category_id?.message || errors?.category_id}
                        </p>
                      )}
                    </div>
                  </div>
                </section>
                <section className="rounded-lg bg-green-50 dark:bg-green-900 p-6 mb-2 border">
                  <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">
                    Unit & Pricing
                  </h3>
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="unit" className="mb-1">
                        Unit *
                      </Label>
                      <Select
                        value={watch('unit')}
                        onValueChange={(value) => setValue('unit', value)}
                      >
                        <SelectTrigger id="unit" className="w-full">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {unitOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.unit && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.unit?.message}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="amount_per_unit" className="mb-1">
                        Amount per unit *
                      </Label>
                      <Input
                        id="amount_per_unit"
                        type="number"
                        step="0.01"
                        min="0.01"
                        {...register('amount_per_unit')}
                        placeholder="e.g. 1, 100, 6"
                        autoComplete="off"
                      />
                      {formErrors.amount_per_unit && (
                        <p className="text-xs text-red-500 mt-1">
                          {formErrors.amount_per_unit?.message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="price" className="mb-1">
                        {t('price')} ({t('Rs')}.) *
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        {...register('price')}
                        placeholder="e.g. 120.00"
                        autoComplete="off"
                      />
                      {(formErrors.price || errors?.price) && (
                        <p className="text-xs text-red-500 mt-1">
                          {formErrors.price?.message || errors?.price}
                        </p>
                      )}
                    </div>
                  </div>
                </section>
                <section className="rounded-lg bg-yellow-50 dark:bg-yellow-900 p-6 mb-2 border">
                  <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">
                    Deals & Status
                  </h3>
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <Label className="mb-1">Product Status & Deals</Label>
                      <div className="flex flex-row flex-wrap gap-4">
                        {/* Active switch moved above image, not shown here */}
                        <Controller
                          name="is_seasonal_deal"
                          control={control}
                          render={({ field }) => (
                            <div className="border rounded-lg p-4 flex items-center gap-4 min-w-[180px] bg-white dark:bg-gray-950 shadow-sm">
                              <Switch
                                id="is_seasonal_deal"
                                checked={field.value}
                                onCheckedChange={handleSeasonalDealChange}
                              />
                              <div>
                                <div className="font-medium">Seasonal Deal</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Highlight as a seasonal offer
                                </div>
                              </div>
                            </div>
                          )}
                        />
                        <Controller
                          name="is_flash_deal"
                          control={control}
                          render={({ field }) => (
                            <div className="border rounded-lg p-4 flex items-center gap-4 min-w-[180px] bg-white dark:bg-gray-950 shadow-sm">
                              <Switch
                                id="is_flash_deal"
                                checked={field.value}
                                onCheckedChange={handleFlashDealChange}
                              />
                              <div>
                                <div className="font-medium">Flash Deal</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Limited time flash sale
                                </div>
                              </div>
                            </div>
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="discounted_price" className="mb-1">
                        Discounted Price *
                      </Label>
                      <Input
                        id="discounted_price"
                        type="number"
                        step="0.01"
                        min="0"
                        {...register('discounted_price')}
                        placeholder="e.g. 120.00"
                        autoComplete="off"
                        disabled={!(watch('is_seasonal_deal') || watch('is_flash_deal'))}
                      />
                      {(formErrors.discounted_price || errors?.discounted_price) && (
                        <p className="text-xs text-red-500 mt-1">
                          {formErrors.discounted_price?.message || errors?.discounted_price}
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </DrawerBody>
        <DrawerFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : product ? (
              'Update Product'
            ) : (
              'Add Product'
            )}
          </Button>
        </DrawerFooter>
      </form>
    </Drawer>
  );
}

export default ProductForm;
