export interface SlotInfo {
  timeSlot: string;
  slotId: number | null;
  totalCapacity: number;
  bookedCount: number;
  availableSeats: number;
  isAvailable: boolean;
  price: number;
}

export interface DateAvailability {
  date: string;
  dayOfWeek: string;
  slots: SlotInfo[];
}

export interface AvailabilityResponse {
  success: boolean;
  data: {
    experience: Experiences;
    availability: DateAvailability[];
  };
}

export interface Slot {
  id: string;
  slotNumber: string;
  isBooked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Experiences {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  imageUrl?: string | null;
  price: number;
  isActive: boolean;
  slots: Slot[];
  createdAt: Date;
  updatedAt: Date;
}

