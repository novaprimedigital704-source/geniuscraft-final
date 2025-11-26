# GeniusCraft Studio - Ready to deploy

## How to deploy on Vercel

1. Create a new Vercel project and link this repository.
2. Add Environment Variables:
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET
   - STRIPE_BASIC_PLAN_ID
   - STRIPE_PRO_PLAN_ID
   - STRIPE_STUDIO_PLAN_ID
   - UPSTASH_REDIS_REST_URL
   - UPSTASH_REDIS_REST_TOKEN
   - HUGGINGFACE_TOKEN
   - HF_MODEL (optional)
   - NEXT_PUBLIC_SITE_URL (optional)

3. Deploy. After deploy, configure Stripe webhook endpoint:
   - URL: https://&lt;your-vercel-domain&gt;/api/webhook
   - Events: checkout.session.completed, invoice.paid, customer.subscription.created, customer.subscription.updated

## Notes
- This package contains production-ready serverless API routes and frontend files.
- Do not commit secret keys to the repo.
