import { Link, useNavigate } from 'react-router-dom';
// We only use useQuery to get data
// To send data i.e POST request to the backend, we would instead use
// useMutation
// useMutation is optimized for data changeing queries for example, simply by
// making sure that those request are not sent instantly when this component
// renders as it by default is the case with useQuery but here our requests
// are onyl sent when we want to send them
import { useMutation } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { createNewEvent } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { queryClient } from '../../util/http.js';

export default function NewEvent() {
  const navigate = useNavigate();

  // we can also add the mutationKey here but we don't necessarily need to do
  // this because the idea with mutation typically isn't to cache the response
  // data because they're primarily about changing something on our backend
  // not about getting and storing data in our frontend
  // Just like useQuery, useMutation returns an object too
  // mutate if a fn which we can call anywhere in this component to actually
  // send this request i.e send createNewEvent
  // Because useMutation unlike useQuery does not automatically sends this request
  // when this component here is rendered but only when we tell it to send the
  // request which we do with the help of that mutate fn
  // isPending will be true if the request is currently on its way otherwise false
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createNewEvent,
    // onSuccess is a fn that will be executed once this mutation is completed
    // i.e This also makes sure that this code, fn in onSuccess, will only
    // execute if the mutation did succeed
    onSuccess: () => {
      // invalidateQueries: It in the end, tells React Query that the data fetched
      // by certain queries is outdated now that it should be marked as stale
      // and that immediate refetch should be triggered if the query belongs
      // to the component that's currently visible on the screen.
      /* queryClient.invalidateQueries({ queryKey: ['events'], exact: true }); */
      // We should built our queryKeys such that they kind of describe the data
      // we're fetching, it makes sense to invalidate all queries that include
      // events because all those queries would otherwise be dealing with old data.
      // Now what happens is when we create new event and submit it, we see that
      // new event created instantly in the all events section since we're
      // refetching them behind the scenes immediately because we're invalidating
      // queries here
      // Here, this guarantees that all queries that use a certain key operate
      // on a recent data again!
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('/events');
    },
  });

  function handleSubmit(formData) {
    mutate({ event: formData });
    // if we directly use navigate here then we will navigate away before the
    // mutation succeeds or fails
    // So if it fails and error message should be displayed, we would never
    // see that because we instantly navigate away
    // if we do navigate inside `onSuccess` provided by React Query instead of
    // doing it here on handleSubmit, we'll stay on the screen until the
    // mutation did really succeed! So any errors would be shown to us.
  }

  return (
    <Modal onClose={() => navigate('../')}>
      <EventForm onSubmit={handleSubmit}>
        {isPending && 'Submitting...'}
        {!isPending && (
          <>
            <Link to='../' className='button-text'>
              Cancel
            </Link>
            <button type='submit' className='button'>
              Create
            </button>
          </>
        )}
      </EventForm>
      {isError && (
        <ErrorBlock
          title='Failed to create event'
          message={
            error.info?.message ||
            'Failed to create event. Please check your inputs and try again later.'
          }
        />
      )}
    </Modal>
  );
}
