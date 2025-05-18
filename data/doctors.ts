export const defaultTimeSlots = [
    '8:00 AM', '9:30 AM', '11:00 AM',
    '1:30 PM', '3:00 PM', '4:30 PM'
  ];
  
  export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    bio: string;
    image: string;
    unavailableDates: { [date: string]: boolean };
    timeSlots: string[];
  }
  
  export const defaultDoctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Ophthalmology',
      bio: 'Specializes in cataract surgery and glaucoma treatment with 10 years of experience.',
      image: 'https://example.com/doctor1.jpg',
      unavailableDates: {
        '2023-11-15': true,
        '2023-11-20': true
      },
      timeSlots: [...defaultTimeSlots]
    },
    {
      id: '2',
      name: 'Dr. Michael Lee',
      specialty: 'Cardiology',
      bio: 'Expert in heart failure management and cardiac imaging.',
      image: 'https://example.com/doctor2.jpg',
      unavailableDates: {},
      timeSlots: [...defaultTimeSlots]
    },
  ];
  