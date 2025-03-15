import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Utensils, Clock, Users, Car, Hotel, FileText, LogIn, LogOut, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { TravelPlan } from '../types';

interface Props {
  plan: TravelPlan;
}

export default function ItineraryDisplay({ plan }: Props) {
  if (!plan) return null;

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const totalActivitiesCost = plan.days.reduce(
    (sum, day) => sum + day.activities.reduce((daySum, activity) => daySum + activity.cost, 0),
    0
  );

  const totalMealsCost = plan.days.reduce(
    (sum, day) => sum + day.meals.reduce((daySum, meal) => daySum + meal.cost, 0),
    0
  );

  const totalCost = totalActivitiesCost + totalMealsCost;
  const isOverBudget = totalCost > plan.budget;

  const handleLocationClick = (location: { lat: number; lng: number }) => {
    if (location.lat !== 0 && location.lng !== 0) {
      setSelectedLocation(location);
      // Emit custom event for map component
      window.dispatchEvent(new CustomEvent('focusLocation', { detail: location }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-card rounded-xl p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-accent-purple to-accent-pink bg-clip-text text-transparent">
          Your Travel Plan for {plan.destination}
        </h2>
        <span className="text-accent-blue">
          Created {format(new Date(plan.createdAt), 'MMM d, yyyy')}
        </span>
      </div>

      {isOverBudget && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <p className="text-red-500">
            Warning: Plan exceeds budget by ₹{(totalCost - plan.budget).toLocaleString()}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-dark-lighter rounded-lg p-4 flex items-center gap-3">
          <Users className="w-5 h-5 text-accent-purple" />
          <div>
            <p className="text-sm text-gray-400">Travelers</p>
            <p className="text-lg font-semibold text-white">{plan.numberOfTravelers}</p>
          </div>
        </div>
        <div className="bg-dark-lighter rounded-lg p-4 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-accent-blue" />
          <div>
            <p className="text-sm text-gray-400">Duration</p>
            <p className="text-lg font-semibold text-white">{plan.numberOfDays} days</p>
          </div>
        </div>
        <div className="bg-dark-lighter rounded-lg p-4 flex items-center gap-3">
          <Car className="w-5 h-5 text-accent-pink" />
          <div>
            <p className="text-sm text-gray-400">Transportation</p>
            <p className="text-lg font-semibold text-white capitalize">{plan.transportation}</p>
          </div>
        </div>
        <div className="bg-dark-lighter rounded-lg p-4 flex items-center gap-3">
          <Hotel className="w-5 h-5 text-accent-purple" />
          <div>
            <p className="text-sm text-gray-400">Stay</p>
            <p className="text-lg font-semibold text-white capitalize">{plan.accommodation}</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {plan.days.map((day) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: day.day * 0.1 }}
            className="border border-dark-accent rounded-lg p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-accent-purple flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Day {day.day}
              </h3>
              {(day.checkIn || day.checkOut) && (
                <div className="flex gap-4">
                  {day.checkIn && (
                    <div className="flex items-center gap-2 text-accent-blue">
                      <LogIn className="w-4 h-4" />
                      <span>Check-in: {day.checkIn}</span>
                    </div>
                  )}
                  {day.checkOut && (
                    <div className="flex items-center gap-2 text-accent-pink">
                      <LogOut className="w-4 h-4" />
                      <span>Check-out: {day.checkOut}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {day.activities.map((activity, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.01 }}
                  className="bg-dark-lighter rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent-blue" />
                        <span className="text-accent-blue font-medium">{activity.time}</span>
                      </div>
                      <h4 className="text-lg font-medium text-white mt-1">{activity.name}</h4>
                      <p className="text-gray-400 mt-1">{activity.description}</p>
                      {activity.address && (
                        <p className="text-sm text-gray-500 mt-1">{activity.address}</p>
                      )}
                      {activity.location.lat !== 0 && activity.location.lng !== 0 && (
                        <button
                          onClick={() => handleLocationClick(activity.location)}
                          className="flex items-center gap-1 text-sm text-accent-blue mt-2 hover:text-accent-purple transition-colors"
                        >
                          <MapPin className="w-4 h-4" />
                          View on map
                        </button>
                      )}
                    </div>
                    <span className="text-accent-pink font-semibold whitespace-nowrap">
                      ₹{activity.cost.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))}

              <div className="grid grid-cols-3 gap-4 mt-4">
                {day.meals.map((meal, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="bg-dark-lighter rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Utensils className="w-4 h-4 text-accent-purple" />
                      <span className="text-sm font-medium capitalize">{meal.type}</span>
                    </div>
                    <p className="text-sm text-white">{meal.restaurant}</p>
                    <p className="text-xs text-gray-400">{meal.cuisine} Cuisine</p>
                    {meal.address && (
                      <p className="text-xs text-gray-500 mt-1">{meal.address}</p>
                    )}
                    {meal.location.lat !== 0 && meal.location.lng !== 0 && (
                      <button
                        onClick={() => handleLocationClick(meal.location)}
                        className="flex items-center gap-1 text-xs text-accent-blue mt-1 hover:text-accent-purple transition-colors"
                      >
                        <MapPin className="w-3 h-3" />
                        View on map
                      </button>
                    )}
                    <p className="text-accent-pink font-semibold mt-2">₹{meal.cost.toLocaleString()}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-dark-lighter rounded-lg p-4">
            <h4 className="text-accent-purple font-medium mb-2">Activities Cost</h4>
            <p className="text-2xl font-bold text-white">₹{totalActivitiesCost.toLocaleString()}</p>
          </div>
          <div className="bg-dark-lighter rounded-lg p-4">
            <h4 className="text-accent-blue font-medium mb-2">Meals Cost</h4>
            <p className="text-2xl font-bold text-white">₹{totalMealsCost.toLocaleString()}</p>
          </div>
        </div>
        <div className={`bg-dark-lighter rounded-lg p-4 ${isOverBudget ? 'border-2 border-red-500/50' : ''}`}>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-accent-pink font-medium">Total Cost</h4>
            <p className="text-sm text-gray-400">Budget: ₹{plan.budget.toLocaleString()}</p>
          </div>
          <p className={`text-3xl font-bold ${isOverBudget ? 'text-red-500' : 'bg-gradient-to-r from-accent-purple to-accent-pink bg-clip-text text-transparent'}`}>
            ₹{totalCost.toLocaleString()}
          </p>
          {isOverBudget && (
            <p className="text-sm text-red-500 mt-2">
              Exceeds budget by ₹{(totalCost - plan.budget).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}