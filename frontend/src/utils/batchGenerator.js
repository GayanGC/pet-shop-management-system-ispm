/**
 * Automated Clinical Batch Number Generator Utility
 * Sprint 3 Feature 2: Pharmacy Inventory Inwarding & Stock Management
 *
 * Generates ISO-formatted clinical batch numbers:
 * Format: {PREFIX}-{YYYY}{MM}-{4_DIGIT_SEED} (e.g. BATCH-202610-4821)
 */

export const generateAutomatedBatchNumber = (prefix = 'BATCH') => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit unique seed
  return `${prefix}-${year}${month}-${randomSuffix}`;
};

/**
 * Maps inventory category to clinical prefix
 */
export const getCategoryBatchPrefix = (category = '') => {
  const cat = String(category).toLowerCase();
  if (cat.includes('medicine') || cat.includes('drug')) return 'MED';
  if (cat.includes('vaccine') || cat.includes('immun')) return 'VAC';
  if (cat.includes('clinical') || cat.includes('healthcare') || cat.includes('supplies')) return 'CLI';
  if (cat.includes('supplement') || cat.includes('nutrition')) return 'SUP';
  return 'BATCH';
};

export default generateAutomatedBatchNumber;
