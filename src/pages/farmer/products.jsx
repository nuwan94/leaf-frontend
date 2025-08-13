import { useEffect, useState } from 'react';
import SidebarLayout from '@/components/layouts/SidebarLayout.jsx';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle, Trash2, CheckCircle2, Camera } from 'lucide-react';
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
	const [showAddModal, setShowAddModal] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [deletingId, setDeletingId] = useState(null);
	const [inventoryState, setInventoryState] = useState({});
	const [savingInventoryId, setSavingInventoryId] = useState(null);
	const [selectedImage, setSelectedImage] = useState(null);
	const [productImages, setProductImages] = useState({}); // Track image changes per product

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
			image: null,
		},
	});

	const fetchProducts = async () => {
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

	// Ensure the image field is correctly appended to FormData
	// Add logging to debug FormData content
	const onAddProduct = async (data) => {
		setIsSubmitting(true);
		try {
			console.log('Form data:', data);
			console.log('Selected image:', selectedImage);

			const formData = new FormData();
			formData.append('name', data.name);
			formData.append('price', parseFloat(data.price));
			formData.append('category_id', parseInt(data.category_id));
			formData.append('status', data.status);

			// Use the selectedImage state instead of data.image
			if (selectedImage) {
				formData.append('image', selectedImage);
			}

			// Log FormData content for debugging
			for (let [key, value] of formData.entries()) {
				console.log(key, value);
			}

			const response = await farmerService.addProduct(formData);

			if (response.success) {
				toast.success('Product added successfully!');
				setShowAddModal(false);
				reset();
				setSelectedImage(null); // Reset image state
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

	// Add function to handle image change
	const handleImageChange = (productId, file) => {
		setProductImages((prev) => ({
			...prev,
			[productId]: file,
		}));
	};

	const handleSaveInventory = async (productId) => {
		setSavingInventoryId(productId);
		const product = products.find((p) => p.id === productId);
		const state = inventoryState[productId] || {};
		const imageFile = productImages[productId];

		const name = state.name !== undefined ? state.name : product.name;
		const quantity_available = state.quantity_available !== undefined ? parseInt(state.quantity_available) : product.quantity_available;
		const price = state.price !== undefined ? parseFloat(state.price) : product.price;

		try {
			// Check if we have image changes
			if (imageFile) {
				// Use FormData for image updates with other changes
				const formData = new FormData();
				formData.append('name', name);
				formData.append('price', price);
				formData.append('image', imageFile);

				// Update product with image and name
				await farmerService.updateProduct(productId, formData);

				// Update inventory separately
				await farmerService.updateInventory(productId, { quantity_available });

				// Clear the image from state after successful upload
				setProductImages((prev) => {
					const newState = { ...prev };
					delete newState[productId];
					return newState;
				});
			} else {
				// Handle regular inventory, price, and name updates without image
				await farmerService.updateProduct(productId, { name, price });
				await farmerService.updateInventory(productId, { quantity_available });
			}

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
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
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
							{/* Product Image with FAB */}
							{product.image_url && (
								<div className="relative w-full h-32 mb-2 rounded-md overflow-hidden group">
									<img
										src={`${import.meta.env.VITE_IMAGE_HOST_BASE_URL || 'http://localhost:8000'}${product.image_url}`}
										alt={product.name}
										className="w-full h-full object-cover"
										onError={(e) => {
											e.target.style.display = 'none';
										}}
									/>
									{/* Image Change FAB overlay, top left */}
									<div className="absolute top-2 left-2 z-10 flex items-center">
										<label
											htmlFor={`image-upload-${product.id}`}
											className="pointer-events-auto opacity-90 hover:opacity-100 transition-opacity duration-200 cursor-pointer bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-xl border-2 border-gray-300 flex items-center justify-center"
											style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}
										>
											<Camera className="h-6 w-6 text-primary drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
										</label>
										<input
											id={`image-upload-${product.id}`}
											type="file"
											accept="image/png,image/jpeg,image/jpg"
											className="hidden"
											onChange={(e) => {
												const file = e.target.files[0];
												if (file) {
													handleImageChange(product.id, file);
												}
											}}
										/>
									</div>
								</div>
							)}

							{/* Product Name Editable */}
							<div className="mb-2">
								<Label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Product Name</Label>
								<Input
									type="text"
									className="w-full px-2 py-1 text-center"
									value={inventoryState[product.id]?.name ?? product.name}
									onChange={e => handleInventoryChange(product.id, 'name', e.target.value)}
								/>
							</div>

							{/* Category badge */}
							{product.category && (
								<div className="mb-2">
									<span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
										{product.category.name || 'Unknown Category'}
									</span>
								</div>
							)}

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
							{/* Status Switch below price */}
							<div className="mb-2 flex items-center gap-2">
								<Switch
									checked={inventoryState[product.id]?.is_active !== undefined
										? inventoryState[product.id]?.is_active === 1
										: product.is_active === 1}
									onCheckedChange={checked => handleStatusChange(product.id, checked ? 1 : 0)}
									id={`status-switch-${product.id}`}
								/>
								<span className="text-xs text-gray-600 dark:text-gray-300">{inventoryState[product.id]?.is_active === 1 || product.is_active === 1 ? 'Active' : 'Inactive'}</span>
							</div>
							{/* Save and Delete buttons at bottom */}
							<div className="mt-auto pt-2 flex justify-end gap-2">
								<Button
									size="sm"
									className={`w-fit flex items-center gap-1 px-3 py-1 ${
										productImages[product.id] 
											? 'bg-blue-600 hover:bg-blue-700' 
											: 'bg-green-600 hover:bg-green-700'
									} text-white`}
									disabled={savingInventoryId === product.id}
									onClick={() => handleSaveInventory(product.id)}
								>
									{savingInventoryId === product.id ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<CheckCircle2 className="h-4 w-4 mr-1" />
									)}
									{productImages[product.id] ? 'Save & Upload' : 'Save'}
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
						<div className="flex flex-col gap-2">
							<Label htmlFor="image" className="mb-1">Product Image</Label>
							<Input
								id="image"
								type="file"
								accept="image/png,image/jpeg,image/jpg"
								onChange={(e) => {
									const file = e.target.files[0];
									setSelectedImage(file);
									console.log('Image selected:', file);
								}}
							/>
							{selectedImage && (
								<p className="text-xs text-green-600 mt-1">
									Selected: {selectedImage.name}
								</p>
							)}
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
