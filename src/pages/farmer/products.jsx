import { useEffect, useState } from 'react';
import SidebarLayout from '@/components/layouts/SidebarLayout.jsx';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle, Trash2, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { farmerService } from '@/lib/services';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const categories = [
	{ id: 1, name: 'Vegetables' },
	{ id: 2, name: 'Fruits' },
	{ id: 3, name: 'Grains' },
	{ id: 4, name: 'Other' },
];

const productSchema = z.object({
	name: z.string().min(2, 'Product name is required'),
	price: z.string().min(1, 'Price is required'),
	category_id: z.string().min(1, 'Category is required'),
	status: z.enum(['active', 'inactive']).default('active'),
});

const FarmerProducts = () => {
	const [products, setProducts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showAddModal, setShowAddModal] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [deletingId, setDeletingId] = useState(null);
	const [inventoryState, setInventoryState] = useState({});
	const [savingInventoryId, setSavingInventoryId] = useState(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
		watch,
		setValue,
	} = useForm({
		resolver: zodResolver(productSchema),
		defaultValues: {
			name: '',
			price: '',
			category_id: '',
			status: 'active',
		},
	});

	const fetchProducts = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await farmerService.getProducts();
			if (response.success && Array.isArray(response.data)) {
				setProducts(response.data);
			} else {
				setError(response.message || 'Failed to load products');
			}
		} catch (err) {
			setError(err.message || 'Failed to load products');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchProducts();
	}, []);

	const onAddProduct = async (data) => {
		setIsSubmitting(true);
		try {
			const productData = {
				...data,
				price: parseFloat(data.price),
				category_id: parseInt(data.category_id),
			};
			const response = await farmerService.addProduct(productData);
			if (response.success) {
				toast.success('Product added successfully!');
				setShowAddModal(false);
				reset();
				fetchProducts();
			} else {
				toast.error(response.message || 'Failed to add product');
			}
		} catch (err) {
			toast.error(err.message || 'Failed to add product');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteProduct = async (productId) => {
		setDeletingId(productId);
		try {
			const response = await farmerService.deleteProduct(productId);
			if (response.success) {
				toast.success('Product deleted successfully!');
				fetchProducts();
			} else {
				toast.error(response.message || 'Failed to delete product');
			}
		} catch (err) {
			toast.error(err.message || 'Failed to delete product');
		} finally {
			setDeletingId(null);
		}
	};

	const handleInventoryChange = (productId, field, value) => {
		setInventoryState((prev) => ({
			...prev,
			[productId]: {
				...prev[productId],
				[field]: value,
			},
		}));
	};

	const handleInventoryAdjust = (productId, field, delta) => {
		const current = inventoryState[productId]?.[field] ?? products.find((p) => p.id === productId)[field];
		const newValue = Math.max(0, parseInt(current || 0) + delta);
		handleInventoryChange(productId, field, newValue);
	};

	const handleSaveInventory = async (productId) => {
		setSavingInventoryId(productId);
		const product = products.find((p) => p.id === productId);
		const state = inventoryState[productId] || {};
		const quantity_available = state.quantity_available !== undefined ? parseInt(state.quantity_available) : product.quantity_available;
		const price = state.price !== undefined ? parseFloat(state.price) : product.price;
		try {
			// Update price using the correct API
			await farmerService.updateProduct(productId, { price });
			// Update quantity using inventory API
			await farmerService.updateInventory(productId, { quantity_available });
			toast.success('Product updated!');
			fetchProducts();
		} catch (err) {
			toast.error(err.message || 'Failed to update product');
		} finally {
			setSavingInventoryId(null);
		}
	};

	const handleStatusChange = async (productId, is_active) => {
		setSavingInventoryId(productId);
		try {
			await farmerService.updateProduct(productId, { is_active });
			setInventoryState(prev => ({
				...prev,
				[productId]: {
					...prev[productId],
					is_active,
				},
			}));
			fetchProducts();
		} catch (err) {
			toast.error(err.message || 'Failed to update status');
		} finally {
			setSavingInventoryId(null);
		}
	};

	return (
		<SidebarLayout role="farmer" title="My Products" subtitle="Manage and view your farm products">
			<div className="">

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{/* Add Product Card */}
					<div
						className="relative p-4 flex flex-col gap-2 items-center justify-center border-2 border-dashed border-primary rounded-lg min-h-[220px] cursor-pointer hover:bg-primary/5 transition"
						style={{ minHeight: '220px' }}
						onClick={() => setShowAddModal(true)}
					>
						<PlusCircle className="h-8 w-8 text-primary mb-2" />
						<h2 className="text-lg font-semibold text-primary mb-1">Add New Product</h2>
						<div className="text-sm text-primary/80 mb-1 text-center">Click to add a new product to your catalog</div>
					</div>
					{/* Existing product cards */}
					{products.map((product) => (
						<Card key={product.id} className="relative p-4 flex flex-col gap-2">
							{/* Status Switch top right */}
							<div className="absolute top-4 right-4 flex items-center gap-2">
								<Switch
									checked={inventoryState[product.id]?.is_active !== undefined
										? inventoryState[product.id]?.is_active === 1
										: product.is_active === 1}
									onCheckedChange={checked => handleStatusChange(product.id, checked ? 1 : 0)}
									id={`status-switch-${product.id}`}
								/>
							</div>
							<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{product.name}</h2>
							{/* Price and Quantity in grid */}
							<div className="grid grid-cols-2 gap-4 mb-4">
								<div className="flex flex-col gap-1">
									<Label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Price (Rs.)</Label>
									<Input
										type="number"
										className="w-full px-2 py-1 text-center"
										value={inventoryState[product.id]?.price ?? product.price}
										onChange={e => handleInventoryChange(product.id, 'price', e.target.value)}
										min={0}
										step="0.01"
									/>
								</div>
								<div className="flex flex-col gap-1">
									<Label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Qty</Label>
									<Input
										type="number"
										className="w-full px-2 py-1 text-center"
										value={inventoryState[product.id]?.quantity_available ?? product.quantity_available}
										onChange={e => handleInventoryChange(product.id, 'quantity_available', e.target.value)}
										min={0}
									/>
								</div>
							</div>
							{/* Save and Delete buttons at bottom */}
							<div className="mt-auto pt-2 flex justify-end gap-2">
								<Button
									size="sm"
									className="w-fit bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 px-3 py-1"
									disabled={savingInventoryId === product.id}
									onClick={() => handleSaveInventory(product.id)}
								>
									{savingInventoryId === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />} Save
								</Button>
								<Button
									size="sm"
									className="w-fit bg-red-600 hover:bg-red-700 text-white flex items-center gap-1 px-3 py-1"
									disabled={deletingId === product.id}
									onClick={() => handleDeleteProduct(product.id)}
								>
									{deletingId === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />} Delete
								</Button>
							</div>
						</Card>
					))}
				</div>
			</div>

			{/* Add Product Modal */}
			<Dialog open={showAddModal} onOpenChange={setShowAddModal}>
				<DialogContent>
					<DialogHeader>
						<h2 className="text-lg font-semibold">Add New Product</h2>
					</DialogHeader>
					<form onSubmit={handleSubmit(onAddProduct)} className="space-y-4 mt-4">
						<div className="flex flex-col gap-2">
							<Label htmlFor="name" className="mb-1">Product Name *</Label>
							<Input id="name" {...register('name')} placeholder="e.g. Tomatoes" autoComplete="off" />
							{errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="category_id" className="mb-1">Category *</Label>
							<Select value={watch('category_id')} onValueChange={value => setValue('category_id', value)}>
								<SelectTrigger id="category_id" className="w-full">
									<SelectValue placeholder="Select category" />
								</SelectTrigger>
								<SelectContent>
									{categories.map(cat => (
										<SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.category_id && <p className="text-xs text-red-500 mt-1">{errors.category_id.message}</p>}
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="price" className="mb-1">Price (Rs.) *</Label>
							<Input id="price" type="number" step="0.01" {...register('price')} placeholder="e.g. 120.00" autoComplete="off" />
							{errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="status" className="mb-1">Status *</Label>
							<Select value={watch('status')} onValueChange={value => setValue('status', value)}>
								<SelectTrigger id="status" className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="inactive">Inactive</SelectItem>
								</SelectContent>
							</Select>
							{errors.status && <p className="text-xs text-red-500 mt-1">{errors.status.message}</p>}
						</div>
						<DialogFooter>
							<Button type="button" variant="ghost" onClick={() => setShowAddModal(false)} className="mr-2">Cancel</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Product'}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</SidebarLayout>
	);
};

export default FarmerProducts;
