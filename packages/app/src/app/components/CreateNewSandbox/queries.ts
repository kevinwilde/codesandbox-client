import gql from 'graphql-tag';
import { client } from 'app/graphql/client';
import immer from 'immer';
import {
  addSandboxesToFolder,
  PATHED_SANDBOXES_CONTENT_QUERY,
} from 'app/pages/Dashboard/queries';
import {
  UnmakeSandboxesTemplateMutation,
  UnmakeSandboxesTemplateMutationVariables,
  ListTemplatesQueryVariables,
  ListTemplatesQuery,
  PathedSandboxesQuery,
  PathedSandboxesFoldersQueryVariables,
} from 'app/graphql/types';

const TEMPLATE_FRAGMENT = gql`
  fragment Template on Template {
    id
    color
    iconUrl
    published
    sandbox {
      id
      alias
      title
      description
      insertedAt
      updatedAt

      author {
        username
      }

      source {
        template
      }
    }
  }
`;

export const LIST_PERSONAL_TEMPLATES = gql`
  query ListPersonalTemplates {
    me {
      templates {
        ...Template
      }

      recentlyUsedTemplates {
        ...Template

        sandbox {
          git {
            id
            username
            commitSha
            path
            repo
            branch
          }
        }
      }

      bookmarkedTemplates {
        ...Template
      }

      teams {
        id
        name
        bookmarkedTemplates {
          ...Template
        }
        templates {
          ...Template
        }
      }
    }
  }

  ${TEMPLATE_FRAGMENT}
`;

export const LIST_OWNED_TEMPLATES = gql`
  query ListTemplates($teamId: ID, $showAll: Boolean) {
    me {
      templates(teamId: $teamId, showAll: $showAll) {
        ...Template
      }

      teams {
        name
        templates {
          ...Template
        }
      }
    }
  }

  ${TEMPLATE_FRAGMENT}
`;

export const LIST_BOOKMARKED_TEMPLATES_QUERY = gql`
  query ListPersonalBookmarkedTemplates {
    me {
      teams {
        id
        name
        bookmarkedTemplates {
          ...Template
        }
      }
      bookmarkedTemplates {
        ...Template
      }
    }
  }

  ${TEMPLATE_FRAGMENT}
`;

export const MAKE_SANDBOXES_TEMPLATE_MUTATION = gql`
  mutation MakeSandboxesTemplate($sandboxIds: [ID]!) {
    makeSandboxesTemplates(sandboxIds: $sandboxIds) {
      id
    }
  }
`;

export const UNMAKE_SANDBOXES_TEMPLATE_MUTATION = gql`
  mutation UnmakeSandboxesTemplate($sandboxIds: [ID]!) {
    unmakeSandboxesTemplates(sandboxIds: $sandboxIds) {
      id
    }
  }
`;

export function unmakeTemplates(selectedSandboxes: string[], teamId?: string) {
  return client.mutate<
    UnmakeSandboxesTemplateMutation,
    UnmakeSandboxesTemplateMutationVariables
  >({
    mutation: UNMAKE_SANDBOXES_TEMPLATE_MUTATION,
    variables: {
      sandboxIds: selectedSandboxes,
    },
    refetchQueries: [
      'DeletedSandboxes',
      'PathedSandboxes',
      'RecentSandboxes',
      'SearchSandboxes',
      'ListTemplates',
    ],
    update: cache => {
      try {
        const variables: ListTemplatesQueryVariables = {
          teamId,
          showAll: false,
        };

        const oldTemplatesCache = cache.readQuery<
          ListTemplatesQuery,
          ListTemplatesQueryVariables
        >({
          query: LIST_OWNED_TEMPLATES,
          variables,
        });

        const data = immer(oldTemplatesCache, draft => {
          draft.me.templates = draft.me.templates.filter(
            x => selectedSandboxes.indexOf(x.sandbox.id) === -1
          );
        });

        cache.writeQuery<ListTemplatesQuery, ListTemplatesQueryVariables>({
          query: LIST_OWNED_TEMPLATES,
          variables,
          data,
        });
      } catch (e) {
        // cache doesn't exist, no biggie!
      }
    },
  });
}

export function makeTemplates(
  selectedSandboxes: string[],
  teamId?: string,
  collections?: { teamId: string | null }[]
) {
  const unpackedSelectedSandboxes: string[] =
    // @ts-ignore
    typeof selectedSandboxes.toJS === 'function'
      ? (selectedSandboxes as any).toJS()
      : selectedSandboxes;
  return Promise.all([
    addSandboxesToFolder(unpackedSelectedSandboxes, '/', teamId),
    client
      .mutate({
        mutation: MAKE_SANDBOXES_TEMPLATE_MUTATION,
        variables: {
          sandboxIds: unpackedSelectedSandboxes,
        },
        refetchQueries: [
          'DeletedSandboxes',
          'PathedSandboxes',
          'RecentSandboxes',
          'SearchSandboxes',
          'ListTemplates',
        ],
        update: cache => {
          if (collections) {
            collections.forEach(variables => {
              try {
                const oldFolderCacheData = cache.readQuery<
                  PathedSandboxesQuery,
                  PathedSandboxesFoldersQueryVariables
                >({
                  query: PATHED_SANDBOXES_CONTENT_QUERY,
                  variables,
                });

                const data = immer(oldFolderCacheData, draft => {
                  draft.me.collection.sandboxes = oldFolderCacheData.me.collection.sandboxes.filter(
                    x => selectedSandboxes.indexOf(x.id) === -1
                  );
                });

                cache.writeQuery({
                  query: PATHED_SANDBOXES_CONTENT_QUERY,
                  variables,
                  data,
                });
              } catch (e) {
                // cache doesn't exist, no biggie!
              }
            });
          }
        },
      })
      .then(() => {}),
  ]);
}
