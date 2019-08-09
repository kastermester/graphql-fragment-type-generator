import * as fs from 'fs';
import { buildClientSchema, GraphQLError } from 'graphql';
import * as path from 'path';
import { getInputObjectTypes } from '../InputObjectTypePrinter';

const schema = buildClientSchema(
	JSON.parse(fs.readFileSync(path.resolve(__dirname, 'githubSchema.json'), 'utf-8')).data,
);

test('It can find all possible object types in a schema', () => {
	const inputObjects = getInputObjectTypes(schema);
	// tslint:disable
	expect(inputObjects).toMatchInlineSnapshot(`
		"export interface AddCommentInput {
		  /**
		   * The contents of the comment.
		   */
		  body: string;
		  /**
		   * A unique identifier for the client performing the mutation.
		   */
		  clientMutationId?: string | null;
		  /**
		   * The Node ID of the subject to modify.
		   */
		  subjectId: string;
		}

		export interface AddProjectCardInput {
		  /**
		   * A unique identifier for the client performing the mutation.
		   */
		  clientMutationId?: string | null;
		  /**
		   * The content of the card. Must be a member of the ProjectCardItem union
		   */
		  contentId?: string | null;
		  /**
		   * The note on the card.
		   */
		  note?: string | null;
		  /**
		   * The Node ID of the ProjectColumn.
		   */
		  projectColumnId: string;
		}

		export interface AddProjectColumnInput {
		  /**
		   * A unique identifier for the client performing the mutation.
		   */
		  clientMutationId?: string | null;
		  /**
		   * The name of the column.
		   */
		  name: string;
		  /**
		   * The Node ID of the project.
		   */
		  projectId: string;
		}

		export interface AddPullRequestReviewCommentInput {
		  /**
		   * The text of the comment.
		   */
		  body: string;
		  /**
		   * A unique identifier for the client performing the mutation.
		   */
		  clientMutationId?: string | null;
		  /**
		   * The SHA of the commit to comment on.
		   */
		  commitOID?: string | null;
		  /**
		   * The comment id to reply to.
		   */
		  inReplyTo?: string | null;
		  /**
		   * The relative path of the file to comment on.
		   */
		  path?: string | null;
		  /**
		   * The line index in the diff to comment on.
		   */
		  position?: number | null;
		  /**
		   * The Node ID of the review to modify.
		   */
		  pullRequestReviewId: string;
		}

		export interface AddPullRequestReviewInput {
		  /**
		   * The contents of the review body comment.
		   */
		  body?: string | null;
		  /**
		   * A unique identifier for the client performing the mutation.
		   */
		  clientMutationId?: string | null;
		  /**
		   * The review line comments.
		   */
		  comments?: (DraftPullRequestReviewComment | null)[] | null;
		  /**
		   * The event to perform on the pull request review.
		   */
		  event?: PullRequestReviewEvent | null;
		  /**
		   * The Node ID of the pull request to modify.
		   */
		  pullRequestId: string;
		}

		export interface AddReactionInput {
		  /**
		   * A unique identifier for the client performing the mutation.
		   */
		  clientMutationId?: string | null;
		  /**
		   * The name of the emoji to react with.
		   */
		  content: ReactionContent;
		  /**
		   * The Node ID of the subject to modify.
		   */
		  subjectId: string;
		}

		export interface CommitAuthor {
		  /**
		   * Email addresses to filter by. Commits authored by any of the specified email addresses will be returned.
		   */
		  emails?: string[] | null;
		  /**
		   * ID of a User to filter by. If non-null, only commits authored by this user will be returned. This field takes precedence over emails.
		   */
		  id?: string | null;
		}

		export interface CreateProjectInput {
		  /**
		   * The description of project.
		   */
		  body?: string | null;
		  /**
		   * A unique identifier for the client performing the mutation.
		   */
		  clientMutationId?: string | null;
		  /**
		   * The name of project.
		   */
		  name: string;
		  /**
		   * The owner ID to create the project under.
		   */
		  ownerId: string;
		}

		export interface DeleteProjectCardInput {
		  /**
		   * The id of the card to delete.
		   */
		  cardId: string;
		  /**
		   * A unique identifier for the client performing the mutation.
		   */
		  clientMutationId?: string | null;
		}

		export interface DeleteProjectColumnInput {
		  /**
		   * A unique identifier for the client performing the mutation.
		   */
		  clientMutationId?: string | null;
		  /**
		   * The id of the column to delete.
		   */
		  columnId: string;
		}

		export interface DeleteProjectInput {
		  /**
		   * A unique identifier for the client performing the mutation.
		   */
		  clientMutationId?: string | null;
		  /**
		   * The Project ID to update.
		   */
		  projectId: string;
		}

		export interface DeletePullRequestReviewInput {
		  /**
		   * A unique identifier for the client performing the mutation.
		   */
		  clientMutationId?: string | null;
		  /**
		   * The Node ID of the pull request review to delete.
		   */
		  pullRequestReviewId: string;
		}

		export interface DismissPullRequestReviewInput {
		  /**
		   * A unique identifier for the client performing the mutation.
		   */
		  clientMutationId?: string | null;
		  /**
		   * The contents of the pull request review dismissal message.
		   */
		  message: string;
		  /**
		   * The Node ID of the pull request review to modify.
		   */
		  pullRequestReviewId: string;
		}

		export interface DraftPullRequestReviewComment {
		  /**
		   * Body of the comment to leave.
		   */
		  body: string;
		  /**
		   * Path to the file being commented on.
		   */
		  path: string;
		  /**
		   * Position in the file to leave a comment on.
		   */
		  position: number;
		}

		export interface LanguageOrder {
		  /**
		   * The ordering direction.
		   */
		  direction: OrderDirection;
		  /**
		   * The field to order languages by.
		   */
		  field: LanguageOrderField;
		}

		export interface MoveProjectCardInput {
		  /**
		   * Place the new card after the card with this id. Pass null to place it at the top.
		   */
		  afterCardId?: string | null;
		  /**
		   * The id of the card to move.
		   */
		  cardId: string;
		  /**
		   * A unique identifier for the client performing the mutation.
		   */
		  clientMutationId?: string | null;
		  /**
		   * The id of the column to move it into.
		   */
		  columnId: string;
		}

		export interface MoveProjectColumnInput {
		  /**
		   * Place the new column after the column with this id. Pass null to place it at the front.
		   */
		  afterColumnId?: string | null;
		  /**
		   * A unique identifier for the client performing the mutation.
		   */
		  clientMutationId?: string | null;
		  /**
		   * The id of the column to move.
		   */
		  columnId: string;
		}

		export interface ProjectOrder {
		  /**
		   * The direction in which to order projects by the specified field.
		   */
		  direction: OrderDirection;
		  /**
		   * The field in which to order projects by.
		   */
		  field: ProjectOrderField;
		}

		export interface ReactionOrder {
		  /**
		   * The direction in which to order reactions by the specified field.
		   */
		  direction: OrderDirection;
		  /**
		   * The field in which to order reactions by.
		   */
		  field: ReactionOrderField;
		}

		export interface RemoveOutsideCollaboratorInput {
		  /**
		   * A unique identifier for the client performing the mutation.
		   */
		  clientMutationId?: string | null;
		  /**
		   * The ID of the organization to remove the outside collaborator from.
		   */
		  organizationId: string;
		  /**
		   * The ID of the outside collaborator to remove.
		   */
		  userId: string;
		}

		export interface RemoveReactionInput {
		  /**
		   * A unique identifier for the client performing the mutation.
		   */
		  clientMutationId?: string | null;
		  /**
		   * The name of the emoji to react with.
		   */
		  content: ReactionContent;
		  /**
		   * The Node ID of the subject to modify.
		   */
		  subjectId: string;
		}

		export interface RepositoryOrder {
		  /**
		   * The ordering direction.
		   */
		  direction: OrderDirection;
		  /**
		   * The field to order repositories by.
		   */
		  field: RepositoryOrderField;
		}

		export interface RequestReviewsInput {
		  /**
		   * A unique identifier for the client performing the mutation.
		   */
		  clientMutationId?: string | null;
		  /**
		   * The Node ID of the pull request to modify.
		   */
		  pullRequestId: string;
		  /**
		   * Add users to the set rather than replace.
		   */
		  union?: boolean | null;
		  /**
		   * The Node IDs of the users to request.
		   */
		  userIds: string[];
		}

		export interface StarOrder {
		  /**
		   * The direction in which to order nodes.
		   */
		  direction: OrderDirection;
		  /**
		   * The field in which to order nodes by.
		   */
		  field: StarOrderField;
		}

		export interface SubmitPullRequestReviewInput {
		  /**
		   * The text field to set on the Pull Request Review.
		   */
		  body?: string | null;
		  /**
		   * A unique identifier for the client performing the mutation.
		   */
		  clientMutationId?: string | null;
		  /**
		   * The event to send to the Pull Request Review.
		   */
		  event: PullRequestReviewEvent;
		  /**
		   * The Pull Request Review ID to submit.
		   */
		  pullRequestReviewId: string;
		}

		export interface UpdateProjectCardInput {
		  /**
		   * A unique identifier for the client performing the mutation.
		   */
		  clientMutationId?: string | null;
		  /**
		   * The note of ProjectCard.
		   */
		  note: string;
		  /**
		   * The ProjectCard ID to update.
		   */
		  projectCardId: string;
		}

		export interface UpdateProjectColumnInput {
		  /**
		   * A unique identifier for the client performing the mutation.
		   */
		  clientMutationId?: string | null;
		  /**
		   * The name of project column.
		   */
		  name: string;
		  /**
		   * The ProjectColumn ID to update.
		   */
		  projectColumnId: string;
		}

		export interface UpdateProjectInput {
		  /**
		   * The description of project.
		   */
		  body?: string | null;
		  /**
		   * A unique identifier for the client performing the mutation.
		   */
		  clientMutationId?: string | null;
		  /**
		   * The name of project.
		   */
		  name: string;
		  /**
		   * The Project ID to update.
		   */
		  projectId: string;
		}

		export interface UpdatePullRequestReviewCommentInput {
		  /**
		   * The text of the comment.
		   */
		  body: string;
		  /**
		   * A unique identifier for the client performing the mutation.
		   */
		  clientMutationId?: string | null;
		  /**
		   * The Node ID of the comment to modify.
		   */
		  pullRequestReviewCommentId: string;
		}

		export interface UpdatePullRequestReviewInput {
		  /**
		   * The contents of the pull request review body.
		   */
		  body: string;
		  /**
		   * A unique identifier for the client performing the mutation.
		   */
		  clientMutationId?: string | null;
		  /**
		   * The Node ID of the pull request review to modify.
		   */
		  pullRequestReviewId: string;
		}

		export interface UpdateSubscriptionInput {
		  /**
		   * A unique identifier for the client performing the mutation.
		   */
		  clientMutationId?: string | null;
		  /**
		   * The new state of the subscription.
		   */
		  state: SubscriptionState;
		  /**
		   * The Node ID of the subscribable object to modify.
		   */
		  subscribableId: string;
		}

		export type CommentCannotEditReason = \\"INSUFFICIENT_ACCESS\\" | \\"LOCKED\\" | \\"LOGIN_REQUIRED\\" | \\"MAINTENANCE\\" | \\"VERIFIED_EMAIL_REQUIRED\\";

		export type DefaultRepositoryPermissionField = \\"READ\\" | \\"WRITE\\" | \\"ADMIN\\";

		export type DeploymentState = \\"PENDING\\" | \\"SUCCESS\\" | \\"FAILURE\\" | \\"INACTIVE\\" | \\"ERROR\\";

		export type GistVisibility = \\"PUBLIC\\" | \\"SECRET\\" | \\"ALL\\";

		export type GitSignatureState = \\"VALID\\" | \\"INVALID\\" | \\"MALFORMED_SIG\\" | \\"UNKNOWN_KEY\\" | \\"BAD_EMAIL\\" | \\"UNVERIFIED_EMAIL\\" | \\"NO_USER\\" | \\"UNKNOWN_SIG_TYPE\\" | \\"UNSIGNED\\" | \\"GPGVERIFY_UNAVAILABLE\\" | \\"GPGVERIFY_ERROR\\" | \\"NOT_SIGNING_KEY\\" | \\"EXPIRED_KEY\\";

		export type IssueEventType = \\"ASSIGNED\\" | \\"BASE_REF_FORCE_PUSHED\\" | \\"CLOSED\\" | \\"DEMILESTONED\\" | \\"DEPLOYED\\" | \\"HEAD_REF_DELETED\\" | \\"HEAD_REF_FORCE_PUSHED\\" | \\"HEAD_REF_RESTORED\\" | \\"LABELED\\" | \\"LOCKED\\" | \\"MENTIONED\\" | \\"MERGED\\" | \\"MILESTONED\\" | \\"REFERENCED\\" | \\"RENAMED\\" | \\"REOPENED\\" | \\"REVIEW_REQUESTED\\" | \\"REVIEW_REQUEST_REMOVED\\" | \\"REVIEW_DISMISSED\\" | \\"SUBSCRIBED\\" | \\"UNASSIGNED\\" | \\"UNLABELED\\" | \\"UNLOCKED\\" | \\"UNSUBSCRIBED\\";

		export type IssuePubSubTopic = \\"UPDATED\\" | \\"MARKASREAD\\";

		export type IssueState = \\"OPEN\\" | \\"CLOSED\\";

		export type LanguageOrderField = \\"SIZE\\";

		export type MilestoneState = \\"OPEN\\" | \\"CLOSED\\";

		export type OrderDirection = \\"ASC\\" | \\"DESC\\";

		export type OrganizationInvitationRole = \\"DIRECT_MEMBER\\" | \\"ADMIN\\" | \\"BILLING_MANAGER\\" | \\"HIRING_MANAGER\\" | \\"REINSTATE\\";

		export type ProjectCardState = \\"CONTENT_ONLY\\" | \\"NOTE_ONLY\\" | \\"REDACTED\\";

		export type ProjectOrderField = \\"CREATED_AT\\" | \\"UPDATED_AT\\" | \\"NAME\\";

		export type PullRequestPubSubTopic = \\"UPDATED\\" | \\"MARKASREAD\\";

		export type PullRequestReviewEvent = \\"COMMENT\\" | \\"APPROVE\\" | \\"REQUEST_CHANGES\\" | \\"DISMISS\\";

		export type PullRequestReviewState = \\"PENDING\\" | \\"COMMENTED\\" | \\"APPROVED\\" | \\"CHANGES_REQUESTED\\" | \\"DISMISSED\\";

		export type PullRequestState = \\"OPEN\\" | \\"CLOSED\\" | \\"MERGED\\";

		export type ReactionContent = \\"THUMBS_UP\\" | \\"THUMBS_DOWN\\" | \\"LAUGH\\" | \\"HOORAY\\" | \\"CONFUSED\\" | \\"HEART\\";

		export type ReactionOrderField = \\"CREATED_AT\\";

		export type RepositoryCollaboratorAffiliation = \\"ALL\\" | \\"OUTSIDE\\";

		export type RepositoryLockReason = \\"MOVING\\" | \\"BILLING\\" | \\"RENAME\\" | \\"MIGRATING\\";

		export type RepositoryOrderField = \\"CREATED_AT\\" | \\"UPDATED_AT\\" | \\"PUSHED_AT\\" | \\"NAME\\";

		export type RepositoryPrivacy = \\"PUBLIC\\" | \\"PRIVATE\\";

		export type SearchType = \\"ISSUE\\" | \\"REPOSITORY\\" | \\"USER\\";

		export type StarOrderField = \\"STARRED_AT\\";

		export type StatusState = \\"EXPECTED\\" | \\"ERROR\\" | \\"FAILURE\\" | \\"PENDING\\" | \\"SUCCESS\\";

		export type SubscriptionState = \\"UNSUBSCRIBED\\" | \\"SUBSCRIBED\\" | \\"IGNORED\\";

		export type TeamPrivacy = \\"SECRET\\" | \\"VISIBLE\\";"
  `);
	// tslint:enable
});
