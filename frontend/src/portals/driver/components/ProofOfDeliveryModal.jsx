import React, { useState, useRef } from 'react';
import { 
  FiCamera, 
  FiUpload, 
  FiCheckCircle, 
  FiX, 
  FiAlertCircle, 
  FiShield, 
  FiDollarSign,
  FiFileText
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import driverOrderService from '../services/driverOrderService';

const ProofOfDeliveryModal = ({
  isOpen,
  order,
  onClose,
  onComplete
}) => {
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [handoffType, setHandoffType] = useState('contactless');
  const [codCollected, setCodCollected] = useState(false);
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen || !order) return null;

  const orderId = order._id || order.id;
  const isCod = order.paymentMethod === 'cash_on_delivery';
  const totalAmount = Number(order.totalAmount || 0).toFixed(2);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose a valid photo image');
      return;
    }

    setPhotoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
  };

  const handleClearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (handoffType === 'contactless' && !photoFile) {
      toast.error('Please take or upload a photo of the package at the doorstep');
      return;
    }

    if (isCod && !codCollected) {
      toast.error('Please confirm cash-on-delivery collection before completing');
      return;
    }

    setIsUploading(true);
    let proofOfDeliveryUrl = null;

    try {
      if (photoFile) {
        const formData = new FormData();
        formData.append('image', photoFile);
        const uploadRes = await driverOrderService.uploadPodImage(orderId, formData);
        proofOfDeliveryUrl = uploadRes?.imageUrl;
      }

      await onComplete({
        handoffType,
        codCollected: isCod ? codCollected : false,
        codAmount: isCod ? Number(order.totalAmount || 0) : 0,
        proofOfDeliveryUrl,
        proofOfDeliveryNotes: notes.trim(),
        note: notes.trim() || (proofOfDeliveryUrl ? 'Delivered with photo proof' : 'Delivered directly to customer')
      });

      toast.success('Proof of delivery verified & trip completed!', { icon: '🏆' });
      onClose?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to complete delivery');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FiShield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Proof of Delivery</h2>
              <p className="text-xs text-muted-foreground font-mono">Order #{order.orderNumber || orderId.slice(0, 8)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Handoff Type Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Handoff Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setHandoffType('contactless')}
              className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                handoffType === 'contactless'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FiCamera className="w-4 h-4" />
              <span>Contactless Drop</span>
              <span className="text-2xs font-normal opacity-80">(Doorstep Photo)</span>
            </button>

            <button
              type="button"
              onClick={() => setHandoffType('in_person')}
              className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                handoffType === 'in_person'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FiCheckCircle className="w-4 h-4" />
              <span>In-Person Hand</span>
              <span className="text-2xs font-normal opacity-80">(Direct to recipient)</span>
            </button>
          </div>
        </div>

        {/* Camera Photo Capture Area */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center justify-between">
            <span>Drop-off Photo {handoffType === 'contactless' && <span className="text-rose-500 dark:text-rose-400">*</span>}</span>
            <span className="text-xs font-normal text-muted-foreground">Timestamped proof</span>
          </label>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelect}
            className="hidden"
          />

          {!photoPreview ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-36 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500/60 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-950 flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 group-hover:bg-emerald-500/20 flex items-center justify-center transition-colors">
                <FiCamera className="w-6 h-6 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
              </div>
              <div className="text-center">
                <span className="font-bold text-xs text-slate-900 dark:text-white block">Tap to Open Camera / Upload</span>
                <span className="text-2xs text-muted-foreground">Capture parcel at customer door</span>
              </div>
            </button>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-slate-950">
              <img
                src={photoPreview}
                alt="Proof of Delivery preview"
                className="w-full h-44 object-cover"
              />
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleClearPhoto}
                  className="p-1.5 rounded-full bg-slate-900/90 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute bottom-2 left-2 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-2xs font-mono tabular-nums text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <FiCheckCircle className="w-3 h-3" />
                <span>Photo Attached</span>
              </div>
            </div>
          )}
        </div>

        {/* Cash-on-Delivery Confirmation (If Applicable) */}
        {isCod && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-300">
              <span>Cash on Delivery (COD)</span>
              <span className="text-sm font-bold tabular-nums text-amber-600 dark:text-amber-400">{totalAmount} ETB</span>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer pt-1 text-xs text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={codCollected}
                onChange={(e) => setCodCollected(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
              />
              <span>I confirm I collected <strong>{totalAmount} ETB</strong> in cash</span>
            </label>
          </div>
        )}

        {/* Drop-off Notes Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Drop-off Notes (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Left on table next to front door"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Submit Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            disabled={isUploading}
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl font-medium text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isUploading}
            onClick={handleSubmit}
            className="py-2.5 px-4 rounded-xl font-semibold text-sm uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiCheckCircle className="w-4 h-4" />
                <span>Verify & Complete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProofOfDeliveryModal;
