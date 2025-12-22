export interface CreditPackage {
  id: string; // Stripe product ID
  priceId: string; // Stripe price ID
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
  discount?: number;
  originalPrice?: number;
}

const devProducts = [
  {
    id: 'prod_SZ9ZrKVp8D4ChN',
    name: 'Single Review',
    credits: 1,
    price: 9.99,
    priceId: 'price_1SRwBP03wFCvtmnbg5sSQwOZ',
  },
  {
    id: 'prod_SZ9nIXNbOIMBv2',
    name: '5 Review Pack',
    credits: 5,
    price: 39.99,
    originalPrice: 49.95,
    discount: 20,
    priceId: 'price_1Re1UG02R5keeXtZEBVyIsRG',
    popular: true,
  },
  {
    id: 'prod_SZ9oRH3K1aueQv',
    name: '10 Review Pack',
    credits: 10,
    price: 69.99,
    originalPrice: 99.90,
    discount: 30,
    priceId: 'price_1Re1US02R5keeXtZaOHxoeTL',
  }
];
const prodProducts = [
  {
    id: 'prod_Sc8zf33MR0t3SZ',
    name: 'Single Review',
    credits: 1,
    price: 9.99,
    priceId: 'price_1SRwBP03wFCvtmnbg5sSQwOZ',
  },
  {
    id: 'prod_Sc90kY3c9LLDL8',
    name: '5 Review Pack',
    credits: 5,
    price: 39.99,
    originalPrice: 49.95,
    discount: 20,
    priceId: 'price_1SRwU503wFCvtmnb7PeXdGCG',
    popular: true,
  },
  {
    id: 'prod_Sc92ZeDwkx5Igc',
    name: '10 Review Pack',
    credits: 10,
    price: 69.99,
    originalPrice: 99.90,
    discount: 30,
    priceId: 'price_1SYuQS03wFCvtmnbU1phNKFl',
  }
];

export const creditPackages: CreditPackage[] = process.env.NODE_ENV === 'production' ? prodProducts : devProducts;
