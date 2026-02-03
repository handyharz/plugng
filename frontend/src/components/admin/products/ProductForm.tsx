'use client';

import { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Image as ImageIcon,
    Save,
    X,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    Wand,
    Calendar
} from 'lucide-react';
import { AdminProduct } from '@/types/admin';
import { categoryApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import ImageUpload from '../ImageUpload';

interface ProductFormProps {
    initialData?: AdminProduct;
    onSubmit: (data: any) => void;
    isLoading?: boolean;
}

export default function ProductForm({ initialData, onSubmit, isLoading }: ProductFormProps) {
    const [formData, setFormData] = useState<any>({
        name: '',
        slug: '',
        description: '',
        status: 'draft',
        category: '',
        categoryLevel1: '',
        categoryLevel2: '',
        categoryLevel3: '',
        subCategory: '', // Legacy support
        featured: false,
        lowStockThreshold: 10,
        images: [{ url: '', key: 'manual', isPrimary: true, alt: '' }],
        options: [], // { name: 'Color', values: [{ value: 'Red', swatchUrl: '' }] }
        variants: [
            {
                sku: '',
                attributeValues: {},
                costPrice: 0,
                sellingPrice: 0,
                compareAtPrice: 0,
                stock: 0,
                image: ''
            }
        ],
        specifications: [], // { key: 'Material', value: 'Cotton' }
        compatibility: { brands: [], models: [] },
        metaTitle: '',
        metaDescription: '',
        walletOnlyDiscount: { enabled: false, percentage: 0 }
    });

    const [newSpec, setNewSpec] = useState({ key: '', value: '' });
    const [newBio, setNewBio] = useState({ brand: '', model: '' });

    const { data: categories } = useQuery({
        queryKey: ['categories', { active: true }], // Include param in key for caching
        queryFn: () => categoryApi.getAll({ active: true })
    });

    // Derived state for dependent dropdowns
    const level1Categories = categories?.filter((c: any) => c.level === 1 || !c.parent) || [];
    const level2Categories = categories?.filter((c: any) =>
        (c.parent?._id === formData.categoryLevel1) ||
        (c.parent === formData.categoryLevel1)
    ) || [];
    const level3Categories = categories?.filter((c: any) =>
        (c.parent?._id === formData.categoryLevel2) ||
        (c.parent === formData.categoryLevel2)
    ) || [];

    useEffect(() => {
        if (initialData) {
            const initialCategory = typeof initialData.category === 'object' ? initialData.category._id : initialData.category;

            // Normalize variants attributes to object if it's a Map (from backend)
            let variants = initialData.variants || [];
            if (variants.length > 0 && variants[0].attributeValues instanceof Map) {
                variants = variants.map((v: any) => ({
                    ...v,
                    attributeValues: Object.fromEntries(v.attributeValues)
                }));
            }

            setFormData((prev: any) => ({
                ...prev,
                ...initialData,
                category: initialCategory,
                variants: variants
            }));

            // Restore hierarchy
            if (categories && initialCategory) {
                const savedCat = categories.find((c: any) => c._id === initialCategory);
                if (savedCat) {
                    if (savedCat.level === 1) {
                        setFormData((prev: any) => ({ ...prev, categoryLevel1: savedCat._id }));
                    } else if (savedCat.level === 2) {
                        const parent = savedCat.parent;
                        const parentId = typeof parent === 'object' ? (parent as any)?._id : parent;
                        setFormData((prev: any) => ({ ...prev, categoryLevel1: parentId, categoryLevel2: savedCat._id }));
                    } else if (savedCat.level === 3) {
                        const parent = savedCat.parent;
                        const parentId = typeof parent === 'object' ? (parent as any)?._id : parent;

                        // Find grandparent
                        const parentObj = categories.find((c: any) => c._id === parentId);
                        const grandParent = parentObj?.parent;
                        const grandParentId = typeof grandParent === 'object' ? (grandParent as any)?._id : grandParent;

                        setFormData((prev: any) => ({
                            ...prev,
                            categoryLevel1: grandParentId,
                            categoryLevel2: parentId,
                            categoryLevel3: savedCat._id
                        }));
                    }
                }
            }
        }
    }, [initialData, categories]);

    const handleCategoryChange = (level: number, value: string) => {
        setFormData((prev: any) => {
            const newData = { ...prev };
            if (level === 1) {
                newData.categoryLevel1 = value;
                newData.categoryLevel2 = '';
                newData.categoryLevel3 = '';
                newData.category = value;
            } else if (level === 2) {
                newData.categoryLevel2 = value;
                newData.categoryLevel3 = '';
                newData.category = value;
            } else if (level === 3) {
                newData.categoryLevel3 = value;
                newData.category = value;
            }
            return newData;
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        setFormData((prev: any) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as any).checked : value
        }));
    };

    // --- Images ---
    const addImage = () => {
        if (formData.images.length >= 10) return;
        setFormData((prev: any) => ({
            ...prev,
            images: [...prev.images, { url: '', key: 'manual', isPrimary: false, alt: '' }]
        }));
    };

    const removeImage = (index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            images: prev.images.filter((_: any, i: number) => i !== index)
        }));
    };

    const updateImage = (index: number, field: string, value: any) => {
        const newImages = [...formData.images];
        newImages[index] = { ...newImages[index], [field]: value };
        setFormData({ ...formData, images: newImages });
    };

    // --- Options (Attributes) ---
    const addOption = () => {
        setFormData((prev: any) => ({
            ...prev,
            options: [...(prev.options || []), { name: '', values: [] }]
        }));
    };

    const updateOptionName = (idx: number, name: string) => {
        const newOpts = [...formData.options];
        newOpts[idx].name = name;
        setFormData({ ...formData, options: newOpts });
    };

    const updateOptionValue = (optIdx: number, valIdx: number, field: string, value: any) => {
        const newOpts = [...formData.options];
        if (!newOpts[optIdx].values[valIdx]) return;
        newOpts[optIdx].values[valIdx][field] = value;
        setFormData({ ...formData, options: newOpts });
    };

    const addOptionValue = (optIdx: number, value: string) => {
        const newOpts = [...formData.options];
        if (!newOpts[optIdx].values.find((v: any) => v.value === value)) {
            newOpts[optIdx].values.push({ value, swatchUrl: '' });
            setFormData({ ...formData, options: newOpts });
        }
    };

    const removeOptionValue = (optIdx: number, valIdx: number) => {
        const newOpts = [...formData.options];
        newOpts[optIdx].values.splice(valIdx, 1);
        setFormData({ ...formData, options: newOpts });
    };

    const removeOption = (idx: number) => {
        const newOpts = [...formData.options];
        newOpts.splice(idx, 1);
        setFormData({ ...formData, options: newOpts });
    };

    const generateSeo = () => {
        if (!formData.metaTitle && !formData.metaDescription) {
            setFormData((prev: any) => ({
                ...prev,
                metaTitle: prev.name,
                metaDescription: prev.description ? prev.description.substring(0, 160) : ''
            }));
        }
    };

    const generateSku = (index: number) => {
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        const prefix = formData.slug ? formData.slug.substring(0, 3).toUpperCase() : 'PRD';
        const sku = `${prefix}-${random}`;
        updateVariant(index, 'sku', sku);
    };

    // --- Variants ---
    const addVariant = () => {
        setFormData((prev: any) => ({
            ...prev,
            variants: [...prev.variants, {
                sku: `${formData.slug || 'PRD'}-${prev.variants.length + 1}`,
                attributeValues: {},
                costPrice: 0,
                sellingPrice: 0,
                compareAtPrice: 0,
                stock: 0
            }]
        }));
    };

    const removeVariant = (varIndex: number) => {
        setFormData((prev: any) => ({
            ...prev,
            variants: prev.variants.filter((_: any, i: number) => i !== varIndex)
        }));
    };

    const updateVariant = (index: number, field: string, value: any) => {
        const newVariants = [...formData.variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setFormData({ ...formData, variants: newVariants });
    };

    const updateVariantAttribute = (varIndex: number, attrName: string, attrValue: string) => {
        const newVariants = [...formData.variants];
        newVariants[varIndex].attributeValues = {
            ...newVariants[varIndex].attributeValues,
            [attrName]: attrValue
        };
        setFormData({ ...formData, variants: newVariants });
    };

    // --- Specifications ---
    const addSpec = () => {
        if (newSpec.key && newSpec.value) {
            setFormData((prev: any) => ({
                ...prev,
                specifications: [...(prev.specifications || []), { ...newSpec }]
            }));
            setNewSpec({ key: '', value: '' });
        }
    };

    const removeSpec = (idx: number) => {
        setFormData((prev: any) => ({
            ...prev,
            specifications: prev.specifications.filter((_: any, i: number) => i !== idx)
        }));
    };

    // --- Compatibility ---
    const addCompatBrand = (brand: string) => {
        if (brand && !formData.compatibility?.brands?.includes(brand)) {
            setFormData((prev: any) => ({
                ...prev,
                compatibility: {
                    ...prev.compatibility,
                    brands: [...(prev.compatibility?.brands || []), brand]
                }
            }));
        }
    };

    const addCompatModel = (model: string) => {
        if (model && !formData.compatibility?.models?.includes(model)) {
            setFormData((prev: any) => ({
                ...prev,
                compatibility: {
                    ...prev.compatibility,
                    models: [...(prev.compatibility?.models || []), model]
                }
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
            {/* General Info */}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    General Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Product Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={(e) => {
                                handleChange(e);
                                if (!initialData) {
                                    setFormData((prev: any) => ({
                                        ...prev,
                                        slug: e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
                                    }));
                                }
                            }}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 transition-colors"
                            placeholder="e.g. Premium Power Bank"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Slug</label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white font-mono text-sm focus:border-blue-500 transition-colors"
                            placeholder="premium-power-bank"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                        <div className="relative">
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                            >
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="out_of_stock">Out of Stock</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 w-4 h-4" />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 transition-colors"
                            placeholder="Tell customers about your product..."
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Categorization & Inventory Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                        Categorization
                    </h3>
                    <div className="space-y-4">
                        {/* Level 1: Brand/Main */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Category (Brand/Type)</label>
                            <div className="relative">
                                <select
                                    value={formData.categoryLevel1 || ''}
                                    onChange={(e) => handleCategoryChange(1, e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {level1Categories.map((cat: any) => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 w-4 h-4" />
                            </div>
                        </div>

                        {/* Level 2: Sub-category */}
                        {level2Categories.length > 0 && (
                            <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                                <label className="block text-sm font-medium text-slate-400 mb-2">Sub-Category (Type)</label>
                                <div className="relative">
                                    <select
                                        value={formData.categoryLevel2 || ''}
                                        onChange={(e) => handleCategoryChange(2, e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Sub-Category</option>
                                        {level2Categories.map((cat: any) => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 w-4 h-4" />
                                </div>
                            </div>
                        )}

                        {/* Level 3: Specific */}
                        {level3Categories.length > 0 && (
                            <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                                <label className="block text-sm font-medium text-slate-400 mb-2">Specific Type</label>
                                <div className="relative">
                                    <select
                                        value={formData.categoryLevel3 || ''}
                                        onChange={(e) => handleCategoryChange(3, e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Specific</option>
                                        {level3Categories.map((cat: any) => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 w-4 h-4" />
                                </div>
                            </div>
                        )}


                    </div>
                </div>
                <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                        Inventory Settings
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Low Stock Threshold</label>
                            <input
                                type="number"
                                name="lowStockThreshold"
                                value={formData.lowStockThreshold}
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white"
                                min="0"
                            />
                        </div>
                        <div className="flex items-center gap-3 pt-4">
                            <input
                                type="checkbox"
                                id="featured"
                                name="featured"
                                checked={formData.featured}
                                onChange={handleChange}
                                className="w-5 h-5 bg-slate-950 border-white/10 rounded"
                            />
                            <label htmlFor="featured" className="text-sm font-medium text-slate-300">
                                Feature this product on homepage
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Images */}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-6" >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                        Product Images
                    </h3>
                    <button
                        type="button"
                        onClick={addImage}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center"
                    >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Image
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {formData.images.map((img: any, index: number) => (
                        <div key={index} className="relative group bg-slate-950 p-4 rounded-xl border border-white/5">
                            <ImageUpload
                                value={img.url}
                                onChange={(url) => updateImage(index, 'url', url)}
                                label={`Image ${index + 1} ${index === 0 ? '(Primary)' : ''}`}
                            />
                            <div className="mt-3">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alt Text</label>
                                <input
                                    type="text"
                                    value={img.alt || ''}
                                    onChange={(e) => updateImage(index, 'alt', e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded p-2 text-xs text-white"
                                    placeholder="Describe image for SEO"
                                />
                            </div>
                            {formData.images.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                    title="Remove Image"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div >

            {/* Product Options */}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                        Product Options
                    </h3>
                    <button
                        type="button"
                        onClick={addOption}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center"
                    >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Option
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {formData.options?.map((opt: any, optIdx: number) => (
                        <div key={optIdx} className="bg-slate-950 border border-white/10 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Option Name</label>
                                    <input
                                        type="text"
                                        value={opt.name}
                                        onChange={(e) => updateOptionName(optIdx, e.target.value)}
                                        placeholder="e.g. Color, Size"
                                        className="bg-slate-900 border border-white/10 rounded p-2 text-white text-sm w-48"
                                    />
                                </div>
                                <button type="button" onClick={() => removeOption(optIdx)} className="text-slate-500 hover:text-red-400">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2 items-center">
                                {opt.values.map((val: any, valIdx: number) => (
                                    <div key={valIdx} className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-full pl-1 pr-3 py-1 text-sm text-white">
                                        <ImageUpload
                                            variant="compact"
                                            value={val.swatchUrl}
                                            onChange={(url) => updateOptionValue(optIdx, valIdx, 'swatchUrl', url)}
                                        />
                                        <span>{val.value}</span>
                                        <button type="button" onClick={() => removeOptionValue(optIdx, valIdx)} className="text-slate-500 hover:text-white">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add Value"
                                        className="bg-transparent border border-white/20 rounded px-2 py-1 text-sm text-white w-24 focus:w-32 transition-all"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addOptionValue(optIdx, e.currentTarget.value);
                                                e.currentTarget.value = '';
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    {(!formData.options || formData.options.length === 0) && (
                        <p className="text-sm text-slate-500 italic col-span-full">No options defined (e.g. Color, Size).</p>
                    )}
                </div>
            </div>

            {/* Variants */}
            < div className="bg-slate-900 border border-white/10 rounded-xl p-6" >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-pink-500 rounded-full"></span>
                        Product Variants
                    </h3>
                    <button
                        type="button"
                        onClick={addVariant}
                        className="flex items-center px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/10 transition-colors"
                    >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Variant
                    </button>
                </div>

                <div className="space-y-4">
                    {formData.variants.map((v: any, index: number) => (
                        <div key={index} className="bg-slate-950/50 border border-white/5 rounded-xl p-6 relative group">
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button
                                    type="button"
                                    className="p-1 px-2 border border-white/10 bg-slate-900 rounded text-[10px] font-bold text-slate-500 hover:text-white"
                                    onClick={() => {
                                        const nextSku = `${formData.slug || 'prd'}-${formData.variants.length + 1}`;
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            variants: [...prev.variants, { ...v, sku: nextSku }]
                                        }));
                                    }}
                                >
                                    Duplicate
                                </button>
                                {formData.variants.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(index)}
                                        className="p-1 text-slate-600 hover:text-red-400"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Variant Image */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase">Image</label>
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={v.image || ''}
                                            onChange={(e) => updateVariant(index, 'image', e.target.value)}
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 pl-9 text-white text-sm appearance-none cursor-pointer"
                                        >
                                            <option value="">No specific image</option>

                                            {formData.images.map((img: any, i: number) => (
                                                <option key={i} value={img.url}>Image {i + 1}</option>
                                            ))}
                                        </select>
                                        {v.image ? (
                                            <img src={v.image} className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded object-cover border border-white/20" />
                                        ) : (
                                            <ImageIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        )}
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 w-4 h-4" />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase">SKU</label>
                                        <button type="button" onClick={() => generateSku(index)} className="text-blue-400 hover:text-blue-300" title="Generate SKU">
                                            <RefreshCw className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={v.sku}
                                        onChange={(e) => updateVariant(index, 'sku', e.target.value.toUpperCase())}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white text-sm font-mono"
                                        placeholder="SKU-123"
                                        required
                                    />
                                </div>

                                {/* Dynamic Attributes Selectors */}
                                {formData.options?.map((opt: any) => (
                                    <div key={opt.name}>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{opt.name}</label>
                                        <div className="relative">
                                            <select
                                                value={v.attributeValues?.[opt.name] || ''}
                                                onChange={(e) => updateVariantAttribute(index, opt.name, e.target.value)}
                                                className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white text-sm appearance-none cursor-pointer"
                                            >
                                                <option value="">Select {opt.name}</option>
                                                {opt.values.map((val: any) => (
                                                    <option key={val.value} value={val.value}>{val.value}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 w-4 h-4" />
                                        </div>
                                    </div>
                                ))}

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Stock</label>
                                    <input
                                        type="number"
                                        value={v.stock}
                                        onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value))}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white text-sm"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cost (NGN)</label>
                                    <input
                                        type="number"
                                        value={v.costPrice}
                                        onChange={(e) => updateVariant(index, 'costPrice', parseFloat(e.target.value))}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white text-sm"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Price (NGN)</label>
                                    <input
                                        type="number"
                                        value={v.sellingPrice}
                                        onChange={(e) => updateVariant(index, 'sellingPrice', parseFloat(e.target.value))}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white text-sm"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Compare Price</label>
                                    <input
                                        type="number"
                                        value={v.compareAtPrice || 0}
                                        onChange={(e) => updateVariant(index, 'compareAtPrice', parseFloat(e.target.value))}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white text-sm"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div >

            {/* Specifications */}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-teal-500 rounded-full"></span>
                    Specifications
                </h3>
                <div className="space-y-4">
                    {formData.specifications?.map((spec: any, idx: number) => (
                        <div key={idx} className="flex gap-4">
                            <input
                                readOnly
                                value={spec.key}
                                className="bg-slate-950 border border-white/10 rounded p-2 text-slate-400 text-sm w-1/3"
                            />
                            <input
                                readOnly
                                value={spec.value}
                                className="bg-slate-950 border border-white/10 rounded p-2 text-slate-200 text-sm flex-1"
                            />
                            <button type="button" onClick={() => removeSpec(idx)} className="text-red-400">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <div className="flex gap-4 items-end">
                        <div className="w-1/3">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Key</label>
                            <input
                                type="text"
                                value={newSpec.key}
                                onChange={(e) => setNewSpec({ ...newSpec, key: e.target.value })}
                                placeholder="e.g. Material"
                                className="w-full bg-slate-950 border border-white/10 rounded p-2 text-white text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Value</label>
                            <input
                                type="text"
                                value={newSpec.value}
                                onChange={(e) => setNewSpec({ ...newSpec, value: e.target.value })}
                                placeholder="e.g. 100% Cotton"
                                className="w-full bg-slate-950 border border-white/10 rounded p-2 text-white text-sm"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addSpec();
                                    }
                                }}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={addSpec}
                            className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded hover:bg-blue-600/30"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Compatibility */}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
                    Compatibility
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Compatible Brands</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.compatibility?.brands?.map((brand: string, i: number) => (
                                <span key={i} className="bg-slate-800 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                    {brand}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newBrands = formData.compatibility.brands.filter((_: any, idx: number) => idx !== i);
                                            setFormData((prev: any) => ({ ...prev, compatibility: { ...prev.compatibility, brands: newBrands } }));
                                        }}
                                    ><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            placeholder="Add brand and press Enter"
                            className="w-full bg-slate-950 border border-white/10 rounded p-2 text-white text-sm"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addCompatBrand(e.currentTarget.value);
                                    e.currentTarget.value = '';
                                }
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Compatible Models</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.compatibility?.models?.map((model: string, i: number) => (
                                <span key={i} className="bg-slate-800 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                    {model}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newModels = formData.compatibility.models.filter((_: any, idx: number) => idx !== i);
                                            setFormData((prev: any) => ({ ...prev, compatibility: { ...prev.compatibility, models: newModels } }));
                                        }}
                                    ><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            placeholder="Add model and press Enter"
                            className="w-full bg-slate-950 border border-white/10 rounded p-2 text-white text-sm"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addCompatModel(e.currentTarget.value);
                                    e.currentTarget.value = '';
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Wallet Only Discount */}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-cyan-500 rounded-full"></span>
                    Wallet-Only Discount
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="walletDiscountEnabled"
                            checked={formData.walletOnlyDiscount?.enabled || false}
                            onChange={(e) => setFormData((prev: any) => ({
                                ...prev,
                                walletOnlyDiscount: { ...prev.walletOnlyDiscount, enabled: e.target.checked }
                            }))}
                            className="w-5 h-5 bg-slate-950 border-white/10 rounded"
                        />
                        <label htmlFor="walletDiscountEnabled" className="text-sm font-medium text-slate-300">
                            Enable exclusive discount for wallet payments
                        </label>
                    </div>

                    {formData.walletOnlyDiscount?.enabled && (
                        <div className="grid grid-cols-2 gap-4 pl-8">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Percentage Off</label>
                                <input
                                    type="number"
                                    value={formData.walletOnlyDiscount?.percentage || 0}
                                    onChange={(e) => setFormData((prev: any) => ({
                                        ...prev,
                                        walletOnlyDiscount: { ...prev.walletOnlyDiscount, percentage: parseFloat(e.target.value) }
                                    }))}
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white"
                                    min="0"
                                    max="50"
                                    placeholder="%"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Valid Until (Optional)</label>
                                <input
                                    type="date"
                                    value={formData.walletOnlyDiscount?.validUntil ? new Date(formData.walletOnlyDiscount.validUntil).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setFormData((prev: any) => ({
                                        ...prev,
                                        walletOnlyDiscount: { ...prev.walletOnlyDiscount, validUntil: e.target.value ? new Date(e.target.value) : undefined }
                                    }))}
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white [color-scheme:dark] cursor-pointer"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* SEO */}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-gray-500 rounded-full"></span>
                        SEO
                    </h3>
                    <button type="button" onClick={generateSeo} className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center">
                        <Wand className="w-3 h-3 mr-1" />
                        Auto Generate
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Meta Title</label>
                        <input
                            type="text"
                            name="metaTitle"
                            value={formData.metaTitle || ''}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white"
                            placeholder={formData.name}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Meta Description</label>
                        <textarea
                            name="metaDescription"
                            value={formData.metaDescription || ''}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white"
                            placeholder="Short summary for search engines..."
                        />
                    </div>
                </div>
            </div>

            {/* Sticky Actions */}
            < div className="fixed bottom-0 left-0 right-0 md:left-64 bg-slate-950/80 backdrop-blur-md border-t border-white/10 p-4 px-8 flex items-center justify-between z-40" >
                <div className="flex items-center gap-3">
                    {initialData ? (
                        <div className="hidden md:flex flex-col">
                            <span className="text-xs text-slate-500">Last updated</span>
                            <span className="text-sm text-slate-300 font-medium">
                                {new Date(initialData.updatedAt).toLocaleString()}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-blue-400">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Creating new product</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="px-6 py-2.5 text-slate-400 hover:text-white font-medium transition-colors"
                    >
                        Discard Changes
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {initialData ? 'Update Product' : 'Create Product'}
                    </button>
                </div>
            </div >
        </form >
    );
}
