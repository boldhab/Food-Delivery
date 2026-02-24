import React from 'react';
import { FiClock, FiPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import resolveImageUrl from '../../utils/image';

const FoodCard = ({ food }) => {
    const { isAuthenticated } = useAuth();
    const { addItem } = useCart();
    const navigate = useNavigate();

    const handleAdd = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to add items');
            navigate('/login');
            return;
        }

        try {
            await addItem(food._id, 1);
            toast.success(`${food.name} added to cart`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to add item');
        }
    };

    return (
        <article className="food-card">
            <img
                src={resolveImageUrl(food.image)}
                alt={food.name}
                className="food-image"
                onError={(event) => {
                    event.currentTarget.src = resolveImageUrl('');
                }}
            />
            <div className="food-body">
                <h3>{food.name}</h3>
                <p>{food.description}</p>
                <div className="food-meta">
                    <span>${food.price?.toFixed(2)}</span>
                    <span>
                        <FiClock /> {food.preparationTime || 15} min
                    </span>
                </div>
                <button type="button" onClick={handleAdd}>
                    <FiPlus /> Add to cart
                </button>
            </div>
        </article>
    );
};

export default FoodCard;
