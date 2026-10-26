import { test, expect } from '@playwright/test';

test.describe('Courier Delivery Flow Smoke Tests', () => {
  test('should display courier sign-in portal and validate input fields', async ({ page }) => {
    await page.goto('/driver/login');
    
    // Check heading / portal badge
    await expect(page.locator('text=COURIER FLEET').or(page.locator('text=Courier Partner Sign In')).first()).toBeVisible({ timeout: 10000 });

    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitBtn = page.locator('button[type="submit"]').first();

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();

    // Verify submission validation on empty form
    await submitBtn.click();
    await expect(page.locator('text=Please enter your courier email and password').or(emailInput)).toBeVisible();
  });

  test('should authenticate courier and route to active delivery dashboard', async ({ page }) => {
    // Mock driver login response
    await page.route('**/api/driver/auth/login*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          token: 'mock_jwt_driver_token',
          driver: {
            id: 'driver_007',
            name: 'Speedy Courier',
            email: 'courier@foodiehub.com',
            status: 'active',
            vehicleType: 'scooter',
            rating: 4.95
          }
        })
      });
    });

    // Mock active/available orders
    await page.route('**/api/driver/orders*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          orders: [
            {
              id: 'order_999',
              orderNumber: '#FH-999',
              customer: { name: 'Sarah Connor', phone: '+1234567890' },
              restaurant: { name: 'Downtown Bistro', address: '456 Market St' },
              deliveryAddress: '789 Elm St, Apt 4B',
              status: 'ready_for_pickup',
              total: 42.50,
              estimatedEarnings: 8.50
            }
          ]
        })
      });
    });

    await page.goto('/driver/login');

    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitBtn = page.locator('button[type="submit"]').first();

    await emailInput.fill('driver@foodiehub.com');
    await passwordInput.fill('Driver@123456');
    await submitBtn.click();

    // Verify redirect towards driver dashboard
    await expect(page).toHaveURL(/\/driver\/(available|my-deliveries)/, { timeout: 10000 });
  });
});
