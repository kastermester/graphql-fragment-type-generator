import * as fs from 'fs';
import { buildClientSchema, GraphQLError } from 'graphql';
import * as path from 'path';
import { getTypeBrands } from '../TypeBrandCreator';

const schema = buildClientSchema(
	JSON.parse(fs.readFileSync(path.resolve(__dirname, 'githubSchema.json'), 'utf-8')).data,
);

test('It can find all possible object types in a schema', () => {
	const brands = getTypeBrands(schema);

	expect(brands).toMatchInlineSnapshot(`
		"export enum AddCommentPayload {};
		export enum AddProjectCardPayload {};
		export enum AddProjectColumnPayload {};
		export enum AddPullRequestReviewCommentPayload {};
		export enum AddPullRequestReviewPayload {};
		export enum AddReactionPayload {};
		export enum AssignedEvent {};
		export enum BaseRefForcePushedEvent {};
		export enum Blame {};
		export enum BlameRange {};
		export enum Blob {};
		export enum ClosedEvent {};
		export enum Commit {};
		export enum CommitComment {};
		export enum CommitCommentConnection {};
		export enum CommitCommentEdge {};
		export enum CommitConnection {};
		export enum CommitEdge {};
		export enum CommitHistoryConnection {};
		export enum CreateProjectPayload {};
		export enum DeleteProjectCardPayload {};
		export enum DeleteProjectColumnPayload {};
		export enum DeleteProjectPayload {};
		export enum DeletePullRequestReviewPayload {};
		export enum DemilestonedEvent {};
		export enum DeployedEvent {};
		export enum Deployment {};
		export enum DeploymentStatus {};
		export enum DeploymentStatusConnection {};
		export enum DeploymentStatusEdge {};
		export enum DismissPullRequestReviewPayload {};
		export enum Gist {};
		export enum GistComment {};
		export enum GistConnection {};
		export enum GistEdge {};
		export enum GitActor {};
		export enum GpgSignature {};
		export enum HeadRefDeletedEvent {};
		export enum HeadRefForcePushedEvent {};
		export enum HeadRefRestoredEvent {};
		export enum Issue {};
		export enum IssueComment {};
		export enum IssueCommentConnection {};
		export enum IssueCommentEdge {};
		export enum IssueConnection {};
		export enum IssueEdge {};
		export enum IssueTimelineConnection {};
		export enum IssueTimelineItemEdge {};
		export enum Label {};
		export enum LabelConnection {};
		export enum LabelEdge {};
		export enum LabeledEvent {};
		export enum Language {};
		export enum LanguageConnection {};
		export enum LanguageEdge {};
		export enum LockedEvent {};
		export enum MentionedEvent {};
		export enum MergedEvent {};
		export enum Milestone {};
		export enum MilestoneConnection {};
		export enum MilestoneEdge {};
		export enum MilestonedEvent {};
		export enum MoveProjectCardPayload {};
		export enum MoveProjectColumnPayload {};
		export enum Organization {};
		export enum OrganizationConnection {};
		export enum OrganizationEdge {};
		export enum OrganizationInvitation {};
		export enum OrganizationInvitationConnection {};
		export enum OrganizationInvitationEdge {};
		export enum PageInfo {};
		export enum Project {};
		export enum ProjectCard {};
		export enum ProjectCardConnection {};
		export enum ProjectCardEdge {};
		export enum ProjectColumn {};
		export enum ProjectColumnConnection {};
		export enum ProjectColumnEdge {};
		export enum ProjectConnection {};
		export enum ProjectEdge {};
		export enum PullRequest {};
		export enum PullRequestConnection {};
		export enum PullRequestEdge {};
		export enum PullRequestReview {};
		export enum PullRequestReviewComment {};
		export enum PullRequestReviewCommentConnection {};
		export enum PullRequestReviewCommentEdge {};
		export enum PullRequestReviewConnection {};
		export enum PullRequestReviewEdge {};
		export enum PullRequestReviewThread {};
		export enum ReactingUserConnection {};
		export enum ReactingUserEdge {};
		export enum Reaction {};
		export enum ReactionConnection {};
		export enum ReactionEdge {};
		export enum ReactionGroup {};
		export enum Ref {};
		export enum RefConnection {};
		export enum RefEdge {};
		export enum ReferencedEvent {};
		export enum Release {};
		export enum ReleaseAsset {};
		export enum ReleaseAssetConnection {};
		export enum ReleaseAssetEdge {};
		export enum ReleaseConnection {};
		export enum ReleaseEdge {};
		export enum RemoveOutsideCollaboratorPayload {};
		export enum RemoveReactionPayload {};
		export enum RenamedEvent {};
		export enum ReopenedEvent {};
		export enum Repository {};
		export enum RepositoryConnection {};
		export enum RepositoryEdge {};
		export enum RepositoryInvitation {};
		export enum RepositoryInvitationRepository {};
		export enum RequestReviewsPayload {};
		export enum ReviewDismissedEvent {};
		export enum ReviewRequest {};
		export enum ReviewRequestConnection {};
		export enum ReviewRequestEdge {};
		export enum ReviewRequestRemovedEvent {};
		export enum ReviewRequestedEvent {};
		export enum SearchResultItemConnection {};
		export enum SearchResultItemEdge {};
		export enum SmimeSignature {};
		export enum StargazerConnection {};
		export enum StargazerEdge {};
		export enum StarredRepositoryConnection {};
		export enum StarredRepositoryEdge {};
		export enum Status {};
		export enum StatusContext {};
		export enum SubmitPullRequestReviewPayload {};
		export enum SubscribedEvent {};
		export enum Tag {};
		export enum Team {};
		export enum TeamConnection {};
		export enum TeamEdge {};
		export enum Tree {};
		export enum TreeEntry {};
		export enum UnassignedEvent {};
		export enum UnknownSignature {};
		export enum UnlabeledEvent {};
		export enum UnlockedEvent {};
		export enum UnsubscribedEvent {};
		export enum UpdateProjectCardPayload {};
		export enum UpdateProjectColumnPayload {};
		export enum UpdateProjectPayload {};
		export enum UpdatePullRequestReviewCommentPayload {};
		export enum UpdatePullRequestReviewPayload {};
		export enum UpdateSubscriptionPayload {};
		export enum User {};
		export enum UserConnection {};
		export enum UserEdge {};"
	`);
});
