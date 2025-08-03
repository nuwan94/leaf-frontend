import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { LangSelector } from '@/components/lang-selector';
import { DarkModeSwitcher } from '@/components/dark-mode-switcher';
import Logo from '@/assets/logo.png';
import { ShoppingCart, Home, Menu, ChevronDown, ChevronRight, Search, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
	{
		label: 'Fruits',
		children: [
			{
				label: 'Citrus',
				children: [
					{ label: 'Orange' },
					{ label: 'Lemon' },
					{ label: 'Lime' }
				]
			},
			{
				label: 'Berries',
				children: [
					{ label: 'Strawberry' },
					{ label: 'Blueberry' },
					{ label: 'Raspberry' }
				]
			}
		]
	},
	{
		label: 'Vegetables',
		children: [
			{
				label: 'Leafy',
				children: [
					{ label: 'Spinach' },
					{ label: 'Lettuce' }
				]
			},
			{
				label: 'Root',
				children: [
					{ label: 'Carrot' },
					{ label: 'Potato' }
				]
			}
		]
	}
];

function CategoryMenu({ items, level = 0 }) {
	const [openIndex, setOpenIndex] = useState(null);
	return (
		<ul className={cn('min-w-[160px] bg-popover rounded shadow', level > 0 && 'absolute left-full top-0 z-50')}>
			{items.map((item, idx) => (
				<li key={item.label} className="relative group">
					<Button
						variant="ghost"
						className="w-full flex justify-between items-center px-3 py-2 text-left"
						onMouseEnter={() => setOpenIndex(idx)}
						onMouseLeave={() => setOpenIndex(null)}
						tabIndex={0}
					>
						{item.label}
						{item.children && (level === 0 ? <ChevronDown className="h-4 w-4 ml-2" /> : <ChevronRight className="h-4 w-4 ml-2" />)}
					</Button>
					{item.children && openIndex === idx && (
						<div className="absolute left-full top-0 z-50" onMouseEnter={() => setOpenIndex(idx)} onMouseLeave={() => setOpenIndex(null)}>
							<CategoryMenu items={item.children} level={level + 1} />
						</div>
					)}
				</li>
			))}
		</ul>
	);
}

const TopNavLayout = ({ children }) => {
	const [catMenuOpen, setCatMenuOpen] = useState(false);
	const [alertOpen, setAlertOpen] = useState(false);
	const [alertConfig, setAlertConfig] = useState({ title: '', description: '', action: '' });
	const navigate = useNavigate();

	// Check if user is logged in
	const user = JSON.parse(localStorage.getItem('user') || 'null');
	const isLoggedIn = !!user;

	const handleLogout = () => {
		localStorage.removeItem('user');
		navigate('/login');
	};

	const handleProtectedAction = (actionName) => {
		if (!isLoggedIn) {
			setAlertConfig({
				title: 'Login Required',
				description: `Please login to ${actionName}. You'll be redirected to the login page.`,
				action: 'Go to Login'
			});
			setAlertOpen(true);
			return;
		}
		// Handle the action for logged-in users
		console.log(`${actionName} action for logged-in user`);
	};

	const handleAlertAction = () => {
		setAlertOpen(false);
		navigate('/login');
	};

	return (
		<div className="min-h-screen flex flex-col">
			<nav className="sticky top-0 z-50 w-full bg-background border-b flex items-center px-4 py-2 gap-2 flex-shrink-0">
				<img src={Logo} alt="Logo" className="h-10 w-10 mr-2" />
				<Button variant="ghost" className="flex items-center gap-1 px-2" onClick={() => navigate('/')}>
					<Home className="h-5 w-5" /> Home
				</Button>
				<div className="relative" onMouseEnter={() => setCatMenuOpen(true)} onMouseLeave={() => setCatMenuOpen(false)}>
					<Button variant="ghost" className="flex items-center gap-1 px-2">
						<Menu className="h-5 w-5" /> Categories <ChevronDown className="h-4 w-4 ml-1" />
					</Button>
					{catMenuOpen && (
						<div className="absolute left-0 top-full z-50 mt-1">
							<CategoryMenu items={categories} />
						</div>
					)}
				</div>
				<div className="flex-1 flex justify-center">
					<div className="relative w-full max-w-md">
						<Input type="text" placeholder="Search products..." className="pl-10 pr-4" />
						<Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					</div>
				</div>
				<Button
					variant="ghost"
					className="relative px-2"
					onClick={() => handleProtectedAction('view cart')}
				>
					<ShoppingCart className="h-5 w-5" />
				</Button>

				{/* Conditional rendering based on login status */}
				{isLoggedIn ? (
					<div className="flex items-center gap-2">
						<Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => navigate('/profile')}>
							<User className="h-4 w-4" />
							Profile
						</Button>
						<Button
							size="sm"
							onClick={handleLogout}
							className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white"
						>
							<LogOut className="h-4 w-4" />
							Logout
						</Button>
					</div>
				) : (
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" onClick={() => navigate('/login')}>
							Login
						</Button>
						<Button size="sm" onClick={() => navigate('/login')}>
							Sign Up
						</Button>
					</div>
				)}

				<LangSelector />
				<DarkModeSwitcher />
			</nav>

			{/* Alert Dialog */}
			<AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
						<AlertDialogDescription>
							{alertConfig.description}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleAlertAction}>
							{alertConfig.action}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<main className="flex-1 overflow-auto">
				{children}
			</main>
		</div>
	);
};

export default TopNavLayout;
