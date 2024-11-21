import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { GRAPHQL_URL } from './constants';

const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: GRAPHQL_URL,
    fetch,
  }),
  cache: new InMemoryCache(),
});

export default apolloClient;
