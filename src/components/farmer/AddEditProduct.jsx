import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { farmerService, productService } from '@/lib/services';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

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
	price: z.string().min(1, 'Price is required'),
	category_id: z.string().min(1, 'Category is required'),
	unit: z.string().min(1, 'Unit is required'),
	status: z.enum(['active', 'inactive']).default('active'),
	is_seasonal_deal: z.boolean().default(false),
	is_flash_deal: z.boolean().default(false),
	discounted_price: z.string().refine(
		(val, ctx) => {
			// Defensive: ctx and ctx.parent may be undefined in some react-hook-form/zod versions
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

function ProductForm({ open, onOpenChange, onProductAdded, product, dialogWidth = 'max-w-4xl' }) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedImage, setSelectedImage] = useState(null);
	const [errors, setErrors] = useState({});
	const [categories, setCategories] = useState([]);

	// Set up default values for add/edit
	const defaultValues = product
		? {
				name: product.name || '',
				price: product.price ? String(product.price) : '',
				category_id: product.category_id ? String(product.category_id) : '',
				unit: product.unit || '',
				status: product.status || 'active',
				image: null,
				is_seasonal_deal: !!product.is_seasonal_deal,
				is_flash_deal: !!product.is_flash_deal,
				discounted_price: product.discounted_price ? String(product.discounted_price) : '',
		  }
		: {
				name: '',
				price: '',
				category_id: '',
				unit: '',
				status: 'active',
				image: null,
				is_seasonal_deal: false,
				is_flash_deal: false,
				discounted_price: '',
		  };

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
	}, [product, reset]);

	useEffect(() => {
		async function fetchCategories() {
			try {
				const response = await productService.getCategories();
				if (response.success && Array.isArray(response.data)) {
					setCategories(response.data);
				}
			} catch (err) {
				// Optionally handle error
			}
		}
		fetchCategories();
	}, []);

	const onSubmit = async (data) => {
		setIsSubmitting(true);
		setErrors({});
		try {
			const formData = new FormData();
			formData.append('name', data.name);
			formData.append('price', parseFloat(data.price));
			formData.append('category_id', parseInt(data.category_id));
			formData.append('unit', data.unit);
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
				response = await farmerService.updateProduct(product.product_id, formData);
			} else {
				// Add mode
				response = await farmerService.addProduct(formData);
			}
			if (response.success) {
				toast.success(product ? 'Product updated successfully!' : 'Product added successfully!');
				reset();
				setSelectedImage(null);
				onOpenChange(false);
				if (onProductAdded) onProductAdded();
			} else {
				setErrors(response.errors || {});
				toast.error(response.message || (product ? 'Failed to update product' : 'Failed to add product'));
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
				<Dialog open={open} onOpenChange={onOpenChange}>
					<DialogContent className={dialogWidth}>
				<DialogHeader>
					{product && product.image_url ? (
						<div className="w-full h-64 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden rounded-t-lg mb-2">
							<img
								src={`${import.meta.env.VITE_IMAGE_HOST_BASE_URL || 'http://localhost:8000'}${product.image_url}`}
								alt={product.name}
								className="w-full h-full object-cover"
							/>
						</div>
					) : null}
					<h2 className="text-lg font-semibold">{product ? 'Edit Product' : 'Add New Product'}</h2>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="flex flex-col gap-2">
							<Label htmlFor="name" className="mb-1">
								Product Name *
							</Label>
							<Input
								id="name"
								{...register('name')}
								autoComplete="off"
							/>
							{(formErrors.name || errors?.name) && (
								<p className="text-xs text-red-500 mt-1">
									{formErrors.name?.message || errors?.name}
								</p>
							)}
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="category_id" className="mb-1">
								Category *
							</Label>
							<Select
								value={watch('category_id')}
								onValueChange={(value) => setValue('category_id', value)}
							>
								<SelectTrigger id="category_id" className="w-full">
									<SelectValue placeholder="Select category" />
								</SelectTrigger>
								<SelectContent>
									{categories.map((cat) => (
										<SelectItem key={cat.category_id} value={String(cat.category_id)}>
											{cat.category_name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{(formErrors.category_id || errors?.category_id) && (
								<p className="text-xs text-red-500 mt-1">
									{formErrors.category_id?.message || errors?.category_id}
								</p>
							)}
						</div>
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
							{formErrors.unit && <p className="text-xs text-red-500 mt-1">{formErrors.unit?.message}</p>}
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="price" className="mb-1">
								Price (Rs.) *
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
						<div className="flex flex-col gap-2">
							<Label className="mb-1">Product Status & Deals</Label>
							<div className="flex flex-row items-center gap-6">
								<Controller
									name="status"
									control={control}
									render={({ field }) => (
										<div className="flex items-center gap-2">
											<Switch
												id="is_active"
												checked={field.value === 'active'}
												onCheckedChange={checked => field.onChange(checked ? 'active' : 'inactive')}
											/>
											<span className="text-xs">Active</span>
										</div>
									)}
								/>
								<Controller
									name="is_seasonal_deal"
									control={control}
									render={({ field }) => (
										<div className="flex items-center gap-2">
											<Switch
												id="is_seasonal_deal"
												checked={field.value}
												onCheckedChange={handleSeasonalDealChange}
											/>
											<span className="text-xs">Seasonal</span>
										</div>
									)}
								/>
								<Controller
									name="is_flash_deal"
									control={control}
									render={({ field }) => (
										<div className="flex items-center gap-2">
											<Switch
												id="is_flash_deal"
												checked={field.value}
												onCheckedChange={handleFlashDealChange}
											/>
											<span className="text-xs">Flash</span>
										</div>
									)}
								/>
							</div>
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="image" className="mb-1">
								Product Image
							</Label>
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
					<DialogFooter>
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
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export default ProductForm;
