
# Add Currency Selector to Profile Dropdown

## Overview
Add a currency selection option inside the user profile dropdown menu in the top-right header. Users can switch between common currencies (USD, EUR, GBP, SAR, AED, etc.), and the selected currency will be persisted and available app-wide via a React context.

## What changes

### 1. Create CurrencyContext (`src/contexts/CurrencyContext.tsx`)
- Follow the same pattern as `LanguageContext.tsx`
- Stores selected currency code (e.g., "USD", "EUR")
- Persists to `localStorage`
- Provides `currency`, `setCurrency`, and currency symbol via context
- Supported currencies: USD, EUR, GBP, SAR, AED, JPY, CNY, INR

### 2. Update App Provider Tree (`src/app/App.tsx`)
- Wrap with `CurrencyProvider` alongside existing providers

### 3. Add Currency Submenu to Profile Dropdown (`src/features/dashboard/components/DashboardHeader.tsx`)
- Add a `DropdownMenuSub` item with a `Coins` icon labeled "Currency" showing the current code (e.g., "USD")
- Submenu lists all supported currencies with checkmark on the active one
- Placed between "Settings" and "API Keys" in the existing dropdown

### 4. Update `formatCurrency` utility (`src/utils/formatters.ts`)
- No breaking changes -- the existing function already accepts a `currency` parameter
- Components can pass the context currency to it

## Technical details

### New file: `src/contexts/CurrencyContext.tsx`
- `CurrencyCode` type with supported codes
- `supportedCurrencies` array with `{ code, name, symbol }`
- `CurrencyProvider` reads/writes `localStorage` key `"preferred-currency"`
- `useCurrency()` hook

### Modified: `src/app/App.tsx`
- Import and wrap with `CurrencyProvider`

### Modified: `src/features/dashboard/components/DashboardHeader.tsx`
- Import `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent` from dropdown-menu
- Import `Coins` from lucide-react and `useCurrency` from context
- Add currency submenu item in the user dropdown between Settings and API Keys
- Each currency option shows name and checkmark if active

### Files
- **Create**: `src/contexts/CurrencyContext.tsx`
- **Modify**: `src/app/App.tsx`, `src/features/dashboard/components/DashboardHeader.tsx`
