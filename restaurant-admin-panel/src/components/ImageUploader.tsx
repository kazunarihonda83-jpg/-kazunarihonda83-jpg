'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  currentImageUrl?: string;
  onImageChange: (imageUrl: string) => void;
  label?: string;
}

export default function ImageUploader({
  currentImageUrl,
  onImageChange,
  label = '画像をアップロード',
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック (5MB制限)
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズが大きすぎます。5MB以下の画像を選択してください。');
      return;
    }

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください。');
      return;
    }

    setIsUploading(true);

    // ファイルをBase64に変換
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      setPreview(base64String);
      onImageChange(base64String);
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert('画像の読み込みに失敗しました。');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {preview ? (
        <div className="relative group">
          <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                <button
                  type="button"
                  onClick={handleClick}
                  className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                  title="画像を変更"
                >
                  <Upload className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                  title="画像を削除"
                >
                  <X className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={isUploading}
          className={`w-full h-64 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors flex flex-col items-center justify-center gap-3 ${
            isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="text-sm text-gray-600">アップロード中...</p>
            </>
          ) : (
            <>
              <div className="p-4 bg-gray-100 rounded-full">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  クリックして画像を選択
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF (最大5MB)
                </p>
              </div>
            </>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-gray-500">
        💡 ヒント: 料理の魅力が伝わる鮮明な写真をアップロードしてください
      </p>
    </div>
  );
}
