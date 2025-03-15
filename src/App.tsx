import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Plane } from 'lucide-react';
import { useTravelStore } from './store';
import SearchForm from './components/SearchForm';
import TravelMap from './components/TravelMap';
import ItineraryDisplay from './components/ItineraryDisplay';

function App() {
  const { isDarkMode, toggleDarkMode, currentPlan } = useTravelStore();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-dark-DEFAULT min-h-screen transition-colors duration-300">
        <nav className="fixed w-full top-0 z-50 bg-dark-card/80 backdrop-blur-lg border-b border-dark-accent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Plane className="w-6 h-6 text-accent-purple" />
                <span className="text-xl font-bold bg-gradient-to-r from-accent-purple to-accent-pink bg-clip-text text-transparent">
                  AI Travel Planner
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-dark-lighter hover:bg-dark-accent transition-colors"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isDarkMode ? (
                    <Moon className="w-5 h-5 text-accent-blue" />
                  ) : (
                    <Sun className="w-5 h-5 text-accent-purple" />
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </nav>

        <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="space-y-8">
              <SearchForm />
              {currentPlan && <ItineraryDisplay plan={currentPlan} />}
            </div>
            <TravelMap />
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default App;