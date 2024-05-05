import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

import Header from '../Header.jsx';
import { fetchEvent, deleteEvent, queryClient } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { useState } from 'react';
import Modal from '../UI/Modal.jsx';

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);

  const params = useParams();
  const navigate = useNavigate();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });

  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      // in addition to navigate, we also want to invalidate our queries
      // i.e event related queries because since we deleted event. Of course,
      // all data should be marked as outdated, and React Query should be
      // forced to fetch that data again.
      // So to do that, we need queryClient
      // And we can use that queryClient to call invalidateQueries and pass
      // configuration object to invalidate queries where we set the
      // queryKey of the query that should be invalidated to just events!
      // So to an array that contains single string that says events because
      // all event related queries should be invalidated because they're all
      // affected by the fact that an event has been deleted.
      queryClient.invalidateQueries({
        queryKey: ['events'],
        // refetchType to none makes: when we call invalidateQueries, these
        // existing queries like 'events' there will not automatically be
        // triggered again immediately instead they will just be invalidated
        // and the next time they are required, they will run again. But they
        // will not be re-triggered immediately which otherwise would be the
        // default behavior.
        // And here that's what we want because this makes sure that this
        // event details query of this page (i.e individual event info page)
        // is not triggered again but if we then go back to all events page,
        // the queries on this page will be triggered again because this
        // component re-rendered again i.e this entire component and all the
        // nested components But the query on the page on which we triggered
        // the deletion (i.e individual event page), where this component for
        // this page was not rerendered will not be triggered just because
        // we called invalidateQueries
        // Now with that, if we delete event, we see that request on the
        // developer tools, we are navigated back to the starting page and
        // we see no failing request anymore!
        refetchType: 'none',
      });
      navigate('/events');
    },
  });

  function handleStartDelete() {
    setIsDeleting(true);
  }

  function handleStopDelete() {
    setIsDeleting(false);
  }

  function handleDelete() {
    mutate({ id: params.id });
  }

  let content;

  if (isPending) {
    content = (
      <div id='event-details-content' className='center'>
        <p>Fetching event data...</p>
      </div>
    );
  }

  if (isError) {
    content = (
      <div id='event-details-content' className='center'>
        <ErrorBlock
          title='Failed to load event'
          message={
            error.info?.message ||
            'Failed to fetch event data, please try again later.'
          }
        />
      </div>
    );
  }

  if (data) {
    const formattedDate = new Date(data.date).toLocaleDateString('en-us', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to='edit'>Edit</Link>
          </nav>
        </header>

        <div id='event-details-content'>
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id='event-details-info'>
            <div>
              <p id='event-details-location'>{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {formattedDate} @ {data.time}
              </time>
            </div>
            <p id='event-details-description'>{data.description}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure?</h2>
          <p>
            Do you really want to delete this event? This action cannot be
            undone.
          </p>
          <div className='form-actions'>
            {isPendingDeletion && <p>Deleting, please wait...</p>}
            {!isPendingDeletion && (
              <>
                <button onClick={handleStopDelete} className='button-text'>
                  Cancel
                </button>
                <button onClick={handleDelete} className='button'>
                  Delete
                </button>
              </>
            )}
          </div>
          {isErrorDeleting && (
            <ErrorBlock
              title='Failed to delete event'
              message={
                deleteError.info?.message ||
                'Failed to delete event, please try again later.'
              }
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to='/events' className='nav-item'>
          View all Events
        </Link>
      </Header>
      <article id='event-details'>{content}</article>
    </>
  );
}
