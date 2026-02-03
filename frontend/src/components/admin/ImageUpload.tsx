import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import adminApi from '@/lib/adminApi';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    className?: string;
    variant?: 'standard' | 'compact';
}

export default function ImageUpload({ value, onChange, label = 'Product Image', className, variant = 'standard' }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(value || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create local preview
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        setIsUploading(true);

        try {
            const data = await adminApi.uploadImage(file);
            onChange(data.url);
            setPreview(data.url);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image. Please try again.');
            setPreview(value || null); // Revert
        } finally {
            setIsUploading(false);
        }
    };

    const handleClear = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        onChange('');
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (variant === 'compact') {
        return (
            <div className={className}>
                <div className="relative group">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={isUploading}
                    />

                    {preview ? (
                        <div
                            className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-slate-900 cursor-pointer hover:opacity-80 transition"
                            onClick={() => fileInputRef.current?.click()}
                            title="Click to change swatch"
                        >
                            <img
                                src={preview}
                                alt="Swatch"
                                className="w-full h-full object-cover"
                            />
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Loader2 className="w-3 h-3 text-white animate-spin" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-blue-500/50 transition-all text-slate-400 hover:text-blue-400"
                            title="Upload Swatch"
                        >
                            {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                {label}
            </label>

            <div className="relative group">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isUploading}
                />

                {preview ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-slate-900 group">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover transition-opacity group-hover:opacity-75"
                        />
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500/80 text-white rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-video rounded-xl border-2 border-dashed border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center gap-2 group/btn"
                    >
                        <div className="p-3 rounded-full bg-white/5 group-hover/btn:bg-blue-500/20 text-slate-400 group-hover/btn:text-blue-500 transition-colors">
                            {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                        </div>
                        <p className="text-xs font-bold text-slate-500 group-hover/btn:text-slate-300">
                            {isUploading ? 'Uploading...' : 'Click to Upload Image'}
                        </p>
                    </button>
                )}
            </div>
            {value && !preview && (
                <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    Existing image URL present
                </div>
            )}
        </div>
    );
}
