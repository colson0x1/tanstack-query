import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

// We setup that property name, searchTerm by passing an object in
// findEventSection component
export async function fetchEvents({ signal, searchTerm }) {
  // `signals` make sures that the request that is begin sent is aborted if
  // React Query thinks that it should be aborted because for example we left
  // the page
  console.log(searchTerm);

  let url = 'http://localhost:3000/events';

  if (searchTerm) {
    url += '?search=' + searchTerm;
  }

  // We can use that signal and pass it to the builtin fetch fn by adding a
  // second argument to fetch, a configuration object which takes a signal
  // property and wants a signal that React Query gives it to us so that
  // the browser then can use that abort signal internally to stop this
  // request if it receives that signal
  // i.e await fetch(url, { signal: signal })
  // that request won't run if fetch receives signal from React Query
  const response = await fetch(url, { signal: signal });

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the events');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { events } = await response.json();

  return events;
}

export async function createNewEvent(eventData) {
  const response = await fetch(`http://localhost:3000/events`, {
    method: 'POST',
    body: JSON.stringify(eventData),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = new Error('An error occurred while creating the event');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { event } = await response.json();

  return event;
}

export async function fetchSelectableImages({ signal }) {
  const response = await fetch(`http://localhost:3000/events/images`, {
    signal,
  });

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the images');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { images } = await response.json();

  return images;
}
