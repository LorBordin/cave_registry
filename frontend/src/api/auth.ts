export interface User {
  id: number;
  username: string;
  email: string;
}

export async function getMe(): Promise<User> {
  const response = await fetch('/api/v1/auth/me/', {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Not authenticated');
  }
  return response.json();
}

export async function login(username: string, password: string): Promise<User> {
  const response = await fetch('/api/v1/auth/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
    credentials: 'include',
  });

  if (response.status === 401) {
    throw new Error('Credenziali non valide. Riprova.');
  }

  if (!response.ok) {
    throw new Error('Errore durante il login');
  }

  return response.json();
}

export async function logout(): Promise<void> {
  const response = await fetch('/api/v1/auth/logout/', {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Errore durante il logout');
  }
}
