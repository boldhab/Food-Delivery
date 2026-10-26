const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getApiOrigin = () => {
    try {
        return new URL(API_BASE).origin;
    } catch (error) {
        return 'http://localhost:5000';
    }
};

const PLACEHOLDER_IMAGE =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">' +
            '<rect width="400" height="300" fill="#f1f5f9"/>' +
            '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#64748b" font-family="Arial" font-size="22">Food Image</text>' +
        '</svg>'
    );

export const resolveImageUrl = (value) => {
    if (typeof value !== 'string' || !value.trim()) return PLACEHOLDER_IMAGE;

    const image = value.trim();
    if (image === 'default-food.jpg' || image === 'default-food.png') {
        return `${getApiOrigin()}/assets/default-food.svg`;
    }

    if (image.startsWith('//')) return `https:${image}`;
    if (/^(https?:|data:|blob:)/i.test(image)) return image;
    if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(image)) return `https://${image}`;
    if (image.startsWith('/')) return `${getApiOrigin()}${image}`;

    return PLACEHOLDER_IMAGE;
};

export default resolveImageUrl;
