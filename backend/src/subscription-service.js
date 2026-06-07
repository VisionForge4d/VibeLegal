const express = require('express');

// Lazy initialize Stripe only when needed and API key is available
let stripe = null;
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  if (!stripe) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}
const { pool } = require('./db/pool');
const { authenticateToken } = require('../middleware/authenticateToken');
const { asyncHandler } = require('../middleware/errorHandler');
const { getTierLimits, TIER_LIMITS } = require('./subscription-limits');
const { LocalLLMProvider } = require('./ai-providers/local-llm-provider.js');

const router = express.Router();

/**
 * Subscription Service
 * Handles user tier management, feature access control, and billing
 */

// Get user subscription details
router.get('/subscription', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const result = await pool.query(
    `SELECT u.subscription_tier, u.contracts_used_this_month, u.created_at,
            us.status, us.billing_cycle, us.next_billing_date, us.stripe_subscription_id
     FROM users u
     LEFT JOIN user_subscriptions us ON u.id = us.user_id
     WHERE u.id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  const user = result.rows[0];
  const tierLimits = getTierLimits(user.subscription_tier);

  res.json({
    success: true,
    subscription: {
      tier: user.subscription_tier,
      status: user.status || 'active',
      billingCycle: user.billing_cycle,
      nextBillingDate: user.next_billing_date,
      contractsUsed: user.contracts_used_this_month,
      contractsLimit: tierLimits.monthlyContracts,
      features: tierLimits.features,
      stripeSubscriptionId: user.stripe_subscription_id
    }
  });
}));

// Local LLM / AI provider settings
router.get('/settings', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const result = await pool.query(
    `SELECT local_llm_enabled, local_llm_endpoint, local_llm_model, local_llm_api_key
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(result.rows[0]);
}));

router.put('/settings', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { local_llm_enabled, local_llm_endpoint, local_llm_model, local_llm_api_key } = req.body;

  await pool.query(
    `UPDATE users
       SET local_llm_enabled = $1,
           local_llm_endpoint = $2,
           local_llm_model = $3,
           local_llm_api_key = $4,
           updated_at = NOW()
     WHERE id = $5`,
    [
      !!local_llm_enabled,
      local_llm_endpoint || null,
      local_llm_model || null,
      local_llm_api_key || null,
      userId
    ]
  );

  res.json({ message: 'Settings updated successfully' });
}));

router.post('/test-local-llm', authenticateToken, asyncHandler(async (req, res) => {
  const { endpoint, model, apiKey } = req.body;

  try {
    const provider = new LocalLLMProvider({ endpoint, model, apiKey });
    const testPrompt = 'Respond with valid JSON: {"status": "ok"}';
    const response = await provider._makeRequest(testPrompt);
    res.json({ success: true, message: 'Connection successful', response });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}));

// Check feature access
router.get('/access/:feature', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { feature } = req.params;

  const result = await pool.query(
    'SELECT subscription_tier, contracts_used_this_month FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  const user = result.rows[0];
  const tierLimits = getTierLimits(user.subscription_tier);
  const hasAccess = checkFeatureAccess(feature, user.subscription_tier, user.contracts_used_this_month, tierLimits);

  res.json({
    success: true,
    hasAccess,
    tier: user.subscription_tier,
    reason: hasAccess ? 'access_granted' : getAccessDenialReason(feature, user.subscription_tier, user.contracts_used_this_month, tierLimits)
  });
}));

// Create subscription checkout session (Stripe integration)
router.post('/checkout', authenticateToken, asyncHandler(async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({
      success: false,
      error: 'Payment processing is not configured. Please contact support.'
    });
  }

  const userId = req.user.userId;
  const { tier, billingCycle = 'monthly' } = req.body;

  if (!['pro', 'enterprise'].includes(tier)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid subscription tier'
    });
  }

  // Get user info for customer creation
  const userResult = await pool.query('SELECT email, name FROM users WHERE id = $1', [userId]);
  if (userResult.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  const user = userResult.rows[0];

  // Create or retrieve Stripe customer
  let customer;
  try {
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name || user.email,
        metadata: {
          userId: userId.toString()
        }
      });
    }
  } catch (stripeError) {
    console.error('Stripe customer creation error:', stripeError);
    return res.status(500).json({
      success: false,
      error: 'Failed to create customer'
    });
  }

  const price = getPrice(tier, billingCycle);
  const priceId = getPriceId(tier, billingCycle);

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ['card'],
    line_items: [{
      price: priceId, // Use actual Stripe price IDs when available
      quantity: 1,
    }],
    mode: 'subscription',
    success_url: `${process.env.FRONTEND_URL}/dashboard?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/dashboard?upgrade=cancelled`,
    metadata: {
      userId: userId.toString(),
      tier,
      billingCycle
    },
    subscription_data: {
      metadata: {
        userId: userId.toString(),
        tier
      }
    },
    allow_promotion_codes: true,
    billing_address_collection: 'auto'
  });

  res.json({
    success: true,
    checkoutSession: {
      id: session.id,
      url: session.url,
      tier,
      billingCycle,
      amount: price
    }
  });
}));

