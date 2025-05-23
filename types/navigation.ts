export type AdminStackParamList = {
  AdminTabs: undefined;
  AdminDashboard: undefined;
  AdAppointments: undefined;
  AdDoctors: undefined;
  AdPatients: undefined;
  AdminProfile: undefined;
  Login: undefined;
  Notifications: {
    notifications: Notification[];
    markAllAsRead: () => void;
  };
};


export type Notification = {
  id: string;
  message: string;
  timestamp: string;
  read?: boolean;
};


export type RootStackParamList = {
  Login: undefined;
  AdminProfile: undefined;
  AdminDashboard: undefined;


  // Add more screens here if needed
};
