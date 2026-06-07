const TIER_LIMITS = {
  basic: {
    monthlyContracts: 5,
    features: ['basic_contract_generation'],
    price: 0
  },
  pro: {
    monthlyContracts: -1,
    features: [
      'basic_contract_generation',
      'conversational_ai',
      'advanced_customization',
      'risk_tolerance_controls',
      'legal_stance_selection',
      'contract_versioning',
      'priority_support'
    ],
    price: { monthly: 29, yearly: 290 }
  },
  enterprise: {
    monthlyContracts: -1,
    features: [
      'basic_contract_generation',
      'conversational_ai',
      'advanced_customization',
      'risk_tolerance_controls',
      'legal_stance_selection',
      'contract_versioning',
      'team_collaboration',
      'usage_analytics',
      'priority_support',
      'dedicated_support'
    ],
    price: { monthly: 99, yearly: 990 }
  }
};

function getTierLimits(tier) {
  return TIER_LIMITS[tier] || TIER_LIMITS.basic;
}

module.exports = {
  TIER_LIMITS,
  getTierLimits,
};
