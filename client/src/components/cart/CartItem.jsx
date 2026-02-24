import React from 'react';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import resolveImageUrl from '../../utils/image';

const CartItem = ({ item, onUpdate, onRemove, busy }) => {
    return (
        <div className="cart-item">
            <img
                src={resolveImageUrl(item.snapshot?.image || item.foodId?.image)}
                alt={item.name}
                onError={(event) => {
                    event.currentTarget.src = resolveImageUrl('');
                }}
            />
            <div className="cart-item-main">
                <h3>{item.name}</h3>
                <p>${item.price.toFixed(2)}</p>
            </div>
            <div className="cart-actions">
                <button disabled={busy || item.quantity <= 1} onClick={() => onUpdate(item._id, item.quantity - 1)} type="button">
                    <FiMinus />
                </button>
                <span>{item.quantity}</span>
                <button disabled={busy || item.quantity >= 20} onClick={() => onUpdate(item._id, item.quantity + 1)} type="button">
                    <FiPlus />
                </button>
            </div>
            <div className="cart-line-total">${(item.price * item.quantity).toFixed(2)}</div>
            <button className="icon-danger" disabled={busy} onClick={() => onRemove(item._id)} type="button">
                <FiTrash2 />
            </button>
        </div>
    );
};

export default CartItem;
