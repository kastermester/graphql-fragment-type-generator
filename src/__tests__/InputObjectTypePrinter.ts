import * as fs from 'fs';
import { buildClientSchema, GraphQLError } from 'graphql';
import * as path from 'path';
import { getInputObjectTypes } from '../InputObjectTypePrinter';

const schema = buildClientSchema(
	JSON.parse(fs.readFileSync(path.resolve(__dirname, 'githubSchema.json'), 'utf-8')).data,
);

test('It can find all possible object types in a schema', () => {
	const inputObjects = getInputObjectTypes(schema);
	expect(inputObjects).toEqual(
		// tslint:disable:max-line-length
		`export interface AddCommentInput {
  body: string;
  clientMutationId?: string | null;
  subjectId: string;
}

export interface AddProjectCardInput {
  clientMutationId?: string | null;
  contentId?: string | null;
  note?: string | null;
  projectColumnId: string;
}

export interface AddProjectColumnInput {
  clientMutationId?: string | null;
  name: string;
  projectId: string;
}

export interface AddPullRequestReviewCommentInput {
  body: string;
  clientMutationId?: string | null;
  commitOID?: string | null;
  inReplyTo?: string | null;
  path?: string | null;
  position?: number | null;
  pullRequestReviewId: string;
}

export interface AddPullRequestReviewInput {
  body?: string | null;
  clientMutationId?: string | null;
  comments?: (DraftPullRequestReviewComment | null)[] | null;
  event?: PullRequestReviewEvent | null;
  pullRequestId: string;
}

export interface AddReactionInput {
  clientMutationId?: string | null;
  content: ReactionContent;
  subjectId: string;
}

export interface CommitAuthor {
  emails?: string[] | null;
  id?: string | null;
}

export interface CreateProjectInput {
  body?: string | null;
  clientMutationId?: string | null;
  name: string;
  ownerId: string;
}

export interface DeleteProjectCardInput {
  cardId: string;
  clientMutationId?: string | null;
}

export interface DeleteProjectColumnInput {
  clientMutationId?: string | null;
  columnId: string;
}

export interface DeleteProjectInput {
  clientMutationId?: string | null;
  projectId: string;
}

export interface DeletePullRequestReviewInput {
  clientMutationId?: string | null;
  pullRequestReviewId: string;
}

export interface DismissPullRequestReviewInput {
  clientMutationId?: string | null;
  message: string;
  pullRequestReviewId: string;
}

export interface DraftPullRequestReviewComment {
  body: string;
  path: string;
  position: number;
}

export interface LanguageOrder {
  direction: OrderDirection;
  field: LanguageOrderField;
}

export interface MoveProjectCardInput {
  afterCardId?: string | null;
  cardId: string;
  clientMutationId?: string | null;
  columnId: string;
}

export interface MoveProjectColumnInput {
  afterColumnId?: string | null;
  clientMutationId?: string | null;
  columnId: string;
}

export interface ProjectOrder {
  direction: OrderDirection;
  field: ProjectOrderField;
}

export interface ReactionOrder {
  direction: OrderDirection;
  field: ReactionOrderField;
}

export interface RemoveOutsideCollaboratorInput {
  clientMutationId?: string | null;
  organizationId: string;
  userId: string;
}

export interface RemoveReactionInput {
  clientMutationId?: string | null;
  content: ReactionContent;
  subjectId: string;
}

export interface RepositoryOrder {
  direction: OrderDirection;
  field: RepositoryOrderField;
}

export interface RequestReviewsInput {
  clientMutationId?: string | null;
  pullRequestId: string;
  union?: boolean | null;
  userIds: string[];
}

export interface StarOrder {
  direction: OrderDirection;
  field: StarOrderField;
}

export interface SubmitPullRequestReviewInput {
  body?: string | null;
  clientMutationId?: string | null;
  event: PullRequestReviewEvent;
  pullRequestReviewId: string;
}

export interface UpdateProjectCardInput {
  clientMutationId?: string | null;
  note: string;
  projectCardId: string;
}

export interface UpdateProjectColumnInput {
  clientMutationId?: string | null;
  name: string;
  projectColumnId: string;
}

export interface UpdateProjectInput {
  body?: string | null;
  clientMutationId?: string | null;
  name: string;
  projectId: string;
}

export interface UpdatePullRequestReviewCommentInput {
  body: string;
  clientMutationId?: string | null;
  pullRequestReviewCommentId: string;
}

export interface UpdatePullRequestReviewInput {
  body: string;
  clientMutationId?: string | null;
  pullRequestReviewId: string;
}

export interface UpdateSubscriptionInput {
  clientMutationId?: string | null;
  state: SubscriptionState;
  subscribableId: string;
}

export type CommentCannotEditReason = "INSUFFICIENT_ACCESS" | "LOCKED" | "LOGIN_REQUIRED" | "MAINTENANCE" | "VERIFIED_EMAIL_REQUIRED";

export type DefaultRepositoryPermissionField = "READ" | "WRITE" | "ADMIN";

export type DeploymentState = "PENDING" | "SUCCESS" | "FAILURE" | "INACTIVE" | "ERROR";

export type GistVisibility = "PUBLIC" | "SECRET" | "ALL";

export type GitSignatureState = "VALID" | "INVALID" | "MALFORMED_SIG" | "UNKNOWN_KEY" | "BAD_EMAIL" | "UNVERIFIED_EMAIL" | "NO_USER" | "UNKNOWN_SIG_TYPE" | "UNSIGNED" | "GPGVERIFY_UNAVAILABLE" | "GPGVERIFY_ERROR" | "NOT_SIGNING_KEY" | "EXPIRED_KEY";

export type IssueEventType = "ASSIGNED" | "BASE_REF_FORCE_PUSHED" | "CLOSED" | "DEMILESTONED" | "DEPLOYED" | "HEAD_REF_DELETED" | "HEAD_REF_FORCE_PUSHED" | "HEAD_REF_RESTORED" | "LABELED" | "LOCKED" | "MENTIONED" | "MERGED" | "MILESTONED" | "REFERENCED" | "RENAMED" | "REOPENED" | "REVIEW_REQUESTED" | "REVIEW_REQUEST_REMOVED" | "REVIEW_DISMISSED" | "SUBSCRIBED" | "UNASSIGNED" | "UNLABELED" | "UNLOCKED" | "UNSUBSCRIBED";

export type IssuePubSubTopic = "UPDATED" | "MARKASREAD";

export type IssueState = "OPEN" | "CLOSED";

export type LanguageOrderField = "SIZE";

export type MilestoneState = "OPEN" | "CLOSED";

export type OrderDirection = "ASC" | "DESC";

export type OrganizationInvitationRole = "DIRECT_MEMBER" | "ADMIN" | "BILLING_MANAGER" | "HIRING_MANAGER" | "REINSTATE";

export type ProjectCardState = "CONTENT_ONLY" | "NOTE_ONLY" | "REDACTED";

export type ProjectOrderField = "CREATED_AT" | "UPDATED_AT" | "NAME";

export type PullRequestPubSubTopic = "UPDATED" | "MARKASREAD";

export type PullRequestReviewEvent = "COMMENT" | "APPROVE" | "REQUEST_CHANGES" | "DISMISS";

export type PullRequestReviewState = "PENDING" | "COMMENTED" | "APPROVED" | "CHANGES_REQUESTED" | "DISMISSED";

export type PullRequestState = "OPEN" | "CLOSED" | "MERGED";

export type ReactionContent = "THUMBS_UP" | "THUMBS_DOWN" | "LAUGH" | "HOORAY" | "CONFUSED" | "HEART";

export type ReactionOrderField = "CREATED_AT";

export type RepositoryCollaboratorAffiliation = "ALL" | "OUTSIDE";

export type RepositoryLockReason = "MOVING" | "BILLING" | "RENAME" | "MIGRATING";

export type RepositoryOrderField = "CREATED_AT" | "UPDATED_AT" | "PUSHED_AT" | "NAME";

export type RepositoryPrivacy = "PUBLIC" | "PRIVATE";

export type SearchType = "ISSUE" | "REPOSITORY" | "USER";

export type StarOrderField = "STARRED_AT";

export type StatusState = "EXPECTED" | "ERROR" | "FAILURE" | "PENDING" | "SUCCESS";

export type SubscriptionState = "UNSUBSCRIBED" | "SUBSCRIBED" | "IGNORED";

export type TeamPrivacy = "SECRET" | "VISIBLE";`,
		// tslint:enable:max-line-length
	);
});
