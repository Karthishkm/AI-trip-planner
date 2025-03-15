export interface TravelPlan {
  id: string;
  destination: string;
  budget: number;
  interests: string[];
  numberOfTravelers: number;
  transportation: 'own' | 'rental';
  numberOfDays: number;
  accommodation: 'hotel' | 'hostel' | 'resort';
  description: string;
  days: TravelDay[];
  createdAt: string;
}

export interface TravelDay {
  day: number;
  activities: Activity[];
  meals: Meal[];
  checkIn?: string;
  checkOut?: string;
}

export interface Activity {
  name: string;
  description: string;
  time: string;
  cost: number;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  imageUrl?: string;
}

export interface Meal {
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner';
  restaurant: string;
  cost: number;
  cuisine: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
}