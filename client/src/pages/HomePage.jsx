import React from 'react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import foodService from '../services/food.service';
import FoodList from '../components/food/FoodList';
import Loader from '../components/ui/Loader';

const HomePage = () => {
    const [featuredFoods, setFeaturedFoods] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        foodService
            .getFeaturedFoods()
            .then((response) => setFeaturedFoods(response.data || []))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="home-page">
            <section className="hero">
                <h1>Hot meals delivered fast</h1>
                <p>Order from your favorite categories and track every step of your delivery.</p>
                <Link to="/menu" className="primary-link">
                    Browse menu
                </Link>
            </section>

            <section>
                <h2>Popular right now</h2>
                {loading ? <Loader /> : <FoodList foods={featuredFoods} />}
            </section>
        </div>
    );
};

export default HomePage;
