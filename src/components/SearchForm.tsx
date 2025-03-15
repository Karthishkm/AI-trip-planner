import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, Share2, Download, Users, Car, Hotel, Calendar, FileText } from 'lucide-react';
import { useTravelStore } from '../store';
import { generateTravelPlan } from '../lib/gemini';

const interests = [
  'Adventure', 'Culture', 'Food', 'History', 
  'Nature', 'Nightlife', 'Shopping', 'Relaxation'
];

const accommodationOptions = [
  { value: 'hotel', label: 'Hotel', icon: Hotel },
  { value: 'hostel', label: 'Hostel', icon: Hotel },
  { value: 'resort', label: 'Resort', icon: Hotel },
];

export default function SearchForm() {
  const { setCurrentPlan, savePlan } = useTravelStore();
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState('');
  const [numberOfTravelers, setNumberOfTravelers] = useState(1);
  const [transportation, setTransportation] = useState<'own' | 'rental'>('own');
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [accommodation, setAccommodation] = useState<'hotel' | 'hostel' | 'resort'>('hotel');
  const [description, setDescription] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !budget || selectedInterests.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const plan = await generateTravelPlan(
        destination,
        parseInt(budget),
        selectedInterests,
        numberOfTravelers,
        transportation,
        numberOfDays,
        accommodation,
        description
      );
      setCurrentPlan(plan);
      savePlan(plan);
    } catch (error) {
      console.error('Failed to generate travel plan:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate travel plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    alert('Share functionality coming soon!');
  };

  const handleDownload = () => {
    alert('Download functionality coming soon!');
  };

  const handleNumberOfTravelersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setNumberOfTravelers(isNaN(value) ? 1 : Math.max(1, value));
  };

  const handleNumberOfDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setNumberOfDays(isNaN(value) ? 1 : Math.max(1, value));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-card rounded-xl p-6 shadow-xl"
    >
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-accent-purple to-accent-pink bg-clip-text text-transparent">
        Plan Your Dream Trip
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Destination
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-dark-lighter border border-dark-accent focus:ring-2 focus:ring-accent-purple outline-none transition-all text-gray-200"
            placeholder="Enter city or country"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Trip Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-dark-lighter border border-dark-accent focus:ring-2 focus:ring-accent-purple outline-none transition-all text-gray-200 min-h-[100px]"
            placeholder="Describe your ideal trip, preferences, and any specific requirements..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Budget (₹)
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-dark-lighter border border-dark-accent focus:ring-2 focus:ring-accent-purple outline-none transition-all text-gray-200"
              placeholder="Enter your budget in INR"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Days
            </label>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-accent-purple mr-2" />
              <input
                type="number"
                min="1"
                value={numberOfDays}
                onChange={handleNumberOfDaysChange}
                className="w-full px-4 py-2 rounded-lg bg-dark-lighter border border-dark-accent focus:ring-2 focus:ring-accent-purple outline-none transition-all text-gray-200"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Travelers
            </label>
            <div className="flex items-center">
              <Users className="w-5 h-5 text-accent-purple mr-2" />
              <input
                type="number"
                min="1"
                value={numberOfTravelers}
                onChange={handleNumberOfTravelersChange}
                className="w-full px-4 py-2 rounded-lg bg-dark-lighter border border-dark-accent focus:ring-2 focus:ring-accent-purple outline-none transition-all text-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Accommodation Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {accommodationOptions.map((option) => (
                <motion.button
                  key={option.value}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setAccommodation(option.value as any)}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    accommodation === option.value
                      ? 'bg-accent-purple text-white'
                      : 'bg-dark-lighter text-gray-300 hover:bg-dark-accent'
                  }`}
                >
                  <option.icon className="w-4 h-4" />
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Transportation
          </label>
          <div className="flex gap-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTransportation('own')}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                transportation === 'own'
                  ? 'bg-accent-purple text-white'
                  : 'bg-dark-lighter text-gray-300 hover:bg-dark-accent'
              }`}
            >
              <Car className="w-4 h-4" />
              Own Vehicle
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTransportation('rental')}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                transportation === 'rental'
                  ? 'bg-accent-purple text-white'
                  : 'bg-dark-lighter text-gray-300 hover:bg-dark-accent'
              }`}
            >
              <Car className="w-4 h-4" />
              Rental
            </motion.button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Interests
          </label>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <motion.button
                key={interest}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => {
                  setSelectedInterests((prev) =>
                    prev.includes(interest)
                      ? prev.filter((i) => i !== interest)
                      : [...prev, interest]
                  );
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedInterests.includes(interest)
                    ? 'bg-accent-purple text-white'
                    : 'bg-dark-lighter text-gray-300 hover:bg-dark-accent'
                }`}
              >
                {interest}
              </motion.button>
            ))}
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-accent-purple to-accent-pink text-white font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Generating Plan...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Search className="w-5 h-5 mr-2" />
                Generate Travel Plan
              </span>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleShare}
            className="p-3 rounded-lg bg-dark-lighter text-accent-blue hover:bg-dark-accent transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleDownload}
            className="p-3 rounded-lg bg-dark-lighter text-accent-pink hover:bg-dark-accent transition-colors"
          >
            <Download className="w-5 h-5" />
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}