// Webhook for handling Stripe subscription events
router.post('/webhook/stripe', express.raw({type: 'application/json'}), asyncHandler(async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({
      success: false,
      error: 'Payment processing is not configured'
    });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set. Aborting webhook processing.');
    return res.status(500).json({ error: 'Webhook secret not configured.' });
  }

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Stripe webhook event:', event.type);

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionCancellation(event.data.object);
      break;

    case 'invoice.payment_succeeded':
      await handlePaymentSuccess(event.data.object);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;

    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
}));

// Update user subscription tier
router.post('/update-tier', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { tier, stripeSubscriptionId } = req.body;

  const allowedTiers = Object.keys(TIER_LIMITS);
  if (!allowedTiers.includes(tier)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid subscription tier'
    });
  }

  if (tier === 'basic') {
    await pool.query(
      'UPDATE users SET subscription_tier = $1 WHERE id = $2',
      ['basic', userId]
    );

    await pool.query(
      `UPDATE user_subscriptions
       SET status = 'canceled', updated_at = NOW()
       WHERE user_id = $1`,
      [userId]
    );

    return res.json({
      success: true,
      message: 'Subscription downgraded to basic tier'
    });
  }

  if (!stripeSubscriptionId) {
    return res.status(400).json({
      success: false,
      error: 'stripeSubscriptionId is required for paid tiers'
    });
  }

  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({
      success: false,
      error: 'Payment processing is not configured. Please contact support.'
    });
  }

  let subscription;
  try {
    subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  } catch (error) {
    console.error('Unable to retrieve Stripe subscription during tier update:', error);
    return res.status(400).json({
      success: false,
      error: 'Invalid or inaccessible Stripe subscription.'
    });
  }

  if (!subscription) {
    return res.status(403).json({
      success: false,
      error: 'Stripe subscription is not active.'
    });
  }

  const activeStatuses = new Set(['active', 'trialing']);
  if (!activeStatuses.has(subscription.status)) {
    return res.status(403).json({
      success: false,
      error: 'Stripe subscription is not active.'
    });
  }

  if (subscription.metadata?.userId !== String(userId)) {
    return res.status(403).json({
      success: false,
      error: 'Subscription does not belong to this user.'
    });
  }

  const derivedTier = deriveTierFromSubscription(subscription);
  if (!derivedTier) {
    return res.status(400).json({
      success: false,
      error: 'Unable to determine subscription tier from Stripe data.'
    });
  }

  if (tier !== derivedTier) {
    return res.status(400).json({
      success: false,
      error: 'Requested tier does not match Stripe subscription.'
    });
  }

  await pool.query(
    'UPDATE users SET subscription_tier = $1 WHERE id = $2',
    [derivedTier, userId]
  );

  await pool.query(
    `INSERT INTO user_subscriptions (user_id, plan_type, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
     VALUES ($1, $2, $3, $4, $5, to_timestamp($6), to_timestamp($7), NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET
       plan_type = EXCLUDED.plan_type,
       status = EXCLUDED.status,
       stripe_subscription_id = EXCLUDED.stripe_subscription_id,
       stripe_customer_id = EXCLUDED.stripe_customer_id,
       current_period_start = EXCLUDED.current_period_start,
       current_period_end = EXCLUDED.current_period_end,
       updated_at = NOW()`,
    [
      userId,
      derivedTier,
      subscription.status,
      subscription.id,
      subscription.customer,
      subscription.current_period_start || null,
      subscription.current_period_end || null
    ]
  );

  res.json({
    success: true,
    message: 'Subscription updated successfully',
    tier: derivedTier,
    status: subscription.status
  });
}));

// Helper Functions

function checkFeatureAccess(feature, tier, contractsUsed, tierLimits) {
  // Check if feature is included in tier
  if (!tierLimits.features.includes(feature)) {
    return false;
  }

  // Check monthly contract limits
  if (feature === 'basic_contract_generation' && tierLimits.monthlyContracts !== -1) {
    return contractsUsed < tierLimits.monthlyContracts;
  }

  return true;
}

function getAccessDenialReason(feature, tier, contractsUsed, tierLimits) {
  if (!tierLimits.features.includes(feature)) {
    return 'feature_not_included_in_tier';
  }

  if (feature === 'basic_contract_generation' && tierLimits.monthlyContracts !== -1) {
    if (contractsUsed >= tierLimits.monthlyContracts) {
      return 'monthly_limit_exceeded';
    }
  }

  return 'unknown';
}

function getPrice(tier, billingCycle) {
  const limits = getTierLimits(tier);
  return limits.price[billingCycle] || limits.price.monthly;
}

// Get Stripe price ID based on tier and billing cycle
function getPriceId(tier, billingCycle) {
  // In production, these would be actual Stripe price IDs
  // For now, we'll create them dynamically or use fallback pricing
  const priceIds = {
    'pro': {
      'monthly': process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly_fallback',
      'yearly': process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly_fallback'
    },
    'enterprise': {
      'monthly': process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || 'price_enterprise_monthly_fallback',
      'yearly': process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || 'price_enterprise_yearly_fallback'
    }
  };

  return priceIds[tier]?.[billingCycle] || null;
}

