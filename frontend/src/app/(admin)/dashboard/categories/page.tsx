'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Tag,
    Plus,
    ChevronRight,
    Folder,
    ExternalLink,
    Edit,
    Trash2,
    Search,
    ChevronDown,
    Layers,
    Save,
    X,
    FolderPlus,
    AlertCircle,
    Package,
    Upload,
    FileText
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import StatusModal from '@/components/ui/StatusModal';

export default function CategoriesPage() {
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [deletingCategory, setDeletingCategory] = useState<any>(null);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState('');
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const postSaveAction = useRef<'close' | 'reset' | 'child'>('close');

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [parent, setParent] = useState('');
    const [image, setImage] = useState('');

    // Status Modal State
    const [statusModal, setStatusModal] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });

    const { data: treeData, isLoading } = useQuery({
        queryKey: ['categoryTree'],
        queryFn: async () => {
            const { data } = await api.get('/categories/tree');
            return data.data.tree || [];
        }
    });

    const { data: flatCategoriesData } = useQuery({
        queryKey: ['adminCategoriesFlat'],
        queryFn: async () => {
            const { data } = await api.get('/categories', { params: { active: true } });
            return data.data.categories || [];
        }
    });
    const flatCategories = flatCategoriesData || [];

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/categories', data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['categoryTree'] });
            queryClient.invalidateQueries({ queryKey: ['adminCategoriesFlat'] });

            const action = postSaveAction.current;
            // Handle Axios response structure: response.data.data.category
            const responseBody = data.data;
            const newCategory = responseBody?.data?.category || responseBody?.category || responseBody;

            if (action === 'child' && newCategory?._id) {
                // Set parent to new category and clear fields
                setParent(newCategory._id);
                setName('');
                setDescription('');
                setImage('');
                setStatusModal({
                    isOpen: true,
                    type: 'success',
                    title: 'Category Created',
                    message: `Created "${newCategory.name}". Now adding a subcategory.`
                });
            } else if (action === 'reset') {
                // Keep parent, clear fields
                setName('');
                setDescription('');
                setImage('');
                setStatusModal({
                    isOpen: true,
                    type: 'success',
                    title: 'Category Created',
                    message: 'Category created. Ready to add another sibling.'
                });
            } else {
                // Default: close
                setIsAdding(false);
                resetForm();
                setStatusModal({
                    isOpen: true,
                    type: 'success',
                    title: 'Category Created',
                    message: 'The category has been successfully created.'
                });
            }
        },
        onError: (error: any) => {
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Creation Failed',
                message: error.response?.data?.message || 'Failed to create category.'
            });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/categories/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categoryTree'] });
            queryClient.invalidateQueries({ queryKey: ['adminCategoriesFlat'] });
            resetForm();
            setStatusModal({
                isOpen: true,
                type: 'success',
                title: 'Category Updated',
                message: 'The category has been successfully updated.'
            });
        },
        onError: (error: any) => {
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Update Failed',
                message: error.response?.data?.message || 'Failed to update category.'
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/categories/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categoryTree'] });
            queryClient.invalidateQueries({ queryKey: ['adminCategoriesFlat'] });
            setDeletingCategory(null);
            setStatusModal({
                isOpen: true,
                type: 'success',
                title: 'Category Deleted',
                message: 'The category has been successfully deleted.'
            });
        },
        onError: (error: any) => {
            setDeletingCategory(null);
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Deletion Failed',
                message: error.response?.data?.message || 'Failed to delete category. It may have products or subcategories.'
            });
        }
    });

    const bulkImportMutation = useMutation({
        mutationFn: async (lines: string[]) => {
            const results = [];
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

            // Local map to resolve parents by name, including newly created ones
            const nameToIdMap = new Map((flatCategories as any[]).map((c: any) => [c.name.toLowerCase(), c._id]));

            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;

                const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                const categoryData: any = {};

                headers.forEach((header, index) => {
                    if (values[index]) {
                        if (header === 'parent') {
                            categoryData.parent = nameToIdMap.get(values[index].toLowerCase()) || null;
                        } else {
                            categoryData[header] = values[index];
                        }
                    }
                });

                if (categoryData.name) {
                    try {
                        const response = await api.post('/categories', categoryData);
                        const newCategory = response.data?.data?.category || response.data?.category || response.data;

                        if (newCategory?._id) {
                            nameToIdMap.set(newCategory.name.toLowerCase(), newCategory._id);
                        }

                        results.push({ success: true, name: categoryData.name });
                    } catch (error: any) {
                        results.push({
                            success: false,
                            name: categoryData.name,
                            error: error.response?.data?.message || error.message
                        });
                    }
                }
            }
            return results;
        },
        onSuccess: (results) => {
            queryClient.invalidateQueries({ queryKey: ['categoryTree'] });
            queryClient.invalidateQueries({ queryKey: ['adminCategoriesFlat'] });
            const successCount = results.filter(r => r.success).length;
            const failCount = results.filter(r => !r.success).length;
            setShowBulkImport(false);
            setCsvFile(null);
            setStatusModal({
                isOpen: true,
                type: failCount === 0 ? 'success' : 'error',
                title: 'Bulk Import Complete',
                message: `Successfully imported ${successCount} categories.${failCount > 0 ? ` Failed: ${failCount}` : ''}`
            });
        },
        onError: (error: any) => {
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Import Failed',
                message: error.message || 'Failed to import categories.'
            });
        }
    });

    const resetForm = () => {
        setIsAdding(false);
        setEditingCategory(null);
        setName('');
        setDescription('');
        setParent('');
        setImage('');
    };

    const handleEdit = (category: any) => {
        setEditingCategory(category);
        setName(category.name);
        setDescription(category.description || '');
        setParent(category.parent?._id || category.parent || '');
        setImage(category.image || '');
        setIsAdding(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = { name, description, parent: parent || null, image };

        if (editingCategory) {
            updateMutation.mutate({ id: editingCategory._id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = () => {
        if (deletingCategory) {
            deleteMutation.mutate(deletingCategory._id);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCsvFile(e.target.files[0]);
        }
    };

    const handleBulkImport = async () => {
        if (!csvFile) return;

        const text = await csvFile.text();
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Invalid CSV',
                message: 'CSV file must have a header row and at least one data row.'
            });
            return;
        }

        bulkImportMutation.mutate(lines);
    };

    // Filter categories based on search
    const filteredTree = useMemo(() => {
        if (!search.trim()) return treeData || [];

        const searchLower = search.toLowerCase();
        const filterCategories = (categories: any[]): any[] => {
            return categories.reduce((acc: any[], category: any) => {
                const matches = category.name.toLowerCase().includes(searchLower) ||
                    category.slug.toLowerCase().includes(searchLower);
                const filteredChildren = category.children ? filterCategories(category.children) : [];

                if (matches || filteredChildren.length > 0) {
                    acc.push({
                        ...category,
                        children: filteredChildren
                    });
                }
                return acc;
            }, []);
        };

        return filterCategories(treeData || []);
    }, [treeData, search]);

    const toggleExpand = (categoryId: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(categoryId)) {
                next.delete(categoryId);
            } else {
                next.add(categoryId);
            }
            return next;
        });
    };

    const renderCategoryItem = (category: any, depth = 0) => {
        const hasChildren = category.children && category.children.length > 0;
        const isExpanded = expandedCategories.has(category._id);

        return (
            <div key={category._id} className="animate-in fade-in duration-300">
                <div
                    className={`flex items-center justify-between p-4 group hover:bg-white/5 border-b border-white/5 transition-colors ${depth > 0 ? 'ml-8 border-l border-white/10' : ''}`}
                >
                    <div className="flex items-center gap-4">
                        {hasChildren && (
                            <button
                                onClick={() => toggleExpand(category._id)}
                                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-blue-500" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-slate-500" />
                                )}
                            </button>
                        )}
                        {!hasChildren && <div className="w-6" />}
                        <div className={`p-2 rounded-xl border border-white/10 ${depth === 0 ? 'bg-blue-500/10 text-blue-500' : (depth === 1 ? 'bg-purple-500/10 text-purple-500' : 'bg-slate-500/10 text-slate-500')}`}>
                            <Folder className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-white uppercase tracking-tight">{category.name}</h4>
                                {category.productCount !== undefined && category.productCount > 0 && (
                                    <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full text-[8px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1">
                                        <Package className="w-2.5 h-2.5" />
                                        {category.productCount}
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-500 font-mono">Slug: {category.slug} • {category.children?.length || 0} Subcategories</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {category.level < 3 && (
                            <button
                                onClick={() => {
                                    setParent(category._id);
                                    setName('');
                                    setDescription('');
                                    setImage('');
                                    setEditingCategory(null);
                                    setIsAdding(true);
                                }}
                                className="p-2 text-slate-400 hover:text-green-500 transition-colors"
                                title="Add Subcategory"
                            >
                                <FolderPlus className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={() => handleEdit(category)}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                            title="Edit Category"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setDeletingCategory(category)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            title="Delete Category"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <Link href={`/categories/${category.slug}`} className="p-2 text-slate-400 hover:text-blue-400 transition-colors" title="View on Site">
                            <ExternalLink className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
                {hasChildren && isExpanded && (
                    <div className="animate-in slide-in-from-top-2 duration-200">
                        {category.children.map((child: any) => renderCategoryItem(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-8 mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                        <Layers className="w-6 h-6 text-blue-500" />
                        Category Management
                    </h1>
                    <p className="text-slate-400">Organize your products into logical, hierarchical groups</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowBulkImport(true)}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all active:scale-95"
                    >
                        <Upload className="w-5 h-5" />
                        Bulk Import
                    </button>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                    >
                        <FolderPlus className="w-5 h-5" />
                        New Category
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List View */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-blue-500" />
                                    Category Hierarchy
                                </h3>
                                <div className="text-[10px] text-slate-500 font-bold uppercase">
                                    3 Levels Supported
                                </div>
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                <input
                                    type="text"
                                    placeholder="Search categories..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all italic font-medium"
                                />
                            </div>
                        </div>

                        <div className="divide-y divide-white/5">
                            {isLoading ? (
                                <div className="p-12 text-center text-slate-500 italic">
                                    Organizing category tree...
                                </div>
                            ) : filteredTree.length === 0 ? (
                                <div className="p-12 text-center text-slate-500 italic">
                                    {search ? 'No categories match your search.' : 'No categories found. Start by creating one.'}
                                </div>
                            ) : filteredTree.map((category: any) => renderCategoryItem(category))}
                        </div>
                    </div>
                </div>

                {/* Info / Tips Sidebar */}
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Management Tips</h4>
                        </div>
                        <ul className="space-y-4 text-xs text-slate-400 leading-relaxed">
                            <li className="flex gap-3">
                                <span className="text-blue-500 font-bold">•</span>
                                Categories can be nested up to 3 levels deep for better navigation.
                            </li>
                            <li className="flex gap-3">
                                <span className="text-blue-500 font-bold">•</span>
                                Slugs are automatically generated from the category name for SEO.
                            </li>
                            <li className="flex gap-3">
                                <span className="text-blue-500 font-bold">•</span>
                                Product counts show how many items are in each category.
                            </li>
                            <li className="flex gap-3">
                                <span className="text-blue-500 font-bold">•</span>
                                Deleting a category with products or subcategories will fail for safety.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Add/Edit Category Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-xl p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-white">
                                {editingCategory ? 'Update Category' : 'Create New Category'}
                            </h2>
                            <button onClick={resetForm} className="text-slate-500 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Category Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-blue-500"
                                        placeholder="Mobile Phones"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Parent Category</label>
                                    <div className="relative">
                                        <select
                                            value={parent}
                                            onChange={(e) => setParent(e.target.value)}
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-white focus:border-blue-500 appearance-none"
                                        >
                                            <option value="">None (Top Level)</option>
                                            {flatCategories
                                                .filter((c: any) => c.level < 3 && c._id !== editingCategory?._id)
                                                .map((cat: any) => (
                                                    <option key={cat._id} value={cat._id}>
                                                        {cat.level === 1 ? '📱 ' : cat.level === 2 ? '  └─ ' : ''}{cat.fullName || cat.name}
                                                    </option>
                                                ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Description</label>
                                <textarea
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white text-sm"
                                    placeholder="Summary of this category..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Thumbnail URL</label>
                                <input
                                    type="text"
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-0 min-h-[52px] rounded-xl font-bold text-slate-400 bg-white/5 hover:bg-white/10 transition-all uppercase tracking-widest text-xs flex items-center justify-center whitespace-nowrap"
                                >
                                    Cancel
                                </button>

                                {!editingCategory && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                postSaveAction.current = 'reset';
                                                handleSubmit(e);
                                            }}
                                            disabled={createMutation.isPending || !name}
                                            className="px-4 py-0 min-h-[52px] rounded-xl font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-all text-xs flex items-center gap-2 whitespace-nowrap"
                                            title="Save & Add Another (Sibling)"
                                        >
                                            <FolderPlus className="w-4 h-4" />
                                            + Sibling
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                postSaveAction.current = 'child';
                                                handleSubmit(e);
                                            }}
                                            disabled={createMutation.isPending || !name || flatCategories.find((c: any) => c._id === parent)?.level >= 2}
                                            className="px-4 py-0 min-h-[52px] rounded-xl font-bold text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 transition-all text-xs flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                            title={flatCategories.find((c: any) => c._id === parent)?.level >= 2 ? "Max depth reached" : "Save & Add Child (Subcategory)"}
                                        >
                                            <FolderPlus className="w-4 h-4" />
                                            + Child
                                        </button>
                                    </>
                                )}

                                <button
                                    type="submit"
                                    onClick={() => { postSaveAction.current = 'close'; }}
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="flex-1 py-0 min-h-[52px] rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
                                >
                                    {(createMutation.isPending || updateMutation.isPending) ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {editingCategory ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-red-500/20 rounded-3xl w-full max-w-md p-8 shadow-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Delete Category?</h2>
                                <p className="text-sm text-slate-400">This action cannot be undone</p>
                            </div>
                        </div>

                        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-sm text-white font-medium mb-1">{deletingCategory.name}</p>
                            <p className="text-xs text-slate-500">
                                {deletingCategory.children?.length > 0 && `${deletingCategory.children.length} subcategories • `}
                                {deletingCategory.productCount > 0 && `${deletingCategory.productCount} products`}
                            </p>
                        </div>

                        {(deletingCategory.children?.length > 0 || deletingCategory.productCount > 0) && (
                            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                <p className="text-xs text-amber-500 font-medium">
                                    ⚠️ This category has {deletingCategory.children?.length > 0 ? 'subcategories' : 'products'}.
                                    Deletion may fail or require reassignment.
                                </p>
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setDeletingCategory(null)}
                                className="flex-1 py-4 rounded-xl font-bold text-slate-400 bg-white/5 hover:bg-white/10 transition-all uppercase tracking-widest text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending}
                                className="flex-1 py-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-500 transition-all shadow-lg shadow-red-600/20 uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {deleteMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                                Delete Category
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Import Modal */}
            {showBulkImport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-xl p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Upload className="w-6 h-6 text-purple-500" />
                                Bulk Import Categories
                            </h2>
                            <button onClick={() => { setShowBulkImport(false); setCsvFile(null); }} className="text-slate-500 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                                <p className="text-sm text-purple-400 font-medium mb-2">CSV Format Required:</p>
                                <code className="block bg-slate-950 p-3 rounded-lg text-xs font-mono text-slate-300">
                                    name,parent,description,image<br />
                                    "Cases & Covers","Huawei","Protective cases","..."
                                </code>
                            </div>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${csvFile ? 'border-purple-500 bg-purple-500/5' : 'border-white/10 hover:border-purple-500/50 hover:bg-white/5'}`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".csv"
                                    className="hidden"
                                />
                                {csvFile ? (
                                    <div className="text-center">
                                        <FileText className="w-10 h-10 text-purple-500 mx-auto mb-2" />
                                        <p className="text-white font-bold">{csvFile.name}</p>
                                        <p className="text-slate-500 text-xs mt-1">{(csvFile.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Upload className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                                        <p className="text-white font-bold">Click to Upload CSV</p>
                                        <p className="text-slate-500 text-xs mt-1">or drag and drop file here</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <button
                                    onClick={() => { setShowBulkImport(false); setCsvFile(null); }}
                                    className="flex-1 py-4 rounded-xl font-bold text-slate-400 bg-white/5 hover:bg-white/10 transition-all uppercase tracking-widest text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBulkImport}
                                    disabled={!csvFile || bulkImportMutation.isPending}
                                    className="flex-1 py-4 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20 uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {bulkImportMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Upload className="w-4 h-4" />
                                    )}
                                    Import Categories
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Modal */}
            <StatusModal
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
            />
        </div>
    );
}

function Loader2({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 2v4" /><path d="m16.2 4.2 2.8 2.8" /><path d="M18 12h4" /><path d="m16.2 19.8 2.8-2.8" /><path d="M12 18v4" /><path d="m4.2 19.8 2.8-2.8" /><path d="M2 12h4" /><path d="m4.2 4.2 2.8 2.8" />
        </svg>
    )
}
