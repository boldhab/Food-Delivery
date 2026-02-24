import React from 'react';
import { useParams } from 'react-router-dom';
import FoodsPage from './FoodsPage';

const EditFoodPage = () => {
    const { id } = useParams();
    return <FoodsPage initialMode="edit" initialFoodId={id} />;
};

export default EditFoodPage;
