import { GoogleGenerativeAI } from '@google/generative-ai';
import { geocode } from './geocoding';

// Use environment variable for API key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'your gemini API';
const genAI = new GoogleGenerativeAI(API_KEY);

const PROMPT_TEMPLATE = `Create a detailed {numberOfDays}-day travel itinerary for {destination} with a STRICT total budget of ₹{budget} for {travelers} travelers. DO NOT exceed this budget.

Trip Details:
- Accommodation: {accommodation} ({travelers} travelers)
- Transportation: {transportation}
- Interests: {interests}
- Additional Requirements: {description}

Budget Breakdown Guidelines (Total: ₹{budget}):
Accommodation: 30% of budget
Activities: 40% of budget
Meals: 20% of budget
Transportation: 10% of budget

Provide a VERY detailed itinerary with:
1. Check-in and check-out times for accommodation
2. Detailed daily schedule with specific times (morning, afternoon, evening activities)
3. Restaurant recommendations for breakfast (₹300-500/person), lunch (₹500-800/person), and dinner (₹700-1000/person)
4. Exact costs in INR (₹) for each activity, meal, and accommodation
5. Transportation details between locations with estimated times
6. Specific locations and landmarks with complete addresses

CRITICAL: Ensure all costs combined DO NOT exceed the total budget of ₹{budget}.

Format each day as follows:

Day X:
Check-in: HH:MM (if applicable)
Check-out: HH:MM (if applicable)

Morning Activities:
09:00 - 10:30 Activity Name (Full Address) ₹Cost
[Brief description of the activity]

Afternoon Activities:
13:00 - 14:30 Activity Name (Full Address) ₹Cost
[Brief description of the activity]

Evening Activities:
18:00 - 19:30 Activity Name (Full Address) ₹Cost
[Brief description of the activity]

Meals:
Breakfast: Restaurant Name (Full Address) - Cuisine Type ₹Cost
Lunch: Restaurant Name (Full Address) - Cuisine Type ₹Cost
Dinner: Restaurant Name (Full Address) - Cuisine Type ₹Cost

Transportation Details:
[Specific details about getting between locations]

Important:
- All costs must be in INR (₹) and adjusted for {travelers} travelers
- Include specific time slots for each activity
- Provide actual restaurant names and cuisines with addresses
- Include brief descriptions for each activity/location
- Factor in travel time between locations`;

export async function generateTravelPlan(
  destination: string,
  budget: number,
  interests: string[],
  numberOfTravelers: number,
  transportation: 'own' | 'rental',
  numberOfDays: number,
  accommodation: 'hotel' | 'hostel' | 'resort',
  description: string
) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' }); // Use pro model for better results

    const prompt = PROMPT_TEMPLATE
      .replace(/{destination}/g, destination)
      .replace(/{budget}/g, budget.toString())
      .replace(/{travelers}/g, numberOfTravelers.toString())
      .replace(/{transportation}/g, transportation)
      .replace(/{numberOfDays}/g, numberOfDays.toString())
      .replace(/{accommodation}/g, accommodation)
      .replace(/{interests}/g, interests.join(', '))
      .replace(/{description}/g, description || 'No additional requirements');

    const result = await model.generateContent(prompt);
    
    if (!result.response) {
      throw new Error('No response received from AI');
    }

    const text = result.response.text();
    
    if (!text) {
      throw new Error('Empty response received from AI');
    }

    // Clean up any markdown formatting
    const cleanText = text.replace(/\*/g, '').replace(/\_/g, '');

    const plan = await parseTravelPlan(
      cleanText,
      destination,
      budget,
      interests,
      numberOfTravelers,
      transportation,
      numberOfDays,
      accommodation,
      description
    );

    // Validate total cost doesn't exceed budget
    const totalCost = calculateTotalCost(plan);
    if (totalCost > budget) {
      throw new Error(`Generated plan exceeds budget (₹${totalCost} > ₹${budget})`);
    }

    return plan;
  } catch (error) {
    console.error('Gemini API Error:', error);
    if (error instanceof Error) {
      throw new Error(`AI Error: ${error.message}`);
    }
    throw new Error('Failed to generate travel plan');
  }
}

function calculateTotalCost(plan: any) {
  return plan.days.reduce((total: number, day: any) => {
    const activityCosts = day.activities.reduce((sum: number, activity: any) => sum + activity.cost, 0);
    const mealCosts = day.meals.reduce((sum: number, meal: any) => sum + meal.cost, 0);
    return total + activityCosts + mealCosts;
  }, 0);
}

