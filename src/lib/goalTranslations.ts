// Utility to translate goal values from English to Portuguese
export const goalTranslations: Record<string, string> = {
  'fat_loss': 'Diminuição da gordura',
  'mass_gain': 'Ganho de massa', 
  'maintenance': 'Manutenção',
  'muscle_building': 'Construção muscular',
  'weight_loss': 'Perda de peso',
  'endurance': 'Resistência',
  'strength': 'Força',
  'flexibility': 'Flexibilidade'
};

export const translateGoal = (goal: string | null): string => {
  if (!goal) return '';
  return goalTranslations[goal] || goal;
};