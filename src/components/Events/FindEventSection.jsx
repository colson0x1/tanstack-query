import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { fetchEvents } from '../../util/http';
import LoadingIndicator from '../UI/LoadingIndicator';
import ErrorBlock from '../UI/ErrorBlock';
import EventItem from './EventItem';

export default function FindEventSection() {
  const searchElement = useRef();
  const [searchTerm, setSearchTerm] = useState();

  // make sure both fetchEvents and queryKey are updated dynamically and lead
  // to different query being sent as this search term changes
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['events', { search: searchTerm }],
    // wrapping fetchEvents with anonymous fn and passing an object to
    // fetch events and setting a property name searchTerm in this object
    // Now to also forward the signal there, we can simply accept the object
    // in this anonymous fn because that's now the fn that will actually be
    // called by React Query i.e queryFn
    // And therefore, we get the signal here
    // And we can then simply set it as a key value pair in this object here as well
    queryFn: ({ signal }) => fetchEvents({ signal, searchTerm }),
    // setting enabled to false won't send the request if no search term was entered
    enabled: searchTerm !== undefined,
  });

  function handleSubmit(event) {
    event.preventDefault();
    setSearchTerm(searchElement.current.value);
  }

  let content = <p>Please enter a search term and to find events.</p>;

  if (isLoading) {
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
    <section className='content-section' id='all-events-section'>
      <header>
        <h2>Find your next event!</h2>
        <form onSubmit={handleSubmit} id='search-form'>
          <input
            type='search'
            placeholder='Search events'
            ref={searchElement}
          />
          <button>Search</button>
        </form>
      </header>
      {content}
    </section>
  );
}
