
import { useQuery } from '@tanstack/react-query';


export const fetchUsers = async () => {
  const res = await fetch('/api/users');
  return res.json();
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
};


export const fetchAccounts = async () => {
  const res = await fetch('/api/accounts');
  return res.json();
};

export const useAccounts = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,
  });
};


export const fetchMemberUsers = async () => {
  const res = await fetch('/api/memberusers');
  return res.json();
};

export const useMemberUsers = () => {
  return useQuery({
    queryKey: ['memberusers'],
    queryFn: fetchMemberUsers,
  });
};


export const fetchMembershipTiers = async () => {
  const res = await fetch('/api/membershiptiers');
  return res.json();
};

export const useMembershipTiers = () => {
  return useQuery({
    queryKey: ['membershiptiers'],
    queryFn: fetchMembershipTiers,
  });
};


export const fetchTransactions = async () => {
  const res = await fetch('/api/transactions');
  return res.json();
};

export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });
};


export const fetchReservations = async () => {
  const res = await fetch('/api/reservations');
  return res.json();
};

export const useReservations = () => {
  return useQuery({
    queryKey: ['reservations'],
    queryFn: fetchReservations,
  });
};


export const fetchVenues = async () => {
  const res = await fetch('/api/venues');
  return res.json();
};

export const useVenues = () => {
  return useQuery({
    queryKey: ['venues'],
    queryFn: fetchVenues,
  });
};


export const fetchItems = async () => {
  const res = await fetch('/api/items');
  return res.json();
};

export const useItems = () => {
  return useQuery({
    queryKey: ['items'],
    queryFn: fetchItems,
  });
};


export const fetchPackages = async () => {
  const res = await fetch('/api/packages');
  return res.json();
};

export const usePackages = () => {
  return useQuery({
    queryKey: ['packages'],
    queryFn: fetchPackages,
  });
};


export const fetchGuarantors = async () => {
  const res = await fetch('/api/guarantors');
  return res.json();
};

export const useGuarantors = () => {
  return useQuery({
    queryKey: ['guarantors'],
    queryFn: fetchGuarantors,
  });
};


export const fetchAccountCreationLogs = async () => {
  const res = await fetch('/api/accountcreationlogs');
  return res.json();
};

export const useAccountCreationLogs = () => {
  return useQuery({
    queryKey: ['accountcreationlogs'],
    queryFn: fetchAccountCreationLogs,
  });
};


export const fetchRequestLogs = async () => {
  const res = await fetch('/api/requestlogs');
  return res.json();
};

export const useRequestLogs = () => {
  return useQuery({
    queryKey: ['requestlogs'],
    queryFn: fetchRequestLogs,
  });
};


export const fetchHotels = async () => {
  const res = await fetch('/api/hotels');
  return res.json();
};

export const useHotels = () => {
  return useQuery({
    queryKey: ['hotels'],
    queryFn: fetchHotels,
  });
};


export const fetchHotelFacilitys = async () => {
  const res = await fetch('/api/hotelfacilitys');
  return res.json();
};

export const useHotelFacilitys = () => {
  return useQuery({
    queryKey: ['hotelfacilitys'],
    queryFn: fetchHotelFacilitys,
  });
};


export const fetchHotelRooms = async () => {
  const res = await fetch('/api/hotelrooms');
  return res.json();
};

export const useHotelRooms = () => {
  return useQuery({
    queryKey: ['hotelrooms'],
    queryFn: fetchHotelRooms,
  });
};


export const fetchMerchandiseCategorys = async () => {
  const res = await fetch('/api/merchandisecategorys');
  return res.json();
};

export const useMerchandiseCategorys = () => {
  return useQuery({
    queryKey: ['merchandisecategorys'],
    queryFn: fetchMerchandiseCategorys,
  });
};


export const fetchMerchandiseItems = async () => {
  const res = await fetch('/api/merchandiseitems');
  return res.json();
};

export const useMerchandiseItems = () => {
  return useQuery({
    queryKey: ['merchandiseitems'],
    queryFn: fetchMerchandiseItems,
  });
};


export const fetchEvents = async () => {
  const res = await fetch('/api/events');
  return res.json();
};

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  });
};


export const fetchChatMessages = async () => {
  const res = await fetch('/api/chatmessages');
  return res.json();
};

export const useChatMessages = () => {
  return useQuery({
    queryKey: ['chatmessages'],
    queryFn: fetchChatMessages,
  });
};


export const fetchMemberProfiles = async () => {
  const res = await fetch('/api/memberprofiles');
  return res.json();
};

export const useMemberProfiles = () => {
  return useQuery({
    queryKey: ['memberprofiles'],
    queryFn: fetchMemberProfiles,
  });
};


export const fetchVenueTemplates = async () => {
  const res = await fetch('/api/venuetemplates');
  return res.json();
};

export const useVenueTemplates = () => {
  return useQuery({
    queryKey: ['venuetemplates'],
    queryFn: fetchVenueTemplates,
  });
};


export const fetchTwilioSIPRegistrations = async () => {
  const res = await fetch('/api/twiliosipregistrations');
  return res.json();
};

export const useTwilioSIPRegistrations = () => {
  return useQuery({
    queryKey: ['twiliosipregistrations'],
    queryFn: fetchTwilioSIPRegistrations,
  });
};


export const fetchChatRegistrations = async () => {
  const res = await fetch('/api/chatregistrations');
  return res.json();
};

export const useChatRegistrations = () => {
  return useQuery({
    queryKey: ['chatregistrations'],
    queryFn: fetchChatRegistrations,
  });
};


export const fetchMemberOnboardings = async () => {
  const res = await fetch('/api/memberonboardings');
  return res.json();
};

export const useMemberOnboardings = () => {
  return useQuery({
    queryKey: ['memberonboardings'],
    queryFn: fetchMemberOnboardings,
  });
};


// Helper function to handle API errors
export const handleApiError = (error: any) => {
  console.error('API Error:', error);
  throw new Error(error.message || 'Issue with the API, user requires to register for access');
};
