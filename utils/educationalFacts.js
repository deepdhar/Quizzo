import {decodeText} from './decoder';

/**
 * Curated trivia fun facts for well-known Quizzo questions.
 */
const CURATED_FACTS = {
  'tardar sauce':
    "Grumpy Cat's real name was Tardar Sauce! Born in 2012, her permanently grumpy expression was caused by feline dwarfism, making her an international internet icon.",
  mercury:
    'Mercury is the closest planet to the Sun and the smallest in our Solar System, taking only 88 Earth days to complete one orbit!',
  venus:
    'Venus is the hottest planet in the Solar System because its thick atmosphere traps heat in an extreme greenhouse effect, reaching over 460°C (860°F)!',
  mars: 'Mars is known as the Red Planet because iron minerals in the Martian soil oxidize (rust), giving the surface its distinctive reddish tint.',
  jupiter:
    'Jupiter is so massive that more than 1,300 Earths could fit inside it! Its Great Red Spot is a giant storm that has raged for hundreds of years.',
  saturn:
    "Saturn's iconic rings are mostly made of billions of chunks of ice and rock, ranging in size from tiny dust grains to giant mountains!",
  'blue whale':
    'The Blue Whale is the largest animal ever known to have lived on Earth—even bigger than any dinosaur—with a heart the size of a small car!',
  cheetah:
    'Cheetahs can accelerate from 0 to 60 mph in just three seconds, faster than many sports cars!',
  honey:
    'Honey never spoils! Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.',
  octopuses:
    'Octopuses have three hearts and blue blood! Two hearts pump blood to the gills, while the third circulates blood to the rest of the body.',
  'mount everest':
    'Mount Everest rises about 4 millimeters higher every year due to the tectonic collision between the Indian and Eurasian plates!',
  amazon:
    'The Amazon Rainforest produces approximately 20% of the Earth’s oxygen and is home to one in ten known species on the planet.',
  python:
    'Python was named after the British comedy television show "Monty Python\'s Flying Circus", not after the snake!',
  javascript:
    'JavaScript was created in just 10 days in May 1995 by Brendan Eich while working at Netscape!',
  'ada lovelace':
    'Ada Lovelace is widely regarded as the world’s first computer programmer for writing an algorithm for Charles Babbage’s mechanical computer in 1843!',
};

/**
 * Synthesizes a friendly, educational 'Did you know?' snippet for any trivia question.
 *
 * @param {string} question - The raw question text
 * @param {string} correctAnswer - The raw correct answer text
 * @param {string} category - The question category
 * @returns {string} Educational fact text
 */
export const getEducationalFact = (question, correctAnswer, category = '') => {
  const decodedAns = decodeText(correctAnswer || '').trim();
  const lowerAns = decodedAns.toLowerCase();

  // Check curated facts library first
  if (CURATED_FACTS[lowerAns]) {
    return CURATED_FACTS[lowerAns];
  }

  for (const [key, fact] of Object.entries(CURATED_FACTS)) {
    if (lowerAns.includes(key) || key.includes(lowerAns)) {
      return fact;
    }
  }

  const cleanQ = decodeText(question || '')
    .replace(/\?+$/, '')
    .trim();

  // Pattern matching based on question format
  if (/^what is/i.test(cleanQ)) {
    const subject = cleanQ.replace(/^what is\s+/i, '');
    return `${decodedAns} is indeed ${subject}! Exploring trivia helps strengthen long-term memory and problem solving.`;
  }

  if (/^who (is|was)/i.test(cleanQ)) {
    const subject = cleanQ.replace(/^who (is|was)\s+/i, '');
    return `${decodedAns} was ${subject}! Remembering key historical and cultural figures builds broad general knowledge.`;
  }

  if (/^which (of the following|planet|country|animal|city)/i.test(cleanQ)) {
    return `Out of all options, ${decodedAns} is correct! Paying attention to specific details makes you a sharper trivia master.`;
  }

  if (/^in which year|^when/i.test(cleanQ)) {
    return `${decodedAns} marks this important milestone! Connecting events to timelines helps you understand how the world developed.`;
  }

  if (/^where is/i.test(cleanQ)) {
    const place = cleanQ.replace(/^where is\s+/i, '');
    return `You'll find ${place} in ${decodedAns}! Geography trivia trains spatial reasoning and global awareness.`;
  }

  // Category specific context
  const cat = (category || '').toLowerCase();
  if (cat.includes('science') || cat.includes('nature')) {
    return `The correct answer is ${decodedAns}! Science helps us understand the fundamental laws that govern our universe.`;
  }
  if (cat.includes('history')) {
    return `${decodedAns} is the correct answer! History teaches us how past decisions shape our modern world today.`;
  }
  if (cat.includes('geography')) {
    return `${decodedAns} is correct! Earth has over 195 recognized countries, each with unique landscapes and cultures.`;
  }
  if (cat.includes('computer') || cat.includes('tech')) {
    return `${decodedAns} is correct! Computing technology continues to transform how we communicate and learn every day.`;
  }
  if (cat.includes('animal')) {
    return `${decodedAns} is correct! The animal kingdom contains over 1.5 million documented living species across Earth.`;
  }

  // General fallback
  return `The correct answer is ${decodedAns}! Every question you answer strengthens your knowledge and brain power.`;
};
