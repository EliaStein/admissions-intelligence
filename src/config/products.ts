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

export const creditPackages: CreditPackage[] = [
  {
    id: 'prod_SZ9ZrKVp8D4ChN',
    name: 'Single Review',
    credits: 1,
    price: 99,
    priceId: 'price_1Re1GW02R5keeXtZ7yEPRyIz',
  },
  {
    id: 'prod_SZ9fokXOBwQhDd',
    name: '3 Review Pack',
    credits: 3,
    price: 282,
    originalPrice: 297,
    discount: 5,
    priceId: 'price_1Re1Ma02R5keeXtZT13yayvt',
  },
  {
    id: 'prod_SZ9nIXNbOIMBv2',
    name: '5 Review Pack',
    credits: 5,
    price: 446,
    originalPrice: 495,
    discount: 10,
    priceId: 'price_1Re1UG02R5keeXtZEBVyIsRG',
    popular: true,
  },
  {
    id: 'prod_SZ9oRH3K1aueQv',
    name: '10 Review Pack',
    credits: 10,
    price: 792,
    originalPrice: 990,
    discount: 20,
    priceId: 'price_1Re1US02R5keeXtZaOHxoeTL',
  }
];