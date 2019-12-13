import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { BatchHttpLink } from 'apollo-link-batch-http';
import { setContext } from 'apollo-link-context';
import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from 'apollo-cache-inmemory';
import { onError } from 'apollo-link-error';
import introspectionQueryResultData from './introspection-result';

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData,
});

const httpLink = new BatchHttpLink({
  uri: '/api/graphql',
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('jwt');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${JSON.parse(token)}` : '',
    },
  };
});

const absintheAfterware = new ApolloLink((operation, forward) =>
  // @ts-ignore
  forward(operation).map(({ payload, ...result }) => ({
    ...result,
    errors: payload.errors,
    data: payload.data,
  }))
);

const errorHandler = onError(({ graphQLErrors, networkError }) => {});

export const client = new ApolloClient({
  link: authLink.concat(
    errorHandler.concat(absintheAfterware.concat(httpLink))
  ),
  cache: new InMemoryCache({
    dataIdFromObject: o => o.id,
    fragmentMatcher,
    cacheRedirects: {
      Query: {
        collection: (_, args, { getCacheKey }) =>
          getCacheKey({ __typename: 'Collection', path: args.path }),
      },
    },
  }),
  queryDeduplication: true,
});
