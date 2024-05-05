// Find out if React Query is currently fetching data anywhere in this application
import { useIsFetching } from '@tanstack/react-query';

export default function Header({ children }) {
  // we get back a value that in the end allows us to find out whether React Query
  // is fetching somewhere in the application or not.
  // fetching will be a number that's zero if React Query is not fetching any data
  // at this point in time anywhere in the application.
  // or a higher number if React Query is fetching data.
  // We can use this to conditionally show this progress element!
  const fetching = useIsFetching();

  return (
    <>
      <div id='main-header-loading'>{fetching > 0 && <progress />}</div>
      <header id='main-header'>
        <div id='header-title'>
          <h1>React Events</h1>
        </div>
        <nav>{children}</nav>
      </header>
    </>
  );
}