async function parseTravelPlan(
  text: string,
  destination: string,
  budget: number,
  interests: string[],
  numberOfTravelers: number,
  transportation: 'own' | 'rental',
  numberOfDays: number,
  accommodation: 'hotel' | 'hostel' | 'resort',
  description: string
) {
  // Split text into days using regex that matches "Day X:" or "Day X -"
  const dayTexts = text.split(/Day \d+(?::|-)/).filter(Boolean);
  
  const days = await Promise.all(dayTexts.map(async (dayText, index) => {
    // Extract activities using time pattern (HH:MM - HH:MM or HH:MM)
    const activities = await Promise.all((dayText.match(/(?:\d{1,2}:\d{2}(?:\s*-\s*\d{1,2}:\d{2})?)\s*[^(\n]+(?:\([^)]+\))?/g) || [])
      .map(async activity => {
        const timeMatch = activity.match(/(\d{1,2}:\d{2}(?:\s*-\s*\d{1,2}:\d{2})?)/);
        const time = timeMatch ? timeMatch[1].trim() : '';
        const description = activity.replace(timeMatch?.[0] || '', '').trim();
        const costMatch = description.match(/₹\s*(\d+)/);
        const locationMatch = description.match(/\(([^)]+)\)/);
        const address = locationMatch ? locationMatch[1].trim() : '';
        
        // Get coordinates for the location
        let location = { lat: 0, lng: 0 };
        if (address) {
          try {
            location = await geocode(`${address}, ${destination}`);
          } catch (error) {
            console.error('Geocoding error:', error);
          }
        }

        const cost = costMatch ? parseInt(costMatch[1]) : 0;
        // Ensure cost is adjusted for number of travelers if it's a per-person cost
        const adjustedCost = cost > 1000 ? cost : cost * numberOfTravelers;
        
        return {
          name: description.split('(')[0].replace(/₹\s*\d+/, '').trim(),
          description: description.replace(/₹\s*\d+/, '').trim(),
          time,
          cost: adjustedCost,
          location,
          address
        };
      }));

    // Extract meals with more detail
    const meals = await Promise.all(['Breakfast', 'Lunch', 'Dinner'].map(async mealType => {
      const mealRegex = new RegExp(`${mealType}:([^₹\n]+)(?:₹\\s*(\\d+))?`, 'i');
      const mealMatch = dayText.match(mealRegex);
      const restaurantInfo = mealMatch ? mealMatch[1].trim() : 'Local Restaurant';
      const costMatch = mealMatch?.[2] ? parseInt(mealMatch[2]) : null;
      const addressMatch = restaurantInfo.match(/\(([^)]+)\)/);
      const address = addressMatch ? addressMatch[1].trim() : '';

      // Get coordinates for the restaurant
      let location = { lat: 0, lng: 0 };
      if (address) {
        try {
          location = await geocode(`${address}, ${destination}`);
        } catch (error) {
          console.error('Geocoding error:', error);
        }
      }

      const baseCost = costMatch || (
        mealType === 'Dinner' ? 800 :
        mealType === 'Lunch' ? 600 :
        400
      );

      return {
        type: mealType.toLowerCase() as 'breakfast' | 'lunch' | 'dinner',
        name: mealType,
        restaurant: restaurantInfo.replace(/\([^)]+\)/, '').trim(),
        cost: baseCost * numberOfTravelers,
        cuisine: extractCuisine(restaurantInfo),
        location,
        address
      };
    }));

    // Extract check-in/check-out times if present
    const checkInMatch = dayText.match(/check[- ]in:?\s*(\d{1,2}:\d{2})/i);
    const checkOutMatch = dayText.match(/check[- ]out:?\s*(\d{1,2}:\d{2})/i);

    return {
      day: index + 1,
      activities,
      meals,
      checkIn: checkInMatch?.[1] || '',
      checkOut: checkOutMatch?.[1] || ''
    };
  }));

  return {
    id: crypto.randomUUID(),
    destination,
    budget,
    interests,
    numberOfTravelers,
    transportation,
    numberOfDays,
    accommodation,
    description,
    days,
    createdAt: new Date().toISOString()
  };
}

function extractCuisine(restaurantInfo: string): string {
  const commonCuisines = [
    'Indian', 'Chinese', 'Italian', 'Continental', 'Local',
    'South Indian', 'North Indian', 'Thai', 'Japanese', 'Mediterranean'
  ];
  
  for (const cuisine of commonCuisines) {
    if (restaurantInfo.toLowerCase().includes(cuisine.toLowerCase())) {
      return cuisine;
    }
  }
  
  return 'Local';
}