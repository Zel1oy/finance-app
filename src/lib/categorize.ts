import type { Category } from '../types'

interface CategoryRule {
  keywords: string[]
  category: Category
}

const RULES: CategoryRule[] = [
  {
    keywords: [
      'salary', 'payroll', 'paycheck', 'freelance', 'invoice paid', 'dividend',
      'interest earned', 'bonus', 'income', 'payment received', 'refund', 'cashback',
      'wage', 'pension',
    ],
    category: 'income',
  },
  {
    keywords: [
      'transfer to savings', 'savings deposit', 'investment', 'etf', 'stocks',
      'crypto', 'bitcoin', '401k', 'pension fund', 'index fund', 'vanguard', 'fidelity',
    ],
    category: 'savings',
  },
  {
    keywords: [
      'netflix', 'spotify', 'youtube premium', 'disney', 'hulu', 'twitch',
      'steam', 'playstation', 'xbox', 'nintendo', 'cinema', 'movie', 'concert',
      'theater', 'theatre', 'apple music', 'deezer', 'tidal', 'hbo', 'prime video',
      'crunchyroll', 'gaming', 'ticket',
    ],
    category: 'entertainment',
  },
  {
    keywords: [
      'uber', 'lyft', 'bolt', 'taxi', 'cab', 'bus', 'metro', 'subway', 'train',
      'flight', 'airfare', 'ryanair', 'wizz', 'airline', 'parking', 'toll',
      'fuel', 'petrol', 'gas station', 'shell', 'bp fuel', 'easyjet', 'lufthansa',
    ],
    category: 'transport',
  },
  {
    keywords: [
      'rent', 'mortgage', 'landlord', 'property', 'electricity', 'water bill',
      'gas bill', 'utilities', 'home insurance', 'council tax', 'maintenance',
      'internet bill', 'broadband', 'phone bill', 'mobile plan',
    ],
    category: 'housing',
  },
  {
    keywords: [
      'pharmacy', 'chemist', 'doctor', 'hospital', 'dentist', 'gym', 'fitness',
      'health insurance', 'prescription', 'clinic', 'medic', 'therapy', 'yoga',
      'pilates', 'vitamins', 'supplement',
    ],
    category: 'health',
  },
  {
    keywords: [
      'whole foods', 'tesco', 'lidl', 'aldi', 'walmart', 'target', 'carrefour',
      'restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'burger', 'pizza',
      'grocery', 'supermarket', 'foodpanda', 'doordash', 'uber eats', 'just eat',
      'deliveroo', 'wolt', 'grubhub', 'sushi', 'bakery', 'deli', 'takeaway',
      'dinner', 'lunch', 'breakfast', 'bar ', 'pub ', 'tavern',
    ],
    category: 'food',
  },
]

export function autoCategory(description: string): Category {
  const lower = description.toLowerCase()
  for (const rule of RULES) {
    if (rule.keywords.some((k) => lower.includes(k))) {
      return rule.category
    }
  }
  return 'other'
}

export function categoryFromMcc(mcc: number): Category {
  if ((mcc >= 5411 && mcc <= 5499) || (mcc >= 5811 && mcc <= 5814)) return 'food'
  if (
    (mcc >= 4111 && mcc <= 4131) ||
    mcc === 4411 ||
    mcc === 4511 ||
    mcc === 4784 ||
    mcc === 5541 ||
    mcc === 5542 ||
    mcc === 7511 ||
    mcc === 7512
  ) return 'transport'
  if (
    (mcc >= 5600 && mcc <= 5699) ||
    (mcc >= 5900 && mcc <= 5945) ||
    (mcc >= 7011 && mcc <= 7041) ||
    (mcc >= 7900 && mcc <= 7999) ||
    mcc === 5815 ||
    mcc === 5816 ||
    mcc === 5817 ||
    mcc === 5818
  ) return 'entertainment'
  if (
    (mcc >= 8011 && mcc <= 8099) ||
    mcc === 5047 ||
    mcc === 5122 ||
    mcc === 5912
  ) return 'health'
  if (
    mcc === 4900 ||
    (mcc >= 4814 && mcc <= 4816) ||
    mcc === 4899 ||
    mcc === 7372
  ) return 'housing'
  return 'other'
}
