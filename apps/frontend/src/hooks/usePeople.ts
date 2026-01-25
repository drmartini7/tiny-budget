import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Person, CreatePersonDto } from '@fun-budget/domain';

const API_BASE = 'http://localhost:3000';

async function fetchPeople(): Promise<Person[]> {
  const response = await fetch(`${API_BASE}/people`);
  if (!response.ok) throw new Error('Failed to fetch people');
  return response.json();
}

async function createPerson(data: CreatePersonDto): Promise<Person> {
  const response = await fetch(`${API_BASE}/people`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create person');
  return response.json();
}

export function usePeople() {
  return useQuery({
    queryKey: ['people'],
    queryFn: fetchPeople,
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });
}