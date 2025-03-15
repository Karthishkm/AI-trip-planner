import { create } from 'zustand';
import { TravelPlan } from '../types';

interface TravelStore {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  savedPlans: TravelPlan[];
  currentPlan: TravelPlan | null;
  setCurrentPlan: (plan: TravelPlan | null) => void;
  savePlan: (plan: TravelPlan) => void;
  removePlan: (planId: string) => void;
}

export const useTravelStore = create<TravelStore>((set) => ({
  isDarkMode: true,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  savedPlans: [],
  currentPlan: null,
  setCurrentPlan: (plan) => set({ currentPlan: plan }),
  savePlan: (plan) =>
    set((state) => ({
      savedPlans: [...state.savedPlans, plan],
    })),
  removePlan: (planId) =>
    set((state) => ({
      savedPlans: state.savedPlans.filter((plan) => plan.id !== planId),
    })),
}));