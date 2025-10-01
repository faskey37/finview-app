
import type { EcoChallenge } from '@/lib/types';
import { Utensils, ShoppingBasket, Droplets, Coffee, Recycle, Plug, Wind, Thermometer, Bike } from 'lucide-react';

export const challenges: EcoChallenge[] = [
  {
    id: 'meat-free',
    title: 'Go Meat-Free for a Day',
    description: 'Reducing meat consumption is one of the most effective ways to lower your carbon footprint. Try a plant-based diet for just one day.',
    points: 20,
    icon: Utensils,
  },
  {
    id: 'reusable-bags',
    title: 'Bring Reusable Bags',
    description: 'Avoid single-use plastic bags when you shop. Keep reusable bags in your car or by the door so you never forget them.',
    points: 10,
    icon: ShoppingBasket,
  },
  {
    id: 'reusable-cup',
    title: 'Use a Reusable Coffee Cup',
    description: 'Disposable coffee cups contribute to massive landfill waste. Bring your own reusable cup to your favorite coffee shop—many even offer a small discount.',
    points: 10,
    icon: Coffee,
  },
  {
    id: 'shorten-shower',
    title: 'Shorten Your Shower',
    description: 'Cutting just two minutes off your shower time can save several gallons of water and the energy used to heat it. Try timing yourself!',
    points: 15,
    icon: Droplets,
  },
  {
    id: 'recycle-right',
    title: 'Recycle One Extra Item',
    description: 'Take a moment to find one item you would normally throw away and check if it can be recycled in your area. Small efforts add up!',
    points: 5,
    icon: Recycle,
  },
  {
    id: 'unplug-electronics',
    title: 'Unplug Phantom Load',
    description: 'Unplug electronics that are not in use, like phone chargers or TVs. They still draw power even when turned off (phantom load).',
    points: 10,
    icon: Plug,
  },
  {
    id: 'active-commute',
    title: 'Walk or Bike for a Short Trip',
    description: 'For a trip under a mile, choose to walk or bike instead of driving. It\'s great for your health and the planet.',
    points: 25,
    icon: Bike,
  },
  {
    id: 'adjust-thermostat',
    title: 'Adjust Your Thermostat',
    description: 'Adjust your thermostat by two degrees (cooler in winter, warmer in summer) to save a surprising amount of energy.',
    points: 15,
    icon: Thermometer,
  },
];

/**
 * Gets a consistent "random" challenge for any given day.
 * Uses the date to create a stable index, so it's the same for all users on the same day.
 * @returns The EcoChallenge for the current day.
 */
export function getDailyChallenge(): EcoChallenge {
  const date = new Date();
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const index = (dayOfYear + date.getFullYear()) % challenges.length;
  return challenges[index];
}

