export const mealPlans = [
  {
    plan_id: 'c47b4ef6-3567-4495-8d11-261c4a7c5417',
    calorie_range_min: 1200,
    calorie_range_max: 1400,
    breakfast: 'Greek yogurt with berries + 10 almonds',
    lunch: 'Grilled chicken salad with olive oil & vinegar',
    dinner: 'Baked salmon (100g), steamed broccoli, and ½ cup brown rice',
    snacks: '1 boiled egg + ½ apple, Carrot sticks with 1 tbsp hummus',
    portions_multiplier: 1,
  },
  {
    plan_id: '9f5a9b2c-0123-4456-7890-abcdef123456',
    calorie_range_min: 1500,
    calorie_range_max: 1700,
    breakfast: 'Oatmeal with banana and peanut butter',
    lunch: 'Turkey wrap with veggies + small fruit',
    dinner: 'Stir-fried tofu, vegetables, 1 cup quinoa',
    snacks: 'Low-fat cottage cheese + peach, Protein shake with water',
    portions_multiplier: 1,
  },
  {
    plan_id: 'e8d7c6b5-a432-1098-7654-321fedcba987',
    calorie_range_min: 1800,
    calorie_range_max: 2000,
    breakfast: '2 scrambled eggs, whole grain toast, orange',
    lunch: 'Grilled chicken sandwich, sweet potato wedges',
    dinner: 'Beef stir-fry with rice and vegetables',
    snacks: 'Trail mix (30g), Greek yogurt + chia seeds',
    portions_multiplier: 1,
  },
  {
    plan_id: 'b1a2c3d4-e5f6-7890-1234-567890abcdef',
    calorie_range_min: 2200,
    calorie_range_max: 2500,
    breakfast: '3 eggs, oatmeal with honey and banana',
    lunch: 'Chicken breast, pasta, olive oil, side salad',
    dinner: 'Grilled salmon, couscous, roasted veggies',
    snacks: 'Peanut butter on toast + milk, Protein smoothie with fruit and oats',
    portions_multiplier: 1,
  },
  {
    plan_id: 'd4c3b2a1-9876-5432-1098-765432109876',
    calorie_range_min: 2700,
    calorie_range_max: 3000,
    breakfast: 'Omelet with 4 eggs, cheese, toast, fruit juice',
    lunch: 'Steak wrap, rice, avocado, fruit',
    dinner: 'Chicken, sweet potatoes, mixed vegetables, olive oil drizzle',
    snacks: 'Granola bar + protein shake, Nuts, yogurt, banana',
    portions_multiplier: 1,
  },
];

export const initializeMealPlans = async (supabase: any) => {
  try {
    const { data, error } = await supabase.from('meal_plans').select('*');
    
    if (error) {
      console.error('Error checking for meal plans:', error);
      return;
    }
    
    // If no meal plans exist, insert the default ones
    if (!data || data.length === 0) {
      const { error: insertError } = await supabase.from('meal_plans').insert(mealPlans);
      
      if (insertError) {
        console.error('Error inserting meal plans:', insertError);
      }
    }
  } catch (error) {
    console.error('Error initializing meal plans:', error);
  }
};