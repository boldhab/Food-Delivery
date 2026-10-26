import React from 'react';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import resolveImageUrl from '../../utils/image';

const CartItem = ({ item, onUpdate, onRemove, busy }) => {
    const itemId = item.id || item._id;
    const price = Number(item.price || item.food?.price || item.snapshot?.price || 0);
    const quantity = Number(item.quantity || 1);
    const imageSrc = resolveImageUrl(item.snapshot?.image || item.foodId?.image || item.food?.image || item.image);

    return (
        <div className="cart-item">
            <img
                src={imageSrc}
                alt={item.name}
                onError={(event) => {
                    event.currentTarget.src = resolveImageUrl('');
                }}
            />
            <div className="cart-item-main">
                <h3>{item.name}</h3>
                <p>{price.toFixed(2)} ETB</p>
            </div>
            <div className="cart-actions">
                <button 
                    disabled={busy || quantity <= 1} 
                    onClick={() => onUpdate(itemId, quantity - 1)} 
                    type="button"
                    aria-label="Decrease quantity"
                >
                    <FiMinus />
                </button>
                <span>{quantity}</span>
                <button 
                    disabled={busy || quantity >= 20} 
                    onClick={() => onUpdate(itemId, quantity + 1)} 
                    type="button"
                    aria-label="Increase quantity"
                >
                    <FiPlus />
                </button>
            </div>
            <div className="cart-line-total">{(price * quantity).toFixed(2)} ETB</div>
            <button 
                className="icon-danger" 
                disabled={busy} 
                onClick={() => onRemove(itemId)} 
                type="button"
                aria-label="Remove item"
            >
                <FiTrash2 />
            </button>
        </div>
    );
};

export default CartItem;
