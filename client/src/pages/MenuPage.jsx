import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import foodService from '../services/food.service';
import FoodFilter from '../components/food/FoodFilter';
import FoodList from '../components/food/FoodList';
import Loader from '../components/ui/Loader';

const MenuPage = () => {
    const [foods, setFoods] = useState([]);
    const [categories, setCategories] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([foodService.getFoods(), foodService.getCategories()])
            .then(([foodsResponse, categoriesResponse]) => {
                setFoods(foodsResponse.data || []);
                setCategories(categoriesResponse.data || []);
            })
            .finally(() => setLoading(false));
    }, []);

    const filteredFoods = useMemo(() => {
        return foods.filter((food) => {
            const keywordMatch = keyword
                ? `${food.name} ${food.description} ${food.category}`.toLowerCase().includes(keyword.toLowerCase())
                : true;
            const categoryMatch = category ? food.category === category : true;
            return keywordMatch && categoryMatch;
        });
    }, [foods, keyword, category]);

    return (
        <div className="menu-page">
            <h1>Menu</h1>
            <FoodFilter
                keyword={keyword}
                onKeywordChange={setKeyword}
                category={category}
                categories={categories}
                onCategoryChange={setCategory}
            />
            {loading ? <Loader /> : <FoodList foods={filteredFoods} />}
        </div>
    );
};

export default MenuPage;
