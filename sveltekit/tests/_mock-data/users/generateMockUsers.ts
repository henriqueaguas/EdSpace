import { v4 as generateUUID } from "uuid";
import { BaseMockUsers } from "./baseUsers";
import { pickRandom } from "../../utils";

type IntermediateUser =
  & SafeOmit<
    tuser.UserPrivateStats,
    | "id"
    | "emailVerified"
    | "created_at"
    | "name_updated_at"
    | "image_updated_at"
  >
  & {
    emailVerified: string;
    created_at: string;
    name_updated_at: string;
    image_updated_at: string;
  };

export async function generateMockUsers() {
  const baseUsers: IntermediateUser[] = BaseMockUsers;

  console.log("Generating " + baseUsers.length + " users")

  await Promise.all([
    getImageLinks().then(imageLinks =>
      baseUsers.forEach(u => u.image = pickRandom(imageLinks))
    ),

    fetch(
      `https://randomuser.me/api?inc=name&results=${baseUsers.length}`,
    )
      .then((r) => r.json()).then((r) => {
        let i = 0;
        r.results.forEach((u: any) => {
          baseUsers[i++].name = `${u.name.first} ${u.name.last}`
        })
      })
  ])

  return baseUsers.map((u) => ({
    ...u,
    id: generateUUID(),
    emailVerified: dateStringToDate(u.emailVerified),
    created_at: dateStringToDate(u.created_at),
    name_updated_at: dateStringToDate(u.name_updated_at),
    image_updated_at: dateStringToDate(u.image_updated_at),
  })) satisfies tuser.User[];
}

// Utils

export function dateStringToDate(dateString: string): Date {
  const dateParts = dateString.split("/");
  const year = parseInt(dateParts[2], 10);
  const month = parseInt(dateParts[0], 10) - 1;
  const day = parseInt(dateParts[1], 10);
  const date = new Date(year, month, day);
  return date;
}

async function getImageLinks(): Promise<string[]> {
  const imageLinks: string[] = []

  for (const username of ["kumarsconcern", "rafe"]) {
    imageLinks.push(
      ...(await fetch("https://medium.com/_/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Graphql-Operation": "UserFollowingUsersList"
        },
        body: JSON.stringify(
          [
            {
              "operationName": "UserFollowingUsersList",
              "variables": {
                "id": null,
                "username": username,
                "paging": {
                  "from": null,
                  "limit": 25
                }
              },
              "query": "query UserFollowingUsersList($username: ID, $id: ID, $paging: PagingOptions) {\n  userResult(username: $username, id: $id) {\n    __typename\n    ... on User {\n      id\n      followingUserConnection(paging: $paging) {\n        pagingInfo {\n          next {\n            from\n            limit\n            __typename\n          }\n          __typename\n        }\n        users {\n          ...FollowList_publisher\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n  }\n}\n\nfragment FollowList_publisher on Publisher {\n  id\n  ... on Collection {\n    ...PublicationFollowRow_collection\n    __typename\n    id\n  }\n  ... on User {\n    ...UserFollowRow_user\n    __typename\n    id\n  }\n  __typename\n}\n\nfragment PublicationFollowRow_collection on Collection {\n  id\n  name\n  description\n  ...CollectionAvatar_collection\n  ...CollectionFollowButton_collection\n  __typename\n}\n\nfragment CollectionAvatar_collection on Collection {\n  name\n  avatar {\n    id\n    __typename\n  }\n  ...collectionUrl_collection\n  __typename\n  id\n}\n\nfragment collectionUrl_collection on Collection {\n  id\n  domain\n  slug\n  __typename\n}\n\nfragment CollectionFollowButton_collection on Collection {\n  __typename\n  id\n  name\n  slug\n  ...collectionUrl_collection\n  ...SusiClickable_collection\n}\n\nfragment SusiClickable_collection on Collection {\n  ...SusiContainer_collection\n  __typename\n  id\n}\n\nfragment SusiContainer_collection on Collection {\n  name\n  ...SignInOptions_collection\n  ...SignUpOptions_collection\n  __typename\n  id\n}\n\nfragment SignInOptions_collection on Collection {\n  id\n  name\n  __typename\n}\n\nfragment SignUpOptions_collection on Collection {\n  id\n  name\n  __typename\n}\n\nfragment UserFollowRow_user on User {\n  id\n  name\n  bio\n  ...UserAvatar_user\n  ...UserFollowButton_user\n  ...useIsVerifiedBookAuthor_user\n  __typename\n}\n\nfragment UserAvatar_user on User {\n  __typename\n  id\n  imageId\n  mediumMemberAt\n  name\n  username\n  ...userUrl_user\n}\n\nfragment userUrl_user on User {\n  __typename\n  id\n  customDomainState {\n    live {\n      domain\n      __typename\n    }\n    __typename\n  }\n  hasSubdomain\n  username\n}\n\nfragment UserFollowButton_user on User {\n  ...UserFollowButtonSignedIn_user\n  ...UserFollowButtonSignedOut_user\n  __typename\n  id\n}\n\nfragment UserFollowButtonSignedIn_user on User {\n  id\n  name\n  __typename\n}\n\nfragment UserFollowButtonSignedOut_user on User {\n  id\n  ...SusiClickable_user\n  __typename\n}\n\nfragment SusiClickable_user on User {\n  ...SusiContainer_user\n  __typename\n  id\n}\n\nfragment SusiContainer_user on User {\n  ...SignInOptions_user\n  ...SignUpOptions_user\n  __typename\n  id\n}\n\nfragment SignInOptions_user on User {\n  id\n  name\n  __typename\n}\n\nfragment SignUpOptions_user on User {\n  id\n  name\n  __typename\n}\n\nfragment useIsVerifiedBookAuthor_user on User {\n  verifications {\n    isBookAuthor\n    __typename\n  }\n  __typename\n  id\n}\n"
            }
          ]
        )
      }).then(r => r.json())
        .then(d => d[0].data.userResult.followingUserConnection.users.map((u: any) => u.imageId))
        .then(imageIds => imageIds.map((iid: string) => `https://miro.medium.com/v2/resize:fill:96:96/${iid}`)))
    )
  }

  return imageLinks
}
