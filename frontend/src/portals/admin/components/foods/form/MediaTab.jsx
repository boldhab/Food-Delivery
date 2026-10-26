import React from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiX, FiPlus } from 'react-icons/fi';

const MediaTab = ({
  imagePreview,
  setImagePreview,
  setFormData,
  imagePreviews,
  handleImageUpload,
  handleMultipleImageUpload,
  removeImage,
  fileInputRef,
  errors
}) => {
  return (
    <motion.div
      key="media"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Main Image */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Main Item Image
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            imagePreview
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40'
              : 'border-slate-300 dark:border-slate-600 hover:border-primary-500'
          }`}
        >
          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Main preview"
                className="max-h-56 mx-auto rounded-lg object-cover shadow-sm"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setImagePreview(null);
                  setFormData((prev) => ({ ...prev, image: null }));
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow"
                title="Remove image"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <FiUpload className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                Click to upload main menu photo
              </p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP up to 5MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        {errors?.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
      </div>

      {/* Additional Gallery Images */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Gallery Photos
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {imagePreviews?.map((preview, index) => (
            <div key={index} className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <img
                src={preview}
                alt={`Gallery ${index + 1}`}
                className="w-full h-24 object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => document.getElementById('multi-image-input')?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg h-24 flex flex-col items-center justify-center hover:border-primary-500 transition-colors text-slate-400 hover:text-primary-600"
          >
            <FiPlus className="w-6 h-6 mb-1" />
            <span className="text-xs">Add more</span>
          </button>
        </div>
        <input
          id="multi-image-input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleMultipleImageUpload}
          className="hidden"
        />
      </div>
    </motion.div>
  );
};

export default MediaTab;
