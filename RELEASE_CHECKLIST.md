# Food Delivery Project Release Checklist

Use this checklist to close the project with clear go/no-go criteria.

## 1) Critical Flow Verification
- [ ] Admin/Customer/Driver 5-minute UI smoke completed
- [ ] Evidence captured (3 screenshots):
  - [ ] Admin order delivered state
  - [ ] Customer delivered state (+ promotion visibility if applicable)
  - [ ] Driver delivery history state
- [ ] No blocking UI console errors in critical flows
- [ ] No blocking API 4xx/5xx errors in critical flows

## 2) Quality Gates
- [ ] `server`: `npm test` passes
- [ ] `admin`: `npm run lint` and `npm run build` pass
- [ ] `client`: `npm run lint` and `npm run build` pass
- [ ] `Driver`: `npm run lint` and `npm run build` pass

## 3) Lint/Code Quality Hardening (Pre-Release Recommended)
- [ ] Review temporary relaxed ESLint rules
- [ ] Re-enable high-value rules incrementally
- [ ] Fix root code issues for any re-enabled rules
- [ ] Final lint run remains clean after re-enable

## 4) Configuration & Security
- [ ] Production `.env` values verified for all apps
- [ ] No default/test secrets in production
- [ ] JWT secret and DB credentials rotated/secured
- [ ] CORS/origin rules locked to production domains
- [ ] Stripe/Cloudinary keys validated in production mode

## 5) Data & Access Hygiene
- [ ] Remove or deactivate smoke test users/promotions/orders (if needed)
- [ ] Confirm admin accounts and roles are correct
- [ ] Confirm driver creation/activation flow works in production-like env

## 6) Deployment
- [ ] Backend deployed and health endpoint returns `200`
- [ ] Admin deployed and login/dashboard loads
- [ ] Client deployed and ordering flow loads
- [ ] Driver deployed and delivery flow loads
- [ ] Post-deploy critical smoke run completed

## 7) Documentation & Handoff
- [ ] README includes local run steps for all apps
- [ ] README includes deploy/environment setup
- [ ] Final release notes/changelog prepared
- [ ] Known limitations/issues list documented

## 8) Release Decision
- [ ] All must-have items above are checked
- [ ] Final go-live approval recorded

