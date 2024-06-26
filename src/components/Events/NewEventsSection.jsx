import { useQuery } from '@tanstack/react-query';

import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import EventItem from './EventItem.jsx';
import { fetchEvents } from '../../util/http.js';

export default function NewEventsSection() {
  // React Query passes some default data to the queryFn
  // Its an object that contains queryKey and signals

  // All useQuery wants is a fn (i.e queryFn) that returns a Promise
  // THat is its requirement here
  // fetchEvents will be executed by TanStack Query to fetch our data
  // When using useQuery, every fetch http request (GET) that we send in the
  // end also should have a queryKey which will then internally be used by
  // React Query i.e by TanStack Query, to cache the data that's yielded by
  // that request so that the 'response' from that request could be reused in
  // the future if we're trying to send the same request again.
  // i.e Data can be shown to the user quicker if we already have it because
  // it doesn't need to be refetched all the time
  // So that's why every query needs such a key and that key is actually an
  // array. An array of values which are then internally stored by React Query
  // such that whenever we're using a similar array or similar values, React Query
  // sees that and is able to reuse existing data.
  // We can have strings, objects, nested arrays or other kind of values
  // And now we get something back from useQuery and that is an object
  // queryObject but we can use destructuring to pull out the elements that
  // are most important to us.
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', { max: 3 }],
    // In this object which we're getting from React Query passed into this
    // queryFn, we also get the queryKey that is responsible for triggering
    // this fn in queryFn
    // hence: ...queryKey[1] is same as { max: 3 }
    queryFn: ({ signal, queryKey }) => fetchEvents({ signal, ...queryKey[1] }),
    staleTime: 5000,
    // garbage collection means cached data will be kept for x milliseconds of
    // time and later it will be removed from the memory
    // gcTime: 3000,
  });

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title='An error occurred'
        message={error.info?.message || 'Failed to fetch events.'}
      />
    );
  }

  if (data) {
    content = (
      <ul className='events-list'>
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className='content-section' id='new-events-section'>
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
