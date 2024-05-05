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
  });

  function handleSubmit(formData) {
    mutate({ event: formData });
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
