import Stripe from "stripe";
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return Response.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }
  const { amount, currency = "nok" } = await req.json();
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    automatic_payment_methods: {
      enabled: true,
    },
  });
  return Response.json({
    clientSecret: paymentIntent.client_secret,
  });
});
