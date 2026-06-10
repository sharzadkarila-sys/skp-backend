import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Autoriser les requêtes depuis votre site Netlify
  res.setHeader('Access-Control-Allow-Origin', 'https://stellular-capybara-b93534.netlify.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { photoId, photoTitle, format, price } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${photoTitle} — ${format}`,
              description: 'Tirage Fine Art numéroté et signé. Papier Hahnemühle photo rag 308 g/m². Édition limitée à 8 exemplaires.',
            },
            unit_amount: price * 100, // Stripe travaille en centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://stellular-capybara-b93534.netlify.app?commande=confirmee',
      cancel_url: 'https://stellular-capybara-b93534.netlify.app',
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Erreur Stripe:', error);
    res.status(500).json({ error: error.message });
  }
}
