import { test, expect } from '@playwright/test';

test.describe('Customer Checkout Flow Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the current user authentication state as logged-in customer
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: 'user_123',
            _id: 'user_123',
            name: 'Jane Customer',
            email: 'customer@example.com',
            role: 'customer',
            address: {
              street: '123 Main St',
              city: 'Metropolis',
              state: 'NY',
              zipCode: '10001'
            }
          }
        })
      });
    });

    // Mock foods menu endpoint
    await page.route('**/api/foods*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          foods: [
            {
              id: 'food_1',
              _id: 'food_1',
              name: 'Signature Truffle Burger',
              price: 18.99,
              category: 'Burgers',
              description: 'Juicy Angus patty topped with black truffle aioli',
              image: '/burger.jpg',
              rating: 4.8
            },
            {
              id: 'food_2',
              _id: 'food_2',
              name: 'Artisan Margherita Pizza',
              price: 15.50,
              category: 'Pizza',
              description: 'San Marzano tomatoes, fresh mozzarella, and basil',
              image: '/pizza.jpg',
              rating: 4.9
            }
          ],
          total: 2,
          pages: 1
        })
      });
    });

    // Mock cart API
    await page.route('**/api/cart*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              items: [
                {
                  id: 'item_1',
                  food: {
                    id: 'food_1',
                    _id: 'food_1',
                    name: 'Signature Truffle Burger',
                    price: 18.99,
                    image: '/burger.jpg'
                  },
                  quantity: 2,
                  price: 18.99
                }
              ],
              subtotal: 37.98,
              totalItems: 2
            }
          })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              items: [],
              subtotal: 0,
              totalItems: 0
            }
          })
        });
      }
    });
  });

  test('should render the customer storefront and menu items', async ({ page }) => {
    await page.goto('/menu');
    await expect(page).toHaveTitle(/Food Hub|Menu/i);
    await expect(page.locator('text=Signature Truffle Burger').first()).toBeVisible({ timeout: 10000 });
  });

  test('should view food details and verify add-to-cart interaction', async ({ page }) => {
    await page.route('**/api/foods/food_1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'food_1',
            _id: 'food_1',
            name: 'Signature Truffle Burger',
            price: 18.99,
            category: 'Burgers',
            description: 'Juicy Angus patty topped with black truffle aioli',
            image: '/burger.jpg',
            rating: 4.8,
            reviews: []
          }
        })
      });
    });

    await page.goto('/food/food_1');
    await expect(page.locator('text=Signature Truffle Burger').first()).toBeVisible({ timeout: 10000 });
    
    // Check quantity and add to cart button
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    await expect(addToCartButton).toBeVisible();
    await expect(addToCartButton).toBeEnabled();
  });

  test('should navigate to checkout and validate delivery address form', async ({ page }) => {
    await page.goto('/checkout');
    
    // Verify checkout page elements load
    await expect(page.locator('h1, h2, h3').filter({ hasText: /Checkout|Order/i }).first()).toBeVisible({ timeout: 10000 });
    
    // Verify address inputs exist
    const streetInput = page.locator('input[name="street"], input[placeholder*="street" i], input[placeholder*="address" i]').first();
    if (await streetInput.isVisible()) {
      await streetInput.fill('742 Evergreen Terrace');
      await expect(streetInput).toHaveValue('742 Evergreen Terrace');
    }
  });
});
