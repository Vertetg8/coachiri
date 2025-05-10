import { ActivityLevel, PersonalInfo, WeightGoal } from '../types';

// BMI Calculation
export const calculateBMI = (weight: number, height: number): number => {
  // Height in meters, weight in kg
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

// Activity level multipliers
const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// TDEE Calculation (Mifflin-St Jeor Equation)
export const calculateTDEE = (
  weight: number,
  height: number,
  age: number,
  sex: string,
  activityLevel: ActivityLevel
): number => {
  let bmr: number;

  // Calculate BMR based on sex
  if (sex.toLowerCase() === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Apply activity multiplier
  const tdee = bmr * activityMultipliers[activityLevel];
  
  return Math.round(tdee);
};

// Adjust calories based on goal
export const adjustCaloriesForGoal = (
  tdee: number,
  goal: WeightGoal | undefined,
  targetWeightLoss: number | undefined
): number => {
  if (!goal) {
    return tdee; // Maintenance
  }

  if (goal === 'lose_weight') {
    // Default to 0.5 kg/week if not specified
    const weeklyLoss = targetWeightLoss || 0.5;
    
    // 1 kg of fat is roughly 7700 calories
    const dailyDeficit = Math.round((weeklyLoss * 7700) / 7);
    
    // Ensure we don't go below 1200 calories (minimum healthy intake)
    return Math.max(tdee - dailyDeficit, 1200);
  }

  return tdee;
};

// Calculate macronutrients
export const calculateMacros = (
  calories: number,
  weight: number
): { protein: number; fats: number; carbs: number } => {
  // Protein: 1.6g per kg bodyweight
  const proteinInGrams = Math.round(weight * 1.6);
  const proteinCalories = proteinInGrams * 4;

  // Fats: 25% of total calories
  const fatCalories = calories * 0.25;
  const fatInGrams = Math.round(fatCalories / 9);

  // Remaining calories for carbs
  const carbCalories = calories - proteinCalories - fatCalories;
  const carbsInGrams = Math.round(carbCalories / 4);

  return {
    protein: proteinInGrams,
    fats: fatInGrams,
    carbs: carbsInGrams,
  };
};

// Get the appropriate meal plan based on calorie target
export const getMealPlanForCalories = (calories: number, mealPlans: any[]): any => {
  if (!mealPlans || mealPlans.length === 0) return null;
  
  // Find the meal plan with the calorie range that includes the target calories
  return mealPlans.find(
    plan => calories >= plan.calorie_range_min && calories <= plan.calorie_range_max
  );
};

// Calculate all health metrics at once
export const calculateAllMetrics = (data: Omit<PersonalInfo, 'info_id' | 'user_id'>): Partial<PersonalInfo> => {
  const bmi = calculateBMI(data.weight, data.height);
  const tdee = calculateTDEE(data.weight, data.height, data.age, data.sex, data.activity_level);
  const dailyCalories = adjustCaloriesForGoal(tdee, data.weight_goal, data.target_weight_loss);
  const macros = calculateMacros(dailyCalories, data.weight);

  return {
    bmi,
    daily_calories: dailyCalories,
    protein_macro: macros.protein,
    carbs_macro: macros.carbs,
    fat_macro: macros.fats,
  };
};