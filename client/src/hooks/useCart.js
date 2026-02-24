import { useCartContext } from '../context/CartContext';

const useCart = () => {
    return useCartContext();
};

export default useCart;
