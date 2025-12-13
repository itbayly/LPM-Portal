import type { BenefitItem, Notification, TabItem } from "./types";

export const NOTIFICATIONS: Notification[] = [
  {
    icon: "🔔",
    title: "Price Cap Alert",
    message: "Vendor overcharged by 5%"
  },
  {
    icon: "📅",
    title: "HVAC Renewal",
    message: "90 Days remaining"
  },
  {
    icon: "🔧",
    title: "Elevator Maint",
    message: "Technician arrived 45m late"
  },
  {
    icon: "♻️",
    title: "Waste Mgmt",
    message: "Contract auto-renewed (Clause 4.2)"
  },
  {
    icon: "🌳",
    title: "Landscaping",
    message: "Seasonal surcharge pending approval"
  },
  {
    icon: "🛡️",
    title: "Security",
    message: "Patrol missed check-in at 02:00"
  },
  {
    icon: "🔥",
    title: "Fire Safety",
    message: "Inspection due in 14 days"
  },
  {
    icon: "🧹",
    title: "Cleaning",
    message: "Supply cost variance: +12%"
  }
];

export const INITIAL_TABS: TabItem[] = [
  { id: 'elevator', label: 'Elevator', status: 'active' },
  { id: 'hvac', label: 'HVAC', status: 'missing' },
  { id: 'waste', label: 'Waste', status: 'active' },
  { id: 'fire', label: 'Fire', status: 'expired' },
];

export const BENEFITS: BenefitItem[] = [
  {
    title: "Sanity",
    description: "Know exactly who to call when equipment breaks. No digging through emails."
  },
  {
    title: "Power",
    description: "Compare vendor bids in seconds with real market data."
  },
  {
    title: "Leverage",
    description: "Negotiate from a position of strength. We benchmark your contracts against local market data so you know exactly what you should be paying."
  }
];