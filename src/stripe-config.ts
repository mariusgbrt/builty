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
    id: 'prod_TZcrjzG2gcnqze', // ⚠️ REMPLACEZ par votre vrai Product ID Stripe
    priceId: 'price_1ScTbm9X5XfpDIWavtNRbBKP', // ⚠️ REMPLACEZ par votre vrai Price ID Stripe
    name: 'Builty PRO',
    description: 'Abonnement mensuel à Builty PRO',
    price: 169.00, // ✅ Prix mis à jour
    currency: 'eur',
    mode: 'subscription',
    limits: {
      employees: 15,
      activeProjects: 8
    }
  },
  {
    id: 'prod_TZcqjaLY5GovpE', // ⚠️ REMPLACEZ par votre vrai Product ID Stripe
    priceId: 'price_1ScTbG9X5XfpDIWaeUCAYwYP', // ⚠️ REMPLACEZ par votre vrai Price ID Stripe
    name: 'Builty REGULAR',
    description: 'Abonnement mensuel à Builty REGULAR',
    price: 89.00, // ✅ Prix mis à jour
    currency: 'eur',
    mode: 'subscription',
    limits: {
      employees: 8,
      activeProjects: 5
    }
  }
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}