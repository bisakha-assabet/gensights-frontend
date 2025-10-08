
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://pratigya.gensights:8000/api/v1';

export const getCsrfToken = async () => {
  const response = await fetch(`${API_BASE_URL}/csrf/`, {
    credentials: 'include',
  });
  return await response.json();
};

export const loginUser = async (email: string, password: string, otp: string, deviceUuid: string) => {
  const { csrfToken } = await getCsrfToken();
  
  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,  
      'Origin': window.location.origin,
      'Device': deviceUuid,
    },
    credentials: 'include', 
    body: JSON.stringify({ 
      email, 
      password, 
      otp,
      device_uuid: deviceUuid 
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Login failed');
  }

  return await response.json();
};

// Utility function to get device UUID
export const getDeviceUuid = () => {
  if (typeof window !== 'undefined') {
    const storedUuid = localStorage.getItem('deviceUuid');
    if (storedUuid) return storedUuid;
    
    const newUuid = crypto.randomUUID();
    localStorage.setItem('deviceUuid', newUuid);
    return newUuid;
  }
  return crypto.randomUUID();
};
