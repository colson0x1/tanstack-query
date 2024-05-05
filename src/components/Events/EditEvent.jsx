import {
  Link,
  redirect,
  useNavigate,
  useParams,
  useSubmit,
  useNavigation,
} from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { fetchEvent, updateEvent, queryClient } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const { state } = useNavigation();
  const submit = useSubmit();
  const params = useParams();

  const { data, isError, error } = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    // Make sure that the cached data is used without re-fetching it behind
    // the scenes if that data is less than 10 seconds old.
    staleTime: 10000,
  });

  /*
  const { mutate } = useMutation({
    mutationFn: updateEvent,
    // onMutate will perform optimistic update. It will be executed right when
    // we call mutate. So before this process is done, before we got back a
    // response. And its here on mutate where we wanna update the data that's
    // cached by React Query where we want to update the detail data that's
    // stored behind the scenes.
    // NOTE: React Query also passes the data which we passed to mutate
    // as a value to onMutate
    // So we automatically get that data which we did submit to the backend as
    // input here.
    onMutate: async (data) => {
      const newEvent = data.event;
      // Another thing we should typically do when performing optimistic updating
      // like here is, we should also use queryClient to cancel all active
      // queries for a specific key by passing an object to cancel queries and
      // then setting a queryKey for which we want to cancel queries.
      // this returns a promise which we want to await
      await queryClient.cancelQueries({ queryKey: ['events', params.id] });

      // If it fails on the backend, we rollback our optimistic update
      // To rollback, we need old data and store that old data somewhere
      // so that we can roll back to that old data.
      // We shuold do this before we update the data.
      // getQueryData method which gives currently stored query data
      // which we ofcourse want to execute before we set it to some new data.
      const previousEvent = queryClient.getQueryData(['events', params.id]);

      // change the cached data
      // setQueryData manipulates already stored data without waiting for response
      // Normally its manipulated by React Query whenever we got a new response
      // that's being cached. But we can also manipulate that stored data ourself
      // by calling setQueryData
      // It takes two argument. First argument is the key of the query that we
      // do want to edit.
      // The second argument then is the new data we wanna store under that
      // query key
      // So this will manipulate the data behind the scenes without waiting
      // for a response
      queryClient.setQueryData(['events', params.id], newEvent);

      return { previousEvent };
    },
    // onError fn will be executed if this update mutation errors. so if it fails
    // onError conveniently receives a couple of inputs that are passed in
    // automatically by React Query
    // it receives the error object with which it failed, the data which was
    // submitted to the mutation, and a context object
    // Its this context object which can contain this previous event.
    // In order for this previous event to be part of this context, we should
    // return an object here in this onMutate fn because it will actually be
    // that object that will be this context here
    onError: (error, data, context) => {
      // Rolling back this optimistic update if the mutation fails
      queryClient.setQueryData(['events', params.id], context.previousEvent);
    },
    // Last thing we should do when performing optimistic updating is
    // onSettled property which also wants function as a value
    // onSettled will simply be called whenver this mutation i.e (mutationFn: updateEvent)
    // is done no matter if it failed or succeeded.
    // And in that case, just to be sure that we really got the same data
    // in our frontend as we have on our backend, we should also again use the
    // queryClient to invalidate our queries.
    onSettled: () => {
      queryClient.invalidateQueries(['events', params.id]);
    },
  });
  */

  function handleSubmit(formData) {
    // mutate({ id: params.id, event: formData });
    // navigate('../');
    submit(formData, { method: 'PUT' });
  }

  function handleClose() {
    navigate('../');
  }

  let content;

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title='Failed to load event'
          message={
            error.info?.message ||
            'Failed to load event. Please to check your inputs and try again later.'
          }
        />
        <div className='form-actions'>
          <Link to='../' className='button'>
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === 'submitting' ? (
          <p>Sending data...</p>
        ) : (
          <>
            <Link to='../' className='button-text'>
              Cancel
            </Link>
            <button type='submit' className='button'>
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

// loader fn is eventually executed by React Router, it will receive an object
// which will include a params property, which gives us access to the route
// parameters of this active route.
export function loader({ params }) {
  // fetchQuery method is used to trigger a query programatically. so do it
  // ourself without using the useQuery hook.
  // fetchQuery takes the same configuration object as useQuery did.
  return queryClient.fetchQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });
}

// This action fn will be triggerd by React Router when form on this page
// is submitted
// In this action fn, we get an object passed in automatically by React Router
// that will have a request property with information about that submitted form
// in the end and params property with information about this route to which
// this form submission belongs.
// only for the non-GET method will the action fn be triggered by React Router
export async function action({ request, params }) {
  // extract formData that was submitted by awaiting
  const formData = await request.formData();
  // transform more complex formData object yielded by formData method to
  // a simple key value pair object in JS
  const updatedEventData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: updatedEventData });
  // make sure that the updated data is fetched again.
  // we should also await this because invalidateQueries also returns a promise
  await queryClient.invalidateQueries(['events']);
  return redirect('../');
}
