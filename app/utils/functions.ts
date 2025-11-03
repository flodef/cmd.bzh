import { businessHours } from './constants';

export const getPhoneNumber = (phone: string) => {
  return phone.replaceAll(' ', '').replaceAll('-', '').replaceAll('(+33)0', '+33');
};

export type BusinessStatus = {
  isOpen: boolean;
  message: string;
  minutesUntilChange?: number;
};

export const getBusinessStatus = (): BusinessStatus => {
  const now = new Date();
  const parisTime = new Date(
    now.toLocaleString('en-US', { timeZone: businessHours.timezone })
  );
  
  const currentDay = parisTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentHour = parisTime.getHours();
  const currentMinute = parisTime.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  
  const openingTimeInMinutes = businessHours.openingHour * 60;
  const closingTimeInMinutes = businessHours.closingHour * 60;
  
  // Check if today is a working day
  const isWorkingDay = businessHours.openingDays.includes(currentDay);
  
  if (!isWorkingDay) {
    return {
      isOpen: false,
      message: 'Closed',
    };
  }
  
  // Check if currently open
  if (currentTimeInMinutes >= openingTimeInMinutes && currentTimeInMinutes < closingTimeInMinutes) {
    const minutesUntilClose = closingTimeInMinutes - currentTimeInMinutes;
    
    // If closing soon (within 60 minutes)
    if (minutesUntilClose <= 60) {
      return {
        isOpen: true,
        message: 'CloseSoon',
        minutesUntilChange: minutesUntilClose,
      };
    }
    
    return {
      isOpen: true,
      message: 'Open',
    };
  }
  
  // Check if opening soon (within 60 minutes before opening)
  if (currentTimeInMinutes < openingTimeInMinutes) {
    const minutesUntilOpen = openingTimeInMinutes - currentTimeInMinutes;
    
    if (minutesUntilOpen <= 60) {
      return {
        isOpen: false,
        message: 'OpenSoon',
        minutesUntilChange: minutesUntilOpen,
      };
    }
  }
  
  // Otherwise, closed
  return {
    isOpen: false,
    message: 'Closed',
  };
};

export const formatBusinessHours = (): string => {
  const days = businessHours.openingDays;
  const opening = businessHours.openingHour;
  const closing = businessHours.closingHour;
  
  // Format days
  let daysText: string;
  if (days.length === 7) {
    daysText = 'Everyday';
  } else if (days.length === 5 && 
             days.includes('monday') && 
             days.includes('tuesday') && 
             days.includes('wednesday') && 
             days.includes('thursday') && 
             days.includes('friday')) {
    daysText = 'Weekdays';
  } else if (days.length === 2 && days.includes('saturday') && days.includes('sunday')) {
    daysText = 'Weekends';
  } else {
    // Capitalize first letter of each day
    const capitalizedDays = days.map(day => day.charAt(0).toUpperCase() + day.slice(1));
    if (days.length === 1) {
      daysText = capitalizedDays[0];
    } else if (days.length === 2) {
      daysText = capitalizedDays.join(' and ');
    } else {
      daysText = capitalizedDays.slice(0, -1).join(', ') + ', and ' + capitalizedDays[capitalizedDays.length - 1];
    }
  }
  
  return `${daysText}, ${opening}:00 - ${closing}:00`;
};
