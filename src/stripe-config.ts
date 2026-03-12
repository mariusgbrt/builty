export interface PlanLimits {
  employees: number;
  activeProjects: number;
}

export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  mode: 'payment' | 'subscription';
  limits: PlanLimits;
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_TZcrjzG2gcnqze',
    priceId: 'price_1ScTbm9X5XfpDIWavtNRbBKP',
    name: 'Builty PRO',
    description: 'Abonnement mensuel à Builty PRO',
    price: 169.00,
    currency: 'eur',
    mode: 'subscription',
    limits: {
      employees: 15,
      activeProjects: 8
    }
  },
  {
    id: 'prod_TZcqjaLY5GovpE',
    priceId: 'price_1ScTbG9X5XfpDIWaeUCAYwYP',
    name: 'Builty REGULAR',
    description: 'Abonnement mensuel à Builty REGULAR',
    price: 89.00,
    currency: 'eur',
    mode: 'subscription',
    limits: {
      employees: 8,
      activeProjects: 5
    }
  },
  {
    id: 'prod_SOLO',
    priceId: 'price_1T12Ty9X5XfpDIWaL9UjKzJ6',
    name: 'Builty SOLO',
    description: 'Abonnement mensuel à Builty SOLO',
    price: 49.00,
    currency: 'eur',
    mode: 'subscription',
    limits: {
      employees: 1,
      activeProjects: 4
    }
  }
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}