import type { Property, PropertyStatus } from '../dataModel';

// Helper to parse dates safely
const parseDate = (d: string | undefined) => {
  if (!d) return null;
  const date = new Date(d);
  return isNaN(date.getTime()) ? null : date;
};

export function calculatePropertyStatus(property: Property): PropertyStatus {
  const today = new Date();

  // 1. HARD OVERRIDES (Manual/Workflow Flags)
  if (property.status === 'no_elevators') return 'no_elevators';
  if (property.status === 'service_contract_needed') return 'service_contract_needed';
  
  // Handle Legacy mappings
  if (property.status === 'no_service_contract') return 'service_contract_needed';

  if (property.status === 'pending_review' || property.status === 'pending_rpm_review') {
    return 'pending_review';
  }

  // 2. MISSING DATA CHECK
  const isMissingData = 
    !property.vendor?.name || 
    !property.unitCount || 
    !property.vendor?.currentPrice || 
    !property.contractEndDate || 
    !property.cancellationWindow;

  if (isMissingData) {
    return 'missing_data';
  }

  // --- FROM HERE DOWN, DATA IS ASSUMED COMPLETE ---

  // 3. DATE LOGIC (Cancellation Window)
  const endDate = parseDate(property.contractEndDate);
  const nums = property.cancellationWindow ? property.cancellationWindow.match(/\d+/g)?.map(Number) : [];

  if (endDate && nums && nums.length > 0) {
    // Calculate Window Dates
    const maxDays = Math.max(...nums); // Start of Window (e.g. 120 days before end)
    const minDays = Math.min(...nums); // End of Window (e.g. 90 days before end)
    
    const windowOpenDate = new Date(endDate);
    windowOpenDate.setDate(endDate.getDate() - maxDays);
    
    const windowCloseDate = new Date(endDate);
    windowCloseDate.setDate(endDate.getDate() - minDays);

    // CRITICAL: < 15 days left in window
    const daysLeftInWindow = (windowCloseDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
    if (today >= windowOpenDate && today <= windowCloseDate && daysLeftInWindow <= 15) {
      return 'critical_action_required';
    }

    // WINDOW OPEN
    if (today >= windowOpenDate && today <= windowCloseDate) {
      return 'cancellation_window_open';
    }

    // NOTICE DUE SOON (30 days before window opens)
    const warningDate = new Date(windowOpenDate);
    warningDate.setDate(windowOpenDate.getDate() - 30);
    if (today >= warningDate && today < windowOpenDate) {
      return 'notice_due_soon';
    }
  }

  // 4. VENDOR LOGIC
  if (property.vendor?.name === 'Schindler') {
    return property.onNationalContract ? 'on_national_agreement' : 'add_to_msa';
  }

  // 5. DEFAULT
  return 'active_contract';
}