/**
 * Node script to automatically get a timestamp to be used as last update time in the import script.
 * Timestamp returned corresponds to midnight 2 Fridays ago. Therefor contnet update at least a week 
 * ago or newer will be imported.
 */
import fs from 'fs';

const now = new Date();
const today = now.getDay();
const daysToFriday = (today + 6) % 7;

const friday = new Date(now);
friday.setDate(now.getDate() - daysToFriday - 7);
friday.setHours(0, 0, 0, 0);

// Get timestamp
const timestamp = friday.toISOString();

console.log(timestamp);