function getPriceIdToTierMap() {
  return {
    [process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly_fallback']: 'pro',
    [process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly_fallback']: 'pro',
    [process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || 'price_enterprise_monthly_fallback']: 'enterprise',
    [process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || 'price_enterprise_yearly_fallback']: 'enterprise'
  };
}

function deriveTierFromSubscription(subscription) {
  const metadataTier = subscription?.metadata?.tier;
  if (metadataTier && TIER_LIMITS[metadataTier]) {
    return metadataTier;
  }

  const priceItem = subscription?.items?.data?.[0]?.price;
  const priceMetadataTier = priceItem?.metadata?.tier;
  if (priceMetadataTier && TIER_LIMITS[priceMetadataTier]) {
    return priceMetadataTier;
  }

  const priceId = priceItem?.id;
  if (priceId) {
    const map = getPriceIdToTierMap();
    if (map[priceId]) {
      return map[priceId];
    }
  }

  return null;
}

async function handleCheckoutCompleted(session) {
  try {
    const userId = session.metadata?.userId;
    const tier = session.metadata?.tier;
    
    if (!userId || !tier) {
      console.error('Missing metadata in checkout session:', session.id);
      return;
    }

    // Update user subscription tier
    await pool.query(
      'UPDATE users SET subscription_tier = $1 WHERE id = $2',
      [tier, userId]
    );

    // Create or update subscription record
    await pool.query(
      `INSERT INTO user_subscriptions (user_id, plan_type, status, stripe_subscription_id, stripe_customer_id, created_at)
       VALUES ($1, $2, 'active', $3, $4, NOW())
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         plan_type = EXCLUDED.plan_type,
         status = EXCLUDED.status,
         stripe_subscription_id = EXCLUDED.stripe_subscription_id,
         stripe_customer_id = EXCLUDED.stripe_customer_id,
         updated_at = NOW()`,
      [userId, tier, session.subscription, session.customer]
    );

    console.log(`Checkout completed for user ${userId}, upgraded to ${tier}`);
  } catch (error) {
    console.error('Error handling checkout completion:', error);
  }
}

async function handleSubscriptionUpdate(subscription) {
  try {
    const userId = subscription.metadata?.userId;
    
    if (!userId) {
      console.error('Missing userId in subscription metadata:', subscription.id);
      return;
    }

    const status = subscription.status;
    const tier = subscription.metadata?.tier || 'pro';

    await pool.query(
      `UPDATE user_subscriptions 
       SET status = $1, 
           current_period_start = to_timestamp($2),
           current_period_end = to_timestamp($3),
           updated_at = NOW()
       WHERE stripe_subscription_id = $4`,
      [status, subscription.current_period_start, subscription.current_period_end, subscription.id]
    );

    // Update user tier if subscription is active
    if (status === 'active') {
      await pool.query(
        'UPDATE users SET subscription_tier = $1 WHERE id = $2',
        [tier, userId]
      );
    } else if (status === 'canceled' || status === 'past_due') {
      await pool.query(
        'UPDATE users SET subscription_tier = $1 WHERE id = $2',
        ['basic', userId]
      );
    }

    console.log(`Subscription ${subscription.id} updated to ${status} for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionCancellation(subscription) {
  try {
    const userId = subscription.metadata?.userId;
    
    if (!userId) {
      console.error('Missing userId in subscription metadata:', subscription.id);
      return;
    }

    // Downgrade user to basic tier
    await pool.query(
      'UPDATE users SET subscription_tier = $1 WHERE id = $2',
      ['basic', userId]
    );

    // Update subscription record
    await pool.query(
      `UPDATE user_subscriptions 
       SET status = 'canceled', updated_at = NOW()
       WHERE stripe_subscription_id = $1`,
      [subscription.id]
    );

    console.log(`Subscription ${subscription.id} cancelled for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

async function handlePaymentSuccess(invoice) {
  try {
    const subscriptionId = invoice.subscription;
    
    if (subscriptionId) {
      await pool.query(
        `UPDATE user_subscriptions 
         SET status = 'active', updated_at = NOW()
         WHERE stripe_subscription_id = $1`,
        [subscriptionId]
      );
    }

    console.log(`Payment succeeded for invoice ${invoice.id}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(invoice) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      console.error('Stripe not configured for payment failure handling');
      return;
    }
    
    const subscriptionId = invoice.subscription;
    
    if (subscriptionId) {
      // Get subscription details
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const userId = subscription.metadata?.userId;
      
      if (userId && subscription.status === 'past_due') {
        // Optionally downgrade user or send notifications
        await pool.query(
          `UPDATE user_subscriptions 
           SET status = 'past_due', updated_at = NOW()
           WHERE stripe_subscription_id = $1`,
          [subscriptionId]
        );
      }
    }

    console.log(`Payment failed for invoice ${invoice.id}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

module.exports = router;
