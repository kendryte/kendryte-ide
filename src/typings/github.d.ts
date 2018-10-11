declare module '@octokit/rest' {
	/**
	 * This declaration file requires TypeScript 2.1 or above.
	 */

	import * as http from 'http';

	namespace Github {
		type json = any;
		type date = string;

		export interface Response<T> {
			/** This is the data you would see in https://developer.github.com/v3/ */
			data: T;

			/** Response status number */
			status: number;

			/** Response headers */
			headers: {
				'x-ratelimit-limit': string;
				'x-ratelimit-remaining': string;
				'x-ratelimit-reset': string;
				'x-github-request-id': string;
				'x-github-media-type': string;
				link: string;
				'last-modified': string;
				etag: string;
				status: string;
			};

			[Symbol.iterator](): Iterator<any>;
		}

		export type AnyResponse = Response<any>;

		export interface EmptyParams {}

		export interface Options {
			baseUrl?: string;
			timeout?: number;
			headers?: { [header: string]: any };
			agent?: http.Agent;

			/**
			 * @deprecated in version 15.0.0
			 */
			proxy?: string;
			/**
			 * @deprecated in version 15.0.0
			 */
			ca?: string;
			/**
			 * @deprecated in version 15.0.0
			 */
			rejectUnauthorized?: boolean;
			/**
			 * @deprecated in version 15.0.0
			 */
			family?: number;

			/**
			 * @deprecated in version 15.2.0
			 */
			host?: string;
			/**
			 * @deprecated in version 15.2.0
			 */
			pathPrefix?: string;
			/**
			 * @deprecated in version 15.2.0
			 */
			protocol?: string;
			/**
			 * @deprecated in version 15.2.0
			 */
			port?: number;
		}

		export interface AuthBasic {
			type: 'basic';
			username: string;
			password: string;
		}

		export interface AuthOAuthToken {
			type: 'oauth';
			token: string;
		}

		export interface AuthOAuthSecret {
			type: 'oauth';
			key: string;
			secret: string;
		}

		export interface AuthUserToken {
			type: 'token';
			token: string;
		}

		/* @deprecated Use 'app' instead of 'integration' */
		export interface DeprecatedAuthJWT {
			type: 'integration';
			token: string;
		}

		export interface AuthJWT {
			type: 'app';
			token: string;
		}

		export type Auth =
			| AuthBasic
			| AuthOAuthToken
			| AuthOAuthSecret
			| AuthUserToken
			| AuthJWT
			| DeprecatedAuthJWT;

		export type Link = { link: string } | { headers: { link: string } } | string;

		export interface Callback<T> {
			(error: Error | null, result: T): any;
		}

		type UsersUpdateResponsePlan = {
			name: string;
			space: number;
			private_repos: number;
			collaborators: number;
		};
		type UsersUpdateResponse = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
			name: string;
			company: string;
			blog: string;
			location: string;
			email: string;
			hireable: boolean;
			bio: string;
			public_repos: number;
			public_gists: number;
			followers: number;
			following: number;
			created_at: string;
			updated_at: string;
			total_private_repos: number;
			owned_private_repos: number;
			private_gists: number;
			disk_usage: number;
			collaborators: number;
			two_factor_authentication: boolean;
			plan: UsersUpdateResponsePlan;
		};
		type UsersUnfollowUserResponse = {};
		type UsersUnblockUserResponse = {};
		type UsersTogglePrimaryEmailVisibilityResponseItem = {
			email: string;
			primary: boolean;
			verified: boolean;
			visibility: string;
		};
		type UsersRemoveRepoFromInstallationResponse = {};
		type UsersGetTeamsResponseItemOrganization = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
			name: string;
			company: string;
			blog: string;
			location: string;
			email: string;
			is_verified: boolean;
			has_organization_projects: boolean;
			has_repository_projects: boolean;
			public_repos: number;
			public_gists: number;
			followers: number;
			following: number;
			html_url: string;
			created_at: string;
			type: string;
		};
		type UsersGetTeamsResponseItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			slug: string;
			description: string;
			privacy: string;
			permission: string;
			members_url: string;
			repositories_url: string;
			parent: null;
			members_count: number;
			repos_count: number;
			created_at: string;
			updated_at: string;
			organization: UsersGetTeamsResponseItemOrganization;
		};
		type UsersGetRepoInvitesResponseItemInviter = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type UsersGetRepoInvitesResponseItemInvitee = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type UsersGetRepoInvitesResponseItemRepositoryOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type UsersGetRepoInvitesResponseItemRepository = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: UsersGetRepoInvitesResponseItemRepositoryOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
		};
		type UsersGetRepoInvitesResponseItem = {
			id: number;
			repository: UsersGetRepoInvitesResponseItemRepository;
			invitee: UsersGetRepoInvitesResponseItemInvitee;
			inviter: UsersGetRepoInvitesResponseItemInviter;
			permissions: string;
			created_at: string;
			url: string;
			html_url: string;
		};
		type UsersGetPublicEmailsResponseItem = {
			email: string;
			verified: boolean;
			primary: boolean;
			visibility: string;
		};
		type UsersGetOrgsResponseItem = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
		};
		type UsersGetOrgMembershipsResponseItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type UsersGetOrgMembershipsResponseItemOrganization = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
		};
		type UsersGetOrgMembershipsResponseItem = {
			url: string;
			state: string;
			role: string;
			organization_url: string;
			organization: UsersGetOrgMembershipsResponseItemOrganization;
			user: UsersGetOrgMembershipsResponseItemUser;
		};
		type UsersGetOrgMembershipResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type UsersGetOrgMembershipResponseOrganization = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
		};
		type UsersGetOrgMembershipResponse = {
			url: string;
			state: string;
			role: string;
			organization_url: string;
			organization: UsersGetOrgMembershipResponseOrganization;
			user: UsersGetOrgMembershipResponseUser;
		};
		type UsersGetMarketplaceStubbedPurchasesResponseItemPlan = {
			url: string;
			accounts_url: string;
			id: number;
			name: string;
			description: string;
			monthly_price_in_cents: number;
			yearly_price_in_cents: number;
			price_model: string;
			has_free_trial: boolean;
			unit_name: null;
			bullets: Array<string>;
		};
		type UsersGetMarketplaceStubbedPurchasesResponseItemAccount = {
			login: string;
			id: number;
			url: string;
			email: null;
			organization_billing_email: string;
			type: string;
		};
		type UsersGetMarketplaceStubbedPurchasesResponseItem = {
			billing_cycle: string;
			next_billing_date: string;
			unit_count: null;
			on_free_trial: boolean;
			free_trial_ends_on: string;
			updated_at: string;
			account: UsersGetMarketplaceStubbedPurchasesResponseItemAccount;
			plan: UsersGetMarketplaceStubbedPurchasesResponseItemPlan;
		};
		type UsersGetMarketplacePurchasesResponseItemPlan = {
			url: string;
			accounts_url: string;
			id: number;
			name: string;
			description: string;
			monthly_price_in_cents: number;
			yearly_price_in_cents: number;
			price_model: string;
			has_free_trial: boolean;
			unit_name: null;
			bullets: Array<string>;
		};
		type UsersGetMarketplacePurchasesResponseItemAccount = {
			login: string;
			id: number;
			url: string;
			email: null;
			organization_billing_email: string;
			type: string;
		};
		type UsersGetMarketplacePurchasesResponseItem = {
			billing_cycle: string;
			next_billing_date: string;
			unit_count: null;
			on_free_trial: boolean;
			free_trial_ends_on: string;
			updated_at: string;
			account: UsersGetMarketplacePurchasesResponseItemAccount;
			plan: UsersGetMarketplacePurchasesResponseItemPlan;
		};
		type UsersGetKeysForUserResponseItem = {
			id: number;
			key: string;
		};
		type UsersGetKeysResponseItem = {
			id: number;
			key: string;
			url: string;
			title: string;
			verified: boolean;
			created_at: string;
			read_only: boolean;
		};
		type UsersGetKeyResponse = {
			id: number;
			key: string;
			url: string;
			title: string;
			verified: boolean;
			created_at: string;
			read_only: boolean;
		};
		type UsersGetInstallationsResponseInstallationsItemPermissions = {
			metadata: string;
			contents: string;
			issues: string;
			single_file: string;
		};
		type UsersGetInstallationsResponseInstallationsItemAccount = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url?: string;
			issues_url?: string;
			members_url?: string;
			public_members_url?: string;
			avatar_url: string;
			description?: string;
			gravatar_id?: string;
			html_url?: string;
			followers_url?: string;
			following_url?: string;
			gists_url?: string;
			starred_url?: string;
			subscriptions_url?: string;
			organizations_url?: string;
			received_events_url?: string;
			type?: string;
			site_admin?: boolean;
		};
		type UsersGetInstallationsResponseInstallationsItem = {
			id: number;
			account: UsersGetInstallationsResponseInstallationsItemAccount;
			access_tokens_url: string;
			repositories_url: string;
			html_url: string;
			app_id: number;
			target_id: number;
			target_type: string;
			permissions: UsersGetInstallationsResponseInstallationsItemPermissions;
			events: Array<string>;
			single_file_name: string;
		};
		type UsersGetInstallationsResponse = {
			total_count: number;
			installations: Array<UsersGetInstallationsResponseInstallationsItem>;
		};
		type UsersGetInstallationReposResponseRepositoriesItemPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type UsersGetInstallationReposResponseRepositoriesItemOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type UsersGetInstallationReposResponseRepositoriesItem = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: UsersGetInstallationReposResponseRepositoriesItemOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: UsersGetInstallationReposResponseRepositoriesItemPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type UsersGetInstallationReposResponse = {
			total_count: number;
			repositories: Array<UsersGetInstallationReposResponseRepositoriesItem>;
		};
		type UsersGetGpgKeysForUserResponseItemSubkeysItem = {
			id: number;
			primary_key_id: number;
			key_id: string;
			public_key: string;
			emails: Array<any>;
			subkeys: Array<any>;
			can_sign: boolean;
			can_encrypt_comms: boolean;
			can_encrypt_storage: boolean;
			can_certify: boolean;
			created_at: string;
			expires_at: null;
		};
		type UsersGetGpgKeysForUserResponseItemEmailsItem = {
			email: string;
			verified: boolean;
		};
		type UsersGetGpgKeysForUserResponseItem = {
			id: number;
			primary_key_id: null;
			key_id: string;
			public_key: string;
			emails: Array<UsersGetGpgKeysForUserResponseItemEmailsItem>;
			subkeys: Array<UsersGetGpgKeysForUserResponseItemSubkeysItem>;
			can_sign: boolean;
			can_encrypt_comms: boolean;
			can_encrypt_storage: boolean;
			can_certify: boolean;
			created_at: string;
			expires_at: null;
		};
		type UsersGetGpgKeysResponseItemSubkeysItem = {
			id: number;
			primary_key_id: number;
			key_id: string;
			public_key: string;
			emails: Array<any>;
			subkeys: Array<any>;
			can_sign: boolean;
			can_encrypt_comms: boolean;
			can_encrypt_storage: boolean;
			can_certify: boolean;
			created_at: string;
			expires_at: null;
		};
		type UsersGetGpgKeysResponseItemEmailsItem = {
			email: string;
			verified: boolean;
		};
		type UsersGetGpgKeysResponseItem = {
			id: number;
			primary_key_id: null;
			key_id: string;
			public_key: string;
			emails: Array<UsersGetGpgKeysResponseItemEmailsItem>;
			subkeys: Array<UsersGetGpgKeysResponseItemSubkeysItem>;
			can_sign: boolean;
			can_encrypt_comms: boolean;
			can_encrypt_storage: boolean;
			can_certify: boolean;
			created_at: string;
			expires_at: null;
		};
		type UsersGetGpgKeyResponseSubkeysItem = {
			id: number;
			primary_key_id: number;
			key_id: string;
			public_key: string;
			emails: Array<any>;
			subkeys: Array<any>;
			can_sign: boolean;
			can_encrypt_comms: boolean;
			can_encrypt_storage: boolean;
			can_certify: boolean;
			created_at: string;
			expires_at: null;
		};
		type UsersGetGpgKeyResponseEmailsItem = {
			email: string;
			verified: boolean;
		};
		type UsersGetGpgKeyResponse = {
			id: number;
			primary_key_id: null;
			key_id: string;
			public_key: string;
			emails: Array<UsersGetGpgKeyResponseEmailsItem>;
			subkeys: Array<UsersGetGpgKeyResponseSubkeysItem>;
			can_sign: boolean;
			can_encrypt_comms: boolean;
			can_encrypt_storage: boolean;
			can_certify: boolean;
			created_at: string;
			expires_at: null;
		};
		type UsersGetForUserResponse = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
			name: string;
			company: string;
			blog: string;
			location: string;
			email: string;
			hireable: boolean;
			bio: string;
			public_repos: number;
			public_gists: number;
			followers: number;
			following: number;
			created_at: string;
			updated_at: string;
		};
		type UsersGetFollowingForUserResponseItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type UsersGetFollowingResponseItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type UsersGetFollowersForUserResponseItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type UsersGetFollowersResponseItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type UsersGetEmailsResponseItem = {
			email: string;
			verified: boolean;
			primary: boolean;
			visibility: string;
		};
		type UsersGetBlockedUsersResponseItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type UsersGetAllResponseItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type UsersFollowUserResponse = {};
		type UsersEditOrgMembershipResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type UsersEditOrgMembershipResponseOrganization = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
		};
		type UsersEditOrgMembershipResponse = {
			url: string;
			state: string;
			role: string;
			organization_url: string;
			organization: UsersEditOrgMembershipResponseOrganization;
			user: UsersEditOrgMembershipResponseUser;
		};
		type UsersDeleteKeyResponse = {};
		type UsersDeleteGpgKeyResponse = {};
		type UsersDeleteEmailsResponse = {};
		type UsersDeclineRepoInviteResponse = {};
		type UsersCreateKeyResponse = {
			id: number;
			key: string;
			url: string;
			title: string;
			verified: boolean;
			created_at: string;
			read_only: boolean;
		};
		type UsersCreateGpgKeyResponseSubkeysItem = {
			id: number;
			primary_key_id: number;
			key_id: string;
			public_key: string;
			emails: Array<any>;
			subkeys: Array<any>;
			can_sign: boolean;
			can_encrypt_comms: boolean;
			can_encrypt_storage: boolean;
			can_certify: boolean;
			created_at: string;
			expires_at: null;
		};
		type UsersCreateGpgKeyResponseEmailsItem = {
			email: string;
			verified: boolean;
		};
		type UsersCreateGpgKeyResponse = {
			id: number;
			primary_key_id: null;
			key_id: string;
			public_key: string;
			emails: Array<UsersCreateGpgKeyResponseEmailsItem>;
			subkeys: Array<UsersCreateGpgKeyResponseSubkeysItem>;
			can_sign: boolean;
			can_encrypt_comms: boolean;
			can_encrypt_storage: boolean;
			can_certify: boolean;
			created_at: string;
			expires_at: null;
		};
		type UsersCheckBlockedUserResponse = {};
		type UsersBlockUserResponse = {};
		type UsersAddRepoToInstallationResponse = {};
		type UsersAddEmailsResponseItem = {
			email: string;
			primary: boolean;
			verified: boolean;
		};
		type UsersAcceptRepoInviteResponse = {};
		type ReposUpdateProtectedBranchRequiredStatusChecksResponse = {
			url: string;
			strict: boolean;
			contexts: Array<string>;
			contexts_url: string;
		};
		type ReposUpdateProtectedBranchPullRequestReviewEnforcementResponseDismissalRestrictionsTeamsItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			slug: string;
			description: string;
			privacy: string;
			permission: string;
			members_url: string;
			repositories_url: string;
			parent: null;
		};
		type ReposUpdateProtectedBranchPullRequestReviewEnforcementResponseDismissalRestrictionsUsersItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposUpdateProtectedBranchPullRequestReviewEnforcementResponseDismissalRestrictions = {
			url: string;
			users_url: string;
			teams_url: string;
			users: Array<
				ReposUpdateProtectedBranchPullRequestReviewEnforcementResponseDismissalRestrictionsUsersItem
				>;
			teams: Array<
				ReposUpdateProtectedBranchPullRequestReviewEnforcementResponseDismissalRestrictionsTeamsItem
				>;
		};
		type ReposUpdateProtectedBranchPullRequestReviewEnforcementResponse = {
			url: string;
			dismissal_restrictions: ReposUpdateProtectedBranchPullRequestReviewEnforcementResponseDismissalRestrictions;
			dismiss_stale_reviews: boolean;
			require_code_owner_reviews: boolean;
			required_approving_review_count: number;
		};
		type ReposUpdateInviteResponseInviter = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposUpdateInviteResponseInvitee = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposUpdateInviteResponseRepositoryOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposUpdateInviteResponseRepository = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ReposUpdateInviteResponseRepositoryOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
		};
		type ReposUpdateInviteResponse = {
			id: number;
			repository: ReposUpdateInviteResponseRepository;
			invitee: ReposUpdateInviteResponseInvitee;
			inviter: ReposUpdateInviteResponseInviter;
			permissions: string;
			created_at: string;
			url: string;
			html_url: string;
		};
		type ReposUpdateFileResponseCommitVerification = {
			verified: boolean;
			reason: string;
			signature: null;
			payload: null;
		};
		type ReposUpdateFileResponseCommitParentsItem = {
			url: string;
			html_url: string;
			sha: string;
		};
		type ReposUpdateFileResponseCommitTree = {
			url: string;
			sha: string;
		};
		type ReposUpdateFileResponseCommitCommitter = {
			date: string;
			name: string;
			email: string;
		};
		type ReposUpdateFileResponseCommitAuthor = {
			date: string;
			name: string;
			email: string;
		};
		type ReposUpdateFileResponseCommit = {
			sha: string;
			node_id: string;
			url: string;
			html_url: string;
			author: ReposUpdateFileResponseCommitAuthor;
			committer: ReposUpdateFileResponseCommitCommitter;
			message: string;
			tree: ReposUpdateFileResponseCommitTree;
			parents: Array<ReposUpdateFileResponseCommitParentsItem>;
			verification: ReposUpdateFileResponseCommitVerification;
		};
		type ReposUpdateFileResponseContentLinks = {
			self: string;
			git: string;
			html: string;
		};
		type ReposUpdateFileResponseContent = {
			name: string;
			path: string;
			sha: string;
			size: number;
			url: string;
			html_url: string;
			git_url: string;
			download_url: string;
			type: string;
			_links: ReposUpdateFileResponseContentLinks;
		};
		type ReposUpdateFileResponse = {
			content: ReposUpdateFileResponseContent;
			commit: ReposUpdateFileResponseCommit;
		};
		type ReposUpdateCommitCommentResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposUpdateCommitCommentResponse = {
			html_url: string;
			url: string;
			id: number;
			node_id: string;
			body: string;
			path: string;
			position: number;
			line: number;
			commit_id: string;
			user: ReposUpdateCommitCommentResponseUser;
			created_at: string;
			updated_at: string;
		};
		type ReposUpdateBranchProtectionResponseRestrictionsTeamsItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			slug: string;
			description: string;
			privacy: string;
			permission: string;
			members_url: string;
			repositories_url: string;
			parent: null;
		};
		type ReposUpdateBranchProtectionResponseRestrictionsUsersItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposUpdateBranchProtectionResponseRestrictions = {
			url: string;
			users_url: string;
			teams_url: string;
			users: Array<ReposUpdateBranchProtectionResponseRestrictionsUsersItem>;
			teams: Array<ReposUpdateBranchProtectionResponseRestrictionsTeamsItem>;
		};
		type ReposUpdateBranchProtectionResponseRequiredPullRequestReviewsDismissalRestrictionsTeamsItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			slug: string;
			description: string;
			privacy: string;
			permission: string;
			members_url: string;
			repositories_url: string;
			parent: null;
		};
		type ReposUpdateBranchProtectionResponseRequiredPullRequestReviewsDismissalRestrictionsUsersItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposUpdateBranchProtectionResponseRequiredPullRequestReviewsDismissalRestrictions = {
			url: string;
			users_url: string;
			teams_url: string;
			users: Array<
				ReposUpdateBranchProtectionResponseRequiredPullRequestReviewsDismissalRestrictionsUsersItem
				>;
			teams: Array<
				ReposUpdateBranchProtectionResponseRequiredPullRequestReviewsDismissalRestrictionsTeamsItem
				>;
		};
		type ReposUpdateBranchProtectionResponseRequiredPullRequestReviews = {
			url: string;
			dismissal_restrictions: ReposUpdateBranchProtectionResponseRequiredPullRequestReviewsDismissalRestrictions;
			dismiss_stale_reviews: boolean;
			require_code_owner_reviews: boolean;
			required_approving_review_count: number;
		};
		type ReposUpdateBranchProtectionResponseEnforceAdmins = {
			url: string;
			enabled: boolean;
		};
		type ReposUpdateBranchProtectionResponseRequiredStatusChecks = {
			url: string;
			strict: boolean;
			contexts: Array<string>;
			contexts_url: string;
		};
		type ReposUpdateBranchProtectionResponse = {
			url: string;
			required_status_checks: ReposUpdateBranchProtectionResponseRequiredStatusChecks;
			enforce_admins: ReposUpdateBranchProtectionResponseEnforceAdmins;
			required_pull_request_reviews: ReposUpdateBranchProtectionResponseRequiredPullRequestReviews;
			restrictions: ReposUpdateBranchProtectionResponseRestrictions;
		};
		type ReposTransferResponsePermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type ReposTransferResponseOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposTransferResponse = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ReposTransferResponseOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: ReposTransferResponsePermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type ReposTestHookResponse = {};
		type ReposRequestPageBuildResponse = {
			url: string;
			status: string;
		};
		type ReposReplaceTopicsResponse = { names: Array<string> };
		type ReposReplaceProtectedBranchUserRestrictionsResponseItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposReplaceProtectedBranchTeamRestrictionsResponseItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			slug: string;
			description: string;
			privacy: string;
			permission: string;
			members_url: string;
			repositories_url: string;
			parent: null;
		};
		type ReposRemoveProtectedBranchUserRestrictionsResponseItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposRemoveProtectedBranchTeamRestrictionsResponseItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			slug: string;
			description: string;
			privacy: string;
			permission: string;
			members_url: string;
			repositories_url: string;
			parent: null;
		};
		type ReposRemoveCollaboratorResponse = {};
		type ReposRemoveBranchProtectionResponse = {};
		type ReposPingHookResponse = {};
		type ReposGetViewsResponseViewsItem = {
			timestamp: string;
			count: number;
			uniques: number;
		};
		type ReposGetViewsResponse = {
			count: number;
			uniques: number;
			views: Array<ReposGetViewsResponseViewsItem>;
		};
		type ReposGetTopicsResponse = { names: Array<string> };
		type ReposGetTeamsResponseItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			slug: string;
			description: string;
			privacy: string;
			permission: string;
			members_url: string;
			repositories_url: string;
			parent: null;
		};
		type ReposGetTagsResponseItemCommit = {
			sha: string;
			url: string;
		};
		type ReposGetTagsResponseItem = {
			name: string;
			commit: ReposGetTagsResponseItemCommit;
			zipball_url: string;
			tarball_url: string;
		};
		type ReposGetStatusesResponseItemCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetStatusesResponseItem = {
			url: string;
			avatar_url: string;
			id: number;
			node_id: string;
			state: string;
			description: string;
			target_url: string;
			context: string;
			created_at: string;
			updated_at: string;
			creator: ReposGetStatusesResponseItemCreator;
		};
		type ReposGetStatsParticipationResponse = {
			all: Array<number>;
			owner: Array<number>;
		};
		type ReposGetStatsContributorsResponseItemWeeksItem = {
			w: string;
			a: number;
			d: number;
			c: number;
		};
		type ReposGetStatsContributorsResponseItemAuthor = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetStatsContributorsResponseItem = {
			author: ReposGetStatsContributorsResponseItemAuthor;
			total: number;
			weeks: Array<ReposGetStatsContributorsResponseItemWeeksItem>;
		};
		type ReposGetStatsCommitActivityResponseItem = {
			days: Array<number>;
			total: number;
			week: number;
		};
		type ReposGetShaOfCommitRefResponse = {};
		type ReposGetReleasesResponseItemAssetsItemUploader = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetReleasesResponseItemAssetsItem = {
			url: string;
			browser_download_url: string;
			id: number;
			node_id: string;
			name: string;
			label: string;
			state: string;
			content_type: string;
			size: number;
			download_count: number;
			created_at: string;
			updated_at: string;
			uploader: ReposGetReleasesResponseItemAssetsItemUploader;
		};
		type ReposGetReleasesResponseItemAuthor = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetReleasesResponseItem = {
			url: string;
			html_url: string;
			assets_url: string;
			upload_url: string;
			tarball_url: string;
			zipball_url: string;
			id: number;
			node_id: string;
			tag_name: string;
			target_commitish: string;
			name: string;
			body: string;
			draft: boolean;
			prerelease: boolean;
			created_at: string;
			published_at: string;
			author: ReposGetReleasesResponseItemAuthor;
			assets: Array<ReposGetReleasesResponseItemAssetsItem>;
		};
		type ReposGetReleaseByTagResponseAssetsItemUploader = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetReleaseByTagResponseAssetsItem = {
			url: string;
			browser_download_url: string;
			id: number;
			node_id: string;
			name: string;
			label: string;
			state: string;
			content_type: string;
			size: number;
			download_count: number;
			created_at: string;
			updated_at: string;
			uploader: ReposGetReleaseByTagResponseAssetsItemUploader;
		};
		type ReposGetReleaseByTagResponseAuthor = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetReleaseByTagResponse = {
			url: string;
			html_url: string;
			assets_url: string;
			upload_url: string;
			tarball_url: string;
			zipball_url: string;
			id: number;
			node_id: string;
			tag_name: string;
			target_commitish: string;
			name: string;
			body: string;
			draft: boolean;
			prerelease: boolean;
			created_at: string;
			published_at: string;
			author: ReposGetReleaseByTagResponseAuthor;
			assets: Array<ReposGetReleaseByTagResponseAssetsItem>;
		};
		type ReposGetReleaseResponseAssetsItemUploader = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetReleaseResponseAssetsItem = {
			url: string;
			browser_download_url: string;
			id: number;
			node_id: string;
			name: string;
			label: string;
			state: string;
			content_type: string;
			size: number;
			download_count: number;
			created_at: string;
			updated_at: string;
			uploader: ReposGetReleaseResponseAssetsItemUploader;
		};
		type ReposGetReleaseResponseAuthor = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetReleaseResponse = {
			url: string;
			html_url: string;
			assets_url: string;
			upload_url: string;
			tarball_url: string;
			zipball_url: string;
			id: number;
			node_id: string;
			tag_name: string;
			target_commitish: string;
			name: string;
			body: string;
			draft: boolean;
			prerelease: boolean;
			created_at: string;
			published_at: string;
			author: ReposGetReleaseResponseAuthor;
			assets: Array<ReposGetReleaseResponseAssetsItem>;
		};
		type ReposGetReferrersResponseItem = {
			referrer: string;
			count: number;
			uniques: number;
		};
		type ReposGetReadmeResponseLinks = {
			git: string;
			self: string;
			html: string;
		};
		type ReposGetReadmeResponse = {
			type: string;
			encoding: string;
			size: number;
			name: string;
			path: string;
			content: string;
			sha: string;
			url: string;
			git_url: string;
			html_url: string;
			download_url: string;
			_links: ReposGetReadmeResponseLinks;
		};
		type ReposGetPublicResponseItemOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetPublicResponseItem = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ReposGetPublicResponseItemOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
		};
		type ReposGetProtectedBranchRequiredStatusChecksResponse = {
			url: string;
			strict: boolean;
			contexts: Array<string>;
			contexts_url: string;
		};
		type ReposGetProtectedBranchRequiredSignaturesResponse = {
			url: string;
			enabled: boolean;
		};
		type ReposGetPathsResponseItem = {
			path: string;
			title: string;
			count: number;
			uniques: number;
		};
		type ReposGetPagesResponseSource = {
			branch: string;
			directory: string;
		};
		type ReposGetPagesResponse = {
			url: string;
			status: string;
			cname: string;
			custom_404: boolean;
			html_url: string;
			source: ReposGetPagesResponseSource;
		};
		type ReposGetLatestReleaseResponseAssetsItemUploader = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetLatestReleaseResponseAssetsItem = {
			url: string;
			browser_download_url: string;
			id: number;
			node_id: string;
			name: string;
			label: string;
			state: string;
			content_type: string;
			size: number;
			download_count: number;
			created_at: string;
			updated_at: string;
			uploader: ReposGetLatestReleaseResponseAssetsItemUploader;
		};
		type ReposGetLatestReleaseResponseAuthor = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetLatestReleaseResponse = {
			url: string;
			html_url: string;
			assets_url: string;
			upload_url: string;
			tarball_url: string;
			zipball_url: string;
			id: number;
			node_id: string;
			tag_name: string;
			target_commitish: string;
			name: string;
			body: string;
			draft: boolean;
			prerelease: boolean;
			created_at: string;
			published_at: string;
			author: ReposGetLatestReleaseResponseAuthor;
			assets: Array<ReposGetLatestReleaseResponseAssetsItem>;
		};
		type ReposGetLanguagesResponse = {
			C: number;
			Python: number;
		};
		type ReposGetInvitesResponseItemInviter = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetInvitesResponseItemInvitee = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetInvitesResponseItemRepositoryOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetInvitesResponseItemRepository = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ReposGetInvitesResponseItemRepositoryOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
		};
		type ReposGetInvitesResponseItem = {
			id: number;
			repository: ReposGetInvitesResponseItemRepository;
			invitee: ReposGetInvitesResponseItemInvitee;
			inviter: ReposGetInvitesResponseItemInviter;
			permissions: string;
			created_at: string;
			url: string;
			html_url: string;
		};
		type ReposGetHooksResponseItemConfig = {
			url: string;
			content_type: string;
		};
		type ReposGetHooksResponseItem = {
			id: number;
			url: string;
			test_url: string;
			ping_url: string;
			name: string;
			events: Array<string>;
			active: boolean;
			config: ReposGetHooksResponseItemConfig;
			updated_at: string;
			created_at: string;
		};
		type ReposGetHookResponseConfig = {
			url: string;
			content_type: string;
		};
		type ReposGetHookResponse = {
			id: number;
			url: string;
			test_url: string;
			ping_url: string;
			name: string;
			events: Array<string>;
			active: boolean;
			config: ReposGetHookResponseConfig;
			updated_at: string;
			created_at: string;
		};
		type ReposGetForksResponseItemLicense = {
			key: string;
			name: string;
			spdx_id: string;
			url: string;
			node_id: string;
		};
		type ReposGetForksResponseItemPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type ReposGetForksResponseItemOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetForksResponseItem = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ReposGetForksResponseItemOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: ReposGetForksResponseItemPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
			license: ReposGetForksResponseItemLicense;
		};
		type ReposGetForOrgResponseItemLicense = {
			key: string;
			name: string;
			spdx_id: string;
			url: string;
			node_id: string;
		};
		type ReposGetForOrgResponseItemPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type ReposGetForOrgResponseItemOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetForOrgResponseItem = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ReposGetForOrgResponseItemOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: ReposGetForOrgResponseItemPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
			license: ReposGetForOrgResponseItemLicense;
		};
		type ReposGetDownloadsResponseItem = {
			url: string;
			html_url: string;
			id: number;
			name: string;
			description: string;
			size: number;
			download_count: number;
			content_type: string;
		};
		type ReposGetDownloadResponse = {
			url: string;
			html_url: string;
			id: number;
			name: string;
			description: string;
			size: number;
			download_count: number;
			content_type: string;
		};
		type ReposGetDeploymentsResponseItemCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetDeploymentsResponseItemPayload = { task: string };
		type ReposGetDeploymentsResponseItem = {
			url: string;
			id: number;
			node_id: string;
			sha: string;
			ref: string;
			task: string;
			payload: ReposGetDeploymentsResponseItemPayload;
			environment: string;
			description: string;
			creator: ReposGetDeploymentsResponseItemCreator;
			created_at: string;
			updated_at: string;
			statuses_url: string;
			repository_url: string;
		};
		type ReposGetDeploymentStatusesResponseItemCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetDeploymentStatusesResponseItem = {
			url: string;
			id: number;
			node_id: string;
			state: string;
			creator: ReposGetDeploymentStatusesResponseItemCreator;
			description: string;
			target_url: string;
			created_at: string;
			updated_at: string;
			deployment_url: string;
			repository_url: string;
		};
		type ReposGetDeploymentStatusResponseCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetDeploymentStatusResponse = {
			url: string;
			id: number;
			node_id: string;
			state: string;
			creator: ReposGetDeploymentStatusResponseCreator;
			description: string;
			target_url: string;
			created_at: string;
			updated_at: string;
			deployment_url: string;
			repository_url: string;
		};
		type ReposGetDeploymentResponseCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetDeploymentResponsePayload = { task: string };
		type ReposGetDeploymentResponse = {
			url: string;
			id: number;
			node_id: string;
			sha: string;
			ref: string;
			task: string;
			payload: ReposGetDeploymentResponsePayload;
			environment: string;
			description: string;
			creator: ReposGetDeploymentResponseCreator;
			created_at: string;
			updated_at: string;
			statuses_url: string;
			repository_url: string;
		};
		type ReposGetDeployKeysResponseItem = {
			id: number;
			key: string;
			url: string;
			title: string;
			verified: boolean;
			created_at: string;
			read_only: boolean;
		};
		type ReposGetDeployKeyResponse = {
			id: number;
			key: string;
			url: string;
			title: string;
			verified: boolean;
			created_at: string;
			read_only: boolean;
		};
		type ReposGetCommunityProfileMetricsResponseFilesReadme = {
			url: string;
			html_url: string;
		};
		type ReposGetCommunityProfileMetricsResponseFilesLicense = {
			name: string;
			key: string;
			spdx_id: string;
			url: string;
			html_url: string;
		};
		type ReposGetCommunityProfileMetricsResponseFilesPullRequestTemplate = {
			url: string;
			html_url: string;
		};
		type ReposGetCommunityProfileMetricsResponseFilesIssueTemplate = {
			url: string;
			html_url: string;
		};
		type ReposGetCommunityProfileMetricsResponseFilesContributing = {
			url: string;
			html_url: string;
		};
		type ReposGetCommunityProfileMetricsResponseFilesCodeOfConduct = {
			name: string;
			key: string;
			url: string;
			html_url: string;
		};
		type ReposGetCommunityProfileMetricsResponseFiles = {
			code_of_conduct: ReposGetCommunityProfileMetricsResponseFilesCodeOfConduct;
			contributing: ReposGetCommunityProfileMetricsResponseFilesContributing;
			issue_template: ReposGetCommunityProfileMetricsResponseFilesIssueTemplate;
			pull_request_template: ReposGetCommunityProfileMetricsResponseFilesPullRequestTemplate;
			license: ReposGetCommunityProfileMetricsResponseFilesLicense;
			readme: ReposGetCommunityProfileMetricsResponseFilesReadme;
		};
		type ReposGetCommunityProfileMetricsResponse = {
			health_percentage: number;
			description: string;
			documentation: boolean;
			files: ReposGetCommunityProfileMetricsResponseFiles;
			updated_at: string;
		};
		type ReposGetCommitsResponseItemParentsItem = {
			url: string;
			sha: string;
		};
		type ReposGetCommitsResponseItemCommitter = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetCommitsResponseItemAuthor = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetCommitsResponseItemCommitVerification = {
			verified: boolean;
			reason: string;
			signature: null;
			payload: null;
		};
		type ReposGetCommitsResponseItemCommitTree = {
			url: string;
			sha: string;
		};
		type ReposGetCommitsResponseItemCommitCommitter = {
			name: string;
			email: string;
			date: string;
		};
		type ReposGetCommitsResponseItemCommitAuthor = {
			name: string;
			email: string;
			date: string;
		};
		type ReposGetCommitsResponseItemCommit = {
			url: string;
			author: ReposGetCommitsResponseItemCommitAuthor;
			committer: ReposGetCommitsResponseItemCommitCommitter;
			message: string;
			tree: ReposGetCommitsResponseItemCommitTree;
			comment_count: number;
			verification: ReposGetCommitsResponseItemCommitVerification;
		};
		type ReposGetCommitsResponseItem = {
			url: string;
			sha: string;
			node_id: string;
			html_url: string;
			comments_url: string;
			commit: ReposGetCommitsResponseItemCommit;
			author: ReposGetCommitsResponseItemAuthor;
			committer: ReposGetCommitsResponseItemCommitter;
			parents: Array<ReposGetCommitsResponseItemParentsItem>;
		};
		type ReposGetCommitCommentsResponseItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetCommitCommentsResponseItem = {
			html_url: string;
			url: string;
			id: number;
			node_id: string;
			body: string;
			path: string;
			position: number;
			line: number;
			commit_id: string;
			user: ReposGetCommitCommentsResponseItemUser;
			created_at: string;
			updated_at: string;
		};
		type ReposGetCommitCommentResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetCommitCommentResponse = {
			html_url: string;
			url: string;
			id: number;
			node_id: string;
			body: string;
			path: string;
			position: number;
			line: number;
			commit_id: string;
			user: ReposGetCommitCommentResponseUser;
			created_at: string;
			updated_at: string;
		};
		type ReposGetCommitResponseFilesItem = {
			filename: string;
			additions: number;
			deletions: number;
			changes: number;
			status: string;
			raw_url: string;
			blob_url: string;
			patch: string;
		};
		type ReposGetCommitResponseStats = {
			additions: number;
			deletions: number;
			total: number;
		};
		type ReposGetCommitResponseParentsItem = {
			url: string;
			sha: string;
		};
		type ReposGetCommitResponseCommitter = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetCommitResponseAuthor = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetCommitResponseCommitVerification = {
			verified: boolean;
			reason: string;
			signature: null;
			payload: null;
		};
		type ReposGetCommitResponseCommitTree = {
			url: string;
			sha: string;
		};
		type ReposGetCommitResponseCommitCommitter = {
			name: string;
			email: string;
			date: string;
		};
		type ReposGetCommitResponseCommitAuthor = {
			name: string;
			email: string;
			date: string;
		};
		type ReposGetCommitResponseCommit = {
			url: string;
			author: ReposGetCommitResponseCommitAuthor;
			committer: ReposGetCommitResponseCommitCommitter;
			message: string;
			tree: ReposGetCommitResponseCommitTree;
			comment_count: number;
			verification: ReposGetCommitResponseCommitVerification;
		};
		type ReposGetCommitResponse = {
			url: string;
			sha: string;
			node_id: string;
			html_url: string;
			comments_url: string;
			commit: ReposGetCommitResponseCommit;
			author: ReposGetCommitResponseAuthor;
			committer: ReposGetCommitResponseCommitter;
			parents: Array<ReposGetCommitResponseParentsItem>;
			stats: ReposGetCommitResponseStats;
			files: Array<ReposGetCommitResponseFilesItem>;
		};
		type ReposGetCombinedStatusForRefResponseRepositoryOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetCombinedStatusForRefResponseRepository = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ReposGetCombinedStatusForRefResponseRepositoryOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
		};
		type ReposGetCombinedStatusForRefResponseStatusesItem = {
			url: string;
			avatar_url: string;
			id: number;
			node_id: string;
			state: string;
			description: string;
			target_url: string;
			context: string;
			created_at: string;
			updated_at: string;
		};
		type ReposGetCombinedStatusForRefResponse = {
			state: string;
			statuses: Array<ReposGetCombinedStatusForRefResponseStatusesItem>;
			sha: string;
			total_count: number;
			repository: ReposGetCombinedStatusForRefResponseRepository;
			commit_url: string;
			url: string;
		};
		type ReposGetCollaboratorsResponseItemPermissions = {
			pull: boolean;
			push: boolean;
			admin: boolean;
		};
		type ReposGetCollaboratorsResponseItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
			permissions: ReposGetCollaboratorsResponseItemPermissions;
		};
		type ReposGetClonesResponseClonesItem = {
			timestamp: string;
			count: number;
			uniques: number;
		};
		type ReposGetClonesResponse = {
			count: number;
			uniques: number;
			clones: Array<ReposGetClonesResponseClonesItem>;
		};
		type ReposGetBranchesResponseItemCommit = {
			sha: string;
			url: string;
		};
		type ReposGetBranchesResponseItem = {
			name: string;
			commit: ReposGetBranchesResponseItemCommit;
			protected: boolean;
			protection_url: string;
		};
		type ReposGetBranchProtectionResponseRestrictionsTeamsItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			slug: string;
			description: string;
			privacy: string;
			permission: string;
			members_url: string;
			repositories_url: string;
			parent: null;
		};
		type ReposGetBranchProtectionResponseRestrictionsUsersItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetBranchProtectionResponseRestrictions = {
			url: string;
			users_url: string;
			teams_url: string;
			users: Array<ReposGetBranchProtectionResponseRestrictionsUsersItem>;
			teams: Array<ReposGetBranchProtectionResponseRestrictionsTeamsItem>;
		};
		type ReposGetBranchProtectionResponseRequiredPullRequestReviewsDismissalRestrictionsTeamsItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			slug: string;
			description: string;
			privacy: string;
			permission: string;
			members_url: string;
			repositories_url: string;
			parent: null;
		};
		type ReposGetBranchProtectionResponseRequiredPullRequestReviewsDismissalRestrictionsUsersItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetBranchProtectionResponseRequiredPullRequestReviewsDismissalRestrictions = {
			url: string;
			users_url: string;
			teams_url: string;
			users: Array<
				ReposGetBranchProtectionResponseRequiredPullRequestReviewsDismissalRestrictionsUsersItem
				>;
			teams: Array<
				ReposGetBranchProtectionResponseRequiredPullRequestReviewsDismissalRestrictionsTeamsItem
				>;
		};
		type ReposGetBranchProtectionResponseRequiredPullRequestReviews = {
			url: string;
			dismissal_restrictions: ReposGetBranchProtectionResponseRequiredPullRequestReviewsDismissalRestrictions;
			dismiss_stale_reviews: boolean;
			require_code_owner_reviews: boolean;
			required_approving_review_count: number;
		};
		type ReposGetBranchProtectionResponseEnforceAdmins = {
			url: string;
			enabled: boolean;
		};
		type ReposGetBranchProtectionResponseRequiredStatusChecks = {
			url: string;
			strict: boolean;
			contexts: Array<string>;
			contexts_url: string;
		};
		type ReposGetBranchProtectionResponse = {
			url: string;
			required_status_checks: ReposGetBranchProtectionResponseRequiredStatusChecks;
			enforce_admins: ReposGetBranchProtectionResponseEnforceAdmins;
			required_pull_request_reviews: ReposGetBranchProtectionResponseRequiredPullRequestReviews;
			restrictions: ReposGetBranchProtectionResponseRestrictions;
		};
		type ReposGetBranchResponseLinks = {
			html: string;
			self: string;
		};
		type ReposGetBranchResponseCommitCommitter = {
			gravatar_id: string;
			avatar_url: string;
			url: string;
			id: number;
			login: string;
		};
		type ReposGetBranchResponseCommitParentsItem = {
			sha: string;
			url: string;
		};
		type ReposGetBranchResponseCommitAuthor = {
			gravatar_id: string;
			avatar_url: string;
			url: string;
			id: number;
			login: string;
		};
		type ReposGetBranchResponseCommitCommitVerification = {
			verified: boolean;
			reason: string;
			signature: null;
			payload: null;
		};
		type ReposGetBranchResponseCommitCommitCommitter = {
			name: string;
			date: string;
			email: string;
		};
		type ReposGetBranchResponseCommitCommitTree = {
			sha: string;
			url: string;
		};
		type ReposGetBranchResponseCommitCommitAuthor = {
			name: string;
			date: string;
			email: string;
		};
		type ReposGetBranchResponseCommitCommit = {
			author: ReposGetBranchResponseCommitCommitAuthor;
			url: string;
			message: string;
			tree: ReposGetBranchResponseCommitCommitTree;
			committer: ReposGetBranchResponseCommitCommitCommitter;
			verification: ReposGetBranchResponseCommitCommitVerification;
		};
		type ReposGetBranchResponseCommit = {
			sha: string;
			node_id: string;
			commit: ReposGetBranchResponseCommitCommit;
			author: ReposGetBranchResponseCommitAuthor;
			parents: Array<ReposGetBranchResponseCommitParentsItem>;
			url: string;
			committer: ReposGetBranchResponseCommitCommitter;
		};
		type ReposGetBranchResponse = {
			name: string;
			commit: ReposGetBranchResponseCommit;
			_links: ReposGetBranchResponseLinks;
			protected: boolean;
			protection_url: string;
		};
		type ReposGetAssetsResponseItemUploader = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetAssetsResponseItem = {
			url: string;
			browser_download_url: string;
			id: number;
			node_id: string;
			name: string;
			label: string;
			state: string;
			content_type: string;
			size: number;
			download_count: number;
			created_at: string;
			updated_at: string;
			uploader: ReposGetAssetsResponseItemUploader;
		};
		type ReposGetAssetResponseUploader = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetAssetResponse = {
			url: string;
			browser_download_url: string;
			id: number;
			node_id: string;
			name: string;
			label: string;
			state: string;
			content_type: string;
			size: number;
			download_count: number;
			created_at: string;
			updated_at: string;
			uploader: ReposGetAssetResponseUploader;
		};
		type ReposGetArchiveLinkResponse = {};
		type ReposGetAllCommitCommentsResponseItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetAllCommitCommentsResponseItem = {
			html_url: string;
			url: string;
			id: number;
			node_id: string;
			body: string;
			path: string;
			position: number;
			line: number;
			commit_id: string;
			user: ReposGetAllCommitCommentsResponseItemUser;
			created_at: string;
			updated_at: string;
		};
		type ReposGetResponseSourcePermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type ReposGetResponseSourceOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetResponseSource = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ReposGetResponseSourceOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: ReposGetResponseSourcePermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type ReposGetResponseParentPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type ReposGetResponseParentOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetResponseParent = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ReposGetResponseParentOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: ReposGetResponseParentPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type ReposGetResponseOrganization = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetResponseLicense = {
			key: string;
			name: string;
			spdx_id: string;
			url: string;
			node_id: string;
		};
		type ReposGetResponsePermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type ReposGetResponseOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposGetResponse = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ReposGetResponseOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: ReposGetResponsePermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
			license: ReposGetResponseLicense;
			organization: ReposGetResponseOrganization;
			parent: ReposGetResponseParent;
			source: ReposGetResponseSource;
		};
		type ReposForkResponsePermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type ReposForkResponseOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposForkResponse = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ReposForkResponseOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: ReposForkResponsePermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type ReposEditReleaseResponseAssetsItemUploader = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposEditReleaseResponseAssetsItem = {
			url: string;
			browser_download_url: string;
			id: number;
			node_id: string;
			name: string;
			label: string;
			state: string;
			content_type: string;
			size: number;
			download_count: number;
			created_at: string;
			updated_at: string;
			uploader: ReposEditReleaseResponseAssetsItemUploader;
		};
		type ReposEditReleaseResponseAuthor = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposEditReleaseResponse = {
			url: string;
			html_url: string;
			assets_url: string;
			upload_url: string;
			tarball_url: string;
			zipball_url: string;
			id: number;
			node_id: string;
			tag_name: string;
			target_commitish: string;
			name: string;
			body: string;
			draft: boolean;
			prerelease: boolean;
			created_at: string;
			published_at: string;
			author: ReposEditReleaseResponseAuthor;
			assets: Array<ReposEditReleaseResponseAssetsItem>;
		};
		type ReposEditHookResponseConfig = {
			url: string;
			content_type: string;
		};
		type ReposEditHookResponse = {
			id: number;
			url: string;
			test_url: string;
			ping_url: string;
			name: string;
			events: Array<string>;
			active: boolean;
			config: ReposEditHookResponseConfig;
			updated_at: string;
			created_at: string;
		};
		type ReposEditAssetResponseUploader = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposEditAssetResponse = {
			url: string;
			browser_download_url: string;
			id: number;
			node_id: string;
			name: string;
			label: string;
			state: string;
			content_type: string;
			size: number;
			download_count: number;
			created_at: string;
			updated_at: string;
			uploader: ReposEditAssetResponseUploader;
		};
		type ReposEditResponseSourcePermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type ReposEditResponseSourceOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposEditResponseSource = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ReposEditResponseSourceOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: ReposEditResponseSourcePermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type ReposEditResponseParentPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type ReposEditResponseParentOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposEditResponseParent = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ReposEditResponseParentOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: ReposEditResponseParentPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type ReposEditResponseOrganization = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposEditResponsePermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type ReposEditResponseOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposEditResponse = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ReposEditResponseOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: ReposEditResponsePermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
			organization: ReposEditResponseOrganization;
			parent: ReposEditResponseParent;
			source: ReposEditResponseSource;
		};
		type ReposDeleteReleaseResponse = {};
		type ReposDeleteInviteResponse = {};
		type ReposDeleteHookResponse = {};
		type ReposDeleteFileResponseCommitVerification = {
			verified: boolean;
			reason: string;
			signature: null;
			payload: null;
		};
		type ReposDeleteFileResponseCommitParentsItem = {
			url: string;
			html_url: string;
			sha: string;
		};
		type ReposDeleteFileResponseCommitTree = {
			url: string;
			sha: string;
		};
		type ReposDeleteFileResponseCommitCommitter = {
			date: string;
			name: string;
			email: string;
		};
		type ReposDeleteFileResponseCommitAuthor = {
			date: string;
			name: string;
			email: string;
		};
		type ReposDeleteFileResponseCommit = {
			sha: string;
			node_id: string;
			url: string;
			html_url: string;
			author: ReposDeleteFileResponseCommitAuthor;
			committer: ReposDeleteFileResponseCommitCommitter;
			message: string;
			tree: ReposDeleteFileResponseCommitTree;
			parents: Array<ReposDeleteFileResponseCommitParentsItem>;
			verification: ReposDeleteFileResponseCommitVerification;
		};
		type ReposDeleteFileResponse = {
			content: null;
			commit: ReposDeleteFileResponseCommit;
		};
		type ReposDeleteDownloadResponse = {};
		type ReposDeleteDeployKeyResponse = {};
		type ReposDeleteCommitCommentResponse = {};
		type ReposDeleteAssetResponse = {};
		type ReposDeleteResponse = {
			message?: string;
			documentation_url?: string;
		};
		type ReposCreateStatusResponseCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposCreateStatusResponse = {
			url: string;
			avatar_url: string;
			id: number;
			node_id: string;
			state: string;
			description: string;
			target_url: string;
			context: string;
			created_at: string;
			updated_at: string;
			creator: ReposCreateStatusResponseCreator;
		};
		type ReposCreateReleaseResponseAuthor = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposCreateReleaseResponse = {
			url: string;
			html_url: string;
			assets_url: string;
			upload_url: string;
			tarball_url: string;
			zipball_url: string;
			id: number;
			node_id: string;
			tag_name: string;
			target_commitish: string;
			name: string;
			body: string;
			draft: boolean;
			prerelease: boolean;
			created_at: string;
			published_at: string;
			author: ReposCreateReleaseResponseAuthor;
			assets: Array<any>;
		};
		type ReposCreateHookResponseConfig = {
			url: string;
			content_type: string;
		};
		type ReposCreateHookResponse = {
			id: number;
			url: string;
			test_url: string;
			ping_url: string;
			name: string;
			events: Array<string>;
			active: boolean;
			config: ReposCreateHookResponseConfig;
			updated_at: string;
			created_at: string;
		};
		type ReposCreateForOrgResponsePermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type ReposCreateForOrgResponseOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposCreateForOrgResponse = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ReposCreateForOrgResponseOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: ReposCreateForOrgResponsePermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type ReposCreateFileResponseCommitVerification = {
			verified: boolean;
			reason: string;
			signature: null;
			payload: null;
		};
		type ReposCreateFileResponseCommitParentsItem = {
			url: string;
			html_url: string;
			sha: string;
		};
		type ReposCreateFileResponseCommitTree = {
			url: string;
			sha: string;
		};
		type ReposCreateFileResponseCommitCommitter = {
			date: string;
			name: string;
			email: string;
		};
		type ReposCreateFileResponseCommitAuthor = {
			date: string;
			name: string;
			email: string;
		};
		type ReposCreateFileResponseCommit = {
			sha: string;
			node_id: string;
			url: string;
			html_url: string;
			author: ReposCreateFileResponseCommitAuthor;
			committer: ReposCreateFileResponseCommitCommitter;
			message: string;
			tree: ReposCreateFileResponseCommitTree;
			parents: Array<ReposCreateFileResponseCommitParentsItem>;
			verification: ReposCreateFileResponseCommitVerification;
		};
		type ReposCreateFileResponseContentLinks = {
			self: string;
			git: string;
			html: string;
		};
		type ReposCreateFileResponseContent = {
			name: string;
			path: string;
			sha: string;
			size: number;
			url: string;
			html_url: string;
			git_url: string;
			download_url: string;
			type: string;
			_links: ReposCreateFileResponseContentLinks;
		};
		type ReposCreateFileResponse = {
			content: ReposCreateFileResponseContent;
			commit: ReposCreateFileResponseCommit;
		};
		type ReposCreateDeploymentStatusResponseCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposCreateDeploymentStatusResponse = {
			url: string;
			id: number;
			node_id: string;
			state: string;
			creator: ReposCreateDeploymentStatusResponseCreator;
			description: string;
			target_url: string;
			created_at: string;
			updated_at: string;
			deployment_url: string;
			repository_url: string;
		};
		type ReposCreateCommitCommentResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposCreateCommitCommentResponse = {
			html_url: string;
			url: string;
			id: number;
			node_id: string;
			body: string;
			path: string;
			position: number;
			line: number;
			commit_id: string;
			user: ReposCreateCommitCommentResponseUser;
			created_at: string;
			updated_at: string;
		};
		type ReposCreateResponsePermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type ReposCreateResponseOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposCreateResponse = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ReposCreateResponseOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: ReposCreateResponsePermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type ReposAddProtectedBranchUserRestrictionsResponseItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReposAddProtectedBranchTeamRestrictionsResponseItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			slug: string;
			description: string;
			privacy: string;
			permission: string;
			members_url: string;
			repositories_url: string;
			parent: null;
		};
		type ReposAddProtectedBranchRequiredSignaturesResponse = {
			url: string;
			enabled: boolean;
		};
		type ReposAddProtectedBranchAdminEnforcementResponse = {
			url: string;
			enabled: boolean;
		};
		type ReposAddDeployKeyResponse = {
			id: number;
			key: string;
			url: string;
			title: string;
			verified: boolean;
			created_at: string;
			read_only: boolean;
		};
		type ReactionsGetForTeamDiscussionCommentResponseItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReactionsGetForTeamDiscussionCommentResponseItem = {
			id: number;
			node_id: string;
			user: ReactionsGetForTeamDiscussionCommentResponseItemUser;
			content: string;
			created_at: string;
		};
		type ReactionsGetForTeamDiscussionResponseItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReactionsGetForTeamDiscussionResponseItem = {
			id: number;
			node_id: string;
			user: ReactionsGetForTeamDiscussionResponseItemUser;
			content: string;
			created_at: string;
		};
		type ReactionsGetForPullRequestReviewCommentResponseItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReactionsGetForPullRequestReviewCommentResponseItem = {
			id: number;
			node_id: string;
			user: ReactionsGetForPullRequestReviewCommentResponseItemUser;
			content: string;
			created_at: string;
		};
		type ReactionsGetForIssueCommentResponseItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReactionsGetForIssueCommentResponseItem = {
			id: number;
			node_id: string;
			user: ReactionsGetForIssueCommentResponseItemUser;
			content: string;
			created_at: string;
		};
		type ReactionsGetForIssueResponseItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReactionsGetForIssueResponseItem = {
			id: number;
			node_id: string;
			user: ReactionsGetForIssueResponseItemUser;
			content: string;
			created_at: string;
		};
		type ReactionsGetForCommitCommentResponseItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReactionsGetForCommitCommentResponseItem = {
			id: number;
			node_id: string;
			user: ReactionsGetForCommitCommentResponseItemUser;
			content: string;
			created_at: string;
		};
		type ReactionsDeleteResponse = {};
		type ReactionsCreateForTeamDiscussionCommentResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReactionsCreateForTeamDiscussionCommentResponse = {
			id: number;
			node_id: string;
			user: ReactionsCreateForTeamDiscussionCommentResponseUser;
			content: string;
			created_at: string;
		};
		type ReactionsCreateForTeamDiscussionResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReactionsCreateForTeamDiscussionResponse = {
			id: number;
			node_id: string;
			user: ReactionsCreateForTeamDiscussionResponseUser;
			content: string;
			created_at: string;
		};
		type ReactionsCreateForPullRequestReviewCommentResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReactionsCreateForPullRequestReviewCommentResponse = {
			id: number;
			node_id: string;
			user: ReactionsCreateForPullRequestReviewCommentResponseUser;
			content: string;
			created_at: string;
		};
		type ReactionsCreateForIssueCommentResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReactionsCreateForIssueCommentResponse = {
			id: number;
			node_id: string;
			user: ReactionsCreateForIssueCommentResponseUser;
			content: string;
			created_at: string;
		};
		type ReactionsCreateForIssueResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReactionsCreateForIssueResponse = {
			id: number;
			node_id: string;
			user: ReactionsCreateForIssueResponseUser;
			content: string;
			created_at: string;
		};
		type ReactionsCreateForCommitCommentResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ReactionsCreateForCommitCommentResponse = {
			id: number;
			node_id: string;
			user: ReactionsCreateForCommitCommentResponseUser;
			content: string;
			created_at: string;
		};
		type PullRequestsUpdateResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsUpdateResponseLinksStatuses = { href: string };
		type PullRequestsUpdateResponseLinksCommits = { href: string };
		type PullRequestsUpdateResponseLinksReviewComment = { href: string };
		type PullRequestsUpdateResponseLinksReviewComments = { href: string };
		type PullRequestsUpdateResponseLinksComments = { href: string };
		type PullRequestsUpdateResponseLinksIssue = { href: string };
		type PullRequestsUpdateResponseLinksHtml = { href: string };
		type PullRequestsUpdateResponseLinksSelf = { href: string };
		type PullRequestsUpdateResponseLinks = {
			self: PullRequestsUpdateResponseLinksSelf;
			html: PullRequestsUpdateResponseLinksHtml;
			issue: PullRequestsUpdateResponseLinksIssue;
			comments: PullRequestsUpdateResponseLinksComments;
			review_comments: PullRequestsUpdateResponseLinksReviewComments;
			review_comment: PullRequestsUpdateResponseLinksReviewComment;
			commits: PullRequestsUpdateResponseLinksCommits;
			statuses: PullRequestsUpdateResponseLinksStatuses;
		};
		type PullRequestsUpdateResponseBaseRepoPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type PullRequestsUpdateResponseBaseRepoOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsUpdateResponseBaseRepo = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: PullRequestsUpdateResponseBaseRepoOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: PullRequestsUpdateResponseBaseRepoPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type PullRequestsUpdateResponseBaseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsUpdateResponseBase = {
			label: string;
			ref: string;
			sha: string;
			user: PullRequestsUpdateResponseBaseUser;
			repo: PullRequestsUpdateResponseBaseRepo;
		};
		type PullRequestsUpdateResponseHeadRepoPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type PullRequestsUpdateResponseHeadRepoOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsUpdateResponseHeadRepo = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: PullRequestsUpdateResponseHeadRepoOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: PullRequestsUpdateResponseHeadRepoPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type PullRequestsUpdateResponseHeadUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsUpdateResponseHead = {
			label: string;
			ref: string;
			sha: string;
			user: PullRequestsUpdateResponseHeadUser;
			repo: PullRequestsUpdateResponseHeadRepo;
		};
		type PullRequestsUpdateResponseMilestoneCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsUpdateResponseMilestone = {
			url: string;
			html_url: string;
			labels_url: string;
			id: number;
			node_id: string;
			number: number;
			state: string;
			title: string;
			description: string;
			creator: PullRequestsUpdateResponseMilestoneCreator;
			open_issues: number;
			closed_issues: number;
			created_at: string;
			updated_at: string;
			closed_at: string;
			due_on: string;
		};
		type PullRequestsUpdateResponseLabelsItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		};
		type PullRequestsUpdateResponseAssignee = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsUpdateResponse = {
			id: number;
			node_id: string;
			url: string;
			html_url: string;
			diff_url: string;
			patch_url: string;
			issue_url: string;
			commits_url: string;
			review_comments_url: string;
			review_comment_url: string;
			comments_url: string;
			statuses_url: string;
			number: number;
			state: string;
			title: string;
			body: string;
			assignee: PullRequestsUpdateResponseAssignee;
			labels: Array<PullRequestsUpdateResponseLabelsItem>;
			milestone: PullRequestsUpdateResponseMilestone;
			locked: boolean;
			active_lock_reason: string;
			created_at: string;
			updated_at: string;
			closed_at: string;
			merged_at: string;
			head: PullRequestsUpdateResponseHead;
			base: PullRequestsUpdateResponseBase;
			_links: PullRequestsUpdateResponseLinks;
			user: PullRequestsUpdateResponseUser;
		};
		type PullRequestsSubmitReviewResponseLinksPullRequest = { href: string };
		type PullRequestsSubmitReviewResponseLinksHtml = { href: string };
		type PullRequestsSubmitReviewResponseLinks = {
			html: PullRequestsSubmitReviewResponseLinksHtml;
			pull_request: PullRequestsSubmitReviewResponseLinksPullRequest;
		};
		type PullRequestsSubmitReviewResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsSubmitReviewResponse = {
			id: number;
			node_id: string;
			user: PullRequestsSubmitReviewResponseUser;
			body: string;
			commit_id: string;
			state: string;
			html_url: string;
			pull_request_url: string;
			_links: PullRequestsSubmitReviewResponseLinks;
		};
		type PullRequestsGetReviewsResponseItemLinksPullRequest = { href: string };
		type PullRequestsGetReviewsResponseItemLinksHtml = { href: string };
		type PullRequestsGetReviewsResponseItemLinks = {
			html: PullRequestsGetReviewsResponseItemLinksHtml;
			pull_request: PullRequestsGetReviewsResponseItemLinksPullRequest;
		};
		type PullRequestsGetReviewsResponseItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsGetReviewsResponseItem = {
			id: number;
			node_id: string;
			user: PullRequestsGetReviewsResponseItemUser;
			body: string;
			commit_id: string;
			state: string;
			html_url: string;
			pull_request_url: string;
			_links: PullRequestsGetReviewsResponseItemLinks;
		};
		type PullRequestsGetReviewRequestsResponseTeamsItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			slug: string;
			description: string;
			privacy: string;
			permission: string;
			members_url: string;
			repositories_url: string;
			parent: null;
		};
		type PullRequestsGetReviewRequestsResponseUsersItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsGetReviewRequestsResponse = {
			users: Array<PullRequestsGetReviewRequestsResponseUsersItem>;
			teams: Array<PullRequestsGetReviewRequestsResponseTeamsItem>;
		};
		type PullRequestsGetReviewCommentsResponseItemLinksPullRequest = {
			href: string;
		};
		type PullRequestsGetReviewCommentsResponseItemLinksHtml = { href: string };
		type PullRequestsGetReviewCommentsResponseItemLinksSelf = { href: string };
		type PullRequestsGetReviewCommentsResponseItemLinks = {
			self: PullRequestsGetReviewCommentsResponseItemLinksSelf;
			html: PullRequestsGetReviewCommentsResponseItemLinksHtml;
			pull_request: PullRequestsGetReviewCommentsResponseItemLinksPullRequest;
		};
		type PullRequestsGetReviewCommentsResponseItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsGetReviewCommentsResponseItem = {
			url: string;
			id: number;
			node_id: string;
			pull_request_review_id: number;
			diff_hunk: string;
			path: string;
			position: number;
			original_position: number;
			commit_id: string;
			original_commit_id: string;
			in_reply_to_id: number;
			user: PullRequestsGetReviewCommentsResponseItemUser;
			body: string;
			created_at: string;
			updated_at: string;
			html_url: string;
			pull_request_url: string;
			_links: PullRequestsGetReviewCommentsResponseItemLinks;
		};
		type PullRequestsGetReviewResponseLinksPullRequest = { href: string };
		type PullRequestsGetReviewResponseLinksHtml = { href: string };
		type PullRequestsGetReviewResponseLinks = {
			html: PullRequestsGetReviewResponseLinksHtml;
			pull_request: PullRequestsGetReviewResponseLinksPullRequest;
		};
		type PullRequestsGetReviewResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsGetReviewResponse = {
			id: number;
			node_id: string;
			user: PullRequestsGetReviewResponseUser;
			body: string;
			commit_id: string;
			state: string;
			html_url: string;
			pull_request_url: string;
			_links: PullRequestsGetReviewResponseLinks;
		};
		type PullRequestsGetFilesResponseItem = {
			sha: string;
			filename: string;
			status: string;
			additions: number;
			deletions: number;
			changes: number;
			blob_url: string;
			raw_url: string;
			contents_url: string;
			patch: string;
		};
		type PullRequestsGetCommitsResponseItemParentsItem = {
			url: string;
			sha: string;
		};
		type PullRequestsGetCommitsResponseItemCommitter = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsGetCommitsResponseItemAuthor = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsGetCommitsResponseItemCommitVerification = {
			verified: boolean;
			reason: string;
			signature: null;
			payload: null;
		};
		type PullRequestsGetCommitsResponseItemCommitTree = {
			url: string;
			sha: string;
		};
		type PullRequestsGetCommitsResponseItemCommitCommitter = {
			name: string;
			email: string;
			date: string;
		};
		type PullRequestsGetCommitsResponseItemCommitAuthor = {
			name: string;
			email: string;
			date: string;
		};
		type PullRequestsGetCommitsResponseItemCommit = {
			url: string;
			author: PullRequestsGetCommitsResponseItemCommitAuthor;
			committer: PullRequestsGetCommitsResponseItemCommitCommitter;
			message: string;
			tree: PullRequestsGetCommitsResponseItemCommitTree;
			comment_count: number;
			verification: PullRequestsGetCommitsResponseItemCommitVerification;
		};
		type PullRequestsGetCommitsResponseItem = {
			url: string;
			sha: string;
			node_id: string;
			html_url: string;
			comments_url: string;
			commit: PullRequestsGetCommitsResponseItemCommit;
			author: PullRequestsGetCommitsResponseItemAuthor;
			committer: PullRequestsGetCommitsResponseItemCommitter;
			parents: Array<PullRequestsGetCommitsResponseItemParentsItem>;
		};
		type PullRequestsGetCommentsForRepoResponseItemLinksPullRequest = {
			href: string;
		};
		type PullRequestsGetCommentsForRepoResponseItemLinksHtml = { href: string };
		type PullRequestsGetCommentsForRepoResponseItemLinksSelf = { href: string };
		type PullRequestsGetCommentsForRepoResponseItemLinks = {
			self: PullRequestsGetCommentsForRepoResponseItemLinksSelf;
			html: PullRequestsGetCommentsForRepoResponseItemLinksHtml;
			pull_request: PullRequestsGetCommentsForRepoResponseItemLinksPullRequest;
		};
		type PullRequestsGetCommentsForRepoResponseItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsGetCommentsForRepoResponseItem = {
			url: string;
			id: number;
			node_id: string;
			pull_request_review_id: number;
			diff_hunk: string;
			path: string;
			position: number;
			original_position: number;
			commit_id: string;
			original_commit_id: string;
			in_reply_to_id: number;
			user: PullRequestsGetCommentsForRepoResponseItemUser;
			body: string;
			created_at: string;
			updated_at: string;
			html_url: string;
			pull_request_url: string;
			_links: PullRequestsGetCommentsForRepoResponseItemLinks;
		};
		type PullRequestsGetCommentsResponseItemLinksPullRequest = { href: string };
		type PullRequestsGetCommentsResponseItemLinksHtml = { href: string };
		type PullRequestsGetCommentsResponseItemLinksSelf = { href: string };
		type PullRequestsGetCommentsResponseItemLinks = {
			self: PullRequestsGetCommentsResponseItemLinksSelf;
			html: PullRequestsGetCommentsResponseItemLinksHtml;
			pull_request: PullRequestsGetCommentsResponseItemLinksPullRequest;
		};
		type PullRequestsGetCommentsResponseItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsGetCommentsResponseItem = {
			url: string;
			id: number;
			node_id: string;
			pull_request_review_id: number;
			diff_hunk: string;
			path: string;
			position: number;
			original_position: number;
			commit_id: string;
			original_commit_id: string;
			in_reply_to_id: number;
			user: PullRequestsGetCommentsResponseItemUser;
			body: string;
			created_at: string;
			updated_at: string;
			html_url: string;
			pull_request_url: string;
			_links: PullRequestsGetCommentsResponseItemLinks;
		};
		type PullRequestsGetCommentResponseLinksPullRequest = { href: string };
		type PullRequestsGetCommentResponseLinksHtml = { href: string };
		type PullRequestsGetCommentResponseLinksSelf = { href: string };
		type PullRequestsGetCommentResponseLinks = {
			self: PullRequestsGetCommentResponseLinksSelf;
			html: PullRequestsGetCommentResponseLinksHtml;
			pull_request: PullRequestsGetCommentResponseLinksPullRequest;
		};
		type PullRequestsGetCommentResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsGetCommentResponse = {
			url: string;
			id: number;
			node_id: string;
			pull_request_review_id: number;
			diff_hunk: string;
			path: string;
			position: number;
			original_position: number;
			commit_id: string;
			original_commit_id: string;
			in_reply_to_id: number;
			user: PullRequestsGetCommentResponseUser;
			body: string;
			created_at: string;
			updated_at: string;
			html_url: string;
			pull_request_url: string;
			_links: PullRequestsGetCommentResponseLinks;
		};
		type PullRequestsGetAllResponseItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsGetAllResponseItemLinksStatuses = { href: string };
		type PullRequestsGetAllResponseItemLinksCommits = { href: string };
		type PullRequestsGetAllResponseItemLinksReviewComment = { href: string };
		type PullRequestsGetAllResponseItemLinksReviewComments = { href: string };
		type PullRequestsGetAllResponseItemLinksComments = { href: string };
		type PullRequestsGetAllResponseItemLinksIssue = { href: string };
		type PullRequestsGetAllResponseItemLinksHtml = { href: string };
		type PullRequestsGetAllResponseItemLinksSelf = { href: string };
		type PullRequestsGetAllResponseItemLinks = {
			self: PullRequestsGetAllResponseItemLinksSelf;
			html: PullRequestsGetAllResponseItemLinksHtml;
			issue: PullRequestsGetAllResponseItemLinksIssue;
			comments: PullRequestsGetAllResponseItemLinksComments;
			review_comments: PullRequestsGetAllResponseItemLinksReviewComments;
			review_comment: PullRequestsGetAllResponseItemLinksReviewComment;
			commits: PullRequestsGetAllResponseItemLinksCommits;
			statuses: PullRequestsGetAllResponseItemLinksStatuses;
		};
		type PullRequestsGetAllResponseItemBaseRepoPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type PullRequestsGetAllResponseItemBaseRepoOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsGetAllResponseItemBaseRepo = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: PullRequestsGetAllResponseItemBaseRepoOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: PullRequestsGetAllResponseItemBaseRepoPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type PullRequestsGetAllResponseItemBaseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsGetAllResponseItemBase = {
			label: string;
			ref: string;
			sha: string;
			user: PullRequestsGetAllResponseItemBaseUser;
			repo: PullRequestsGetAllResponseItemBaseRepo;
		};
		type PullRequestsGetAllResponseItemHeadRepoPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type PullRequestsGetAllResponseItemHeadRepoOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsGetAllResponseItemHeadRepo = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: PullRequestsGetAllResponseItemHeadRepoOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: PullRequestsGetAllResponseItemHeadRepoPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type PullRequestsGetAllResponseItemHeadUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsGetAllResponseItemHead = {
			label: string;
			ref: string;
			sha: string;
			user: PullRequestsGetAllResponseItemHeadUser;
			repo: PullRequestsGetAllResponseItemHeadRepo;
		};
		type PullRequestsGetAllResponseItemMilestoneCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsGetAllResponseItemMilestone = {
			url: string;
			html_url: string;
			labels_url: string;
			id: number;
			node_id: string;
			number: number;
			state: string;
			title: string;
			description: string;
			creator: PullRequestsGetAllResponseItemMilestoneCreator;
			open_issues: number;
			closed_issues: number;
			created_at: string;
			updated_at: string;
			closed_at: string;
			due_on: string;
		};
		type PullRequestsGetAllResponseItemLabelsItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		};
		type PullRequestsGetAllResponseItemAssignee = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsGetAllResponseItem = {
			id: number;
			node_id: string;
			url: string;
			html_url: string;
			diff_url: string;
			patch_url: string;
			issue_url: string;
			commits_url: string;
			review_comments_url: string;
			review_comment_url: string;
			comments_url: string;
			statuses_url: string;
			number: number;
			state: string;
			title: string;
			body: string;
			assignee: PullRequestsGetAllResponseItemAssignee;
			labels: Array<PullRequestsGetAllResponseItemLabelsItem>;
			milestone: PullRequestsGetAllResponseItemMilestone;
			locked: boolean;
			active_lock_reason: string;
			created_at: string;
			updated_at: string;
			closed_at: string;
			merged_at: string;
			head: PullRequestsGetAllResponseItemHead;
			base: PullRequestsGetAllResponseItemBase;
			_links: PullRequestsGetAllResponseItemLinks;
			user: PullRequestsGetAllResponseItemUser;
		};
		type PullRequestsGetResponseMergedBy = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsGetResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsGetResponseLinksStatuses = { href: string };
		type PullRequestsGetResponseLinksCommits = { href: string };
		type PullRequestsGetResponseLinksReviewComment = { href: string };
		type PullRequestsGetResponseLinksReviewComments = { href: string };
		type PullRequestsGetResponseLinksComments = { href: string };
		type PullRequestsGetResponseLinksIssue = { href: string };
		type PullRequestsGetResponseLinksHtml = { href: string };
		type PullRequestsGetResponseLinksSelf = { href: string };
		type PullRequestsGetResponseLinks = {
			self: PullRequestsGetResponseLinksSelf;
			html: PullRequestsGetResponseLinksHtml;
			issue: PullRequestsGetResponseLinksIssue;
			comments: PullRequestsGetResponseLinksComments;
			review_comments: PullRequestsGetResponseLinksReviewComments;
			review_comment: PullRequestsGetResponseLinksReviewComment;
			commits: PullRequestsGetResponseLinksCommits;
			statuses: PullRequestsGetResponseLinksStatuses;
		};
		type PullRequestsGetResponseBaseRepoPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type PullRequestsGetResponseBaseRepoOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsGetResponseBaseRepo = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: PullRequestsGetResponseBaseRepoOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: PullRequestsGetResponseBaseRepoPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type PullRequestsGetResponseBaseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsGetResponseBase = {
			label: string;
			ref: string;
			sha: string;
			user: PullRequestsGetResponseBaseUser;
			repo: PullRequestsGetResponseBaseRepo;
		};
		type PullRequestsGetResponseHeadRepoPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type PullRequestsGetResponseHeadRepoOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsGetResponseHeadRepo = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: PullRequestsGetResponseHeadRepoOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: PullRequestsGetResponseHeadRepoPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type PullRequestsGetResponseHeadUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsGetResponseHead = {
			label: string;
			ref: string;
			sha: string;
			user: PullRequestsGetResponseHeadUser;
			repo: PullRequestsGetResponseHeadRepo;
		};
		type PullRequestsGetResponseMilestoneCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsGetResponseMilestone = {
			url: string;
			html_url: string;
			labels_url: string;
			id: number;
			node_id: string;
			number: number;
			state: string;
			title: string;
			description: string;
			creator: PullRequestsGetResponseMilestoneCreator;
			open_issues: number;
			closed_issues: number;
			created_at: string;
			updated_at: string;
			closed_at: string;
			due_on: string;
		};
		type PullRequestsGetResponseLabelsItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		};
		type PullRequestsGetResponseAssignee = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsGetResponse = {
			id: number;
			node_id: string;
			url: string;
			html_url: string;
			diff_url: string;
			patch_url: string;
			issue_url: string;
			commits_url: string;
			review_comments_url: string;
			review_comment_url: string;
			comments_url: string;
			statuses_url: string;
			number: number;
			state: string;
			title: string;
			body: string;
			assignee: PullRequestsGetResponseAssignee;
			labels: Array<PullRequestsGetResponseLabelsItem>;
			milestone: PullRequestsGetResponseMilestone;
			locked: boolean;
			active_lock_reason: string;
			created_at: string;
			updated_at: string;
			closed_at: string;
			merged_at: string;
			head: PullRequestsGetResponseHead;
			base: PullRequestsGetResponseBase;
			_links: PullRequestsGetResponseLinks;
			user: PullRequestsGetResponseUser;
			merge_commit_sha: string;
			merged: boolean;
			mergeable: boolean;
			merged_by: PullRequestsGetResponseMergedBy;
			comments: number;
			commits: number;
			additions: number;
			deletions: number;
			changed_files: number;
			maintainer_can_modify: boolean;
		};
		type PullRequestsEditCommentResponseLinksPullRequest = { href: string };
		type PullRequestsEditCommentResponseLinksHtml = { href: string };
		type PullRequestsEditCommentResponseLinksSelf = { href: string };
		type PullRequestsEditCommentResponseLinks = {
			self: PullRequestsEditCommentResponseLinksSelf;
			html: PullRequestsEditCommentResponseLinksHtml;
			pull_request: PullRequestsEditCommentResponseLinksPullRequest;
		};
		type PullRequestsEditCommentResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsEditCommentResponse = {
			url: string;
			id: number;
			node_id: string;
			pull_request_review_id: number;
			diff_hunk: string;
			path: string;
			position: number;
			original_position: number;
			commit_id: string;
			original_commit_id: string;
			in_reply_to_id: number;
			user: PullRequestsEditCommentResponseUser;
			body: string;
			created_at: string;
			updated_at: string;
			html_url: string;
			pull_request_url: string;
			_links: PullRequestsEditCommentResponseLinks;
		};
		type PullRequestsDismissReviewResponseLinksPullRequest = { href: string };
		type PullRequestsDismissReviewResponseLinksHtml = { href: string };
		type PullRequestsDismissReviewResponseLinks = {
			html: PullRequestsDismissReviewResponseLinksHtml;
			pull_request: PullRequestsDismissReviewResponseLinksPullRequest;
		};
		type PullRequestsDismissReviewResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsDismissReviewResponse = {
			id: number;
			node_id: string;
			user: PullRequestsDismissReviewResponseUser;
			body: string;
			commit_id: string;
			state: string;
			html_url: string;
			pull_request_url: string;
			_links: PullRequestsDismissReviewResponseLinks;
		};
		type PullRequestsDeleteReviewRequestResponse = {};
		type PullRequestsDeletePendingReviewResponseLinksPullRequest = {
			href: string;
		};
		type PullRequestsDeletePendingReviewResponseLinksHtml = { href: string };
		type PullRequestsDeletePendingReviewResponseLinks = {
			html: PullRequestsDeletePendingReviewResponseLinksHtml;
			pull_request: PullRequestsDeletePendingReviewResponseLinksPullRequest;
		};
		type PullRequestsDeletePendingReviewResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsDeletePendingReviewResponse = {
			id: number;
			node_id: string;
			user: PullRequestsDeletePendingReviewResponseUser;
			body: string;
			commit_id: string;
			state: string;
			html_url: string;
			pull_request_url: string;
			_links: PullRequestsDeletePendingReviewResponseLinks;
		};
		type PullRequestsDeleteCommentResponse = {};
		type PullRequestsCreateReviewRequestResponseRequestedTeamsItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			slug: string;
			description: string;
			privacy: string;
			permission: string;
			members_url: string;
			repositories_url: string;
			parent: null;
		};
		type PullRequestsCreateReviewRequestResponseRequestedReviewersItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsCreateReviewRequestResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsCreateReviewRequestResponseLinksStatuses = { href: string };
		type PullRequestsCreateReviewRequestResponseLinksCommits = { href: string };
		type PullRequestsCreateReviewRequestResponseLinksReviewComment = {
			href: string;
		};
		type PullRequestsCreateReviewRequestResponseLinksReviewComments = {
			href: string;
		};
		type PullRequestsCreateReviewRequestResponseLinksComments = { href: string };
		type PullRequestsCreateReviewRequestResponseLinksIssue = { href: string };
		type PullRequestsCreateReviewRequestResponseLinksHtml = { href: string };
		type PullRequestsCreateReviewRequestResponseLinksSelf = { href: string };
		type PullRequestsCreateReviewRequestResponseLinks = {
			self: PullRequestsCreateReviewRequestResponseLinksSelf;
			html: PullRequestsCreateReviewRequestResponseLinksHtml;
			issue: PullRequestsCreateReviewRequestResponseLinksIssue;
			comments: PullRequestsCreateReviewRequestResponseLinksComments;
			review_comments: PullRequestsCreateReviewRequestResponseLinksReviewComments;
			review_comment: PullRequestsCreateReviewRequestResponseLinksReviewComment;
			commits: PullRequestsCreateReviewRequestResponseLinksCommits;
			statuses: PullRequestsCreateReviewRequestResponseLinksStatuses;
		};
		type PullRequestsCreateReviewRequestResponseBaseRepoPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type PullRequestsCreateReviewRequestResponseBaseRepoOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsCreateReviewRequestResponseBaseRepo = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: PullRequestsCreateReviewRequestResponseBaseRepoOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: PullRequestsCreateReviewRequestResponseBaseRepoPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type PullRequestsCreateReviewRequestResponseBaseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsCreateReviewRequestResponseBase = {
			label: string;
			ref: string;
			sha: string;
			user: PullRequestsCreateReviewRequestResponseBaseUser;
			repo: PullRequestsCreateReviewRequestResponseBaseRepo;
		};
		type PullRequestsCreateReviewRequestResponseHeadRepoPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type PullRequestsCreateReviewRequestResponseHeadRepoOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsCreateReviewRequestResponseHeadRepo = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: PullRequestsCreateReviewRequestResponseHeadRepoOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: PullRequestsCreateReviewRequestResponseHeadRepoPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type PullRequestsCreateReviewRequestResponseHeadUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsCreateReviewRequestResponseHead = {
			label: string;
			ref: string;
			sha: string;
			user: PullRequestsCreateReviewRequestResponseHeadUser;
			repo: PullRequestsCreateReviewRequestResponseHeadRepo;
		};
		type PullRequestsCreateReviewRequestResponseMilestoneCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsCreateReviewRequestResponseMilestone = {
			url: string;
			html_url: string;
			labels_url: string;
			id: number;
			node_id: string;
			number: number;
			state: string;
			title: string;
			description: string;
			creator: PullRequestsCreateReviewRequestResponseMilestoneCreator;
			open_issues: number;
			closed_issues: number;
			created_at: string;
			updated_at: string;
			closed_at: string;
			due_on: string;
		};
		type PullRequestsCreateReviewRequestResponseLabelsItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		};
		type PullRequestsCreateReviewRequestResponseAssignee = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsCreateReviewRequestResponse = {
			id: number;
			node_id: string;
			url: string;
			html_url: string;
			diff_url: string;
			patch_url: string;
			issue_url: string;
			commits_url: string;
			review_comments_url: string;
			review_comment_url: string;
			comments_url: string;
			statuses_url: string;
			number: number;
			state: string;
			title: string;
			body: string;
			assignee: PullRequestsCreateReviewRequestResponseAssignee;
			labels: Array<PullRequestsCreateReviewRequestResponseLabelsItem>;
			milestone: PullRequestsCreateReviewRequestResponseMilestone;
			locked: boolean;
			active_lock_reason: string;
			created_at: string;
			updated_at: string;
			closed_at: string;
			merged_at: string;
			head: PullRequestsCreateReviewRequestResponseHead;
			base: PullRequestsCreateReviewRequestResponseBase;
			_links: PullRequestsCreateReviewRequestResponseLinks;
			user: PullRequestsCreateReviewRequestResponseUser;
			requested_reviewers: Array<
				PullRequestsCreateReviewRequestResponseRequestedReviewersItem
				>;
			requested_teams: Array<
				PullRequestsCreateReviewRequestResponseRequestedTeamsItem
				>;
		};
		type PullRequestsCreateReviewResponseLinksPullRequest = { href: string };
		type PullRequestsCreateReviewResponseLinksHtml = { href: string };
		type PullRequestsCreateReviewResponseLinks = {
			html: PullRequestsCreateReviewResponseLinksHtml;
			pull_request: PullRequestsCreateReviewResponseLinksPullRequest;
		};
		type PullRequestsCreateReviewResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsCreateReviewResponse = {
			id: number;
			node_id: string;
			user: PullRequestsCreateReviewResponseUser;
			body: string;
			commit_id: string;
			state: string;
			html_url: string;
			pull_request_url: string;
			_links: PullRequestsCreateReviewResponseLinks;
		};
		type PullRequestsCreateFromIssueResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsCreateFromIssueResponseLinksStatuses = { href: string };
		type PullRequestsCreateFromIssueResponseLinksCommits = { href: string };
		type PullRequestsCreateFromIssueResponseLinksReviewComment = { href: string };
		type PullRequestsCreateFromIssueResponseLinksReviewComments = {
			href: string;
		};
		type PullRequestsCreateFromIssueResponseLinksComments = { href: string };
		type PullRequestsCreateFromIssueResponseLinksIssue = { href: string };
		type PullRequestsCreateFromIssueResponseLinksHtml = { href: string };
		type PullRequestsCreateFromIssueResponseLinksSelf = { href: string };
		type PullRequestsCreateFromIssueResponseLinks = {
			self: PullRequestsCreateFromIssueResponseLinksSelf;
			html: PullRequestsCreateFromIssueResponseLinksHtml;
			issue: PullRequestsCreateFromIssueResponseLinksIssue;
			comments: PullRequestsCreateFromIssueResponseLinksComments;
			review_comments: PullRequestsCreateFromIssueResponseLinksReviewComments;
			review_comment: PullRequestsCreateFromIssueResponseLinksReviewComment;
			commits: PullRequestsCreateFromIssueResponseLinksCommits;
			statuses: PullRequestsCreateFromIssueResponseLinksStatuses;
		};
		type PullRequestsCreateFromIssueResponseBaseRepoPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type PullRequestsCreateFromIssueResponseBaseRepoOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsCreateFromIssueResponseBaseRepo = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: PullRequestsCreateFromIssueResponseBaseRepoOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: PullRequestsCreateFromIssueResponseBaseRepoPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type PullRequestsCreateFromIssueResponseBaseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsCreateFromIssueResponseBase = {
			label: string;
			ref: string;
			sha: string;
			user: PullRequestsCreateFromIssueResponseBaseUser;
			repo: PullRequestsCreateFromIssueResponseBaseRepo;
		};
		type PullRequestsCreateFromIssueResponseHeadRepoPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type PullRequestsCreateFromIssueResponseHeadRepoOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsCreateFromIssueResponseHeadRepo = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: PullRequestsCreateFromIssueResponseHeadRepoOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: PullRequestsCreateFromIssueResponseHeadRepoPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type PullRequestsCreateFromIssueResponseHeadUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsCreateFromIssueResponseHead = {
			label: string;
			ref: string;
			sha: string;
			user: PullRequestsCreateFromIssueResponseHeadUser;
			repo: PullRequestsCreateFromIssueResponseHeadRepo;
		};
		type PullRequestsCreateFromIssueResponseMilestoneCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsCreateFromIssueResponseMilestone = {
			url: string;
			html_url: string;
			labels_url: string;
			id: number;
			node_id: string;
			number: number;
			state: string;
			title: string;
			description: string;
			creator: PullRequestsCreateFromIssueResponseMilestoneCreator;
			open_issues: number;
			closed_issues: number;
			created_at: string;
			updated_at: string;
			closed_at: string;
			due_on: string;
		};
		type PullRequestsCreateFromIssueResponseLabelsItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		};
		type PullRequestsCreateFromIssueResponseAssignee = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsCreateFromIssueResponse = {
			id: number;
			node_id: string;
			url: string;
			html_url: string;
			diff_url: string;
			patch_url: string;
			issue_url: string;
			commits_url: string;
			review_comments_url: string;
			review_comment_url: string;
			comments_url: string;
			statuses_url: string;
			number: number;
			state: string;
			title: string;
			body: string;
			assignee: PullRequestsCreateFromIssueResponseAssignee;
			labels: Array<PullRequestsCreateFromIssueResponseLabelsItem>;
			milestone: PullRequestsCreateFromIssueResponseMilestone;
			locked: boolean;
			active_lock_reason: string;
			created_at: string;
			updated_at: string;
			closed_at: string;
			merged_at: string;
			head: PullRequestsCreateFromIssueResponseHead;
			base: PullRequestsCreateFromIssueResponseBase;
			_links: PullRequestsCreateFromIssueResponseLinks;
			user: PullRequestsCreateFromIssueResponseUser;
		};
		type PullRequestsCreateCommentReplyResponseLinksPullRequest = {
			href: string;
		};
		type PullRequestsCreateCommentReplyResponseLinksHtml = { href: string };
		type PullRequestsCreateCommentReplyResponseLinksSelf = { href: string };
		type PullRequestsCreateCommentReplyResponseLinks = {
			self: PullRequestsCreateCommentReplyResponseLinksSelf;
			html: PullRequestsCreateCommentReplyResponseLinksHtml;
			pull_request: PullRequestsCreateCommentReplyResponseLinksPullRequest;
		};
		type PullRequestsCreateCommentReplyResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsCreateCommentReplyResponse = {
			url: string;
			id: number;
			node_id: string;
			pull_request_review_id: number;
			diff_hunk: string;
			path: string;
			position: number;
			original_position: number;
			commit_id: string;
			original_commit_id: string;
			in_reply_to_id: number;
			user: PullRequestsCreateCommentReplyResponseUser;
			body: string;
			created_at: string;
			updated_at: string;
			html_url: string;
			pull_request_url: string;
			_links: PullRequestsCreateCommentReplyResponseLinks;
		};
		type PullRequestsCreateCommentResponseLinksPullRequest = { href: string };
		type PullRequestsCreateCommentResponseLinksHtml = { href: string };
		type PullRequestsCreateCommentResponseLinksSelf = { href: string };
		type PullRequestsCreateCommentResponseLinks = {
			self: PullRequestsCreateCommentResponseLinksSelf;
			html: PullRequestsCreateCommentResponseLinksHtml;
			pull_request: PullRequestsCreateCommentResponseLinksPullRequest;
		};
		type PullRequestsCreateCommentResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsCreateCommentResponse = {
			url: string;
			id: number;
			node_id: string;
			pull_request_review_id: number;
			diff_hunk: string;
			path: string;
			position: number;
			original_position: number;
			commit_id: string;
			original_commit_id: string;
			in_reply_to_id: number;
			user: PullRequestsCreateCommentResponseUser;
			body: string;
			created_at: string;
			updated_at: string;
			html_url: string;
			pull_request_url: string;
			_links: PullRequestsCreateCommentResponseLinks;
		};
		type PullRequestsCreateResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsCreateResponseLinksStatuses = { href: string };
		type PullRequestsCreateResponseLinksCommits = { href: string };
		type PullRequestsCreateResponseLinksReviewComment = { href: string };
		type PullRequestsCreateResponseLinksReviewComments = { href: string };
		type PullRequestsCreateResponseLinksComments = { href: string };
		type PullRequestsCreateResponseLinksIssue = { href: string };
		type PullRequestsCreateResponseLinksHtml = { href: string };
		type PullRequestsCreateResponseLinksSelf = { href: string };
		type PullRequestsCreateResponseLinks = {
			self: PullRequestsCreateResponseLinksSelf;
			html: PullRequestsCreateResponseLinksHtml;
			issue: PullRequestsCreateResponseLinksIssue;
			comments: PullRequestsCreateResponseLinksComments;
			review_comments: PullRequestsCreateResponseLinksReviewComments;
			review_comment: PullRequestsCreateResponseLinksReviewComment;
			commits: PullRequestsCreateResponseLinksCommits;
			statuses: PullRequestsCreateResponseLinksStatuses;
		};
		type PullRequestsCreateResponseBaseRepoPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type PullRequestsCreateResponseBaseRepoOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsCreateResponseBaseRepo = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: PullRequestsCreateResponseBaseRepoOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: PullRequestsCreateResponseBaseRepoPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type PullRequestsCreateResponseBaseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsCreateResponseBase = {
			label: string;
			ref: string;
			sha: string;
			user: PullRequestsCreateResponseBaseUser;
			repo: PullRequestsCreateResponseBaseRepo;
		};
		type PullRequestsCreateResponseHeadRepoPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type PullRequestsCreateResponseHeadRepoOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsCreateResponseHeadRepo = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: PullRequestsCreateResponseHeadRepoOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: PullRequestsCreateResponseHeadRepoPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type PullRequestsCreateResponseHeadUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsCreateResponseHead = {
			label: string;
			ref: string;
			sha: string;
			user: PullRequestsCreateResponseHeadUser;
			repo: PullRequestsCreateResponseHeadRepo;
		};
		type PullRequestsCreateResponseMilestoneCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsCreateResponseMilestone = {
			url: string;
			html_url: string;
			labels_url: string;
			id: number;
			node_id: string;
			number: number;
			state: string;
			title: string;
			description: string;
			creator: PullRequestsCreateResponseMilestoneCreator;
			open_issues: number;
			closed_issues: number;
			created_at: string;
			updated_at: string;
			closed_at: string;
			due_on: string;
		};
		type PullRequestsCreateResponseLabelsItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		};
		type PullRequestsCreateResponseAssignee = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type PullRequestsCreateResponse = {
			id: number;
			node_id: string;
			url: string;
			html_url: string;
			diff_url: string;
			patch_url: string;
			issue_url: string;
			commits_url: string;
			review_comments_url: string;
			review_comment_url: string;
			comments_url: string;
			statuses_url: string;
			number: number;
			state: string;
			title: string;
			body: string;
			assignee: PullRequestsCreateResponseAssignee;
			labels: Array<PullRequestsCreateResponseLabelsItem>;
			milestone: PullRequestsCreateResponseMilestone;
			locked: boolean;
			active_lock_reason: string;
			created_at: string;
			updated_at: string;
			closed_at: string;
			merged_at: string;
			head: PullRequestsCreateResponseHead;
			base: PullRequestsCreateResponseBase;
			_links: PullRequestsCreateResponseLinks;
			user: PullRequestsCreateResponseUser;
		};
		type ProjectsUpdateProjectResponseCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ProjectsUpdateProjectResponse = {
			owner_url: string;
			url: string;
			html_url: string;
			columns_url: string;
			id: number;
			node_id: string;
			name: string;
			body: string;
			number: number;
			state: string;
			creator: ProjectsUpdateProjectResponseCreator;
			created_at: string;
			updated_at: string;
		};
		type ProjectsRemoveCollaboratorResponse = {};
		type ProjectsMoveProjectColumnResponse = {};
		type ProjectsMoveProjectCardResponse = {};
		type ProjectsGetUserPermissionLevelResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ProjectsGetUserPermissionLevelResponse = {
			permission: string;
			user: ProjectsGetUserPermissionLevelResponseUser;
		};
		type ProjectsGetRepoProjectsResponseItemCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ProjectsGetRepoProjectsResponseItem = {
			owner_url: string;
			url: string;
			html_url: string;
			columns_url: string;
			id: number;
			node_id: string;
			name: string;
			body: string;
			number: number;
			state: string;
			creator: ProjectsGetRepoProjectsResponseItemCreator;
			created_at: string;
			updated_at: string;
		};
		type ProjectsGetProjectColumnsResponseItem = {
			id: number;
			node_id: string;
			name: string;
			url: string;
			project_url: string;
			cards_url: string;
			created_at: string;
			updated_at: string;
		};
		type ProjectsGetProjectCardsResponseItemCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ProjectsGetProjectCardsResponseItem = {
			url: string;
			column_url: string;
			content_url: string;
			id: number;
			node_id: string;
			note: string;
			creator: ProjectsGetProjectCardsResponseItemCreator;
			created_at: string;
			updated_at: string;
			archived: boolean;
		};
		type ProjectsGetProjectResponseCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ProjectsGetProjectResponse = {
			owner_url: string;
			url: string;
			html_url: string;
			columns_url: string;
			id: number;
			node_id: string;
			name: string;
			body: string;
			number: number;
			state: string;
			creator: ProjectsGetProjectResponseCreator;
			created_at: string;
			updated_at: string;
		};
		type ProjectsGetOrgProjectsResponseItemCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ProjectsGetOrgProjectsResponseItem = {
			owner_url: string;
			url: string;
			html_url: string;
			columns_url: string;
			id: number;
			node_id: string;
			name: string;
			body: string;
			number: number;
			state: string;
			creator: ProjectsGetOrgProjectsResponseItemCreator;
			created_at: string;
			updated_at: string;
		};
		type ProjectsGetCollaboratorsResponseItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ProjectsDeleteProjectColumnResponse = {};
		type ProjectsDeleteProjectCardResponse = {};
		type ProjectsCreateRepoProjectResponseCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ProjectsCreateRepoProjectResponse = {
			owner_url: string;
			url: string;
			html_url: string;
			columns_url: string;
			id: number;
			node_id: string;
			name: string;
			body: string;
			number: number;
			state: string;
			creator: ProjectsCreateRepoProjectResponseCreator;
			created_at: string;
			updated_at: string;
		};
		type ProjectsCreateProjectCardResponseCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ProjectsCreateProjectCardResponse = {
			url: string;
			column_url: string;
			content_url: string;
			id: number;
			node_id: string;
			note: string;
			creator: ProjectsCreateProjectCardResponseCreator;
			created_at: string;
			updated_at: string;
			archived: boolean;
		};
		type ProjectsCreateOrgProjectResponseCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ProjectsCreateOrgProjectResponse = {
			owner_url: string;
			url: string;
			html_url: string;
			columns_url: string;
			id: number;
			node_id: string;
			name: string;
			body: string;
			number: number;
			state: string;
			creator: ProjectsCreateOrgProjectResponseCreator;
			created_at: string;
			updated_at: string;
		};
		type ProjectsAddCollaboratorResponse = {};
		type OrgsUpdateResponsePlan = {
			name: string;
			space: number;
			private_repos: number;
		};
		type OrgsUpdateResponse = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
			name: string;
			company: string;
			blog: string;
			location: string;
			email: string;
			is_verified: boolean;
			has_organization_projects: boolean;
			has_repository_projects: boolean;
			public_repos: number;
			public_gists: number;
			followers: number;
			following: number;
			html_url: string;
			created_at: string;
			type: string;
			total_private_repos: number;
			owned_private_repos: number;
			private_gists: number;
			disk_usage: number;
			collaborators: number;
			billing_email: string;
			plan: OrgsUpdateResponsePlan;
			default_repository_settings: string;
			members_can_create_repositories: boolean;
			two_factor_requirement_enabled: boolean;
		};
		type OrgsUnblockUserResponse = {};
		type OrgsRemoveTeamMembershipResponse = {};
		type OrgsRemoveOutsideCollaboratorResponse = {};
		type OrgsRemoveOrgMembershipResponse = {};
		type OrgsRemoveMemberResponse = {};
		type OrgsPublicizeMembershipResponse = {};
		type OrgsPingHookResponse = {};
		type OrgsGetTeamsResponseItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			slug: string;
			description: string;
			privacy: string;
			permission: string;
			members_url: string;
			repositories_url: string;
			parent: null;
		};
		type OrgsGetTeamReposResponseItemLicense = {
			key: string;
			name: string;
			spdx_id: string;
			url: string;
			node_id: string;
		};
		type OrgsGetTeamReposResponseItemPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type OrgsGetTeamReposResponseItemOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type OrgsGetTeamReposResponseItem = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: OrgsGetTeamReposResponseItemOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: OrgsGetTeamReposResponseItemPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
			license: OrgsGetTeamReposResponseItemLicense;
		};
		type OrgsGetTeamMembersResponseItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type OrgsGetTeamResponseOrganization = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
			name: string;
			company: string;
			blog: string;
			location: string;
			email: string;
			is_verified: boolean;
			has_organization_projects: boolean;
			has_repository_projects: boolean;
			public_repos: number;
			public_gists: number;
			followers: number;
			following: number;
			html_url: string;
			created_at: string;
			type: string;
		};
		type OrgsGetTeamResponse = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			slug: string;
			description: string;
			privacy: string;
			permission: string;
			members_url: string;
			repositories_url: string;
			parent: null;
			members_count: number;
			repos_count: number;
			created_at: string;
			updated_at: string;
			organization: OrgsGetTeamResponseOrganization;
		};
		type OrgsGetPublicMembersResponseItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type OrgsGetPendingTeamInvitesResponseItemInviter = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type OrgsGetPendingTeamInvitesResponseItem = {
			id: number;
			login: string;
			email: string;
			role: string;
			created_at: string;
			inviter: OrgsGetPendingTeamInvitesResponseItemInviter;
			team_count: number;
			invitation_team_url: string;
		};
		type OrgsGetPendingOrgInvitesResponseItemInviter = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type OrgsGetPendingOrgInvitesResponseItem = {
			id: number;
			login: string;
			email: string;
			role: string;
			created_at: string;
			inviter: OrgsGetPendingOrgInvitesResponseItemInviter;
			team_count: number;
			invitation_team_url: string;
		};
		type OrgsGetOutsideCollaboratorsResponseItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type OrgsGetMembersResponseItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type OrgsGetInvitationTeamsResponseItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			slug: string;
			description: string;
			privacy: string;
			permission: string;
			members_url: string;
			repositories_url: string;
			parent: null;
		};
		type OrgsGetHooksResponseItemConfig = {
			url: string;
			content_type: string;
		};
		type OrgsGetHooksResponseItem = {
			id: number;
			url: string;
			ping_url: string;
			name: string;
			events: Array<string>;
			active: boolean;
			config: OrgsGetHooksResponseItemConfig;
			updated_at: string;
			created_at: string;
		};
		type OrgsGetHookResponseConfig = {
			url: string;
			content_type: string;
		};
		type OrgsGetHookResponse = {
			id: number;
			url: string;
			ping_url: string;
			name: string;
			events: Array<string>;
			active: boolean;
			config: OrgsGetHookResponseConfig;
			updated_at: string;
			created_at: string;
		};
		type OrgsGetForUserResponseItem = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
		};
		type OrgsGetBlockedUsersResponseItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type OrgsGetAllResponseItem = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
		};
		type OrgsGetResponsePlan = {
			name: string;
			space: number;
			private_repos: number;
		};
		type OrgsGetResponse = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
			name: string;
			company: string;
			blog: string;
			location: string;
			email: string;
			is_verified: boolean;
			has_organization_projects: boolean;
			has_repository_projects: boolean;
			public_repos: number;
			public_gists: number;
			followers: number;
			following: number;
			html_url: string;
			created_at: string;
			type: string;
			total_private_repos: number;
			owned_private_repos: number;
			private_gists: number;
			disk_usage: number;
			collaborators: number;
			billing_email: string;
			plan: OrgsGetResponsePlan;
			default_repository_settings: string;
			members_can_create_repositories: boolean;
			two_factor_requirement_enabled: boolean;
		};
		type OrgsEditTeamResponseOrganization = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
			name: string;
			company: string;
			blog: string;
			location: string;
			email: string;
			is_verified: boolean;
			has_organization_projects: boolean;
			has_repository_projects: boolean;
			public_repos: number;
			public_gists: number;
			followers: number;
			following: number;
			html_url: string;
			created_at: string;
			type: string;
		};
		type OrgsEditTeamResponse = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			slug: string;
			description: string;
			privacy: string;
			permission: string;
			members_url: string;
			repositories_url: string;
			parent: null;
			members_count: number;
			repos_count: number;
			created_at: string;
			updated_at: string;
			organization: OrgsEditTeamResponseOrganization;
		};
		type OrgsEditHookResponseConfig = {
			url: string;
			content_type: string;
		};
		type OrgsEditHookResponse = {
			id: number;
			url: string;
			ping_url: string;
			name: string;
			events: Array<string>;
			active: boolean;
			config: OrgsEditHookResponseConfig;
			updated_at: string;
			created_at: string;
		};
		type OrgsDeleteTeamRepoResponse = {};
		type OrgsDeleteTeamResponse = {};
		type OrgsDeleteHookResponse = {};
		type OrgsCreateTeamResponseOrganization = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
			name: string;
			company: string;
			blog: string;
			location: string;
			email: string;
			is_verified: boolean;
			has_organization_projects: boolean;
			has_repository_projects: boolean;
			public_repos: number;
			public_gists: number;
			followers: number;
			following: number;
			html_url: string;
			created_at: string;
			type: string;
		};
		type OrgsCreateTeamResponse = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			slug: string;
			description: string;
			privacy: string;
			permission: string;
			members_url: string;
			repositories_url: string;
			parent: null;
			members_count: number;
			repos_count: number;
			created_at: string;
			updated_at: string;
			organization: OrgsCreateTeamResponseOrganization;
		};
		type OrgsCreateInvitationResponseInviter = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type OrgsCreateInvitationResponse = {
			id: number;
			login: string;
			email: string;
			role: string;
			created_at: string;
			inviter: OrgsCreateInvitationResponseInviter;
			team_count: number;
			invitation_team_url: string;
		};
		type OrgsCreateHookResponseConfig = {
			url: string;
			content_type: string;
		};
		type OrgsCreateHookResponse = {
			id: number;
			url: string;
			ping_url: string;
			name: string;
			events: Array<string>;
			active: boolean;
			config: OrgsCreateHookResponseConfig;
			updated_at: string;
			created_at: string;
		};
		type OrgsConvertMemberToOutsideCollaboratorResponse = {};
		type OrgsConcealMembershipResponse = {};
		type OrgsCheckBlockedUserResponse = {};
		type OrgsBlockUserResponse = {};
		type OrgsAddTeamRepoResponse = {};
		type MiscRenderMarkdownRawResponse = {};
		type MiscRenderMarkdownResponse = {};
		type MiscGetRepoLicenseResponseLicense = {
			key: string;
			name: string;
			spdx_id: string;
			url: string;
			node_id: string;
		};
		type MiscGetRepoLicenseResponseLinks = {
			self: string;
			git: string;
			html: string;
		};
		type MiscGetRepoLicenseResponse = {
			name: string;
			path: string;
			sha: string;
			size: number;
			url: string;
			html_url: string;
			git_url: string;
			download_url: string;
			type: string;
			content: string;
			encoding: string;
			_links: MiscGetRepoLicenseResponseLinks;
			license: MiscGetRepoLicenseResponseLicense;
		};
		type MiscGetRepoCodeOfConductResponse = {
			key: string;
			name: string;
			url: string;
			body: string;
		};
		type MiscGetRateLimitResponseRate = {
			limit: number;
			remaining: number;
			reset: number;
		};
		type MiscGetRateLimitResponseResourcesGraphql = {
			limit: number;
			remaining: number;
			reset: number;
		};
		type MiscGetRateLimitResponseResourcesSearch = {
			limit: number;
			remaining: number;
			reset: number;
		};
		type MiscGetRateLimitResponseResourcesCore = {
			limit: number;
			remaining: number;
			reset: number;
		};
		type MiscGetRateLimitResponseResources = {
			core: MiscGetRateLimitResponseResourcesCore;
			search: MiscGetRateLimitResponseResourcesSearch;
			graphql: MiscGetRateLimitResponseResourcesGraphql;
		};
		type MiscGetRateLimitResponse = {
			resources: MiscGetRateLimitResponseResources;
			rate: MiscGetRateLimitResponseRate;
		};
		type MiscGetLicensesResponseItem = {
			key: string;
			name: string;
			spdx_id: string;
			url: string;
			node_id?: string;
		};
		type MiscGetLicenseResponse = {
			key: string;
			name: string;
			spdx_id: string;
			url: string;
			node_id: string;
			html_url: string;
			description: string;
			implementation: string;
			permissions: Array<string>;
			conditions: Array<string>;
			limitations: Array<string>;
			body: string;
			featured: boolean;
		};
		type MiscGetGitignoreTemplateResponse = {
			name?: string;
			source?: string;
		};
		type MiscGetCodesOfConductResponseItem = {
			key: string;
			name: string;
			url: string;
		};
		type MiscGetCodeOfConductResponse = {
			key: string;
			name: string;
			url: string;
			body: string;
		};
		type MigrationsUpdateImportResponse = {
			vcs: string;
			use_lfs: string;
			vcs_url: string;
			status: string;
			url: string;
			html_url: string;
			authors_url: string;
			repository_url: string;
		};
		type MigrationsUnlockRepoLockedForMigrationResponse = {};
		type MigrationsUnlockRepoForAuthenticatedUserResponse = {};
		type MigrationsStartMigrationResponseRepositoriesItemPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type MigrationsStartMigrationResponseRepositoriesItemOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type MigrationsStartMigrationResponseRepositoriesItem = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: MigrationsStartMigrationResponseRepositoriesItemOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: MigrationsStartMigrationResponseRepositoriesItemPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type MigrationsStartMigrationResponseOwner = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
		};
		type MigrationsStartMigrationResponse = {
			id: number;
			owner: MigrationsStartMigrationResponseOwner;
			guid: string;
			state: string;
			lock_repositories: boolean;
			exclude_attachments: boolean;
			repositories: Array<MigrationsStartMigrationResponseRepositoriesItem>;
			url: string;
			created_at: string;
			updated_at: string;
		};
		type MigrationsStartImportResponse = {
			vcs: string;
			use_lfs: string;
			vcs_url: string;
			status: string;
			status_text: string;
			has_large_files: boolean;
			large_files_size: number;
			large_files_count: number;
			authors_count: number;
			percent: number;
			commit_count: number;
			url: string;
			html_url: string;
			authors_url: string;
			repository_url: string;
		};
		type MigrationsStartForAuthenticatedUserResponseRepositoriesItemPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type MigrationsStartForAuthenticatedUserResponseRepositoriesItemOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type MigrationsStartForAuthenticatedUserResponseRepositoriesItem = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: MigrationsStartForAuthenticatedUserResponseRepositoriesItemOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: MigrationsStartForAuthenticatedUserResponseRepositoriesItemPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type MigrationsStartForAuthenticatedUserResponseOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type MigrationsStartForAuthenticatedUserResponse = {
			id: number;
			owner: MigrationsStartForAuthenticatedUserResponseOwner;
			guid: string;
			state: string;
			lock_repositories: boolean;
			exclude_attachments: boolean;
			repositories: Array<
				MigrationsStartForAuthenticatedUserResponseRepositoriesItem
				>;
			url: string;
			created_at: string;
			updated_at: string;
		};
		type MigrationsSetImportLfsPreferenceResponse = {
			vcs: string;
			use_lfs: string;
			vcs_url: string;
			status: string;
			status_text: string;
			has_large_files: boolean;
			large_files_size: number;
			large_files_count: number;
			authors_count: number;
			url: string;
			html_url: string;
			authors_url: string;
			repository_url: string;
		};
		type MigrationsMapImportCommitAuthorResponse = {
			id: number;
			remote_id: string;
			remote_name: string;
			email: string;
			name: string;
			url: string;
			import_url: string;
		};
		type MigrationsListForAuthenticatedUserResponseItemRepositoriesItemPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type MigrationsListForAuthenticatedUserResponseItemRepositoriesItemOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type MigrationsListForAuthenticatedUserResponseItemRepositoriesItem = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: MigrationsListForAuthenticatedUserResponseItemRepositoriesItemOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: MigrationsListForAuthenticatedUserResponseItemRepositoriesItemPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type MigrationsListForAuthenticatedUserResponseItemOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type MigrationsListForAuthenticatedUserResponseItem = {
			id: number;
			owner: MigrationsListForAuthenticatedUserResponseItemOwner;
			guid: string;
			state: string;
			lock_repositories: boolean;
			exclude_attachments: boolean;
			repositories: Array<
				MigrationsListForAuthenticatedUserResponseItemRepositoriesItem
				>;
			url: string;
			created_at: string;
			updated_at: string;
		};
		type MigrationsGetStatusForAuthenticatedUserResponseRepositoriesItemPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type MigrationsGetStatusForAuthenticatedUserResponseRepositoriesItemOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type MigrationsGetStatusForAuthenticatedUserResponseRepositoriesItem = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: MigrationsGetStatusForAuthenticatedUserResponseRepositoriesItemOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: MigrationsGetStatusForAuthenticatedUserResponseRepositoriesItemPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type MigrationsGetStatusForAuthenticatedUserResponseOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type MigrationsGetStatusForAuthenticatedUserResponse = {
			id: number;
			owner: MigrationsGetStatusForAuthenticatedUserResponseOwner;
			guid: string;
			state: string;
			lock_repositories: boolean;
			exclude_attachments: boolean;
			repositories: Array<
				MigrationsGetStatusForAuthenticatedUserResponseRepositoriesItem
				>;
			url: string;
			created_at: string;
			updated_at: string;
		};
		type MigrationsGetMigrationsResponseItemRepositoriesItemPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type MigrationsGetMigrationsResponseItemRepositoriesItemOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type MigrationsGetMigrationsResponseItemRepositoriesItem = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: MigrationsGetMigrationsResponseItemRepositoriesItemOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: MigrationsGetMigrationsResponseItemRepositoriesItemPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type MigrationsGetMigrationsResponseItemOwner = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
		};
		type MigrationsGetMigrationsResponseItem = {
			id: number;
			owner: MigrationsGetMigrationsResponseItemOwner;
			guid: string;
			state: string;
			lock_repositories: boolean;
			exclude_attachments: boolean;
			repositories: Array<MigrationsGetMigrationsResponseItemRepositoriesItem>;
			url: string;
			created_at: string;
			updated_at: string;
		};
		type MigrationsGetMigrationStatusResponseRepositoriesItemPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type MigrationsGetMigrationStatusResponseRepositoriesItemOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type MigrationsGetMigrationStatusResponseRepositoriesItem = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: MigrationsGetMigrationStatusResponseRepositoriesItemOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: MigrationsGetMigrationStatusResponseRepositoriesItemPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type MigrationsGetMigrationStatusResponseOwner = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
		};
		type MigrationsGetMigrationStatusResponse = {
			id: number;
			owner: MigrationsGetMigrationStatusResponseOwner;
			guid: string;
			state: string;
			lock_repositories: boolean;
			exclude_attachments: boolean;
			repositories: Array<MigrationsGetMigrationStatusResponseRepositoriesItem>;
			url: string;
			created_at: string;
			updated_at: string;
		};
		type MigrationsGetMigrationArchiveLinkResponse = {};
		type MigrationsGetLargeImportFilesResponseItem = {
			ref_name: string;
			path: string;
			oid: string;
			size: number;
		};
		type MigrationsGetImportProgressResponse = {
			vcs: string;
			use_lfs: string;
			vcs_url: string;
			status: string;
			status_text: string;
			has_large_files: boolean;
			large_files_size: number;
			large_files_count: number;
			authors_count: number;
			url: string;
			html_url: string;
			authors_url: string;
			repository_url: string;
		};
		type MigrationsGetImportCommitAuthorsResponseItem = {
			id: number;
			remote_id: string;
			remote_name: string;
			email: string;
			name: string;
			url: string;
			import_url: string;
		};
		type MigrationsGetArchiveForAuthenticatedUserResponse = {};
		type MigrationsDeleteMigrationArchiveResponse = {};
		type MigrationsDeleteArchiveForAuthenticatedUserResponse = {};
		type MigrationsCancelImportResponse = {};
		type IssuesUpdateMilestoneResponseCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesUpdateMilestoneResponse = {
			url: string;
			html_url: string;
			labels_url: string;
			id: number;
			node_id: string;
			number: number;
			state: string;
			title: string;
			description: string;
			creator: IssuesUpdateMilestoneResponseCreator;
			open_issues: number;
			closed_issues: number;
			created_at: string;
			updated_at: string;
			closed_at: string;
			due_on: string;
		};
		type IssuesUpdateLabelResponse = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		};
		type IssuesUnlockResponse = {};
		type IssuesReplaceAllLabelsResponseItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		};
		type IssuesRemoveAssigneesFromIssueResponsePullRequest = {
			url: string;
			html_url: string;
			diff_url: string;
			patch_url: string;
		};
		type IssuesRemoveAssigneesFromIssueResponseMilestoneCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesRemoveAssigneesFromIssueResponseMilestone = {
			url: string;
			html_url: string;
			labels_url: string;
			id: number;
			node_id: string;
			number: number;
			state: string;
			title: string;
			description: string;
			creator: IssuesRemoveAssigneesFromIssueResponseMilestoneCreator;
			open_issues: number;
			closed_issues: number;
			created_at: string;
			updated_at: string;
			closed_at: string;
			due_on: string;
		};
		type IssuesRemoveAssigneesFromIssueResponseAssigneesItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesRemoveAssigneesFromIssueResponseAssignee = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesRemoveAssigneesFromIssueResponseLabelsItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		};
		type IssuesRemoveAssigneesFromIssueResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesRemoveAssigneesFromIssueResponse = {
			id: number;
			node_id: string;
			url: string;
			repository_url: string;
			labels_url: string;
			comments_url: string;
			events_url: string;
			html_url: string;
			number: number;
			state: string;
			title: string;
			body: string;
			user: IssuesRemoveAssigneesFromIssueResponseUser;
			labels: Array<IssuesRemoveAssigneesFromIssueResponseLabelsItem>;
			assignee: IssuesRemoveAssigneesFromIssueResponseAssignee;
			assignees: Array<IssuesRemoveAssigneesFromIssueResponseAssigneesItem>;
			milestone: IssuesRemoveAssigneesFromIssueResponseMilestone;
			locked: boolean;
			active_lock_reason: string;
			comments: number;
			pull_request: IssuesRemoveAssigneesFromIssueResponsePullRequest;
			closed_at: null;
			created_at: string;
			updated_at: string;
		};
		type IssuesRemoveAllLabelsResponse = {};
		type IssuesLockResponse = {};
		type IssuesGetMilestonesResponseItemCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetMilestonesResponseItem = {
			url: string;
			html_url: string;
			labels_url: string;
			id: number;
			node_id: string;
			number: number;
			state: string;
			title: string;
			description: string;
			creator: IssuesGetMilestonesResponseItemCreator;
			open_issues: number;
			closed_issues: number;
			created_at: string;
			updated_at: string;
			closed_at: string;
			due_on: string;
		};
		type IssuesGetMilestoneLabelsResponseItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		};
		type IssuesGetMilestoneResponseCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetMilestoneResponse = {
			url: string;
			html_url: string;
			labels_url: string;
			id: number;
			node_id: string;
			number: number;
			state: string;
			title: string;
			description: string;
			creator: IssuesGetMilestoneResponseCreator;
			open_issues: number;
			closed_issues: number;
			created_at: string;
			updated_at: string;
			closed_at: string;
			due_on: string;
		};
		type IssuesGetLabelsResponseItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		};
		type IssuesGetLabelResponse = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		};
		type IssuesGetIssueLabelsResponseItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		};
		type IssuesGetForUserResponseItemRepositoryPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type IssuesGetForUserResponseItemRepositoryOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetForUserResponseItemRepository = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: IssuesGetForUserResponseItemRepositoryOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: IssuesGetForUserResponseItemRepositoryPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type IssuesGetForUserResponseItemPullRequest = {
			url: string;
			html_url: string;
			diff_url: string;
			patch_url: string;
		};
		type IssuesGetForUserResponseItemMilestoneCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetForUserResponseItemMilestone = {
			url: string;
			html_url: string;
			labels_url: string;
			id: number;
			node_id: string;
			number: number;
			state: string;
			title: string;
			description: string;
			creator: IssuesGetForUserResponseItemMilestoneCreator;
			open_issues: number;
			closed_issues: number;
			created_at: string;
			updated_at: string;
			closed_at: string;
			due_on: string;
		};
		type IssuesGetForUserResponseItemAssigneesItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetForUserResponseItemAssignee = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetForUserResponseItemLabelsItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		};
		type IssuesGetForUserResponseItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetForUserResponseItem = {
			id: number;
			node_id: string;
			url: string;
			repository_url: string;
			labels_url: string;
			comments_url: string;
			events_url: string;
			html_url: string;
			number: number;
			state: string;
			title: string;
			body: string;
			user: IssuesGetForUserResponseItemUser;
			labels: Array<IssuesGetForUserResponseItemLabelsItem>;
			assignee: IssuesGetForUserResponseItemAssignee;
			assignees: Array<IssuesGetForUserResponseItemAssigneesItem>;
			milestone: IssuesGetForUserResponseItemMilestone;
			locked: boolean;
			active_lock_reason: string;
			comments: number;
			pull_request: IssuesGetForUserResponseItemPullRequest;
			closed_at: null;
			created_at: string;
			updated_at: string;
			repository: IssuesGetForUserResponseItemRepository;
		};
		type IssuesGetForRepoResponseItemPullRequest = {
			url: string;
			html_url: string;
			diff_url: string;
			patch_url: string;
		};
		type IssuesGetForRepoResponseItemMilestoneCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetForRepoResponseItemMilestone = {
			url: string;
			html_url: string;
			labels_url: string;
			id: number;
			node_id: string;
			number: number;
			state: string;
			title: string;
			description: string;
			creator: IssuesGetForRepoResponseItemMilestoneCreator;
			open_issues: number;
			closed_issues: number;
			created_at: string;
			updated_at: string;
			closed_at: string;
			due_on: string;
		};
		type IssuesGetForRepoResponseItemAssigneesItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetForRepoResponseItemAssignee = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetForRepoResponseItemLabelsItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		};
		type IssuesGetForRepoResponseItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetForRepoResponseItem = {
			id: number;
			node_id: string;
			url: string;
			repository_url: string;
			labels_url: string;
			comments_url: string;
			events_url: string;
			html_url: string;
			number: number;
			state: string;
			title: string;
			body: string;
			user: IssuesGetForRepoResponseItemUser;
			labels: Array<IssuesGetForRepoResponseItemLabelsItem>;
			assignee: IssuesGetForRepoResponseItemAssignee;
			assignees: Array<IssuesGetForRepoResponseItemAssigneesItem>;
			milestone: IssuesGetForRepoResponseItemMilestone;
			locked: boolean;
			active_lock_reason: string;
			comments: number;
			pull_request: IssuesGetForRepoResponseItemPullRequest;
			closed_at: null;
			created_at: string;
			updated_at: string;
		};
		type IssuesGetForOrgResponseItemRepositoryPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type IssuesGetForOrgResponseItemRepositoryOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetForOrgResponseItemRepository = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: IssuesGetForOrgResponseItemRepositoryOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: IssuesGetForOrgResponseItemRepositoryPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type IssuesGetForOrgResponseItemPullRequest = {
			url: string;
			html_url: string;
			diff_url: string;
			patch_url: string;
		};
		type IssuesGetForOrgResponseItemMilestoneCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetForOrgResponseItemMilestone = {
			url: string;
			html_url: string;
			labels_url: string;
			id: number;
			node_id: string;
			number: number;
			state: string;
			title: string;
			description: string;
			creator: IssuesGetForOrgResponseItemMilestoneCreator;
			open_issues: number;
			closed_issues: number;
			created_at: string;
			updated_at: string;
			closed_at: string;
			due_on: string;
		};
		type IssuesGetForOrgResponseItemAssigneesItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetForOrgResponseItemAssignee = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetForOrgResponseItemLabelsItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		};
		type IssuesGetForOrgResponseItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetForOrgResponseItem = {
			id: number;
			node_id: string;
			url: string;
			repository_url: string;
			labels_url: string;
			comments_url: string;
			events_url: string;
			html_url: string;
			number: number;
			state: string;
			title: string;
			body: string;
			user: IssuesGetForOrgResponseItemUser;
			labels: Array<IssuesGetForOrgResponseItemLabelsItem>;
			assignee: IssuesGetForOrgResponseItemAssignee;
			assignees: Array<IssuesGetForOrgResponseItemAssigneesItem>;
			milestone: IssuesGetForOrgResponseItemMilestone;
			locked: boolean;
			active_lock_reason: string;
			comments: number;
			pull_request: IssuesGetForOrgResponseItemPullRequest;
			closed_at: null;
			created_at: string;
			updated_at: string;
			repository: IssuesGetForOrgResponseItemRepository;
		};
		type IssuesGetEventsTimelineResponseItemActor = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetEventsTimelineResponseItem = {
			id: number;
			node_id: string;
			url: string;
			actor: IssuesGetEventsTimelineResponseItemActor;
			event: string;
			commit_id: string;
			commit_url: string;
			created_at: string;
		};
		type IssuesGetEventsForRepoResponseItemIssuePullRequest = {
			url: string;
			html_url: string;
			diff_url: string;
			patch_url: string;
		};
		type IssuesGetEventsForRepoResponseItemIssueMilestoneCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetEventsForRepoResponseItemIssueMilestone = {
			url: string;
			html_url: string;
			labels_url: string;
			id: number;
			node_id: string;
			number: number;
			state: string;
			title: string;
			description: string;
			creator: IssuesGetEventsForRepoResponseItemIssueMilestoneCreator;
			open_issues: number;
			closed_issues: number;
			created_at: string;
			updated_at: string;
			closed_at: string;
			due_on: string;
		};
		type IssuesGetEventsForRepoResponseItemIssueAssigneesItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetEventsForRepoResponseItemIssueAssignee = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetEventsForRepoResponseItemIssueLabelsItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		};
		type IssuesGetEventsForRepoResponseItemIssueUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetEventsForRepoResponseItemIssue = {
			id: number;
			node_id: string;
			url: string;
			repository_url: string;
			labels_url: string;
			comments_url: string;
			events_url: string;
			html_url: string;
			number: number;
			state: string;
			title: string;
			body: string;
			user: IssuesGetEventsForRepoResponseItemIssueUser;
			labels: Array<IssuesGetEventsForRepoResponseItemIssueLabelsItem>;
			assignee: IssuesGetEventsForRepoResponseItemIssueAssignee;
			assignees: Array<IssuesGetEventsForRepoResponseItemIssueAssigneesItem>;
			milestone: IssuesGetEventsForRepoResponseItemIssueMilestone;
			locked: boolean;
			active_lock_reason: string;
			comments: number;
			pull_request: IssuesGetEventsForRepoResponseItemIssuePullRequest;
			closed_at: null;
			created_at: string;
			updated_at: string;
		};
		type IssuesGetEventsForRepoResponseItemActor = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetEventsForRepoResponseItem = {
			id: number;
			node_id: string;
			url: string;
			actor: IssuesGetEventsForRepoResponseItemActor;
			event: string;
			commit_id: string;
			commit_url: string;
			created_at: string;
			issue: IssuesGetEventsForRepoResponseItemIssue;
		};
		type IssuesGetEventsResponseItemActor = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetEventsResponseItem = {
			id: number;
			node_id: string;
			url: string;
			actor: IssuesGetEventsResponseItemActor;
			event: string;
			commit_id: string;
			commit_url: string;
			created_at: string;
		};
		type IssuesGetEventResponseIssuePullRequest = {
			url: string;
			html_url: string;
			diff_url: string;
			patch_url: string;
		};
		type IssuesGetEventResponseIssueMilestoneCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetEventResponseIssueMilestone = {
			url: string;
			html_url: string;
			labels_url: string;
			id: number;
			node_id: string;
			number: number;
			state: string;
			title: string;
			description: string;
			creator: IssuesGetEventResponseIssueMilestoneCreator;
			open_issues: number;
			closed_issues: number;
			created_at: string;
			updated_at: string;
			closed_at: string;
			due_on: string;
		};
		type IssuesGetEventResponseIssueAssigneesItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetEventResponseIssueAssignee = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetEventResponseIssueLabelsItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		};
		type IssuesGetEventResponseIssueUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetEventResponseIssue = {
			id: number;
			node_id: string;
			url: string;
			repository_url: string;
			labels_url: string;
			comments_url: string;
			events_url: string;
			html_url: string;
			number: number;
			state: string;
			title: string;
			body: string;
			user: IssuesGetEventResponseIssueUser;
			labels: Array<IssuesGetEventResponseIssueLabelsItem>;
			assignee: IssuesGetEventResponseIssueAssignee;
			assignees: Array<IssuesGetEventResponseIssueAssigneesItem>;
			milestone: IssuesGetEventResponseIssueMilestone;
			locked: boolean;
			active_lock_reason: string;
			comments: number;
			pull_request: IssuesGetEventResponseIssuePullRequest;
			closed_at: null;
			created_at: string;
			updated_at: string;
		};
		type IssuesGetEventResponseActor = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetEventResponse = {
			id: number;
			node_id: string;
			url: string;
			actor: IssuesGetEventResponseActor;
			event: string;
			commit_id: string;
			commit_url: string;
			created_at: string;
			issue: IssuesGetEventResponseIssue;
		};
		type IssuesGetCommentsForRepoResponseItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetCommentsForRepoResponseItem = {
			id: number;
			node_id: string;
			url: string;
			html_url: string;
			body: string;
			user: IssuesGetCommentsForRepoResponseItemUser;
			created_at: string;
			updated_at: string;
		};
		type IssuesGetCommentsResponseItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetCommentsResponseItem = {
			id: number;
			node_id: string;
			url: string;
			html_url: string;
			body: string;
			user: IssuesGetCommentsResponseItemUser;
			created_at: string;
			updated_at: string;
		};
		type IssuesGetCommentResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetCommentResponse = {
			id: number;
			node_id: string;
			url: string;
			html_url: string;
			body: string;
			user: IssuesGetCommentResponseUser;
			created_at: string;
			updated_at: string;
		};
		type IssuesGetAssigneesResponseItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetAllResponseItemRepositoryPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type IssuesGetAllResponseItemRepositoryOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetAllResponseItemRepository = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: IssuesGetAllResponseItemRepositoryOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: IssuesGetAllResponseItemRepositoryPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type IssuesGetAllResponseItemPullRequest = {
			url: string;
			html_url: string;
			diff_url: string;
			patch_url: string;
		};
		type IssuesGetAllResponseItemMilestoneCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetAllResponseItemMilestone = {
			url: string;
			html_url: string;
			labels_url: string;
			id: number;
			node_id: string;
			number: number;
			state: string;
			title: string;
			description: string;
			creator: IssuesGetAllResponseItemMilestoneCreator;
			open_issues: number;
			closed_issues: number;
			created_at: string;
			updated_at: string;
			closed_at: string;
			due_on: string;
		};
		type IssuesGetAllResponseItemAssigneesItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetAllResponseItemAssignee = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetAllResponseItemLabelsItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		};
		type IssuesGetAllResponseItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetAllResponseItem = {
			id: number;
			node_id: string;
			url: string;
			repository_url: string;
			labels_url: string;
			comments_url: string;
			events_url: string;
			html_url: string;
			number: number;
			state: string;
			title: string;
			body: string;
			user: IssuesGetAllResponseItemUser;
			labels: Array<IssuesGetAllResponseItemLabelsItem>;
			assignee: IssuesGetAllResponseItemAssignee;
			assignees: Array<IssuesGetAllResponseItemAssigneesItem>;
			milestone: IssuesGetAllResponseItemMilestone;
			locked: boolean;
			active_lock_reason: string;
			comments: number;
			pull_request: IssuesGetAllResponseItemPullRequest;
			closed_at: null;
			created_at: string;
			updated_at: string;
			repository: IssuesGetAllResponseItemRepository;
		};
		type IssuesGetResponseClosedBy = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetResponsePullRequest = {
			url: string;
			html_url: string;
			diff_url: string;
			patch_url: string;
		};
		type IssuesGetResponseMilestoneCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetResponseMilestone = {
			url: string;
			html_url: string;
			labels_url: string;
			id: number;
			node_id: string;
			number: number;
			state: string;
			title: string;
			description: string;
			creator: IssuesGetResponseMilestoneCreator;
			open_issues: number;
			closed_issues: number;
			created_at: string;
			updated_at: string;
			closed_at: string;
			due_on: string;
		};
		type IssuesGetResponseAssigneesItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetResponseAssignee = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetResponseLabelsItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		};
		type IssuesGetResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesGetResponse = {
			id: number;
			node_id: string;
			url: string;
			repository_url: string;
			labels_url: string;
			comments_url: string;
			events_url: string;
			html_url: string;
			number: number;
			state: string;
			title: string;
			body: string;
			user: IssuesGetResponseUser;
			labels: Array<IssuesGetResponseLabelsItem>;
			assignee: IssuesGetResponseAssignee;
			assignees: Array<IssuesGetResponseAssigneesItem>;
			milestone: IssuesGetResponseMilestone;
			locked: boolean;
			active_lock_reason: string;
			comments: number;
			pull_request: IssuesGetResponsePullRequest;
			closed_at: null;
			created_at: string;
			updated_at: string;
			closed_by: IssuesGetResponseClosedBy;
		};
		type IssuesEditCommentResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesEditCommentResponse = {
			id: number;
			node_id: string;
			url: string;
			html_url: string;
			body: string;
			user: IssuesEditCommentResponseUser;
			created_at: string;
			updated_at: string;
		};
		type IssuesEditResponseClosedBy = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesEditResponsePullRequest = {
			url: string;
			html_url: string;
			diff_url: string;
			patch_url: string;
		};
		type IssuesEditResponseMilestoneCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesEditResponseMilestone = {
			url: string;
			html_url: string;
			labels_url: string;
			id: number;
			node_id: string;
			number: number;
			state: string;
			title: string;
			description: string;
			creator: IssuesEditResponseMilestoneCreator;
			open_issues: number;
			closed_issues: number;
			created_at: string;
			updated_at: string;
			closed_at: string;
			due_on: string;
		};
		type IssuesEditResponseAssigneesItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesEditResponseAssignee = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesEditResponseLabelsItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		};
		type IssuesEditResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesEditResponse = {
			id: number;
			node_id: string;
			url: string;
			repository_url: string;
			labels_url: string;
			comments_url: string;
			events_url: string;
			html_url: string;
			number: number;
			state: string;
			title: string;
			body: string;
			user: IssuesEditResponseUser;
			labels: Array<IssuesEditResponseLabelsItem>;
			assignee: IssuesEditResponseAssignee;
			assignees: Array<IssuesEditResponseAssigneesItem>;
			milestone: IssuesEditResponseMilestone;
			locked: boolean;
			active_lock_reason: string;
			comments: number;
			pull_request: IssuesEditResponsePullRequest;
			closed_at: null;
			created_at: string;
			updated_at: string;
			closed_by: IssuesEditResponseClosedBy;
		};
		type IssuesDeleteMilestoneResponse = {};
		type IssuesDeleteLabelResponse = {};
		type IssuesDeleteCommentResponse = {};
		type IssuesCreateMilestoneResponseCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesCreateMilestoneResponse = {
			url: string;
			html_url: string;
			labels_url: string;
			id: number;
			node_id: string;
			number: number;
			state: string;
			title: string;
			description: string;
			creator: IssuesCreateMilestoneResponseCreator;
			open_issues: number;
			closed_issues: number;
			created_at: string;
			updated_at: string;
			closed_at: string;
			due_on: string;
		};
		type IssuesCreateLabelResponse = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		};
		type IssuesCreateCommentResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesCreateCommentResponse = {
			id: number;
			node_id: string;
			url: string;
			html_url: string;
			body: string;
			user: IssuesCreateCommentResponseUser;
			created_at: string;
			updated_at: string;
		};
		type IssuesCreateResponseClosedBy = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesCreateResponsePullRequest = {
			url: string;
			html_url: string;
			diff_url: string;
			patch_url: string;
		};
		type IssuesCreateResponseMilestoneCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesCreateResponseMilestone = {
			url: string;
			html_url: string;
			labels_url: string;
			id: number;
			node_id: string;
			number: number;
			state: string;
			title: string;
			description: string;
			creator: IssuesCreateResponseMilestoneCreator;
			open_issues: number;
			closed_issues: number;
			created_at: string;
			updated_at: string;
			closed_at: string;
			due_on: string;
		};
		type IssuesCreateResponseAssigneesItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesCreateResponseAssignee = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesCreateResponseLabelsItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		};
		type IssuesCreateResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesCreateResponse = {
			id: number;
			node_id: string;
			url: string;
			repository_url: string;
			labels_url: string;
			comments_url: string;
			events_url: string;
			html_url: string;
			number: number;
			state: string;
			title: string;
			body: string;
			user: IssuesCreateResponseUser;
			labels: Array<IssuesCreateResponseLabelsItem>;
			assignee: IssuesCreateResponseAssignee;
			assignees: Array<IssuesCreateResponseAssigneesItem>;
			milestone: IssuesCreateResponseMilestone;
			locked: boolean;
			active_lock_reason: string;
			comments: number;
			pull_request: IssuesCreateResponsePullRequest;
			closed_at: null;
			created_at: string;
			updated_at: string;
			closed_by: IssuesCreateResponseClosedBy;
		};
		type IssuesCheckAssigneeResponse = {};
		type IssuesAddLabelsResponseItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		};
		type IssuesAddAssigneesToIssueResponsePullRequest = {
			url: string;
			html_url: string;
			diff_url: string;
			patch_url: string;
		};
		type IssuesAddAssigneesToIssueResponseMilestoneCreator = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesAddAssigneesToIssueResponseMilestone = {
			url: string;
			html_url: string;
			labels_url: string;
			id: number;
			node_id: string;
			number: number;
			state: string;
			title: string;
			description: string;
			creator: IssuesAddAssigneesToIssueResponseMilestoneCreator;
			open_issues: number;
			closed_issues: number;
			created_at: string;
			updated_at: string;
			closed_at: string;
			due_on: string;
		};
		type IssuesAddAssigneesToIssueResponseAssigneesItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesAddAssigneesToIssueResponseAssignee = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesAddAssigneesToIssueResponseLabelsItem = {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		};
		type IssuesAddAssigneesToIssueResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type IssuesAddAssigneesToIssueResponse = {
			id: number;
			node_id: string;
			url: string;
			repository_url: string;
			labels_url: string;
			comments_url: string;
			events_url: string;
			html_url: string;
			number: number;
			state: string;
			title: string;
			body: string;
			user: IssuesAddAssigneesToIssueResponseUser;
			labels: Array<IssuesAddAssigneesToIssueResponseLabelsItem>;
			assignee: IssuesAddAssigneesToIssueResponseAssignee;
			assignees: Array<IssuesAddAssigneesToIssueResponseAssigneesItem>;
			milestone: IssuesAddAssigneesToIssueResponseMilestone;
			locked: boolean;
			active_lock_reason: string;
			comments: number;
			pull_request: IssuesAddAssigneesToIssueResponsePullRequest;
			closed_at: null;
			created_at: string;
			updated_at: string;
		};
		type GitdataUpdateReferenceResponseObject = {
			type: string;
			sha: string;
			url: string;
		};
		type GitdataUpdateReferenceResponse = {
			ref: string;
			node_id: string;
			url: string;
			object: GitdataUpdateReferenceResponseObject;
		};
		type GitdataGetTagSignatureVerificationResponseVerification = {
			verified: boolean;
			reason: string;
			signature: null;
			payload: null;
		};
		type GitdataGetTagSignatureVerificationResponseObject = {
			type: string;
			sha: string;
			url: string;
		};
		type GitdataGetTagSignatureVerificationResponseTagger = {
			name: string;
			email: string;
			date: string;
		};
		type GitdataGetTagSignatureVerificationResponse = {
			node_id: string;
			tag: string;
			sha: string;
			url: string;
			message: string;
			tagger: GitdataGetTagSignatureVerificationResponseTagger;
			object: GitdataGetTagSignatureVerificationResponseObject;
			verification: GitdataGetTagSignatureVerificationResponseVerification;
		};
		type GitdataGetTagResponseVerification = {
			verified: boolean;
			reason: string;
			signature: null;
			payload: null;
		};
		type GitdataGetTagResponseObject = {
			type: string;
			sha: string;
			url: string;
		};
		type GitdataGetTagResponseTagger = {
			name: string;
			email: string;
			date: string;
		};
		type GitdataGetTagResponse = {
			node_id: string;
			tag: string;
			sha: string;
			url: string;
			message: string;
			tagger: GitdataGetTagResponseTagger;
			object: GitdataGetTagResponseObject;
			verification: GitdataGetTagResponseVerification;
		};
		type GitdataGetCommitSignatureVerificationResponseVerification = {
			verified: boolean;
			reason: string;
			signature: null;
			payload: null;
		};
		type GitdataGetCommitSignatureVerificationResponseParentsItem = {
			url: string;
			sha: string;
		};
		type GitdataGetCommitSignatureVerificationResponseTree = {
			url: string;
			sha: string;
		};
		type GitdataGetCommitSignatureVerificationResponseCommitter = {
			date: string;
			name: string;
			email: string;
		};
		type GitdataGetCommitSignatureVerificationResponseAuthor = {
			date: string;
			name: string;
			email: string;
		};
		type GitdataGetCommitSignatureVerificationResponse = {
			sha: string;
			url: string;
			author: GitdataGetCommitSignatureVerificationResponseAuthor;
			committer: GitdataGetCommitSignatureVerificationResponseCommitter;
			message: string;
			tree: GitdataGetCommitSignatureVerificationResponseTree;
			parents: Array<GitdataGetCommitSignatureVerificationResponseParentsItem>;
			verification: GitdataGetCommitSignatureVerificationResponseVerification;
		};
		type GitdataGetCommitResponseVerification = {
			verified: boolean;
			reason: string;
			signature: null;
			payload: null;
		};
		type GitdataGetCommitResponseParentsItem = {
			url: string;
			sha: string;
		};
		type GitdataGetCommitResponseTree = {
			url: string;
			sha: string;
		};
		type GitdataGetCommitResponseCommitter = {
			date: string;
			name: string;
			email: string;
		};
		type GitdataGetCommitResponseAuthor = {
			date: string;
			name: string;
			email: string;
		};
		type GitdataGetCommitResponse = {
			sha: string;
			url: string;
			author: GitdataGetCommitResponseAuthor;
			committer: GitdataGetCommitResponseCommitter;
			message: string;
			tree: GitdataGetCommitResponseTree;
			parents: Array<GitdataGetCommitResponseParentsItem>;
			verification: GitdataGetCommitResponseVerification;
		};
		type GitdataGetBlobResponse = {
			content: string;
			encoding: string;
			url: string;
			sha: string;
			size: number;
		};
		type GitdataDeleteReferenceResponse = {};
		type GitdataCreateTreeResponseTreeItem = {
			path: string;
			mode: string;
			type: string;
			size: number;
			sha: string;
			url: string;
		};
		type GitdataCreateTreeResponse = {
			sha: string;
			url: string;
			tree: Array<GitdataCreateTreeResponseTreeItem>;
		};
		type GitdataCreateTagResponseVerification = {
			verified: boolean;
			reason: string;
			signature: null;
			payload: null;
		};
		type GitdataCreateTagResponseObject = {
			type: string;
			sha: string;
			url: string;
		};
		type GitdataCreateTagResponseTagger = {
			name: string;
			email: string;
			date: string;
		};
		type GitdataCreateTagResponse = {
			node_id: string;
			tag: string;
			sha: string;
			url: string;
			message: string;
			tagger: GitdataCreateTagResponseTagger;
			object: GitdataCreateTagResponseObject;
			verification: GitdataCreateTagResponseVerification;
		};
		type GitdataCreateReferenceResponseObject = {
			type: string;
			sha: string;
			url: string;
		};
		type GitdataCreateReferenceResponse = {
			ref: string;
			node_id: string;
			url: string;
			object: GitdataCreateReferenceResponseObject;
		};
		type GitdataCreateCommitResponseVerification = {
			verified: boolean;
			reason: string;
			signature: null;
			payload: null;
		};
		type GitdataCreateCommitResponseParentsItem = {
			url: string;
			sha: string;
		};
		type GitdataCreateCommitResponseTree = {
			url: string;
			sha: string;
		};
		type GitdataCreateCommitResponseCommitter = {
			date: string;
			name: string;
			email: string;
		};
		type GitdataCreateCommitResponseAuthor = {
			date: string;
			name: string;
			email: string;
		};
		type GitdataCreateCommitResponse = {
			sha: string;
			node_id: string;
			url: string;
			author: GitdataCreateCommitResponseAuthor;
			committer: GitdataCreateCommitResponseCommitter;
			message: string;
			tree: GitdataCreateCommitResponseTree;
			parents: Array<GitdataCreateCommitResponseParentsItem>;
			verification: GitdataCreateCommitResponseVerification;
		};
		type GitdataCreateBlobResponse = {
			url: string;
			sha: string;
		};
		type GistsUnstarResponse = {};
		type GistsStarResponse = {};
		type GistsGetStarredResponseItemOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type GistsGetStarredResponseItemFilesHelloWorldRb = {
			filename: string;
			type: string;
			language: string;
			raw_url: string;
			size: number;
		};
		type GistsGetStarredResponseItemFiles = {
			'hello_world.rb': GistsGetStarredResponseItemFilesHelloWorldRb;
		};
		type GistsGetStarredResponseItem = {
			url: string;
			forks_url: string;
			commits_url: string;
			id: string;
			node_id: string;
			git_pull_url: string;
			git_push_url: string;
			html_url: string;
			files: GistsGetStarredResponseItemFiles;
			public: boolean;
			created_at: string;
			updated_at: string;
			description: string;
			comments: number;
			user: null;
			comments_url: string;
			owner: GistsGetStarredResponseItemOwner;
			truncated: boolean;
		};
		type GistsGetRevisionResponseHistoryItemChangeStatus = {
			deletions: number;
			additions: number;
			total: number;
		};
		type GistsGetRevisionResponseHistoryItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type GistsGetRevisionResponseHistoryItem = {
			url: string;
			version: string;
			user: GistsGetRevisionResponseHistoryItemUser;
			change_status: GistsGetRevisionResponseHistoryItemChangeStatus;
			committed_at: string;
		};
		type GistsGetRevisionResponseForksItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type GistsGetRevisionResponseForksItem = {
			user: GistsGetRevisionResponseForksItemUser;
			url: string;
			id: string;
			created_at: string;
			updated_at: string;
		};
		type GistsGetRevisionResponseOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type GistsGetRevisionResponseFilesHelloWorldPythonTxt = {
			filename: string;
			type: string;
			language: string;
			raw_url: string;
			size: number;
			truncated: boolean;
			content: string;
		};
		type GistsGetRevisionResponseFilesHelloWorldRubyTxt = {
			filename: string;
			type: string;
			language: string;
			raw_url: string;
			size: number;
			truncated: boolean;
			content: string;
		};
		type GistsGetRevisionResponseFilesHelloWorldPy = {
			filename: string;
			type: string;
			language: string;
			raw_url: string;
			size: number;
			truncated: boolean;
			content: string;
		};
		type GistsGetRevisionResponseFilesHelloWorldRb = {
			filename: string;
			type: string;
			language: string;
			raw_url: string;
			size: number;
			truncated: boolean;
			content: string;
		};
		type GistsGetRevisionResponseFiles = {
			'hello_world.rb': GistsGetRevisionResponseFilesHelloWorldRb;
			'hello_world.py': GistsGetRevisionResponseFilesHelloWorldPy;
			'hello_world_ruby.txt': GistsGetRevisionResponseFilesHelloWorldRubyTxt;
			'hello_world_python.txt': GistsGetRevisionResponseFilesHelloWorldPythonTxt;
		};
		type GistsGetRevisionResponse = {
			url: string;
			forks_url: string;
			commits_url: string;
			id: string;
			node_id: string;
			git_pull_url: string;
			git_push_url: string;
			html_url: string;
			files: GistsGetRevisionResponseFiles;
			public: boolean;
			created_at: string;
			updated_at: string;
			description: string;
			comments: number;
			user: null;
			comments_url: string;
			owner: GistsGetRevisionResponseOwner;
			truncated: boolean;
			forks: Array<GistsGetRevisionResponseForksItem>;
			history: Array<GistsGetRevisionResponseHistoryItem>;
		};
		type GistsGetPublicResponseItemOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type GistsGetPublicResponseItemFilesHelloWorldRb = {
			filename: string;
			type: string;
			language: string;
			raw_url: string;
			size: number;
		};
		type GistsGetPublicResponseItemFiles = {
			'hello_world.rb': GistsGetPublicResponseItemFilesHelloWorldRb;
		};
		type GistsGetPublicResponseItem = {
			url: string;
			forks_url: string;
			commits_url: string;
			id: string;
			node_id: string;
			git_pull_url: string;
			git_push_url: string;
			html_url: string;
			files: GistsGetPublicResponseItemFiles;
			public: boolean;
			created_at: string;
			updated_at: string;
			description: string;
			comments: number;
			user: null;
			comments_url: string;
			owner: GistsGetPublicResponseItemOwner;
			truncated: boolean;
		};
		type GistsGetForksResponseItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type GistsGetForksResponseItem = {
			user: GistsGetForksResponseItemUser;
			url: string;
			id: string;
			created_at: string;
			updated_at: string;
		};
		type GistsGetForUserResponseItemOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type GistsGetForUserResponseItemFilesHelloWorldRb = {
			filename: string;
			type: string;
			language: string;
			raw_url: string;
			size: number;
		};
		type GistsGetForUserResponseItemFiles = {
			'hello_world.rb': GistsGetForUserResponseItemFilesHelloWorldRb;
		};
		type GistsGetForUserResponseItem = {
			url: string;
			forks_url: string;
			commits_url: string;
			id: string;
			node_id: string;
			git_pull_url: string;
			git_push_url: string;
			html_url: string;
			files: GistsGetForUserResponseItemFiles;
			public: boolean;
			created_at: string;
			updated_at: string;
			description: string;
			comments: number;
			user: null;
			comments_url: string;
			owner: GistsGetForUserResponseItemOwner;
			truncated: boolean;
		};
		type GistsGetCommitsResponseItemChangeStatus = {
			deletions: number;
			additions: number;
			total: number;
		};
		type GistsGetCommitsResponseItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type GistsGetCommitsResponseItem = {
			url: string;
			version: string;
			user: GistsGetCommitsResponseItemUser;
			change_status: GistsGetCommitsResponseItemChangeStatus;
			committed_at: string;
		};
		type GistsGetCommentsResponseItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type GistsGetCommentsResponseItem = {
			id: number;
			node_id: string;
			url: string;
			body: string;
			user: GistsGetCommentsResponseItemUser;
			created_at: string;
			updated_at: string;
		};
		type GistsGetCommentResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type GistsGetCommentResponse = {
			id: number;
			node_id: string;
			url: string;
			body: string;
			user: GistsGetCommentResponseUser;
			created_at: string;
			updated_at: string;
		};
		type GistsGetAllResponseItemOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type GistsGetAllResponseItemFilesHelloWorldRb = {
			filename: string;
			type: string;
			language: string;
			raw_url: string;
			size: number;
		};
		type GistsGetAllResponseItemFiles = {
			'hello_world.rb': GistsGetAllResponseItemFilesHelloWorldRb;
		};
		type GistsGetAllResponseItem = {
			url: string;
			forks_url: string;
			commits_url: string;
			id: string;
			node_id: string;
			git_pull_url: string;
			git_push_url: string;
			html_url: string;
			files: GistsGetAllResponseItemFiles;
			public: boolean;
			created_at: string;
			updated_at: string;
			description: string;
			comments: number;
			user: null;
			comments_url: string;
			owner: GistsGetAllResponseItemOwner;
			truncated: boolean;
		};
		type GistsGetResponseHistoryItemChangeStatus = {
			deletions: number;
			additions: number;
			total: number;
		};
		type GistsGetResponseHistoryItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type GistsGetResponseHistoryItem = {
			url: string;
			version: string;
			user: GistsGetResponseHistoryItemUser;
			change_status: GistsGetResponseHistoryItemChangeStatus;
			committed_at: string;
		};
		type GistsGetResponseForksItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type GistsGetResponseForksItem = {
			user: GistsGetResponseForksItemUser;
			url: string;
			id: string;
			created_at: string;
			updated_at: string;
		};
		type GistsGetResponseOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type GistsGetResponseFilesHelloWorldPythonTxt = {
			filename: string;
			type: string;
			language: string;
			raw_url: string;
			size: number;
			truncated: boolean;
			content: string;
		};
		type GistsGetResponseFilesHelloWorldRubyTxt = {
			filename: string;
			type: string;
			language: string;
			raw_url: string;
			size: number;
			truncated: boolean;
			content: string;
		};
		type GistsGetResponseFilesHelloWorldPy = {
			filename: string;
			type: string;
			language: string;
			raw_url: string;
			size: number;
			truncated: boolean;
			content: string;
		};
		type GistsGetResponseFilesHelloWorldRb = {
			filename: string;
			type: string;
			language: string;
			raw_url: string;
			size: number;
			truncated: boolean;
			content: string;
		};
		type GistsGetResponseFiles = {
			'hello_world.rb': GistsGetResponseFilesHelloWorldRb;
			'hello_world.py': GistsGetResponseFilesHelloWorldPy;
			'hello_world_ruby.txt': GistsGetResponseFilesHelloWorldRubyTxt;
			'hello_world_python.txt': GistsGetResponseFilesHelloWorldPythonTxt;
		};
		type GistsGetResponse = {
			url: string;
			forks_url: string;
			commits_url: string;
			id: string;
			node_id: string;
			git_pull_url: string;
			git_push_url: string;
			html_url: string;
			files: GistsGetResponseFiles;
			public: boolean;
			created_at: string;
			updated_at: string;
			description: string;
			comments: number;
			user: null;
			comments_url: string;
			owner: GistsGetResponseOwner;
			truncated: boolean;
			forks: Array<GistsGetResponseForksItem>;
			history: Array<GistsGetResponseHistoryItem>;
		};
		type GistsForkResponseOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type GistsForkResponseFilesHelloWorldRb = {
			filename: string;
			type: string;
			language: string;
			raw_url: string;
			size: number;
		};
		type GistsForkResponseFiles = {
			'hello_world.rb': GistsForkResponseFilesHelloWorldRb;
		};
		type GistsForkResponse = {
			url: string;
			forks_url: string;
			commits_url: string;
			id: string;
			node_id: string;
			git_pull_url: string;
			git_push_url: string;
			html_url: string;
			files: GistsForkResponseFiles;
			public: boolean;
			created_at: string;
			updated_at: string;
			description: string;
			comments: number;
			user: null;
			comments_url: string;
			owner: GistsForkResponseOwner;
			truncated: boolean;
		};
		type GistsEditCommentResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type GistsEditCommentResponse = {
			id: number;
			node_id: string;
			url: string;
			body: string;
			user: GistsEditCommentResponseUser;
			created_at: string;
			updated_at: string;
		};
		type GistsEditResponseHistoryItemChangeStatus = {
			deletions: number;
			additions: number;
			total: number;
		};
		type GistsEditResponseHistoryItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type GistsEditResponseHistoryItem = {
			url: string;
			version: string;
			user: GistsEditResponseHistoryItemUser;
			change_status: GistsEditResponseHistoryItemChangeStatus;
			committed_at: string;
		};
		type GistsEditResponseForksItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type GistsEditResponseForksItem = {
			user: GistsEditResponseForksItemUser;
			url: string;
			id: string;
			created_at: string;
			updated_at: string;
		};
		type GistsEditResponseOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type GistsEditResponseFilesNewFileTxt = {
			filename: string;
			type: string;
			language: string;
			raw_url: string;
			size: number;
			truncated: boolean;
			content: string;
		};
		type GistsEditResponseFilesHelloWorldMd = {
			filename: string;
			type: string;
			language: string;
			raw_url: string;
			size: number;
			truncated: boolean;
			content: string;
		};
		type GistsEditResponseFilesHelloWorldPy = {
			filename: string;
			type: string;
			language: string;
			raw_url: string;
			size: number;
			truncated: boolean;
			content: string;
		};
		type GistsEditResponseFilesHelloWorldRb = {
			filename: string;
			type: string;
			language: string;
			raw_url: string;
			size: number;
			truncated: boolean;
			content: string;
		};
		type GistsEditResponseFiles = {
			'hello_world.rb': GistsEditResponseFilesHelloWorldRb;
			'hello_world.py': GistsEditResponseFilesHelloWorldPy;
			'hello_world.md': GistsEditResponseFilesHelloWorldMd;
			'new_file.txt': GistsEditResponseFilesNewFileTxt;
		};
		type GistsEditResponse = {
			url: string;
			forks_url: string;
			commits_url: string;
			id: string;
			node_id: string;
			git_pull_url: string;
			git_push_url: string;
			html_url: string;
			files: GistsEditResponseFiles;
			public: boolean;
			created_at: string;
			updated_at: string;
			description: string;
			comments: number;
			user: null;
			comments_url: string;
			owner: GistsEditResponseOwner;
			truncated: boolean;
			forks: Array<GistsEditResponseForksItem>;
			history: Array<GistsEditResponseHistoryItem>;
		};
		type GistsDeleteCommentResponse = {};
		type GistsDeleteResponse = {};
		type GistsCreateCommentResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type GistsCreateCommentResponse = {
			id: number;
			node_id: string;
			url: string;
			body: string;
			user: GistsCreateCommentResponseUser;
			created_at: string;
			updated_at: string;
		};
		type GistsCreateResponseHistoryItemChangeStatus = {
			deletions: number;
			additions: number;
			total: number;
		};
		type GistsCreateResponseHistoryItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type GistsCreateResponseHistoryItem = {
			url: string;
			version: string;
			user: GistsCreateResponseHistoryItemUser;
			change_status: GistsCreateResponseHistoryItemChangeStatus;
			committed_at: string;
		};
		type GistsCreateResponseForksItemUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type GistsCreateResponseForksItem = {
			user: GistsCreateResponseForksItemUser;
			url: string;
			id: string;
			created_at: string;
			updated_at: string;
		};
		type GistsCreateResponseOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type GistsCreateResponseFilesHelloWorldPythonTxt = {
			filename: string;
			type: string;
			language: string;
			raw_url: string;
			size: number;
			truncated: boolean;
			content: string;
		};
		type GistsCreateResponseFilesHelloWorldRubyTxt = {
			filename: string;
			type: string;
			language: string;
			raw_url: string;
			size: number;
			truncated: boolean;
			content: string;
		};
		type GistsCreateResponseFilesHelloWorldPy = {
			filename: string;
			type: string;
			language: string;
			raw_url: string;
			size: number;
			truncated: boolean;
			content: string;
		};
		type GistsCreateResponseFilesHelloWorldRb = {
			filename: string;
			type: string;
			language: string;
			raw_url: string;
			size: number;
			truncated: boolean;
			content: string;
		};
		type GistsCreateResponseFiles = {
			'hello_world.rb': GistsCreateResponseFilesHelloWorldRb;
			'hello_world.py': GistsCreateResponseFilesHelloWorldPy;
			'hello_world_ruby.txt': GistsCreateResponseFilesHelloWorldRubyTxt;
			'hello_world_python.txt': GistsCreateResponseFilesHelloWorldPythonTxt;
		};
		type GistsCreateResponse = {
			url: string;
			forks_url: string;
			commits_url: string;
			id: string;
			node_id: string;
			git_pull_url: string;
			git_push_url: string;
			html_url: string;
			files: GistsCreateResponseFiles;
			public: boolean;
			created_at: string;
			updated_at: string;
			description: string;
			comments: number;
			user: null;
			comments_url: string;
			owner: GistsCreateResponseOwner;
			truncated: boolean;
			forks: Array<GistsCreateResponseForksItem>;
			history: Array<GistsCreateResponseHistoryItem>;
		};
		type ChecksUpdateResponsePullRequestsItemBaseRepo = {
			id: number;
			url: string;
			name: string;
		};
		type ChecksUpdateResponsePullRequestsItemBase = {
			ref: string;
			sha: string;
			repo: ChecksUpdateResponsePullRequestsItemBaseRepo;
		};
		type ChecksUpdateResponsePullRequestsItemHeadRepo = {
			id: number;
			url: string;
			name: string;
		};
		type ChecksUpdateResponsePullRequestsItemHead = {
			ref: string;
			sha: string;
			repo: ChecksUpdateResponsePullRequestsItemHeadRepo;
		};
		type ChecksUpdateResponsePullRequestsItem = {
			url: string;
			id: number;
			number: number;
			head: ChecksUpdateResponsePullRequestsItemHead;
			base: ChecksUpdateResponsePullRequestsItemBase;
		};
		type ChecksUpdateResponseAppOwner = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
		};
		type ChecksUpdateResponseApp = {
			id: number;
			node_id: string;
			owner: ChecksUpdateResponseAppOwner;
			name: string;
			description: string;
			external_url: string;
			html_url: string;
			created_at: string;
			updated_at: string;
		};
		type ChecksUpdateResponseCheckSuite = { id: number };
		type ChecksUpdateResponseOutput = {
			title: string;
			summary: string;
			text: string;
			annotations_count: number;
			annotations_url: string;
		};
		type ChecksUpdateResponse = {
			id: number;
			head_sha: string;
			node_id: string;
			external_id: string;
			url: string;
			html_url: string;
			details_url: string;
			status: string;
			conclusion: string;
			started_at: string;
			completed_at: string;
			output: ChecksUpdateResponseOutput;
			name: string;
			check_suite: ChecksUpdateResponseCheckSuite;
			app: ChecksUpdateResponseApp;
			pull_requests: Array<ChecksUpdateResponsePullRequestsItem>;
		};
		type ChecksSetSuitesPreferencesResponseRepositoryPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type ChecksSetSuitesPreferencesResponseRepositoryOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ChecksSetSuitesPreferencesResponseRepository = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ChecksSetSuitesPreferencesResponseRepositoryOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: ChecksSetSuitesPreferencesResponseRepositoryPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type ChecksSetSuitesPreferencesResponsePreferencesAutoTriggerChecksItem = {
			app_id: number;
			setting: boolean;
		};
		type ChecksSetSuitesPreferencesResponsePreferences = {
			auto_trigger_checks: Array<
				ChecksSetSuitesPreferencesResponsePreferencesAutoTriggerChecksItem
				>;
		};
		type ChecksSetSuitesPreferencesResponse = {
			preferences: ChecksSetSuitesPreferencesResponsePreferences;
			repository: ChecksSetSuitesPreferencesResponseRepository;
		};
		type ChecksRerequestSuiteResponse = {};
		type ChecksListSuitesForRefResponseCheckSuitesItemRepositoryPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type ChecksListSuitesForRefResponseCheckSuitesItemRepositoryOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ChecksListSuitesForRefResponseCheckSuitesItemRepository = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ChecksListSuitesForRefResponseCheckSuitesItemRepositoryOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: ChecksListSuitesForRefResponseCheckSuitesItemRepositoryPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type ChecksListSuitesForRefResponseCheckSuitesItemAppOwner = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
		};
		type ChecksListSuitesForRefResponseCheckSuitesItemApp = {
			id: number;
			node_id: string;
			owner: ChecksListSuitesForRefResponseCheckSuitesItemAppOwner;
			name: string;
			description: string;
			external_url: string;
			html_url: string;
			created_at: string;
			updated_at: string;
		};
		type ChecksListSuitesForRefResponseCheckSuitesItem = {
			id: number;
			node_id: string;
			head_branch: string;
			head_sha: string;
			status: string;
			conclusion: string;
			url: string;
			before: string;
			after: string;
			pull_requests: Array<any>;
			app: ChecksListSuitesForRefResponseCheckSuitesItemApp;
			repository: ChecksListSuitesForRefResponseCheckSuitesItemRepository;
		};
		type ChecksListSuitesForRefResponse = {
			total_count: number;
			check_suites: Array<ChecksListSuitesForRefResponseCheckSuitesItem>;
		};
		type ChecksListForSuiteResponseCheckRunsItemPullRequestsItemBaseRepo = {
			id: number;
			url: string;
			name: string;
		};
		type ChecksListForSuiteResponseCheckRunsItemPullRequestsItemBase = {
			ref: string;
			sha: string;
			repo: ChecksListForSuiteResponseCheckRunsItemPullRequestsItemBaseRepo;
		};
		type ChecksListForSuiteResponseCheckRunsItemPullRequestsItemHeadRepo = {
			id: number;
			url: string;
			name: string;
		};
		type ChecksListForSuiteResponseCheckRunsItemPullRequestsItemHead = {
			ref: string;
			sha: string;
			repo: ChecksListForSuiteResponseCheckRunsItemPullRequestsItemHeadRepo;
		};
		type ChecksListForSuiteResponseCheckRunsItemPullRequestsItem = {
			url: string;
			id: number;
			number: number;
			head: ChecksListForSuiteResponseCheckRunsItemPullRequestsItemHead;
			base: ChecksListForSuiteResponseCheckRunsItemPullRequestsItemBase;
		};
		type ChecksListForSuiteResponseCheckRunsItemAppOwner = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
		};
		type ChecksListForSuiteResponseCheckRunsItemApp = {
			id: number;
			node_id: string;
			owner: ChecksListForSuiteResponseCheckRunsItemAppOwner;
			name: string;
			description: string;
			external_url: string;
			html_url: string;
			created_at: string;
			updated_at: string;
		};
		type ChecksListForSuiteResponseCheckRunsItemCheckSuite = { id: number };
		type ChecksListForSuiteResponseCheckRunsItemOutput = {
			title: string;
			summary: string;
			text: string;
			annotations_count: number;
			annotations_url: string;
		};
		type ChecksListForSuiteResponseCheckRunsItem = {
			id: number;
			head_sha: string;
			node_id: string;
			external_id: string;
			url: string;
			html_url: string;
			details_url: string;
			status: string;
			conclusion: string;
			started_at: string;
			completed_at: string;
			output: ChecksListForSuiteResponseCheckRunsItemOutput;
			name: string;
			check_suite: ChecksListForSuiteResponseCheckRunsItemCheckSuite;
			app: ChecksListForSuiteResponseCheckRunsItemApp;
			pull_requests: Array<
				ChecksListForSuiteResponseCheckRunsItemPullRequestsItem
				>;
		};
		type ChecksListForSuiteResponse = {
			total_count: number;
			check_runs: Array<ChecksListForSuiteResponseCheckRunsItem>;
		};
		type ChecksListForRefResponseCheckRunsItemPullRequestsItemBaseRepo = {
			id: number;
			url: string;
			name: string;
		};
		type ChecksListForRefResponseCheckRunsItemPullRequestsItemBase = {
			ref: string;
			sha: string;
			repo: ChecksListForRefResponseCheckRunsItemPullRequestsItemBaseRepo;
		};
		type ChecksListForRefResponseCheckRunsItemPullRequestsItemHeadRepo = {
			id: number;
			url: string;
			name: string;
		};
		type ChecksListForRefResponseCheckRunsItemPullRequestsItemHead = {
			ref: string;
			sha: string;
			repo: ChecksListForRefResponseCheckRunsItemPullRequestsItemHeadRepo;
		};
		type ChecksListForRefResponseCheckRunsItemPullRequestsItem = {
			url: string;
			id: number;
			number: number;
			head: ChecksListForRefResponseCheckRunsItemPullRequestsItemHead;
			base: ChecksListForRefResponseCheckRunsItemPullRequestsItemBase;
		};
		type ChecksListForRefResponseCheckRunsItemAppOwner = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
		};
		type ChecksListForRefResponseCheckRunsItemApp = {
			id: number;
			node_id: string;
			owner: ChecksListForRefResponseCheckRunsItemAppOwner;
			name: string;
			description: string;
			external_url: string;
			html_url: string;
			created_at: string;
			updated_at: string;
		};
		type ChecksListForRefResponseCheckRunsItemCheckSuite = { id: number };
		type ChecksListForRefResponseCheckRunsItemOutput = {
			title: string;
			summary: string;
			text: string;
			annotations_count: number;
			annotations_url: string;
		};
		type ChecksListForRefResponseCheckRunsItem = {
			id: number;
			head_sha: string;
			node_id: string;
			external_id: string;
			url: string;
			html_url: string;
			details_url: string;
			status: string;
			conclusion: string;
			started_at: string;
			completed_at: string;
			output: ChecksListForRefResponseCheckRunsItemOutput;
			name: string;
			check_suite: ChecksListForRefResponseCheckRunsItemCheckSuite;
			app: ChecksListForRefResponseCheckRunsItemApp;
			pull_requests: Array<ChecksListForRefResponseCheckRunsItemPullRequestsItem>;
		};
		type ChecksListForRefResponse = {
			total_count: number;
			check_runs: Array<ChecksListForRefResponseCheckRunsItem>;
		};
		type ChecksListAnnotationsResponseItem = {
			path: string;
			start_line: number;
			end_line: number;
			start_column: number;
			end_column: number;
			annotation_level: string;
			title: string;
			message: string;
			raw_details: string;
		};
		type ChecksGetSuiteResponseRepositoryPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type ChecksGetSuiteResponseRepositoryOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ChecksGetSuiteResponseRepository = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ChecksGetSuiteResponseRepositoryOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: ChecksGetSuiteResponseRepositoryPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type ChecksGetSuiteResponseAppOwner = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
		};
		type ChecksGetSuiteResponseApp = {
			id: number;
			node_id: string;
			owner: ChecksGetSuiteResponseAppOwner;
			name: string;
			description: string;
			external_url: string;
			html_url: string;
			created_at: string;
			updated_at: string;
		};
		type ChecksGetSuiteResponse = {
			id: number;
			node_id: string;
			head_branch: string;
			head_sha: string;
			status: string;
			conclusion: string;
			url: string;
			before: string;
			after: string;
			pull_requests: Array<any>;
			app: ChecksGetSuiteResponseApp;
			repository: ChecksGetSuiteResponseRepository;
		};
		type ChecksGetResponsePullRequestsItemBaseRepo = {
			id: number;
			url: string;
			name: string;
		};
		type ChecksGetResponsePullRequestsItemBase = {
			ref: string;
			sha: string;
			repo: ChecksGetResponsePullRequestsItemBaseRepo;
		};
		type ChecksGetResponsePullRequestsItemHeadRepo = {
			id: number;
			url: string;
			name: string;
		};
		type ChecksGetResponsePullRequestsItemHead = {
			ref: string;
			sha: string;
			repo: ChecksGetResponsePullRequestsItemHeadRepo;
		};
		type ChecksGetResponsePullRequestsItem = {
			url: string;
			id: number;
			number: number;
			head: ChecksGetResponsePullRequestsItemHead;
			base: ChecksGetResponsePullRequestsItemBase;
		};
		type ChecksGetResponseAppOwner = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
		};
		type ChecksGetResponseApp = {
			id: number;
			node_id: string;
			owner: ChecksGetResponseAppOwner;
			name: string;
			description: string;
			external_url: string;
			html_url: string;
			created_at: string;
			updated_at: string;
		};
		type ChecksGetResponseCheckSuite = { id: number };
		type ChecksGetResponseOutput = {
			title: string;
			summary: string;
			text: string;
			annotations_count: number;
			annotations_url: string;
		};
		type ChecksGetResponse = {
			id: number;
			head_sha: string;
			node_id: string;
			external_id: string;
			url: string;
			html_url: string;
			details_url: string;
			status: string;
			conclusion: string;
			started_at: string;
			completed_at: string;
			output: ChecksGetResponseOutput;
			name: string;
			check_suite: ChecksGetResponseCheckSuite;
			app: ChecksGetResponseApp;
			pull_requests: Array<ChecksGetResponsePullRequestsItem>;
		};
		type ChecksCreateSuiteResponseRepositoryPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type ChecksCreateSuiteResponseRepositoryOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ChecksCreateSuiteResponseRepository = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ChecksCreateSuiteResponseRepositoryOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: ChecksCreateSuiteResponseRepositoryPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type ChecksCreateSuiteResponseAppOwner = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
		};
		type ChecksCreateSuiteResponseApp = {
			id: number;
			node_id: string;
			owner: ChecksCreateSuiteResponseAppOwner;
			name: string;
			description: string;
			external_url: string;
			html_url: string;
			created_at: string;
			updated_at: string;
		};
		type ChecksCreateSuiteResponse = {
			id: number;
			node_id: string;
			head_branch: string;
			head_sha: string;
			status: string;
			conclusion: string;
			url: string;
			before: string;
			after: string;
			pull_requests: Array<any>;
			app: ChecksCreateSuiteResponseApp;
			repository: ChecksCreateSuiteResponseRepository;
		};
		type ChecksCreateResponsePullRequestsItemBaseRepo = {
			id: number;
			url: string;
			name: string;
		};
		type ChecksCreateResponsePullRequestsItemBase = {
			ref: string;
			sha: string;
			repo: ChecksCreateResponsePullRequestsItemBaseRepo;
		};
		type ChecksCreateResponsePullRequestsItemHeadRepo = {
			id: number;
			url: string;
			name: string;
		};
		type ChecksCreateResponsePullRequestsItemHead = {
			ref: string;
			sha: string;
			repo: ChecksCreateResponsePullRequestsItemHeadRepo;
		};
		type ChecksCreateResponsePullRequestsItem = {
			url: string;
			id: number;
			number: number;
			head: ChecksCreateResponsePullRequestsItemHead;
			base: ChecksCreateResponsePullRequestsItemBase;
		};
		type ChecksCreateResponseAppOwner = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
		};
		type ChecksCreateResponseApp = {
			id: number;
			node_id: string;
			owner: ChecksCreateResponseAppOwner;
			name: string;
			description: string;
			external_url: string;
			html_url: string;
			created_at: string;
			updated_at: string;
		};
		type ChecksCreateResponseCheckSuite = { id: number };
		type ChecksCreateResponseOutput = {
			title: string;
			summary: string;
			text: string;
		};
		type ChecksCreateResponse = {
			id: number;
			head_sha: string;
			node_id: string;
			external_id: string;
			url: string;
			html_url: string;
			details_url: string;
			status: string;
			conclusion: null;
			started_at: string;
			completed_at: null;
			output: ChecksCreateResponseOutput;
			name: string;
			check_suite: ChecksCreateResponseCheckSuite;
			app: ChecksCreateResponseApp;
			pull_requests: Array<ChecksCreateResponsePullRequestsItem>;
		};
		type AuthorizationUpdateResponseApp = {
			url: string;
			name: string;
			client_id: string;
		};
		type AuthorizationUpdateResponse = {
			id: number;
			url: string;
			scopes: Array<string>;
			token: string;
			token_last_eight: string;
			hashed_token: string;
			app: AuthorizationUpdateResponseApp;
			note: string;
			note_url: string;
			updated_at: string;
			created_at: string;
			fingerprint: string;
		};
		type AuthorizationRevokeGrantResponse = {};
		type AuthorizationRevokeResponse = {};
		type AuthorizationResetResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type AuthorizationResetResponseApp = {
			url: string;
			name: string;
			client_id: string;
		};
		type AuthorizationResetResponse = {
			id: number;
			url: string;
			scopes: Array<string>;
			token: string;
			token_last_eight: string;
			hashed_token: string;
			app: AuthorizationResetResponseApp;
			note: string;
			note_url: string;
			updated_at: string;
			created_at: string;
			fingerprint: string;
			user: AuthorizationResetResponseUser;
		};
		type AuthorizationGetGrantsResponseItemApp = {
			url: string;
			name: string;
			client_id: string;
		};
		type AuthorizationGetGrantsResponseItem = {
			id: number;
			url: string;
			app: AuthorizationGetGrantsResponseItemApp;
			created_at: string;
			updated_at: string;
			scopes: Array<string>;
		};
		type AuthorizationGetGrantResponseApp = {
			url: string;
			name: string;
			client_id: string;
		};
		type AuthorizationGetGrantResponse = {
			id: number;
			url: string;
			app: AuthorizationGetGrantResponseApp;
			created_at: string;
			updated_at: string;
			scopes: Array<string>;
		};
		type AuthorizationGetAllResponseItemApp = {
			url: string;
			name: string;
			client_id: string;
		};
		type AuthorizationGetAllResponseItem = {
			id: number;
			url: string;
			scopes: Array<string>;
			token: string;
			token_last_eight: string;
			hashed_token: string;
			app: AuthorizationGetAllResponseItemApp;
			note: string;
			note_url: string;
			updated_at: string;
			created_at: string;
			fingerprint: string;
		};
		type AuthorizationGetResponseApp = {
			url: string;
			name: string;
			client_id: string;
		};
		type AuthorizationGetResponse = {
			id: number;
			url: string;
			scopes: Array<string>;
			token: string;
			token_last_eight: string;
			hashed_token: string;
			app: AuthorizationGetResponseApp;
			note: string;
			note_url: string;
			updated_at: string;
			created_at: string;
			fingerprint: string;
		};
		type AuthorizationDeleteGrantResponse = {};
		type AuthorizationDeleteResponse = {};
		type AuthorizationCreateResponseApp = {
			url: string;
			name: string;
			client_id: string;
		};
		type AuthorizationCreateResponse = {
			id: number;
			url: string;
			scopes: Array<string>;
			token: string;
			token_last_eight: string;
			hashed_token: string;
			app: AuthorizationCreateResponseApp;
			note: string;
			note_url: string;
			updated_at: string;
			created_at: string;
			fingerprint: string;
		};
		type AuthorizationCheckResponseUser = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type AuthorizationCheckResponseApp = {
			url: string;
			name: string;
			client_id: string;
		};
		type AuthorizationCheckResponse = {
			id: number;
			url: string;
			scopes: Array<string>;
			token: string;
			token_last_eight: string;
			hashed_token: string;
			app: AuthorizationCheckResponseApp;
			note: string;
			note_url: string;
			updated_at: string;
			created_at: string;
			fingerprint: string;
			user: AuthorizationCheckResponseUser;
		};
		type AppsRemoveRepoFromInstallationResponse = {};
		type AppsGetMarketplaceListingStubbedPlansResponseItem = {
			url: string;
			accounts_url: string;
			id: number;
			name: string;
			description: string;
			monthly_price_in_cents: number;
			yearly_price_in_cents: number;
			price_model: string;
			has_free_trial: boolean;
			unit_name: null;
			bullets: Array<string>;
		};
		type AppsGetMarketplaceListingStubbedPlanAccountsResponseItemMarketplacePurchasePlan = {
			url: string;
			accounts_url: string;
			id: number;
			name: string;
			description: string;
			monthly_price_in_cents: number;
			yearly_price_in_cents: number;
			price_model: string;
			has_free_trial: boolean;
			unit_name: null;
			bullets: Array<string>;
		};
		type AppsGetMarketplaceListingStubbedPlanAccountsResponseItemMarketplacePurchase = {
			billing_cycle: string;
			next_billing_date: string;
			unit_count: null;
			on_free_trial: boolean;
			free_trial_ends_on: string;
			updated_at: string;
			plan: AppsGetMarketplaceListingStubbedPlanAccountsResponseItemMarketplacePurchasePlan;
		};
		type AppsGetMarketplaceListingStubbedPlanAccountsResponseItem = {
			url: string;
			type: string;
			id: number;
			login: string;
			email: null;
			organization_billing_email: string;
			marketplace_purchase: AppsGetMarketplaceListingStubbedPlanAccountsResponseItemMarketplacePurchase;
		};
		type AppsGetMarketplaceListingPlansResponseItem = {
			url: string;
			accounts_url: string;
			id: number;
			name: string;
			description: string;
			monthly_price_in_cents: number;
			yearly_price_in_cents: number;
			price_model: string;
			has_free_trial: boolean;
			unit_name: null;
			bullets: Array<string>;
		};
		type AppsGetMarketplaceListingPlanAccountsResponseItemMarketplacePurchasePlan = {
			url: string;
			accounts_url: string;
			id: number;
			name: string;
			description: string;
			monthly_price_in_cents: number;
			yearly_price_in_cents: number;
			price_model: string;
			has_free_trial: boolean;
			unit_name: null;
			bullets: Array<string>;
		};
		type AppsGetMarketplaceListingPlanAccountsResponseItemMarketplacePurchase = {
			billing_cycle: string;
			next_billing_date: string;
			unit_count: null;
			on_free_trial: boolean;
			free_trial_ends_on: string;
			updated_at: string;
			plan: AppsGetMarketplaceListingPlanAccountsResponseItemMarketplacePurchasePlan;
		};
		type AppsGetMarketplaceListingPlanAccountsResponseItem = {
			url: string;
			type: string;
			id: number;
			login: string;
			email: null;
			organization_billing_email: string;
			marketplace_purchase: AppsGetMarketplaceListingPlanAccountsResponseItemMarketplacePurchase;
		};
		type AppsGetInstallationsResponseItemPermissions = {
			metadata: string;
			contents: string;
			issues: string;
			single_file: string;
		};
		type AppsGetInstallationsResponseItemAccount = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
		};
		type AppsGetInstallationsResponseItem = {
			id: number;
			account: AppsGetInstallationsResponseItemAccount;
			access_tokens_url: string;
			repositories_url: string;
			html_url: string;
			app_id: number;
			target_id: number;
			target_type: string;
			permissions: AppsGetInstallationsResponseItemPermissions;
			events: Array<string>;
			single_file_name: string;
			repository_selection: string;
		};
		type AppsGetInstallationRepositoriesResponseRepositoriesItemOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type AppsGetInstallationRepositoriesResponseRepositoriesItem = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: AppsGetInstallationRepositoriesResponseRepositoriesItemOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type AppsGetInstallationRepositoriesResponse = {
			total_count: number;
			repositories: Array<
				AppsGetInstallationRepositoriesResponseRepositoriesItem
				>;
		};
		type AppsGetInstallationResponsePermissions = {
			metadata: string;
			contents: string;
			issues: string;
			single_file: string;
		};
		type AppsGetInstallationResponseAccount = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
		};
		type AppsGetInstallationResponse = {
			id: number;
			account: AppsGetInstallationResponseAccount;
			access_tokens_url: string;
			repositories_url: string;
			html_url: string;
			app_id: number;
			target_id: number;
			target_type: string;
			permissions: AppsGetInstallationResponsePermissions;
			events: Array<string>;
			single_file_name: string;
			repository_selection: string;
		};
		type AppsGetForSlugResponseOwner = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
		};
		type AppsGetForSlugResponse = {
			id: number;
			node_id: string;
			owner: AppsGetForSlugResponseOwner;
			name: string;
			description: string;
			external_url: string;
			html_url: string;
			created_at: string;
			updated_at: string;
		};
		type AppsGetResponseOwner = {
			login: string;
			id: number;
			node_id: string;
			url: string;
			repos_url: string;
			events_url: string;
			hooks_url: string;
			issues_url: string;
			members_url: string;
			public_members_url: string;
			avatar_url: string;
			description: string;
		};
		type AppsGetResponse = {
			id: number;
			node_id: string;
			owner: AppsGetResponseOwner;
			name: string;
			description: string;
			external_url: string;
			html_url: string;
			created_at: string;
			updated_at: string;
		};
		type AppsFindUserInstallationResponsePermissions = {
			checks: string;
			metadata: string;
			contents: string;
		};
		type AppsFindUserInstallationResponseAccount = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type AppsFindUserInstallationResponse = {
			id: number;
			account: AppsFindUserInstallationResponseAccount;
			repository_selection: string;
			access_tokens_url: string;
			repositories_url: string;
			html_url: string;
			app_id: number;
			target_id: number;
			target_type: string;
			permissions: AppsFindUserInstallationResponsePermissions;
			events: Array<string>;
			created_at: string;
			updated_at: string;
			single_file_name: null;
		};
		type AppsFindRepoInstallationResponsePermissions = {
			checks: string;
			metadata: string;
			contents: string;
		};
		type AppsFindRepoInstallationResponseAccount = {
			login: string;
			id: number;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type AppsFindRepoInstallationResponse = {
			id: number;
			account: AppsFindRepoInstallationResponseAccount;
			repository_selection: string;
			access_tokens_url: string;
			repositories_url: string;
			html_url: string;
			app_id: number;
			target_id: number;
			target_type: string;
			permissions: AppsFindRepoInstallationResponsePermissions;
			events: Array<string>;
			created_at: string;
			updated_at: string;
			single_file_name: null;
		};
		type AppsFindOrgInstallationResponsePermissions = {
			checks: string;
			metadata: string;
			contents: string;
		};
		type AppsFindOrgInstallationResponseAccount = {
			login: string;
			id: number;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type AppsFindOrgInstallationResponse = {
			id: number;
			account: AppsFindOrgInstallationResponseAccount;
			repository_selection: string;
			access_tokens_url: string;
			repositories_url: string;
			html_url: string;
			app_id: number;
			target_id: number;
			target_type: string;
			permissions: AppsFindOrgInstallationResponsePermissions;
			events: Array<string>;
			created_at: string;
			updated_at: string;
			single_file_name: null;
		};
		type AppsCreateInstallationTokenResponse = {
			token: string;
			expires_at: string;
		};
		type AppsCreateFromManifestResponseOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type AppsCreateFromManifestResponse = {
			id: number;
			node_id: string;
			owner: AppsCreateFromManifestResponseOwner;
			name: string;
			description: null;
			external_url: string;
			html_url: string;
			created_at: string;
			updated_at: string;
			webhook_secret: string;
			pem: string;
		};
		type AppsCheckMarketplaceListingStubbedAccountResponseMarketplacePurchasePlan = {
			url: string;
			accounts_url: string;
			id: number;
			name: string;
			description: string;
			monthly_price_in_cents: number;
			yearly_price_in_cents: number;
			price_model: string;
			has_free_trial: boolean;
			unit_name: null;
			bullets: Array<string>;
		};
		type AppsCheckMarketplaceListingStubbedAccountResponseMarketplacePurchase = {
			billing_cycle: string;
			next_billing_date: string;
			unit_count: null;
			on_free_trial: boolean;
			free_trial_ends_on: string;
			updated_at: string;
			plan: AppsCheckMarketplaceListingStubbedAccountResponseMarketplacePurchasePlan;
		};
		type AppsCheckMarketplaceListingStubbedAccountResponse = {
			url: string;
			type: string;
			id: number;
			login: string;
			email: null;
			organization_billing_email: string;
			marketplace_purchase: AppsCheckMarketplaceListingStubbedAccountResponseMarketplacePurchase;
		};
		type AppsCheckMarketplaceListingAccountResponseMarketplacePurchasePlan = {
			url: string;
			accounts_url: string;
			id: number;
			name: string;
			description: string;
			monthly_price_in_cents: number;
			yearly_price_in_cents: number;
			price_model: string;
			has_free_trial: boolean;
			unit_name: null;
			bullets: Array<string>;
		};
		type AppsCheckMarketplaceListingAccountResponseMarketplacePurchase = {
			billing_cycle: string;
			next_billing_date: string;
			unit_count: null;
			on_free_trial: boolean;
			free_trial_ends_on: string;
			updated_at: string;
			plan: AppsCheckMarketplaceListingAccountResponseMarketplacePurchasePlan;
		};
		type AppsCheckMarketplaceListingAccountResponse = {
			url: string;
			type: string;
			id: number;
			login: string;
			email: null;
			organization_billing_email: string;
			marketplace_purchase: AppsCheckMarketplaceListingAccountResponseMarketplacePurchase;
		};
		type AppsAddRepoToInstallationResponse = {};
		type ActivityUnwatchRepoResponse = {};
		type ActivityUnstarRepoResponse = {};
		type ActivityStarRepoResponse = {};
		type ActivitySetRepoSubscriptionResponse = {
			subscribed: boolean;
			ignored: boolean;
			reason: null;
			created_at: string;
			url: string;
			repository_url: string;
		};
		type ActivitySetNotificationThreadSubscriptionResponse = {
			subscribed: boolean;
			ignored: boolean;
			reason: null;
			created_at: string;
			url: string;
			thread_url: string;
		};
		type ActivityMarkNotificationsAsReadForRepoResponse = {};
		type ActivityMarkNotificationsAsReadResponse = {};
		type ActivityMarkNotificationThreadAsReadResponse = {};
		type ActivityGetWatchersForRepoResponseItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ActivityGetWatchedReposForUserResponseItemLicense = {
			key: string;
			name: string;
			spdx_id: string;
			url: string;
			node_id: string;
		};
		type ActivityGetWatchedReposForUserResponseItemPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type ActivityGetWatchedReposForUserResponseItemOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ActivityGetWatchedReposForUserResponseItem = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ActivityGetWatchedReposForUserResponseItemOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: ActivityGetWatchedReposForUserResponseItemPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
			license: ActivityGetWatchedReposForUserResponseItemLicense;
		};
		type ActivityGetWatchedReposResponseItemLicense = {
			key: string;
			name: string;
			spdx_id: string;
			url: string;
			node_id: string;
		};
		type ActivityGetWatchedReposResponseItemPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type ActivityGetWatchedReposResponseItemOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ActivityGetWatchedReposResponseItem = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ActivityGetWatchedReposResponseItemOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: ActivityGetWatchedReposResponseItemPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
			license: ActivityGetWatchedReposResponseItemLicense;
		};
		type ActivityGetStarredReposForUserResponseItemPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type ActivityGetStarredReposForUserResponseItemOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ActivityGetStarredReposForUserResponseItem = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ActivityGetStarredReposForUserResponseItemOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: ActivityGetStarredReposForUserResponseItemPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type ActivityGetStarredReposResponseItemPermissions = {
			admin: boolean;
			push: boolean;
			pull: boolean;
		};
		type ActivityGetStarredReposResponseItemOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ActivityGetStarredReposResponseItem = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ActivityGetStarredReposResponseItemOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
			clone_url: string;
			mirror_url: string;
			hooks_url: string;
			svn_url: string;
			homepage: string;
			language: null;
			forks_count: number;
			stargazers_count: number;
			watchers_count: number;
			size: number;
			default_branch: string;
			open_issues_count: number;
			topics: Array<string>;
			has_issues: boolean;
			has_projects: boolean;
			has_wiki: boolean;
			has_pages: boolean;
			has_downloads: boolean;
			archived: boolean;
			pushed_at: string;
			created_at: string;
			updated_at: string;
			permissions: ActivityGetStarredReposResponseItemPermissions;
			allow_rebase_merge: boolean;
			allow_squash_merge: boolean;
			allow_merge_commit: boolean;
			subscribers_count: number;
			network_count: number;
		};
		type ActivityGetStargazersForRepoResponseItem = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ActivityGetNotificationsForUserResponseItemSubject = {
			title: string;
			url: string;
			latest_comment_url: string;
			type: string;
		};
		type ActivityGetNotificationsForUserResponseItemRepositoryOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ActivityGetNotificationsForUserResponseItemRepository = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ActivityGetNotificationsForUserResponseItemRepositoryOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
		};
		type ActivityGetNotificationsForUserResponseItem = {
			id: string;
			repository: ActivityGetNotificationsForUserResponseItemRepository;
			subject: ActivityGetNotificationsForUserResponseItemSubject;
			reason: string;
			unread: boolean;
			updated_at: string;
			last_read_at: string;
			url: string;
		};
		type ActivityGetNotificationsResponseItemSubject = {
			title: string;
			url: string;
			latest_comment_url: string;
			type: string;
		};
		type ActivityGetNotificationsResponseItemRepositoryOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ActivityGetNotificationsResponseItemRepository = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ActivityGetNotificationsResponseItemRepositoryOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
		};
		type ActivityGetNotificationsResponseItem = {
			id: string;
			repository: ActivityGetNotificationsResponseItemRepository;
			subject: ActivityGetNotificationsResponseItemSubject;
			reason: string;
			unread: boolean;
			updated_at: string;
			last_read_at: string;
			url: string;
		};
		type ActivityGetNotificationThreadResponseSubject = {
			title: string;
			url: string;
			latest_comment_url: string;
			type: string;
		};
		type ActivityGetNotificationThreadResponseRepositoryOwner = {
			login: string;
			id: number;
			node_id: string;
			avatar_url: string;
			gravatar_id: string;
			url: string;
			html_url: string;
			followers_url: string;
			following_url: string;
			gists_url: string;
			starred_url: string;
			subscriptions_url: string;
			organizations_url: string;
			repos_url: string;
			events_url: string;
			received_events_url: string;
			type: string;
			site_admin: boolean;
		};
		type ActivityGetNotificationThreadResponseRepository = {
			id: number;
			node_id: string;
			name: string;
			full_name: string;
			owner: ActivityGetNotificationThreadResponseRepositoryOwner;
			private: boolean;
			html_url: string;
			description: string;
			fork: boolean;
			url: string;
			archive_url: string;
			assignees_url: string;
			blobs_url: string;
			branches_url: string;
			collaborators_url: string;
			comments_url: string;
			commits_url: string;
			compare_url: string;
			contents_url: string;
			contributors_url: string;
			deployments_url: string;
			downloads_url: string;
			events_url: string;
			forks_url: string;
			git_commits_url: string;
			git_refs_url: string;
			git_tags_url: string;
			git_url: string;
			issue_comment_url: string;
			issue_events_url: string;
			issues_url: string;
			keys_url: string;
			labels_url: string;
			languages_url: string;
			merges_url: string;
			milestones_url: string;
			notifications_url: string;
			pulls_url: string;
			releases_url: string;
			ssh_url: string;
			stargazers_url: string;
			statuses_url: string;
			subscribers_url: string;
			subscription_url: string;
			tags_url: string;
			teams_url: string;
			trees_url: string;
		};
		type ActivityGetNotificationThreadResponse = {
			id: string;
			repository: ActivityGetNotificationThreadResponseRepository;
			subject: ActivityGetNotificationThreadResponseSubject;
			reason: string;
			unread: boolean;
			updated_at: string;
			last_read_at: string;
			url: string;
		};
		type ActivityGetFeedsResponseLinksCurrentUserOrganizationsItem = {
			href: string;
			type: string;
		};
		type ActivityGetFeedsResponseLinksCurrentUserOrganization = {
			href: string;
			type: string;
		};
		type ActivityGetFeedsResponseLinksCurrentUserActor = {
			href: string;
			type: string;
		};
		type ActivityGetFeedsResponseLinksCurrentUser = {
			href: string;
			type: string;
		};
		type ActivityGetFeedsResponseLinksCurrentUserPublic = {
			href: string;
			type: string;
		};
		type ActivityGetFeedsResponseLinksUser = {
			href: string;
			type: string;
		};
		type ActivityGetFeedsResponseLinksTimeline = {
			href: string;
			type: string;
		};
		type ActivityGetFeedsResponseLinks = {
			timeline: ActivityGetFeedsResponseLinksTimeline;
			user: ActivityGetFeedsResponseLinksUser;
			current_user_public: ActivityGetFeedsResponseLinksCurrentUserPublic;
			current_user: ActivityGetFeedsResponseLinksCurrentUser;
			current_user_actor: ActivityGetFeedsResponseLinksCurrentUserActor;
			current_user_organization: ActivityGetFeedsResponseLinksCurrentUserOrganization;
			current_user_organizations: Array<
				ActivityGetFeedsResponseLinksCurrentUserOrganizationsItem
				>;
		};
		type ActivityGetFeedsResponse = {
			timeline_url: string;
			user_url: string;
			current_user_public_url: string;
			current_user_url: string;
			current_user_actor_url: string;
			current_user_organization_url: string;
			current_user_organization_urls: Array<string>;
			_links: ActivityGetFeedsResponseLinks;
		};
		type ActivityDeleteNotificationThreadSubscriptionResponse = {};
		type ActivityCheckNotificationThreadSubscriptionResponse = {
			subscribed: boolean;
			ignored: boolean;
			reason: null;
			created_at: string;
			url: string;
			thread_url: string;
		};
		type ActivityGetNotificationsResponse = Array<
			ActivityGetNotificationsResponseItem
			>;
		type ActivityGetNotificationsForUserResponse = Array<
			ActivityGetNotificationsForUserResponseItem
			>;
		type ActivityGetStargazersForRepoResponse = Array<
			ActivityGetStargazersForRepoResponseItem
			>;
		type ActivityGetStarredReposResponse = Array<
			ActivityGetStarredReposResponseItem
			>;
		type ActivityGetStarredReposForUserResponse = Array<
			ActivityGetStarredReposForUserResponseItem
			>;
		type ActivityGetWatchedReposResponse = Array<
			ActivityGetWatchedReposResponseItem
			>;
		type ActivityGetWatchedReposForUserResponse = Array<
			ActivityGetWatchedReposForUserResponseItem
			>;
		type ActivityGetWatchersForRepoResponse = Array<
			ActivityGetWatchersForRepoResponseItem
			>;
		type AppsGetInstallationsResponse = Array<AppsGetInstallationsResponseItem>;
		type AppsGetMarketplaceListingPlanAccountsResponse = Array<
			AppsGetMarketplaceListingPlanAccountsResponseItem
			>;
		type AppsGetMarketplaceListingPlansResponse = Array<
			AppsGetMarketplaceListingPlansResponseItem
			>;
		type AppsGetMarketplaceListingStubbedPlanAccountsResponse = Array<
			AppsGetMarketplaceListingStubbedPlanAccountsResponseItem
			>;
		type AppsGetMarketplaceListingStubbedPlansResponse = Array<
			AppsGetMarketplaceListingStubbedPlansResponseItem
			>;
		type AuthorizationGetAllResponse = Array<AuthorizationGetAllResponseItem>;
		type AuthorizationGetGrantsResponse = Array<
			AuthorizationGetGrantsResponseItem
			>;
		type ChecksListAnnotationsResponse = Array<ChecksListAnnotationsResponseItem>;
		type GistsGetAllResponse = Array<GistsGetAllResponseItem>;
		type GistsGetCommentsResponse = Array<GistsGetCommentsResponseItem>;
		type GistsGetCommitsResponse = Array<GistsGetCommitsResponseItem>;
		type GistsGetForUserResponse = Array<GistsGetForUserResponseItem>;
		type GistsGetForksResponse = Array<GistsGetForksResponseItem>;
		type GistsGetPublicResponse = Array<GistsGetPublicResponseItem>;
		type GistsGetStarredResponse = Array<GistsGetStarredResponseItem>;
		type IssuesAddLabelsResponse = Array<IssuesAddLabelsResponseItem>;
		type IssuesGetAllResponse = Array<IssuesGetAllResponseItem>;
		type IssuesGetAssigneesResponse = Array<IssuesGetAssigneesResponseItem>;
		type IssuesGetCommentsResponse = Array<IssuesGetCommentsResponseItem>;
		type IssuesGetCommentsForRepoResponse = Array<
			IssuesGetCommentsForRepoResponseItem
			>;
		type IssuesGetEventsResponse = Array<IssuesGetEventsResponseItem>;
		type IssuesGetEventsForRepoResponse = Array<
			IssuesGetEventsForRepoResponseItem
			>;
		type IssuesGetEventsTimelineResponse = Array<
			IssuesGetEventsTimelineResponseItem
			>;
		type IssuesGetForOrgResponse = Array<IssuesGetForOrgResponseItem>;
		type IssuesGetForRepoResponse = Array<IssuesGetForRepoResponseItem>;
		type IssuesGetForUserResponse = Array<IssuesGetForUserResponseItem>;
		type IssuesGetIssueLabelsResponse = Array<IssuesGetIssueLabelsResponseItem>;
		type IssuesGetLabelsResponse = Array<IssuesGetLabelsResponseItem>;
		type IssuesGetMilestoneLabelsResponse = Array<
			IssuesGetMilestoneLabelsResponseItem
			>;
		type IssuesGetMilestonesResponse = Array<IssuesGetMilestonesResponseItem>;
		type IssuesReplaceAllLabelsResponse = Array<
			IssuesReplaceAllLabelsResponseItem
			>;
		type MigrationsGetImportCommitAuthorsResponse = Array<
			MigrationsGetImportCommitAuthorsResponseItem
			>;
		type MigrationsGetLargeImportFilesResponse = Array<
			MigrationsGetLargeImportFilesResponseItem
			>;
		type MigrationsGetMigrationsResponse = Array<
			MigrationsGetMigrationsResponseItem
			>;
		type MigrationsListForAuthenticatedUserResponse = Array<
			MigrationsListForAuthenticatedUserResponseItem
			>;
		type MiscGetCodesOfConductResponse = Array<MiscGetCodesOfConductResponseItem>;
		type MiscGetGitignoreTemplatesResponse = Array<string>;
		type MiscGetLicensesResponse = Array<MiscGetLicensesResponseItem>;
		type OrgsGetAllResponse = Array<OrgsGetAllResponseItem>;
		type OrgsGetBlockedUsersResponse = Array<OrgsGetBlockedUsersResponseItem>;
		type OrgsGetForUserResponse = Array<OrgsGetForUserResponseItem>;
		type OrgsGetHooksResponse = Array<OrgsGetHooksResponseItem>;
		type OrgsGetInvitationTeamsResponse = Array<
			OrgsGetInvitationTeamsResponseItem
			>;
		type OrgsGetMembersResponse = Array<OrgsGetMembersResponseItem>;
		type OrgsGetOutsideCollaboratorsResponse = Array<
			OrgsGetOutsideCollaboratorsResponseItem
			>;
		type OrgsGetPendingOrgInvitesResponse = Array<
			OrgsGetPendingOrgInvitesResponseItem
			>;
		type OrgsGetPendingTeamInvitesResponse = Array<
			OrgsGetPendingTeamInvitesResponseItem
			>;
		type OrgsGetPublicMembersResponse = Array<OrgsGetPublicMembersResponseItem>;
		type OrgsGetTeamMembersResponse = Array<OrgsGetTeamMembersResponseItem>;
		type OrgsGetTeamReposResponse = Array<OrgsGetTeamReposResponseItem>;
		type OrgsGetTeamsResponse = Array<OrgsGetTeamsResponseItem>;
		type ProjectsGetCollaboratorsResponse = Array<
			ProjectsGetCollaboratorsResponseItem
			>;
		type ProjectsGetOrgProjectsResponse = Array<
			ProjectsGetOrgProjectsResponseItem
			>;
		type ProjectsGetProjectCardsResponse = Array<
			ProjectsGetProjectCardsResponseItem
			>;
		type ProjectsGetProjectColumnsResponse = Array<
			ProjectsGetProjectColumnsResponseItem
			>;
		type ProjectsGetRepoProjectsResponse = Array<
			ProjectsGetRepoProjectsResponseItem
			>;
		type PullRequestsGetAllResponse = Array<PullRequestsGetAllResponseItem>;
		type PullRequestsGetCommentsResponse = Array<
			PullRequestsGetCommentsResponseItem
			>;
		type PullRequestsGetCommentsForRepoResponse = Array<
			PullRequestsGetCommentsForRepoResponseItem
			>;
		type PullRequestsGetCommitsResponse = Array<
			PullRequestsGetCommitsResponseItem
			>;
		type PullRequestsGetFilesResponse = Array<PullRequestsGetFilesResponseItem>;
		type PullRequestsGetReviewCommentsResponse = Array<
			PullRequestsGetReviewCommentsResponseItem
			>;
		type PullRequestsGetReviewsResponse = Array<
			PullRequestsGetReviewsResponseItem
			>;
		type ReactionsGetForCommitCommentResponse = Array<
			ReactionsGetForCommitCommentResponseItem
			>;
		type ReactionsGetForIssueResponse = Array<ReactionsGetForIssueResponseItem>;
		type ReactionsGetForIssueCommentResponse = Array<
			ReactionsGetForIssueCommentResponseItem
			>;
		type ReactionsGetForPullRequestReviewCommentResponse = Array<
			ReactionsGetForPullRequestReviewCommentResponseItem
			>;
		type ReactionsGetForTeamDiscussionResponse = Array<
			ReactionsGetForTeamDiscussionResponseItem
			>;
		type ReactionsGetForTeamDiscussionCommentResponse = Array<
			ReactionsGetForTeamDiscussionCommentResponseItem
			>;
		type ReposAddProtectedBranchRequiredStatusChecksContextsResponse = Array<
			string
			>;
		type ReposAddProtectedBranchTeamRestrictionsResponse = Array<
			ReposAddProtectedBranchTeamRestrictionsResponseItem
			>;
		type ReposAddProtectedBranchUserRestrictionsResponse = Array<
			ReposAddProtectedBranchUserRestrictionsResponseItem
			>;
		type ReposCompareCommitsResponse = any;
		type ReposGetAllCommitCommentsResponse = Array<
			ReposGetAllCommitCommentsResponseItem
			>;
		type ReposGetAssetsResponse = Array<ReposGetAssetsResponseItem>;
		type ReposGetBranchesResponse = Array<ReposGetBranchesResponseItem>;
		type ReposGetCollaboratorsResponse = Array<ReposGetCollaboratorsResponseItem>;
		type ReposGetCommitCommentsResponse = Array<
			ReposGetCommitCommentsResponseItem
			>;
		type ReposGetCommitsResponse = Array<ReposGetCommitsResponseItem>;
		type ReposGetDeployKeysResponse = Array<ReposGetDeployKeysResponseItem>;
		type ReposGetDeploymentStatusesResponse = Array<
			ReposGetDeploymentStatusesResponseItem
			>;
		type ReposGetDeploymentsResponse = Array<ReposGetDeploymentsResponseItem>;
		type ReposGetDownloadsResponse = Array<ReposGetDownloadsResponseItem>;
		type ReposGetForOrgResponse = Array<ReposGetForOrgResponseItem>;
		type ReposGetForksResponse = Array<ReposGetForksResponseItem>;
		type ReposGetHooksResponse = Array<ReposGetHooksResponseItem>;
		type ReposGetInvitesResponse = Array<ReposGetInvitesResponseItem>;
		type ReposGetPathsResponse = Array<ReposGetPathsResponseItem>;
		type ReposGetProtectedBranchTeamRestrictionsResponse = any;
		type ReposGetPublicResponse = Array<ReposGetPublicResponseItem>;
		type ReposGetReferrersResponse = Array<ReposGetReferrersResponseItem>;
		type ReposGetReleasesResponse = Array<ReposGetReleasesResponseItem>;
		type ReposGetStatsCodeFrequencyResponse = Array<Array<number>>;
		type ReposGetStatsCommitActivityResponse = Array<
			ReposGetStatsCommitActivityResponseItem
			>;
		type ReposGetStatsContributorsResponse = Array<
			ReposGetStatsContributorsResponseItem
			>;
		type ReposGetStatsPunchCardResponse = Array<Array<number>>;
		type ReposGetStatusesResponse = Array<ReposGetStatusesResponseItem>;
		type ReposGetTagsResponse = Array<ReposGetTagsResponseItem>;
		type ReposGetTeamsResponse = Array<ReposGetTeamsResponseItem>;
		type ReposRemoveProtectedBranchRequiredStatusChecksContextsResponse = Array<
			string
			>;
		type ReposRemoveProtectedBranchTeamRestrictionsResponse = Array<
			ReposRemoveProtectedBranchTeamRestrictionsResponseItem
			>;
		type ReposRemoveProtectedBranchUserRestrictionsResponse = Array<
			ReposRemoveProtectedBranchUserRestrictionsResponseItem
			>;
		type ReposReplaceProtectedBranchRequiredStatusChecksContextsResponse = Array<
			string
			>;
		type ReposReplaceProtectedBranchTeamRestrictionsResponse = Array<
			ReposReplaceProtectedBranchTeamRestrictionsResponseItem
			>;
		type ReposReplaceProtectedBranchUserRestrictionsResponse = Array<
			ReposReplaceProtectedBranchUserRestrictionsResponseItem
			>;
		type UsersAddEmailsResponse = Array<UsersAddEmailsResponseItem>;
		type UsersGetAllResponse = Array<UsersGetAllResponseItem>;
		type UsersGetBlockedUsersResponse = Array<UsersGetBlockedUsersResponseItem>;
		type UsersGetContextForUserResponse = any;
		type UsersGetEmailsResponse = Array<UsersGetEmailsResponseItem>;
		type UsersGetFollowersResponse = Array<UsersGetFollowersResponseItem>;
		type UsersGetFollowersForUserResponse = Array<
			UsersGetFollowersForUserResponseItem
			>;
		type UsersGetFollowingResponse = Array<UsersGetFollowingResponseItem>;
		type UsersGetFollowingForUserResponse = Array<
			UsersGetFollowingForUserResponseItem
			>;
		type UsersGetGpgKeysResponse = Array<UsersGetGpgKeysResponseItem>;
		type UsersGetGpgKeysForUserResponse = Array<
			UsersGetGpgKeysForUserResponseItem
			>;
		type UsersGetKeysResponse = Array<UsersGetKeysResponseItem>;
		type UsersGetKeysForUserResponse = Array<UsersGetKeysForUserResponseItem>;
		type UsersGetMarketplacePurchasesResponse = Array<
			UsersGetMarketplacePurchasesResponseItem
			>;
		type UsersGetMarketplaceStubbedPurchasesResponse = Array<
			UsersGetMarketplaceStubbedPurchasesResponseItem
			>;
		type UsersGetOrgMembershipsResponse = Array<
			UsersGetOrgMembershipsResponseItem
			>;
		type UsersGetOrgsResponse = Array<UsersGetOrgsResponseItem>;
		type UsersGetPublicEmailsResponse = Array<UsersGetPublicEmailsResponseItem>;
		type UsersGetRepoInvitesResponse = Array<UsersGetRepoInvitesResponseItem>;
		type UsersGetTeamsResponse = Array<UsersGetTeamsResponseItem>;
		type UsersTogglePrimaryEmailVisibilityResponse = Array<
			UsersTogglePrimaryEmailVisibilityResponseItem
			>;

		export type ActivityCheckNotificationThreadSubscriptionParams = {
			thread_id: number;
		};
		export type ActivityCheckStarringRepoParams = {
			owner: string;
			repo: string;
		};
		export type ActivityDeleteNotificationThreadSubscriptionParams = {
			thread_id: number;
		};
		export type ActivityGetEventsParams = {
			per_page?: number;
			page?: number;
		};
		export type ActivityGetEventsForOrgParams = {
			org: string;
			per_page?: number;
			page?: number;
		};
		export type ActivityGetEventsForRepoParams = {
			owner: string;
			repo: string;
			per_page?: number;
			page?: number;
		};
		export type ActivityGetEventsForRepoNetworkParams = {
			owner: string;
			repo: string;
			per_page?: number;
			page?: number;
		};
		export type ActivityGetEventsForUserParams = {
			username: string;
			per_page?: number;
			page?: number;
		};
		export type ActivityGetEventsForUserOrgParams = {
			username: string;
			org: string;
			per_page?: number;
			page?: number;
		};
		export type ActivityGetEventsForUserPublicParams = {
			username: string;
			per_page?: number;
			page?: number;
		};
		export type ActivityGetEventsReceivedParams = {
			username: string;
			per_page?: number;
			page?: number;
		};
		export type ActivityGetEventsReceivedPublicParams = {
			username: string;
			per_page?: number;
			page?: number;
		};
		export type ActivityGetNotificationThreadParams = {
			thread_id: number;
		};
		export type ActivityGetNotificationsParams = {
			all?: boolean;
			participating?: boolean;
			since?: string;
			before?: string;
			per_page?: number;
			page?: number;
		};
		export type ActivityGetNotificationsForUserParams = {
			owner: string;
			repo: string;
			all?: boolean;
			participating?: boolean;
			since?: string;
			before?: string;
			per_page?: number;
			page?: number;
		};
		export type ActivityGetRepoSubscriptionParams = {
			owner: string;
			repo: string;
		};
		export type ActivityGetStargazersForRepoParams = {
			owner: string;
			repo: string;
			per_page?: number;
			page?: number;
		};
		export type ActivityGetStarredReposParams = {
			sort?: 'created' | 'updated';
			direction?: 'asc' | 'desc';
			per_page?: number;
			page?: number;
		};
		export type ActivityGetStarredReposForUserParams = {
			username: string;
			sort?: 'created' | 'updated';
			direction?: 'asc' | 'desc';
			per_page?: number;
			page?: number;
		};
		export type ActivityGetWatchedReposParams = {
			per_page?: number;
			page?: number;
		};
		export type ActivityGetWatchedReposForUserParams = {
			username: string;
			per_page?: number;
			page?: number;
		};
		export type ActivityGetWatchersForRepoParams = {
			owner: string;
			repo: string;
			per_page?: number;
			page?: number;
		};
		export type ActivityMarkNotificationThreadAsReadParams = {
			thread_id: number;
		};
		export type ActivityMarkNotificationsAsReadParams = {
			last_read_at?: string;
		};
		export type ActivityMarkNotificationsAsReadForRepoParams = {
			owner: string;
			repo: string;
			last_read_at?: string;
		};
		export type ActivitySetNotificationThreadSubscriptionParams = {
			thread_id: number;
			ignored?: boolean;
		};
		export type ActivitySetRepoSubscriptionParams = {
			owner: string;
			repo: string;
			subscribed?: boolean;
			ignored?: boolean;
		};
		export type ActivityStarRepoParams = {
			owner: string;
			repo: string;
		};
		export type ActivityUnstarRepoParams = {
			owner: string;
			repo: string;
		};
		export type ActivityUnwatchRepoParams = {
			owner: string;
			repo: string;
		};
		export type AppsAddRepoToInstallationParams = {
			installation_id: number;
			repository_id: number;
		};
		export type AppsCheckMarketplaceListingAccountParams = {
			account_id: number;
			per_page?: number;
			page?: number;
		};
		export type AppsCheckMarketplaceListingStubbedAccountParams = {
			account_id: number;
			per_page?: number;
			page?: number;
		};
		export type AppsCreateFromManifestParams = {
			code: string;
		};
		export type AppsCreateInstallationTokenParams = {
			installation_id: number;
		};
		export type AppsFindOrgInstallationParams = {
			org: string;
		};
		export type AppsFindRepoInstallationParams = {
			owner: string;
			repo: string;
		};
		export type AppsFindUserInstallationParams = {
			username: string;
		};
		export type AppsGetForSlugParams = {
			app_slug: string;
		};
		export type AppsGetInstallationParams = {
			installation_id: number;
		};
		export type AppsGetInstallationRepositoriesParams = {
			per_page?: number;
			page?: number;
		};
		export type AppsGetInstallationsParams = {
			per_page?: number;
			page?: number;
		};
		export type AppsGetMarketplaceListingPlanAccountsParams = {
			plan_id: number;
			sort?: 'created' | 'updated';
			direction?: 'asc' | 'desc';
			per_page?: number;
			page?: number;
		};
		export type AppsGetMarketplaceListingPlansParams = {
			per_page?: number;
			page?: number;
		};
		export type AppsGetMarketplaceListingStubbedPlanAccountsParams = {
			plan_id: number;
			sort?: 'created' | 'updated';
			direction?: 'asc' | 'desc';
			per_page?: number;
			page?: number;
		};
		export type AppsGetMarketplaceListingStubbedPlansParams = {
			per_page?: number;
			page?: number;
		};
		export type AppsRemoveRepoFromInstallationParams = {
			installation_id: number;
			repository_id: number;
		};
		export type AuthorizationCheckParams = {
			client_id: string;
			access_token: string;
		};
		export type AuthorizationCreateParams = {
			scopes?: string[];
			note: string;
			note_url?: string;
			client_id?: string;
			client_secret?: string;
			fingerprint?: string;
		};
		export type AuthorizationDeleteParams = {
			authorization_id: number;
		};
		export type AuthorizationDeleteGrantParams = {
			grant_id: number;
		};
		export type AuthorizationGetParams = {
			authorization_id: number;
		};
		export type AuthorizationGetAllParams = {
			per_page?: number;
			page?: number;
		};
		export type AuthorizationGetGrantParams = {
			grant_id: number;
		};
		export type AuthorizationGetGrantsParams = {
			per_page?: number;
			page?: number;
		};
		export type AuthorizationGetOrCreateAuthorizationForAppParams = {
			client_id: string;
			client_secret: string;
			scopes?: string[];
			note?: string;
			note_url?: string;
			fingerprint?: string;
		};
		export type AuthorizationGetOrCreateAuthorizationForAppAndFingerprintParams = {
			client_id: string;
			fingerprint: string;
			client_secret: string;
			scopes?: string[];
			note?: string;
			note_url?: string;
		};
		export type AuthorizationResetParams = {
			client_id: string;
			access_token: string;
		};
		export type AuthorizationRevokeParams = {
			client_id: string;
			access_token: string;
		};
		export type AuthorizationRevokeGrantParams = {
			client_id: string;
			access_token: string;
		};
		export type AuthorizationUpdateParams = {
			authorization_id: number;
			scopes?: string[];
			add_scopes?: string[];
			remove_scopes?: string[];
			note?: string;
			note_url?: string;
			fingerprint?: string;
		};
		export type ChecksCreateParams = {
			owner: string;
			repo: string;
			name: string;
			head_sha: string;
			details_url?: string;
			external_id?: string;
			status?: 'queued' | 'in_progress' | 'completed';
			started_at?: string;
			conclusion?:
				| 'success'
				| 'failure'
				| 'neutral'
				| 'cancelled'
				| 'timed_out'
				| 'action_required'
				| 'details_url'
				| 'conclusion'
				| 'status'
				| 'completed';
			completed_at?: string;
			output?: ChecksCreateParamsOutput;
			actions?: ChecksCreateParamsActions[];
		};
		export type ChecksCreateSuiteParams = {
			owner: string;
			repo: string;
			head_sha: string;
		};
		export type ChecksGetParams = {
			owner: string;
			repo: string;
			check_run_id: number;
		};
		export type ChecksGetSuiteParams = {
			owner: string;
			repo: string;
			check_suite_id: number;
		};
		export type ChecksListAnnotationsParams = {
			owner: string;
			repo: string;
			check_run_id: number;
			per_page?: number;
			page?: number;
		};
		export type ChecksListForRefParams = {
			owner: string;
			repo: string;
			ref: string;
			check_name?: string;
			status?: 'queued' | 'in_progress' | 'completed';
			filter?: 'latest' | 'all';
			per_page?: number;
			page?: number;
		};
		export type ChecksListForSuiteParams = {
			owner: string;
			repo: string;
			check_suite_id: number;
			check_name?: string;
			status?: 'queued' | 'in_progress' | 'completed';
			filter?: 'latest' | 'all';
			per_page?: number;
			page?: number;
		};
		export type ChecksListSuitesForRefParams = {
			owner: string;
			repo: string;
			ref: string;
			app_id?: number;
			check_name?: string;
			per_page?: number;
			page?: number;
		};
		export type ChecksRerequestSuiteParams = {
			owner: string;
			repo: string;
			check_suite_id: number;
		};
		export type ChecksSetSuitesPreferencesParams = {
			owner: string;
			repo: string;
			auto_trigger_checks?: ChecksSetSuitesPreferencesParamsAutoTriggerChecks[];
		};
		export type ChecksUpdateParams = {
			owner: string;
			repo: string;
			check_run_id: number;
			name?: string;
			details_url?: string;
			external_id?: string;
			started_at?: string;
			status?: 'queued' | 'in_progress' | 'completed';
			conclusion?:
				| 'success'
				| 'failure'
				| 'neutral'
				| 'cancelled'
				| 'timed_out'
				| 'action_required'
				| 'conclusion'
				| 'status'
				| 'completed';
			completed_at?: string;
			output?: ChecksUpdateParamsOutput;
			actions?: ChecksUpdateParamsActions[];
		};
		export type GistsCheckStarParams = {
			gist_id: string;
		};
		export type GistsCreateParams = {
			files: GistsCreateParamsFiles;
			description?: string;
			public?: boolean;
		};
		export type GistsCreateCommentParams = {
			gist_id: string;
			body: string;
		};
		export type GistsDeleteParams = {
			gist_id: string;
		};
		export type GistsDeleteCommentParams = {
			gist_id: string;
			comment_id: number;
		};
		export type GistsEditParams = {
			gist_id: string;
			description?: string;
			files?: GistsEditParamsFiles;
		};
		export type GistsEditCommentParams = {
			gist_id: string;
			comment_id: number;
			body: string;
		};
		export type GistsForkParams = {
			gist_id: string;
		};
		export type GistsGetParams = {
			gist_id: string;
		};
		export type GistsGetAllParams = {
			since?: string;
			per_page?: number;
			page?: number;
		};
		export type GistsGetCommentParams = {
			gist_id: string;
			comment_id: number;
		};
		export type GistsGetCommentsParams = {
			gist_id: string;
			per_page?: number;
			page?: number;
		};
		export type GistsGetCommitsParams = {
			gist_id: string;
			per_page?: number;
			page?: number;
		};
		export type GistsGetForUserParams = {
			username: string;
			since?: string;
			per_page?: number;
			page?: number;
		};
		export type GistsGetForksParams = {
			gist_id: string;
			per_page?: number;
			page?: number;
		};
		export type GistsGetPublicParams = {
			since?: string;
			per_page?: number;
			page?: number;
		};
		export type GistsGetRevisionParams = {
			gist_id: string;
			sha: string;
		};
		export type GistsGetStarredParams = {
			since?: string;
			per_page?: number;
			page?: number;
		};
		export type GistsStarParams = {
			gist_id: string;
		};
		export type GistsUnstarParams = {
			gist_id: string;
		};
		export type GitdataCreateBlobParams = {
			owner: string;
			repo: string;
			content: string;
			encoding?: string;
		};
		export type GitdataCreateCommitParams = {
			owner: string;
			repo: string;
			message: string;
			tree: string;
			parents: string[];
			committer?: GitdataCreateCommitParamsCommitter;
			author?: GitdataCreateCommitParamsAuthor;
		};
		export type GitdataCreateReferenceParams = {
			owner: string;
			repo: string;
			ref: string;
			sha: string;
		};
		export type GitdataCreateTagParams = {
			owner: string;
			repo: string;
			tag: string;
			message: string;
			object: string;
			type: 'commit' | 'tree' | 'blob';
			tagger?: GitdataCreateTagParamsTagger;
		};
		export type GitdataCreateTreeParams = {
			owner: string;
			repo: string;
			tree: GitdataCreateTreeParamsTree[];
			base_tree?: string;
		};
		export type GitdataDeleteReferenceParams = {
			owner: string;
			repo: string;
			ref: string;
		};
		export type GitdataGetBlobParams = {
			owner: string;
			repo: string;
			file_sha: string;
		};
		export type GitdataGetCommitParams = {
			owner: string;
			repo: string;
			commit_sha: string;
		};
		export type GitdataGetCommitSignatureVerificationParams = {
			owner: string;
			repo: string;
			commit_sha: string;
		};
		export type GitdataGetReferenceParams = {
			owner: string;
			repo: string;
			ref: string;
		};
		export type GitdataGetTagParams = {
			owner: string;
			repo: string;
			tag_sha: string;
		};
		export type GitdataGetTagSignatureVerificationParams = {
			owner: string;
			repo: string;
			tag_sha: string;
		};
		export type GitdataGetTreeParams = {
			owner: string;
			repo: string;
			tree_sha: string;
			recursive?: 1;
		};
		export type GitdataUpdateReferenceParams = {
			owner: string;
			repo: string;
			ref: string;
			sha: string;
			force?: boolean;
		};
		export type IssuesAddAssigneesToIssueParams = {
			owner: string;
			repo: string;
			number: number;
			assignees?: string[];
		};
		export type IssuesAddLabelsParams = {
			owner: string;
			repo: string;
			number: number;
			labels: string[];
		};
		export type IssuesCheckAssigneeParams = {
			owner: string;
			repo: string;
			assignee: string;
		};
		export type IssuesCreateParams = {
			owner: string;
			repo: string;
			title: string;
			body?: string;
			assignee?: string;
			milestone?: number;
			labels?: string[];
			assignees?: string[];
		};
		export type IssuesCreateCommentParams = {
			owner: string;
			repo: string;
			number: number;
			body: string;
		};
		export type IssuesCreateLabelParams = {
			owner: string;
			repo: string;
			name: string;
			color: string;
			description?: string;
		};
		export type IssuesCreateMilestoneParams = {
			owner: string;
			repo: string;
			title: string;
			state?: 'open' | 'closed';
			description?: string;
			due_on?: string;
		};
		export type IssuesDeleteCommentParams = {
			owner: string;
			repo: string;
			comment_id: number;
		};
		export type IssuesDeleteLabelParams = {
			owner: string;
			repo: string;
			name: string;
		};
		export type IssuesDeleteMilestoneParams = {
			owner: string;
			repo: string;
			number: number;
		};
		export type IssuesEditParams = {
			owner: string;
			repo: string;
			number: number;
			title?: string;
			body?: string;
			assignee?: string;
			state?: 'open' | 'closed';
			milestone?: number | null;
			labels?: string[];
			assignees?: string[];
		};
		export type IssuesEditCommentParams = {
			owner: string;
			repo: string;
			comment_id: number;
			body: string;
		};
		export type IssuesGetParams = {
			owner: string;
			repo: string;
			number: number;
		};
		export type IssuesGetAllParams = {
			filter?: 'assigned' | 'created' | 'mentioned' | 'subscribed' | 'all';
			state?: 'open' | 'closed' | 'all';
			labels?: string;
			sort?: 'created' | 'updated' | 'comments';
			direction?: 'asc' | 'desc';
			since?: string;
			per_page?: number;
			page?: number;
		};
		export type IssuesGetAssigneesParams = {
			owner: string;
			repo: string;
			per_page?: number;
			page?: number;
		};
		export type IssuesGetCommentParams = {
			owner: string;
			repo: string;
			comment_id: number;
			per_page?: number;
			page?: number;
		};
		export type IssuesGetCommentsParams = {
			owner: string;
			repo: string;
			number: number;
			since?: string;
			per_page?: number;
			page?: number;
		};
		export type IssuesGetCommentsForRepoParams = {
			owner: string;
			repo: string;
			sort?: 'created' | 'updated';
			direction?: 'asc' | 'desc';
			since?: string;
		};
		export type IssuesGetEventParams = {
			owner: string;
			repo: string;
			event_id: number;
		};
		export type IssuesGetEventsParams = {
			owner: string;
			repo: string;
			number: number;
			per_page?: number;
			page?: number;
		};
		export type IssuesGetEventsForRepoParams = {
			owner: string;
			repo: string;
			per_page?: number;
			page?: number;
		};
		export type IssuesGetEventsTimelineParams = {
			owner: string;
			repo: string;
			number: number;
			per_page?: number;
			page?: number;
		};
		export type IssuesGetForOrgParams = {
			org: string;
			filter?: 'assigned' | 'created' | 'mentioned' | 'subscribed' | 'all';
			state?: 'open' | 'closed' | 'all';
			labels?: string;
			sort?: 'created' | 'updated' | 'comments';
			direction?: 'asc' | 'desc';
			since?: string;
			per_page?: number;
			page?: number;
		};
		export type IssuesGetForRepoParams = {
			owner: string;
			repo: string;
			milestone?: string;
			state?: 'open' | 'closed' | 'all';
			assignee?: string;
			creator?: string;
			mentioned?: string;
			labels?: string;
			sort?: 'created' | 'updated' | 'comments';
			direction?: 'asc' | 'desc';
			since?: string;
			per_page?: number;
			page?: number;
		};
		export type IssuesGetForUserParams = {
			filter?: 'assigned' | 'created' | 'mentioned' | 'subscribed' | 'all';
			state?: 'open' | 'closed' | 'all';
			labels?: string;
			sort?: 'created' | 'updated' | 'comments';
			direction?: 'asc' | 'desc';
			since?: string;
			per_page?: number;
			page?: number;
		};
		export type IssuesGetIssueLabelsParams = {
			owner: string;
			repo: string;
			number: number;
			per_page?: number;
			page?: number;
		};
		export type IssuesGetLabelParams = {
			owner: string;
			repo: string;
			name: string;
		};
		export type IssuesGetLabelsParams = {
			owner: string;
			repo: string;
			per_page?: number;
			page?: number;
		};
		export type IssuesGetMilestoneParams = {
			owner: string;
			repo: string;
			number: number;
		};
		export type IssuesGetMilestoneLabelsParams = {
			owner: string;
			repo: string;
			number: number;
			per_page?: number;
			page?: number;
		};
		export type IssuesGetMilestonesParams = {
			owner: string;
			repo: string;
			state?: 'open' | 'closed' | 'all';
			sort?: 'due_on' | 'completeness';
			direction?: 'asc' | 'desc';
			per_page?: number;
			page?: number;
		};
		export type IssuesLockParams = {
			owner: string;
			repo: string;
			number: number;
			lock_reason?: 'off-topic' | 'too heated' | 'resolved' | 'spam';
		};
		export type IssuesRemoveAllLabelsParams = {
			owner: string;
			repo: string;
			number: number;
		};
		export type IssuesRemoveAssigneesFromIssueParams = {
			owner: string;
			repo: string;
			number: number;
			assignees?: string[];
		};
		export type IssuesRemoveLabelParams = {
			owner: string;
			repo: string;
			number: number;
			name: string;
		};
		export type IssuesReplaceAllLabelsParams = {
			owner: string;
			repo: string;
			number: number;
			labels: string[];
		};
		export type IssuesUnlockParams = {
			owner: string;
			repo: string;
			number: number;
		};
		export type IssuesUpdateLabelParams = {
			owner: string;
			repo: string;
			current_name: string;
			name?: string;
			color?: string;
			description?: string;
		};
		export type IssuesUpdateMilestoneParams = {
			owner: string;
			repo: string;
			number: number;
			title?: string;
			state?: 'open' | 'closed';
			description?: string;
			due_on?: string;
		};
		export type MigrationsCancelImportParams = {
			owner: string;
			repo: string;
		};
		export type MigrationsDeleteArchiveForAuthenticatedUserParams = {
			migration_id: number;
		};
		export type MigrationsDeleteMigrationArchiveParams = {
			org: string;
			migration_id: number;
		};
		export type MigrationsGetArchiveForAuthenticatedUserParams = {
			migration_id: number;
		};
		export type MigrationsGetImportCommitAuthorsParams = {
			owner: string;
			repo: string;
			since?: string;
		};
		export type MigrationsGetImportProgressParams = {
			owner: string;
			repo: string;
		};
		export type MigrationsGetLargeImportFilesParams = {
			owner: string;
			repo: string;
		};
		export type MigrationsGetMigrationArchiveLinkParams = {
			org: string;
			migration_id: number;
		};
		export type MigrationsGetMigrationStatusParams = {
			org: string;
			migration_id: number;
		};
		export type MigrationsGetMigrationsParams = {
			org: string;
			per_page?: number;
			page?: number;
		};
		export type MigrationsGetStatusForAuthenticatedUserParams = {
			migration_id: number;
		};
		export type MigrationsListForAuthenticatedUserParams = {
			per_page?: number;
			page?: number;
		};
		export type MigrationsMapImportCommitAuthorParams = {
			owner: string;
			repo: string;
			author_id: number;
			email?: string;
			name?: string;
		};
		export type MigrationsSetImportLfsPreferenceParams = {
			owner: string;
			repo: string;
			use_lfs: 'opt_in' | 'opt_out';
		};
		export type MigrationsStartForAuthenticatedUserParams = {
			repositories: string[];
			lock_repositories?: boolean;
			exclude_attachments?: boolean;
		};
		export type MigrationsStartImportParams = {
			owner: string;
			repo: string;
			vcs_url: string;
			vcs?: 'subversion' | 'git' | 'mercurial' | 'tfvc';
			vcs_username?: string;
			vcs_password?: string;
			tfvc_project?: string;
		};
		export type MigrationsStartMigrationParams = {
			org: string;
			repositories: string[];
			lock_repositories?: boolean;
			exclude_attachments?: boolean;
		};
		export type MigrationsUnlockRepoForAuthenticatedUserParams = {
			migration_id: number;
			repo_name: string;
		};
		export type MigrationsUnlockRepoLockedForMigrationParams = {
			org: string;
			migration_id: number;
			repo_name: string;
		};
		export type MigrationsUpdateImportParams = {
			owner: string;
			repo: string;
			vcs_username?: string;
			vcs_password?: string;
		};
		export type MiscGetCodeOfConductParams = {
			key: string;
		};
		export type MiscGetGitignoreTemplateParams = {
			name: string;
		};
		export type MiscGetLicenseParams = {
			license: string;
		};
		export type MiscGetRepoCodeOfConductParams = {
			owner: string;
			repo: string;
		};
		export type MiscGetRepoLicenseParams = {
			owner: string;
			repo: string;
		};
		export type MiscRenderMarkdownParams = {
			text: string;
			mode?: 'markdown' | 'gfm';
			context?: string;
		};
		export type MiscRenderMarkdownRawParams = {
			data: string;
		};
		export type OrgsAddOrgMembershipParams = {
			org: string;
			username: string;
			role?: 'admin' | 'member';
		};
		export type OrgsAddTeamMembershipParams = {
			team_id: number;
			username: string;
			role?: 'member' | 'maintainer';
		};
		export type OrgsAddTeamRepoParams = {
			team_id: number;
			owner: string;
			repo: string;
			permission?: 'pull' | 'push' | 'admin';
		};
		export type OrgsBlockUserParams = {
			org: string;
			username: string;
		};
		export type OrgsCheckBlockedUserParams = {
			org: string;
			username: string;
		};
		export type OrgsCheckMembershipParams = {
			org: string;
			username: string;
		};
		export type OrgsCheckPublicMembershipParams = {
			org: string;
			username: string;
		};
		export type OrgsCheckTeamRepoParams = {
			team_id: number;
			owner: string;
			repo: string;
		};
		export type OrgsConcealMembershipParams = {
			org: string;
			username: string;
		};
		export type OrgsConvertMemberToOutsideCollaboratorParams = {
			org: string;
			username: string;
		};
		export type OrgsCreateHookParams = {
			org: string;
			name: string;
			config: OrgsCreateHookParamsConfig;
			events?: string[];
			active?: boolean;
		};
		export type OrgsCreateInvitationParams = {
			org: string;
			invitee_id?: number;
			email?: string;
			role?: 'admin' | 'direct_member' | 'billing_manager';
			team_ids?: number[];
		};
		export type OrgsCreateTeamParams = {
			org: string;
			name: string;
			description?: string;
			maintainers?: string[];
			repo_names?: string[];
			privacy?: 'secret' | 'closed';
			permission?: 'pull' | 'push' | 'admin';
			parent_team_id?: number;
		};
		export type OrgsDeleteHookParams = {
			org: string;
			hook_id: number;
		};
		export type OrgsDeleteTeamParams = {
			team_id: number;
		};
		export type OrgsDeleteTeamRepoParams = {
			team_id: number;
			owner: string;
			repo: string;
		};
		export type OrgsEditHookParams = {
			org: string;
			hook_id: number;
			config?: OrgsEditHookParamsConfig;
			events?: string[];
			active?: boolean;
		};
		export type OrgsEditTeamParams = {
			team_id: number;
			name: string;
			description?: string;
			privacy?: string;
			permission?: 'pull' | 'push' | 'admin';
			parent_team_id?: number;
		};
		export type OrgsGetParams = {
			org: string;
		};
		export type OrgsGetAllParams = {
			since?: string;
			per_page?: number;
			page?: number;
		};
		export type OrgsGetBlockedUsersParams = {
			org: string;
		};
		export type OrgsGetChildTeamsParams = {
			team_id: number;
			per_page?: number;
			page?: number;
		};
		export type OrgsGetForUserParams = {
			username: string;
			per_page?: number;
			page?: number;
		};
		export type OrgsGetHookParams = {
			org: string;
			hook_id: number;
		};
		export type OrgsGetHooksParams = {
			org: string;
			per_page?: number;
			page?: number;
		};
		export type OrgsGetInvitationTeamsParams = {
			org: string;
			invitation_id: number;
			per_page?: number;
			page?: number;
		};
		export type OrgsGetMembersParams = {
			org: string;
			filter?: '2fa_disabled' | 'all';
			role?: 'all' | 'admin' | 'member';
			per_page?: number;
			page?: number;
		};
		export type OrgsGetOrgMembershipParams = {
			org: string;
			username: string;
		};
		export type OrgsGetOutsideCollaboratorsParams = {
			org: string;
			filter?: '2fa_disabled' | 'all';
			per_page?: number;
			page?: number;
		};
		export type OrgsGetPendingOrgInvitesParams = {
			org: string;
			per_page?: number;
			page?: number;
		};
		export type OrgsGetPendingTeamInvitesParams = {
			team_id: number;
			per_page?: number;
			page?: number;
		};
		export type OrgsGetPublicMembersParams = {
			org: string;
			per_page?: number;
			page?: number;
		};
		export type OrgsGetTeamParams = {
			team_id: number;
		};
		export type OrgsGetTeamMembersParams = {
			team_id: number;
			role?: 'member' | 'maintainer' | 'all';
			per_page?: number;
			page?: number;
		};
		export type OrgsGetTeamMembershipParams = {
			team_id: number;
			username: string;
		};
		export type OrgsGetTeamReposParams = {
			team_id: number;
			per_page?: number;
			page?: number;
		};
		export type OrgsGetTeamsParams = {
			org: string;
			per_page?: number;
			page?: number;
		};
		export type OrgsPingHookParams = {
			org: string;
			hook_id: number;
		};
		export type OrgsPublicizeMembershipParams = {
			org: string;
			username: string;
		};
		export type OrgsRemoveMemberParams = {
			org: string;
			username: string;
		};
		export type OrgsRemoveOrgMembershipParams = {
			org: string;
			username: string;
		};
		export type OrgsRemoveOutsideCollaboratorParams = {
			org: string;
			username: string;
		};
		export type OrgsRemoveTeamMembershipParams = {
			team_id: number;
			username: string;
		};
		export type OrgsUnblockUserParams = {
			org: string;
			username: string;
		};
		export type OrgsUpdateParams = {
			org: string;
			billing_email?: string;
			company?: string;
			email?: string;
			location?: string;
			name?: string;
			description?: string;
			has_organization_projects?: boolean;
			has_repository_projects?: boolean;
			default_repository_permission?: 'read' | 'write' | 'admin' | 'none';
			members_can_create_repositories?: boolean;
		};
		export type ProjectsAddCollaboratorParams = {
			project_id: number;
			username: string;
			permission?: 'read' | 'write' | 'admin';
		};
		export type ProjectsCreateOrgProjectParams = {
			org: string;
			name: string;
			body?: string;
			per_page?: number;
			page?: number;
		};
		export type ProjectsCreateProjectCardParams = {
			column_id: number;
			note?: string;
			content_id?: number;
			content_type?: string;
		};
		export type ProjectsCreateProjectColumnParams = {
			project_id: number;
			name: string;
		};
		export type ProjectsCreateRepoProjectParams = {
			owner: string;
			repo: string;
			name: string;
			body?: string;
			per_page?: number;
			page?: number;
		};
		export type ProjectsDeleteProjectParams = {
			project_id: number;
		};
		export type ProjectsDeleteProjectCardParams = {
			card_id: number;
		};
		export type ProjectsDeleteProjectColumnParams = {
			column_id: number;
		};
		export type ProjectsGetCollaboratorsParams = {
			project_id: number;
			affiliation?: 'outside' | 'direct' | 'all';
			per_page?: number;
			page?: number;
		};
		export type ProjectsGetOrgProjectsParams = {
			org: string;
			state?: 'open' | 'closed' | 'all';
			per_page?: number;
			page?: number;
		};
		export type ProjectsGetProjectParams = {
			project_id: number;
			per_page?: number;
			page?: number;
		};
		export type ProjectsGetProjectCardParams = {
			card_id: number;
		};
		export type ProjectsGetProjectCardsParams = {
			column_id: number;
			archived_state?: 'all' | 'archived' | 'not_archived';
			per_page?: number;
			page?: number;
		};
		export type ProjectsGetProjectColumnParams = {
			column_id: number;
		};
		export type ProjectsGetProjectColumnsParams = {
			project_id: number;
			per_page?: number;
			page?: number;
		};
		export type ProjectsGetRepoProjectsParams = {
			owner: string;
			repo: string;
			state?: 'open' | 'closed' | 'all';
			per_page?: number;
			page?: number;
		};
		export type ProjectsGetUserPermissionLevelParams = {
			project_id: number;
			username: string;
		};
		export type ProjectsMoveProjectCardParams = {
			card_id: number;
			position: 'top' | 'bottom' | 'after:<card_id>';
			column_id?: number;
		};
		export type ProjectsMoveProjectColumnParams = {
			column_id: number;
			position: 'first' | 'last' | 'after:<column_id>';
		};
		export type ProjectsRemoveCollaboratorParams = {
			project_id: number;
			username: string;
		};
		export type ProjectsUpdateProjectParams = {
			project_id: number;
			name?: string;
			body?: string;
			state?: 'open' | 'closed';
			organization_permission?: string;
			public?: boolean;
			per_page?: number;
			page?: number;
		};
		export type ProjectsUpdateProjectCardParams = {
			card_id: number;
			note?: string;
			archived?: boolean;
		};
		export type ProjectsUpdateProjectColumnParams = {
			column_id: number;
			name: string;
		};
		export type PullRequestsCheckMergedParams = {
			owner: string;
			repo: string;
			number: number;
		};
		export type PullRequestsCreateParams = {
			owner: string;
			repo: string;
			title: string;
			head: string;
			base: string;
			body?: string;
			maintainer_can_modify?: boolean;
		};
		export type PullRequestsCreateCommentParams = {
			owner: string;
			repo: string;
			number: number;
			body: string;
			commit_id: string;
			path: string;
			position: number;
		};
		export type PullRequestsCreateCommentReplyParams = {
			owner: string;
			repo: string;
			number: number;
			body: string;
			in_reply_to: number;
		};
		export type PullRequestsCreateFromIssueParams = {
			owner: string;
			repo: string;
			issue: number;
			head: string;
			base: string;
			maintainer_can_modify?: boolean;
		};
		export type PullRequestsCreateReviewParams = {
			owner: string;
			repo: string;
			number: number;
			commit_id?: string;
			body?: string;
			event?: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';
			comments?: PullRequestsCreateReviewParamsComments[];
		};
		export type PullRequestsCreateReviewRequestParams = {
			owner: string;
			repo: string;
			number: number;
			reviewers?: string[];
			team_reviewers?: string[];
		};
		export type PullRequestsDeleteCommentParams = {
			owner: string;
			repo: string;
			comment_id: number;
		};
		export type PullRequestsDeletePendingReviewParams = {
			owner: string;
			repo: string;
			number: number;
			review_id: number;
		};
		export type PullRequestsDeleteReviewRequestParams = {
			owner: string;
			repo: string;
			number: number;
			reviewers?: string[];
			team_reviewers?: string[];
		};
		export type PullRequestsDismissReviewParams = {
			owner: string;
			repo: string;
			number: number;
			review_id: number;
			message?: string;
		};
		export type PullRequestsEditCommentParams = {
			owner: string;
			repo: string;
			comment_id: number;
			body: string;
		};
		export type PullRequestsGetParams = {
			owner: string;
			repo: string;
			number: number;
		};
		export type PullRequestsGetAllParams = {
			owner: string;
			repo: string;
			state?: 'open' | 'closed' | 'all';
			head?: string;
			base?: string;
			sort?: 'created' | 'updated' | 'popularity' | 'long-running';
			direction?: 'asc' | 'desc';
			per_page?: number;
			page?: number;
		};
		export type PullRequestsGetCommentParams = {
			owner: string;
			repo: string;
			comment_id: number;
		};
		export type PullRequestsGetCommentsParams = {
			owner: string;
			repo: string;
			number: number;
			sort?: 'created' | 'updated';
			direction?: 'asc' | 'desc';
			since?: string;
			per_page?: number;
			page?: number;
		};
		export type PullRequestsGetCommentsForRepoParams = {
			owner: string;
			repo: string;
			sort?: 'created' | 'updated';
			direction?: 'asc' | 'desc';
			since?: string;
			per_page?: number;
			page?: number;
		};
		export type PullRequestsGetCommitsParams = {
			owner: string;
			repo: string;
			number: number;
			per_page?: number;
			page?: number;
		};
		export type PullRequestsGetFilesParams = {
			owner: string;
			repo: string;
			number: number;
			per_page?: number;
			page?: number;
		};
		export type PullRequestsGetReviewParams = {
			owner: string;
			repo: string;
			number: number;
			review_id: number;
		};
		export type PullRequestsGetReviewCommentsParams = {
			owner: string;
			repo: string;
			number: number;
			review_id: number;
			per_page?: number;
			page?: number;
		};
		export type PullRequestsGetReviewRequestsParams = {
			owner: string;
			repo: string;
			number: number;
			per_page?: number;
			page?: number;
		};
		export type PullRequestsGetReviewsParams = {
			owner: string;
			repo: string;
			number: number;
			per_page?: number;
			page?: number;
		};
		export type PullRequestsMergeParams = {
			owner: string;
			repo: string;
			number: number;
			commit_title?: string;
			commit_message?: string;
			sha?: string;
			merge_method?: 'merge' | 'squash' | 'rebase';
		};
		export type PullRequestsSubmitReviewParams = {
			owner: string;
			repo: string;
			number: number;
			review_id: number;
			body?: string;
			event?: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';
		};
		export type PullRequestsUpdateParams = {
			owner: string;
			repo: string;
			number: number;
			title?: string;
			body?: string;
			state?: 'open' | 'closed';
			base?: string;
			maintainer_can_modify?: boolean;
		};
		export type ReactionsCreateForCommitCommentParams = {
			owner: string;
			repo: string;
			comment_id: number;
			content: '+1' | '-1' | 'laugh' | 'confused' | 'heart' | 'hooray';
		};
		export type ReactionsCreateForIssueParams = {
			owner: string;
			repo: string;
			number: number;
			content: '+1' | '-1' | 'laugh' | 'confused' | 'heart' | 'hooray';
		};
		export type ReactionsCreateForIssueCommentParams = {
			owner: string;
			repo: string;
			comment_id: number;
			content: '+1' | '-1' | 'laugh' | 'confused' | 'heart' | 'hooray';
		};
		export type ReactionsCreateForPullRequestReviewCommentParams = {
			owner: string;
			repo: string;
			comment_id: number;
			content: '+1' | '-1' | 'laugh' | 'confused' | 'heart' | 'hooray';
		};
		export type ReactionsCreateForTeamDiscussionParams = {
			team_id: number;
			discussion_number: number;
			content: '+1' | '-1' | 'laugh' | 'confused' | 'heart' | 'hooray';
		};
		export type ReactionsCreateForTeamDiscussionCommentParams = {
			team_id: number;
			discussion_number: number;
			comment_number: number;
			content: '+1' | '-1' | 'laugh' | 'confused' | 'heart' | 'hooray';
		};
		export type ReactionsDeleteParams = {
			reaction_id: number;
		};
		export type ReactionsGetForCommitCommentParams = {
			owner: string;
			repo: string;
			comment_id: number;
			content?: '+1' | '-1' | 'laugh' | 'confused' | 'heart' | 'hooray';
			per_page?: number;
			page?: number;
		};
		export type ReactionsGetForIssueParams = {
			owner: string;
			repo: string;
			number: number;
			content?: '+1' | '-1' | 'laugh' | 'confused' | 'heart' | 'hooray';
			per_page?: number;
			page?: number;
		};
		export type ReactionsGetForIssueCommentParams = {
			owner: string;
			repo: string;
			comment_id: number;
			content?: '+1' | '-1' | 'laugh' | 'confused' | 'heart' | 'hooray';
			per_page?: number;
			page?: number;
		};
		export type ReactionsGetForPullRequestReviewCommentParams = {
			owner: string;
			repo: string;
			comment_id: number;
			content?: '+1' | '-1' | 'laugh' | 'confused' | 'heart' | 'hooray';
			per_page?: number;
			page?: number;
		};
		export type ReactionsGetForTeamDiscussionParams = {
			team_id: number;
			discussion_number: number;
			content?: '+1' | '-1' | 'laugh' | 'confused' | 'heart' | 'hooray';
			per_page?: number;
			page?: number;
		};
		export type ReactionsGetForTeamDiscussionCommentParams = {
			team_id: number;
			discussion_number: number;
			comment_number: number;
			content?: '+1' | '-1' | 'laugh' | 'confused' | 'heart' | 'hooray';
			per_page?: number;
			page?: number;
		};
		export type ReposAddCollaboratorParams = {
			owner: string;
			repo: string;
			username: string;
			permission?: 'pull' | 'push' | 'admin';
		};
		export type ReposAddDeployKeyParams = {
			owner: string;
			repo: string;
			title?: string;
			key: string;
			read_only?: boolean;
		};
		export type ReposAddProtectedBranchAdminEnforcementParams = {
			owner: string;
			repo: string;
			branch: string;
		};
		export type ReposAddProtectedBranchRequiredSignaturesParams = {
			owner: string;
			repo: string;
			branch: string;
		};
		export type ReposAddProtectedBranchRequiredStatusChecksContextsParams = {
			owner: string;
			repo: string;
			branch: string;
			contexts: string[];
		};
		export type ReposAddProtectedBranchTeamRestrictionsParams = {
			owner: string;
			repo: string;
			branch: string;
			teams: string[];
		};
		export type ReposAddProtectedBranchUserRestrictionsParams = {
			owner: string;
			repo: string;
			branch: string;
			users: string[];
		};
		export type ReposCheckCollaboratorParams = {
			owner: string;
			repo: string;
			username: string;
		};
		export type ReposCompareCommitsParams = {
			owner: string;
			repo: string;
			base: string;
			head: string;
		};
		export type ReposCreateParams = {
			name: string;
			description?: string;
			homepage?: string;
			private?: boolean;
			has_issues?: boolean;
			has_projects?: boolean;
			has_wiki?: boolean;
			team_id?: number;
			auto_init?: boolean;
			gitignore_template?: string;
			license_template?: string;
			allow_squash_merge?: boolean;
			allow_merge_commit?: boolean;
			allow_rebase_merge?: boolean;
		};
		export type ReposCreateCommitCommentParams = {
			owner: string;
			repo: string;
			sha: string;
			body: string;
			path?: string;
			position?: number;
			line?: number;
		};
		export type ReposCreateDeploymentParams = {
			owner: string;
			repo: string;
			ref: string;
			task?: string;
			auto_merge?: boolean;
			required_contexts?: string[];
			payload?: string;
			environment?: string;
			description?: string;
			transient_environment?: boolean;
			production_environment?: boolean;
		};
		export type ReposCreateDeploymentStatusParams = {
			owner: string;
			repo: string;
			deployment_id: number;
			state: 'error' | 'failure' | 'inactive' | 'pending' | 'success';
			target_url?: string;
			log_url?: string;
			description?: string;
			environment_url?: string;
			auto_inactive?: boolean;
		};
		export type ReposCreateFileParams = {
			owner: string;
			repo: string;
			path: string;
			message: string;
			content: string;
			branch?: string;
			committer?: ReposCreateFileParamsCommitter;
			author?: ReposCreateFileParamsAuthor;
		};
		export type ReposCreateForOrgParams = {
			org: string;
			name: string;
			description?: string;
			homepage?: string;
			private?: boolean;
			has_issues?: boolean;
			has_projects?: boolean;
			has_wiki?: boolean;
			team_id?: number;
			auto_init?: boolean;
			gitignore_template?: string;
			license_template?: string;
			allow_squash_merge?: boolean;
			allow_merge_commit?: boolean;
			allow_rebase_merge?: boolean;
		};
		export type ReposCreateHookParams = {
			owner: string;
			repo: string;
			name: string;
			config: ReposCreateHookParamsConfig;
			events?: string[];
			active?: boolean;
		};
		export type ReposCreateReleaseParams = {
			owner: string;
			repo: string;
			tag_name: string;
			target_commitish?: string;
			name?: string;
			body?: string;
			draft?: boolean;
			prerelease?: boolean;
		};
		export type ReposCreateStatusParams = {
			owner: string;
			repo: string;
			sha: string;
			state: 'error' | 'failure' | 'pending' | 'success';
			target_url?: string;
			description?: string;
			context?: string;
		};
		export type ReposDeleteParams = {
			owner: string;
			repo: string;
		};
		export type ReposDeleteAssetParams = {
			owner: string;
			repo: string;
			asset_id: number;
		};
		export type ReposDeleteCommitCommentParams = {
			owner: string;
			repo: string;
			comment_id: number;
		};
		export type ReposDeleteDeployKeyParams = {
			owner: string;
			repo: string;
			key_id: number;
		};
		export type ReposDeleteDownloadParams = {
			owner: string;
			repo: string;
			download_id: number;
		};
		export type ReposDeleteFileParams = {
			owner: string;
			repo: string;
			path: string;
			message: string;
			sha: string;
			branch?: string;
			committer?: ReposDeleteFileParamsCommitter;
			author?: ReposDeleteFileParamsAuthor;
		};
		export type ReposDeleteHookParams = {
			owner: string;
			repo: string;
			hook_id: number;
		};
		export type ReposDeleteInviteParams = {
			owner: string;
			repo: string;
			invitation_id: number;
		};
		export type ReposDeleteReleaseParams = {
			owner: string;
			repo: string;
			release_id: number;
		};
		export type ReposEditParams = {
			owner: string;
			repo: string;
			name: string;
			description?: string;
			homepage?: string;
			private?: boolean;
			has_issues?: boolean;
			has_projects?: boolean;
			has_wiki?: boolean;
			default_branch?: string;
			allow_squash_merge?: boolean;
			allow_merge_commit?: boolean;
			allow_rebase_merge?: boolean;
			archived?: boolean;
		};
		export type ReposEditAssetParams = {
			owner: string;
			repo: string;
			asset_id: number;
			name?: string;
			label?: string;
		};
		export type ReposEditHookParams = {
			owner: string;
			repo: string;
			hook_id: number;
			config?: ReposEditHookParamsConfig;
			events?: string[];
			add_events?: string[];
			remove_events?: string[];
			active?: boolean;
		};
		export type ReposEditReleaseParams = {
			owner: string;
			repo: string;
			release_id: number;
			tag_name?: string;
			target_commitish?: string;
			name?: string;
			body?: string;
			draft?: boolean;
			prerelease?: boolean;
		};
		export type ReposForkParams = {
			owner: string;
			repo: string;
			organization?: string;
		};
		export type ReposGetParams = {
			owner: string;
			repo: string;
		};
		export type ReposGetAllParams = {
			visibility?: 'all' | 'public' | 'private';
			affiliation?: 'owner' | 'collaborator' | 'organization_member';
			type?: 'all' | 'owner' | 'public' | 'private' | 'member';
			sort?: 'created' | 'updated' | 'pushed' | 'full_name';
			direction?: 'asc' | 'desc';
			per_page?: number;
			page?: number;
		};
		export type ReposGetAllCommitCommentsParams = {
			owner: string;
			repo: string;
			per_page?: number;
			page?: number;
		};
		export type ReposGetArchiveLinkParams = {
			owner: string;
			repo: string;
			archive_format: 'tarball' | 'zipball';
			ref: string;
		};
		export type ReposGetAssetParams = {
			owner: string;
			repo: string;
			asset_id: number;
		};
		export type ReposGetAssetsParams = {
			owner: string;
			repo: string;
			release_id: number;
			per_page?: number;
			page?: number;
		};
		export type ReposGetBranchParams = {
			owner: string;
			repo: string;
			branch: string;
		};
		export type ReposGetBranchProtectionParams = {
			owner: string;
			repo: string;
			branch: string;
		};
		export type ReposGetBranchesParams = {
			owner: string;
			repo: string;
			protected?: boolean;
			per_page?: number;
			page?: number;
		};
		export type ReposGetClonesParams = {
			owner: string;
			repo: string;
			per?: 'day' | 'week';
		};
		export type ReposGetCollaboratorsParams = {
			owner: string;
			repo: string;
			affiliation?: 'outside' | 'direct' | 'all';
			per_page?: number;
			page?: number;
		};
		export type ReposGetCombinedStatusForRefParams = {
			owner: string;
			repo: string;
			ref: string;
		};
		export type ReposGetCommitParams = {
			owner: string;
			repo: string;
			sha: string;
		};
		export type ReposGetCommitCommentParams = {
			owner: string;
			repo: string;
			comment_id: number;
		};
		export type ReposGetCommitCommentsParams = {
			owner: string;
			repo: string;
			ref: string;
			per_page?: number;
			page?: number;
		};
		export type ReposGetCommitsParams = {
			owner: string;
			repo: string;
			sha?: string;
			path?: string;
			author?: string;
			since?: string;
			until?: string;
			per_page?: number;
			page?: number;
		};
		export type ReposGetCommunityProfileMetricsParams = {
			owner: string;
			repo: string;
		};
		export type ReposGetContentParams = {
			owner: string;
			repo: string;
			path: string;
			ref?: string;
		};
		export type ReposGetContributorsParams = {
			owner: string;
			repo: string;
			anon?: string;
			per_page?: number;
			page?: number;
		};
		export type ReposGetDeployKeyParams = {
			owner: string;
			repo: string;
			key_id: number;
		};
		export type ReposGetDeployKeysParams = {
			owner: string;
			repo: string;
			per_page?: number;
			page?: number;
		};
		export type ReposGetDeploymentParams = {
			owner: string;
			repo: string;
			deployment_id: number;
		};
		export type ReposGetDeploymentStatusParams = {
			owner: string;
			repo: string;
			deployment_id: number;
			id: number;
			status_id: number;
		};
		export type ReposGetDeploymentStatusesParams = {
			owner: string;
			repo: string;
			deployment_id: number;
			id: number;
			per_page?: number;
			page?: number;
		};
		export type ReposGetDeploymentsParams = {
			owner: string;
			repo: string;
			sha?: string;
			ref?: string;
			task?: string;
			environment?: string;
			per_page?: number;
			page?: number;
		};
		export type ReposGetDownloadParams = {
			owner: string;
			repo: string;
			download_id: number;
		};
		export type ReposGetDownloadsParams = {
			owner: string;
			repo: string;
			per_page?: number;
			page?: number;
		};
		export type ReposGetForOrgParams = {
			org: string;
			type?: 'all' | 'public' | 'private' | 'forks' | 'sources' | 'member';
			per_page?: number;
			page?: number;
		};
		export type ReposGetForUserParams = {
			username: string;
			type?: 'all' | 'owner' | 'member';
			sort?: 'created' | 'updated' | 'pushed' | 'full_name';
			direction?: 'asc' | 'desc';
			per_page?: number;
			page?: number;
		};
		export type ReposGetForksParams = {
			owner: string;
			repo: string;
			sort?: 'newest' | 'oldest' | 'stargazers';
			per_page?: number;
			page?: number;
		};
		export type ReposGetHookParams = {
			owner: string;
			repo: string;
			hook_id: number;
		};
		export type ReposGetHooksParams = {
			owner: string;
			repo: string;
			per_page?: number;
			page?: number;
		};
		export type ReposGetInvitesParams = {
			owner: string;
			repo: string;
			per_page?: number;
			page?: number;
		};
		export type ReposGetLanguagesParams = {
			owner: string;
			repo: string;
		};
		export type ReposGetLatestPagesBuildParams = {
			owner: string;
			repo: string;
		};
		export type ReposGetLatestReleaseParams = {
			owner: string;
			repo: string;
		};
		export type ReposGetPagesParams = {
			owner: string;
			repo: string;
		};
		export type ReposGetPagesBuildParams = {
			owner: string;
			repo: string;
			build_id: number;
		};
		export type ReposGetPagesBuildsParams = {
			owner: string;
			repo: string;
			per_page?: number;
			page?: number;
		};
		export type ReposGetPathsParams = {
			owner: string;
			repo: string;
		};
		export type ReposGetProtectedBranchAdminEnforcementParams = {
			owner: string;
			repo: string;
			branch: string;
		};
		export type ReposGetProtectedBranchPullRequestReviewEnforcementParams = {
			owner: string;
			repo: string;
			branch: string;
		};
		export type ReposGetProtectedBranchRequiredSignaturesParams = {
			owner: string;
			repo: string;
			branch: string;
		};
		export type ReposGetProtectedBranchRequiredStatusChecksParams = {
			owner: string;
			repo: string;
			branch: string;
		};
		export type ReposGetProtectedBranchRequiredStatusChecksContextsParams = {
			owner: string;
			repo: string;
			branch: string;
		};
		export type ReposGetProtectedBranchRestrictionsParams = {
			owner: string;
			repo: string;
			branch: string;
		};
		export type ReposGetProtectedBranchTeamRestrictionsParams = {
			owner: string;
			repo: string;
			branch: string;
			per_page?: number;
			page?: number;
		};
		export type ReposGetProtectedBranchUserRestrictionsParams = {
			owner: string;
			repo: string;
			branch: string;
		};
		export type ReposGetPublicParams = {
			since?: string;
			per_page?: number;
			page?: number;
		};
		export type ReposGetReadmeParams = {
			owner: string;
			repo: string;
			ref?: string;
		};
		export type ReposGetReferrersParams = {
			owner: string;
			repo: string;
		};
		export type ReposGetReleaseParams = {
			owner: string;
			repo: string;
			release_id: number;
		};
		export type ReposGetReleaseByTagParams = {
			owner: string;
			repo: string;
			tag: string;
		};
		export type ReposGetReleasesParams = {
			owner: string;
			repo: string;
			per_page?: number;
			page?: number;
		};
		export type ReposGetShaOfCommitRefParams = {
			owner: string;
			repo: string;
			ref: string;
		};
		export type ReposGetStatsCodeFrequencyParams = {
			owner: string;
			repo: string;
		};
		export type ReposGetStatsCommitActivityParams = {
			owner: string;
			repo: string;
		};
		export type ReposGetStatsContributorsParams = {
			owner: string;
			repo: string;
		};
		export type ReposGetStatsParticipationParams = {
			owner: string;
			repo: string;
		};
		export type ReposGetStatsPunchCardParams = {
			owner: string;
			repo: string;
		};
		export type ReposGetStatusesParams = {
			owner: string;
			repo: string;
			ref: string;
			per_page?: number;
			page?: number;
		};
		export type ReposGetTagsParams = {
			owner: string;
			repo: string;
			per_page?: number;
			page?: number;
		};
		export type ReposGetTeamsParams = {
			owner: string;
			repo: string;
			per_page?: number;
			page?: number;
		};
		export type ReposGetTopicsParams = {
			owner: string;
			repo: string;
		};
		export type ReposGetViewsParams = {
			owner: string;
			repo: string;
			per?: 'day' | 'week';
		};
		export type ReposMergeParams = {
			owner: string;
			repo: string;
			base: string;
			head: string;
			commit_message?: string;
		};
		export type ReposPingHookParams = {
			owner: string;
			repo: string;
			hook_id: number;
		};
		export type ReposRemoveBranchProtectionParams = {
			owner: string;
			repo: string;
			branch: string;
		};
		export type ReposRemoveCollaboratorParams = {
			owner: string;
			repo: string;
			username: string;
		};
		export type ReposRemoveProtectedBranchAdminEnforcementParams = {
			owner: string;
			repo: string;
			branch: string;
		};
		export type ReposRemoveProtectedBranchPullRequestReviewEnforcementParams = {
			owner: string;
			repo: string;
			branch: string;
		};
		export type ReposRemoveProtectedBranchRequiredSignaturesParams = {
			owner: string;
			repo: string;
			branch: string;
		};
		export type ReposRemoveProtectedBranchRequiredStatusChecksParams = {
			owner: string;
			repo: string;
			branch: string;
		};
		export type ReposRemoveProtectedBranchRequiredStatusChecksContextsParams = {
			owner: string;
			repo: string;
			branch: string;
			contexts: string[];
		};
		export type ReposRemoveProtectedBranchRestrictionsParams = {
			owner: string;
			repo: string;
			branch: string;
		};
		export type ReposRemoveProtectedBranchTeamRestrictionsParams = {
			owner: string;
			repo: string;
			branch: string;
			teams: string[];
		};
		export type ReposRemoveProtectedBranchUserRestrictionsParams = {
			owner: string;
			repo: string;
			branch: string;
			users: string[];
		};
		export type ReposReplaceProtectedBranchRequiredStatusChecksContextsParams = {
			owner: string;
			repo: string;
			branch: string;
			contexts: string[];
		};
		export type ReposReplaceProtectedBranchTeamRestrictionsParams = {
			owner: string;
			repo: string;
			branch: string;
			teams: string[];
		};
		export type ReposReplaceProtectedBranchUserRestrictionsParams = {
			owner: string;
			repo: string;
			branch: string;
			users: string[];
		};
		export type ReposReplaceTopicsParams = {
			owner: string;
			repo: string;
			names: string[];
		};
		export type ReposRequestPageBuildParams = {
			owner: string;
			repo: string;
		};
		export type ReposReviewUserPermissionLevelParams = {
			owner: string;
			repo: string;
			username: string;
		};
		export type ReposTestHookParams = {
			owner: string;
			repo: string;
			hook_id: number;
		};
		export type ReposTransferParams = {
			owner: string;
			repo: string;
			new_owner?: string;
			team_ids?: number[];
		};
		export type ReposUpdateBranchProtectionParams = {
			owner: string;
			repo: string;
			branch: string;
			required_status_checks: ReposUpdateBranchProtectionParamsRequiredStatusChecks | null;
			enforce_admins: boolean | null;
			required_pull_request_reviews: ReposUpdateBranchProtectionParamsRequiredPullRequestReviews | null;
			restrictions: ReposUpdateBranchProtectionParamsRestrictions | null;
		};
		export type ReposUpdateCommitCommentParams = {
			owner: string;
			repo: string;
			comment_id: number;
			body: string;
		};
		export type ReposUpdateFileParams = {
			owner: string;
			repo: string;
			path: string;
			message: string;
			content: string;
			sha: string;
			branch?: string;
			committer?: ReposUpdateFileParamsCommitter;
			author?: ReposUpdateFileParamsAuthor;
		};
		export type ReposUpdateInviteParams = {
			owner: string;
			repo: string;
			invitation_id: number;
			permissions?: 'read' | 'write' | 'admin';
		};
		export type ReposUpdateProtectedBranchPullRequestReviewEnforcementParams = {
			owner: string;
			repo: string;
			branch: string;
			dismissal_restrictions?: ReposUpdateProtectedBranchPullRequestReviewEnforcementParamsDismissalRestrictions;
			dismiss_stale_reviews?: boolean;
			require_code_owner_reviews?: boolean;
			required_approving_review_count?: number;
		};
		export type ReposUpdateProtectedBranchRequiredStatusChecksParams = {
			owner: string;
			repo: string;
			branch: string;
			strict?: boolean;
			contexts?: string[];
		};
		export type ReposUploadAssetParams = {
			url: string;
			'Content-Length': number;
			'Content-Type': string;
			name: string;
			label?: string;
			file: string | object;
		};
		export type SearchCodeParams = {
			q: string;
			sort?: 'indexed';
			order?: 'asc' | 'desc';
			per_page?: number;
			page?: number;
		};
		export type SearchCommitsParams = {
			q: string;
			sort?: 'author-date' | 'committer-date';
			order?: 'asc' | 'desc';
			per_page?: number;
			page?: number;
		};
		export type SearchIssuesParams = {
			q: string;
			sort?: 'comments' | 'created' | 'updated';
			order?: 'asc' | 'desc';
			per_page?: number;
			page?: number;
		};
		export type SearchLabelsParams = {
			repository_id: number;
			q: string;
			sort?: 'created' | 'updated';
			order?: 'asc' | 'desc';
		};
		export type SearchReposParams = {
			q: string;
			sort?: 'stars' | 'forks' | 'updated';
			order?: 'asc' | 'desc';
			per_page?: number;
			page?: number;
		};
		export type SearchTopicsParams = {
			q: string;
		};
		export type SearchUsersParams = {
			q: string;
			sort?: 'followers' | 'repositories' | 'joined';
			order?: 'asc' | 'desc';
			per_page?: number;
			page?: number;
		};
		export type UsersAcceptRepoInviteParams = {
			invitation_id: number;
		};
		export type UsersAddEmailsParams = {
			emails: string[];
		};
		export type UsersAddRepoToInstallationParams = {
			installation_id: number;
			repository_id: number;
		};
		export type UsersBlockUserParams = {
			username: string;
		};
		export type UsersCheckBlockedUserParams = {
			username: string;
		};
		export type UsersCheckFollowingParams = {
			username: string;
		};
		export type UsersCheckIfOneFollowersOtherParams = {
			username: string;
			target_user: string;
		};
		export type UsersCreateGpgKeyParams = {
			armored_public_key?: string;
		};
		export type UsersCreateKeyParams = {
			title?: string;
			key?: string;
		};
		export type UsersDeclineRepoInviteParams = {
			invitation_id: number;
		};
		export type UsersDeleteEmailsParams = {
			emails: string[];
		};
		export type UsersDeleteGpgKeyParams = {
			gpg_key_id: number;
		};
		export type UsersDeleteKeyParams = {
			key_id: number;
		};
		export type UsersEditOrgMembershipParams = {
			org: string;
			state: 'active';
		};
		export type UsersFollowUserParams = {
			username: string;
		};
		export type UsersGetAllParams = {
			since?: string;
			per_page?: number;
			page?: number;
		};
		export type UsersGetContextForUserParams = {
			username: string;
			subject_type?: 'organization' | 'repository' | 'issue' | 'pull_request';
			subject_id?: string;
		};
		export type UsersGetEmailsParams = {
			per_page?: number;
			page?: number;
		};
		export type UsersGetFollowersParams = {
			per_page?: number;
			page?: number;
		};
		export type UsersGetFollowersForUserParams = {
			username: string;
			per_page?: number;
			page?: number;
		};
		export type UsersGetFollowingParams = {
			per_page?: number;
			page?: number;
		};
		export type UsersGetFollowingForUserParams = {
			username: string;
			per_page?: number;
			page?: number;
		};
		export type UsersGetForUserParams = {
			username: string;
		};
		export type UsersGetGpgKeyParams = {
			gpg_key_id: number;
		};
		export type UsersGetGpgKeysParams = {
			per_page?: number;
			page?: number;
		};
		export type UsersGetGpgKeysForUserParams = {
			username: string;
			per_page?: number;
			page?: number;
		};
		export type UsersGetInstallationReposParams = {
			installation_id: number;
			per_page?: number;
			page?: number;
		};
		export type UsersGetInstallationsParams = {
			per_page?: number;
			page?: number;
		};
		export type UsersGetKeyParams = {
			key_id: number;
		};
		export type UsersGetKeysParams = {
			per_page?: number;
			page?: number;
		};
		export type UsersGetKeysForUserParams = {
			username: string;
			per_page?: number;
			page?: number;
		};
		export type UsersGetMarketplacePurchasesParams = {
			per_page?: number;
			page?: number;
		};
		export type UsersGetMarketplaceStubbedPurchasesParams = {
			per_page?: number;
			page?: number;
		};
		export type UsersGetOrgMembershipParams = {
			org: string;
		};
		export type UsersGetOrgMembershipsParams = {
			state?: 'active' | 'pending';
			per_page?: number;
			page?: number;
		};
		export type UsersGetOrgsParams = {
			per_page?: number;
			page?: number;
		};
		export type UsersGetPublicEmailsParams = {
			per_page?: number;
			page?: number;
		};
		export type UsersGetRepoInvitesParams = {
			per_page?: number;
			page?: number;
		};
		export type UsersGetTeamsParams = {
			per_page?: number;
			page?: number;
		};
		export type UsersRemoveRepoFromInstallationParams = {
			installation_id: number;
			repository_id: number;
		};
		export type UsersTogglePrimaryEmailVisibilityParams = {
			email: string;
			visibility: string;
		};
		export type UsersUnblockUserParams = {
			username: string;
		};
		export type UsersUnfollowUserParams = {
			username: string;
		};
		export type UsersUpdateParams = {
			name?: string;
			email?: string;
			blog?: string;
			company?: string;
			location?: string;
			hireable?: boolean;
			bio?: string;
		};
		export type ChecksCreateParamsOutput = {
			title: string;
			summary: string;
			text?: string;
			annotations?: ChecksCreateParamsOutputAnnotations[];
			images?: ChecksCreateParamsOutputImages[];
		};
		export type ChecksCreateParamsOutputAnnotations = {
			path: string;
			start_line: number;
			end_line: number;
			start_column?: number;
			end_column?: number;
			annotation_level: 'notice' | 'warning' | 'failure';
			message: string;
			title?: string;
			raw_details?: string;
		};
		export type ChecksCreateParamsOutputImages = {
			alt: string;
			image_url: string;
			caption?: string;
		};
		export type ChecksCreateParamsActions = {
			label: string;
			description: string;
			identifier: string;
		};
		export type ChecksSetSuitesPreferencesParamsAutoTriggerChecks = {
			app_id: number;
			setting: boolean;
		};
		export type ChecksUpdateParamsOutput = {
			title?: string;
			summary: string;
			text?: string;
			annotations?: ChecksUpdateParamsOutputAnnotations[];
			images?: ChecksUpdateParamsOutputImages[];
		};
		export type ChecksUpdateParamsOutputAnnotations = {
			path: string;
			start_line: number;
			end_line: number;
			start_column?: number;
			end_column?: number;
			annotation_level: 'notice' | 'warning' | 'failure';
			message: string;
			title?: string;
			raw_details?: string;
		};
		export type ChecksUpdateParamsOutputImages = {
			alt: string;
			image_url: string;
			caption?: string;
		};
		export type ChecksUpdateParamsActions = {
			label: string;
			description: string;
			identifier: string;
		};
		export type GistsCreateParamsFiles = {
			content?: string;
		};
		export type GistsEditParamsFiles = {
			content?: string;
			filename?: string;
		};
		export type GitdataCreateCommitParamsCommitter = {};
		export type GitdataCreateCommitParamsAuthor = {};
		export type GitdataCreateTagParamsTagger = {
			name?: string;
			email?: string;
			date?: string;
		};
		export type GitdataCreateTreeParamsTree = {
			path?: string;
			mode?: '100644' | '100755' | '040000' | '160000' | '120000';
			type?: 'blob' | 'tree' | 'commit';
			sha?: string;
			content?: string;
		};
		export type OrgsCreateHookParamsConfig = {
			url: string;
			content_type?: string;
			secret?: string;
			insecure_ssl?: string;
		};
		export type OrgsEditHookParamsConfig = {
			url: string;
			content_type?: string;
			secret?: string;
			insecure_ssl?: string;
		};
		export type PullRequestsCreateReviewParamsComments = {
			path?: string;
			position?: number;
			body?: string;
		};
		export type ReposCreateFileParamsCommitter = {};
		export type ReposCreateFileParamsAuthor = {};
		export type ReposCreateHookParamsConfig = {
			url: string;
			content_type?: string;
			secret?: string;
			insecure_ssl?: string;
		};
		export type ReposDeleteFileParamsCommitter = {};
		export type ReposDeleteFileParamsAuthor = {};
		export type ReposEditHookParamsConfig = {
			url: string;
			content_type?: string;
			secret?: string;
			insecure_ssl?: string;
		};
		export type ReposUpdateBranchProtectionParamsRequiredStatusChecks = {
			strict: boolean;
			contexts: string[];
		};
		export type ReposUpdateBranchProtectionParamsRequiredPullRequestReviews = {
			dismissal_restrictions?: ReposUpdateBranchProtectionParamsRequiredPullRequestReviewsDismissalRestrictions;
			dismiss_stale_reviews?: boolean;
			require_code_owner_reviews?: boolean;
			required_approving_review_count?: number;
		};
		export type ReposUpdateBranchProtectionParamsRequiredPullRequestReviewsDismissalRestrictions = {
			users?: string[];
			teams?: string[];
		};
		export type ReposUpdateBranchProtectionParamsRestrictions = {
			users?: string[];
			teams?: string[];
		};
		export type ReposUpdateFileParamsCommitter = {};
		export type ReposUpdateFileParamsAuthor = {};
		export type ReposUpdateProtectedBranchPullRequestReviewEnforcementParamsDismissalRestrictions = {
			users?: string[];
			teams?: string[];
		};
	}

	class Github {
		constructor(options?: Github.Options);
		authenticate(auth: Github.Auth): void;
		hasNextPage(link: Github.Link): string | undefined;
		hasPreviousPage(link: Github.Link): string | undefined;
		hasLastPage(link: Github.Link): string | undefined;
		hasFirstPage(link: Github.Link): string | undefined;

		getNextPage(
			link: Github.Link,
			callback?: Github.Callback<Github.AnyResponse>
		): Promise<Github.AnyResponse>;
		getNextPage(
			link: Github.Link,
			headers?: { [header: string]: any },
			callback?: Github.Callback<Github.AnyResponse>
		): Promise<Github.AnyResponse>;

		getPreviousPage(
			link: Github.Link,
			callback?: Github.Callback<Github.AnyResponse>
		): Promise<Github.AnyResponse>;
		getPreviousPage(
			link: Github.Link,
			headers?: { [header: string]: any },
			callback?: Github.Callback<Github.AnyResponse>
		): Promise<Github.AnyResponse>;

		getLastPage(
			link: Github.Link,
			callback?: Github.Callback<Github.AnyResponse>
		): Promise<Github.AnyResponse>;
		getLastPage(
			link: Github.Link,
			headers?: { [header: string]: any },
			callback?: Github.Callback<Github.AnyResponse>
		): Promise<Github.AnyResponse>;

		getFirstPage(
			link: Github.Link,
			callback?: Github.Callback<Github.AnyResponse>
		): Promise<Github.AnyResponse>;
		getFirstPage(
			link: Github.Link,
			headers?: { [header: string]: any },
			callback?: Github.Callback<Github.AnyResponse>
		): Promise<Github.AnyResponse>;

		activity: {
			checkNotificationThreadSubscription(
				params: Github.ActivityCheckNotificationThreadSubscriptionParams,
				callback?: Github.Callback<
					Github.Response<
						Github.ActivityCheckNotificationThreadSubscriptionResponse
						>
					>
			): Promise<
				Github.Response<
					Github.ActivityCheckNotificationThreadSubscriptionResponse
					>
				>;
			checkStarringRepo(
				params: Github.ActivityCheckStarringRepoParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			deleteNotificationThreadSubscription(
				params: Github.ActivityDeleteNotificationThreadSubscriptionParams,
				callback?: Github.Callback<
					Github.Response<
						Github.ActivityDeleteNotificationThreadSubscriptionResponse
						>
					>
			): Promise<
				Github.Response<
					Github.ActivityDeleteNotificationThreadSubscriptionResponse
					>
				>;
			getEvents(
				params: Github.ActivityGetEventsParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getEventsForOrg(
				params: Github.ActivityGetEventsForOrgParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getEventsForRepo(
				params: Github.ActivityGetEventsForRepoParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getEventsForRepoNetwork(
				params: Github.ActivityGetEventsForRepoNetworkParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getEventsForUser(
				params: Github.ActivityGetEventsForUserParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getEventsForUserOrg(
				params: Github.ActivityGetEventsForUserOrgParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getEventsForUserPublic(
				params: Github.ActivityGetEventsForUserPublicParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getEventsReceived(
				params: Github.ActivityGetEventsReceivedParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getEventsReceivedPublic(
				params: Github.ActivityGetEventsReceivedPublicParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getFeeds(
				params: Github.EmptyParams,
				callback?: Github.Callback<
					Github.Response<Github.ActivityGetFeedsResponse>
					>
			): Promise<Github.Response<Github.ActivityGetFeedsResponse>>;
			getNotificationThread(
				params: Github.ActivityGetNotificationThreadParams,
				callback?: Github.Callback<
					Github.Response<Github.ActivityGetNotificationThreadResponse>
					>
			): Promise<Github.Response<Github.ActivityGetNotificationThreadResponse>>;
			getNotifications(
				params: Github.ActivityGetNotificationsParams,
				callback?: Github.Callback<
					Github.Response<Github.ActivityGetNotificationsResponse>
					>
			): Promise<Github.Response<Github.ActivityGetNotificationsResponse>>;
			getNotificationsForUser(
				params: Github.ActivityGetNotificationsForUserParams,
				callback?: Github.Callback<
					Github.Response<Github.ActivityGetNotificationsForUserResponse>
					>
			): Promise<Github.Response<Github.ActivityGetNotificationsForUserResponse>>;
			getRepoSubscription(
				params: Github.ActivityGetRepoSubscriptionParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getStargazersForRepo(
				params: Github.ActivityGetStargazersForRepoParams,
				callback?: Github.Callback<
					Github.Response<Github.ActivityGetStargazersForRepoResponse>
					>
			): Promise<Github.Response<Github.ActivityGetStargazersForRepoResponse>>;
			getStarredRepos(
				params: Github.ActivityGetStarredReposParams,
				callback?: Github.Callback<
					Github.Response<Github.ActivityGetStarredReposResponse>
					>
			): Promise<Github.Response<Github.ActivityGetStarredReposResponse>>;
			getStarredReposForUser(
				params: Github.ActivityGetStarredReposForUserParams,
				callback?: Github.Callback<
					Github.Response<Github.ActivityGetStarredReposForUserResponse>
					>
			): Promise<Github.Response<Github.ActivityGetStarredReposForUserResponse>>;
			getWatchedRepos(
				params: Github.ActivityGetWatchedReposParams,
				callback?: Github.Callback<
					Github.Response<Github.ActivityGetWatchedReposResponse>
					>
			): Promise<Github.Response<Github.ActivityGetWatchedReposResponse>>;
			getWatchedReposForUser(
				params: Github.ActivityGetWatchedReposForUserParams,
				callback?: Github.Callback<
					Github.Response<Github.ActivityGetWatchedReposForUserResponse>
					>
			): Promise<Github.Response<Github.ActivityGetWatchedReposForUserResponse>>;
			getWatchersForRepo(
				params: Github.ActivityGetWatchersForRepoParams,
				callback?: Github.Callback<
					Github.Response<Github.ActivityGetWatchersForRepoResponse>
					>
			): Promise<Github.Response<Github.ActivityGetWatchersForRepoResponse>>;
			markNotificationThreadAsRead(
				params: Github.ActivityMarkNotificationThreadAsReadParams,
				callback?: Github.Callback<
					Github.Response<Github.ActivityMarkNotificationThreadAsReadResponse>
					>
			): Promise<
				Github.Response<Github.ActivityMarkNotificationThreadAsReadResponse>
				>;
			markNotificationsAsRead(
				params: Github.ActivityMarkNotificationsAsReadParams,
				callback?: Github.Callback<
					Github.Response<Github.ActivityMarkNotificationsAsReadResponse>
					>
			): Promise<Github.Response<Github.ActivityMarkNotificationsAsReadResponse>>;
			markNotificationsAsReadForRepo(
				params: Github.ActivityMarkNotificationsAsReadForRepoParams,
				callback?: Github.Callback<
					Github.Response<Github.ActivityMarkNotificationsAsReadForRepoResponse>
					>
			): Promise<
				Github.Response<Github.ActivityMarkNotificationsAsReadForRepoResponse>
				>;
			setNotificationThreadSubscription(
				params: Github.ActivitySetNotificationThreadSubscriptionParams,
				callback?: Github.Callback<
					Github.Response<
						Github.ActivitySetNotificationThreadSubscriptionResponse
						>
					>
			): Promise<
				Github.Response<Github.ActivitySetNotificationThreadSubscriptionResponse>
				>;
			setRepoSubscription(
				params: Github.ActivitySetRepoSubscriptionParams,
				callback?: Github.Callback<
					Github.Response<Github.ActivitySetRepoSubscriptionResponse>
					>
			): Promise<Github.Response<Github.ActivitySetRepoSubscriptionResponse>>;
			starRepo(
				params: Github.ActivityStarRepoParams,
				callback?: Github.Callback<
					Github.Response<Github.ActivityStarRepoResponse>
					>
			): Promise<Github.Response<Github.ActivityStarRepoResponse>>;
			unstarRepo(
				params: Github.ActivityUnstarRepoParams,
				callback?: Github.Callback<
					Github.Response<Github.ActivityUnstarRepoResponse>
					>
			): Promise<Github.Response<Github.ActivityUnstarRepoResponse>>;
			unwatchRepo(
				params: Github.ActivityUnwatchRepoParams,
				callback?: Github.Callback<
					Github.Response<Github.ActivityUnwatchRepoResponse>
					>
			): Promise<Github.Response<Github.ActivityUnwatchRepoResponse>>;
		};
		apps: {
			addRepoToInstallation(
				params: Github.AppsAddRepoToInstallationParams,
				callback?: Github.Callback<
					Github.Response<Github.AppsAddRepoToInstallationResponse>
					>
			): Promise<Github.Response<Github.AppsAddRepoToInstallationResponse>>;
			checkMarketplaceListingAccount(
				params: Github.AppsCheckMarketplaceListingAccountParams,
				callback?: Github.Callback<
					Github.Response<Github.AppsCheckMarketplaceListingAccountResponse>
					>
			): Promise<
				Github.Response<Github.AppsCheckMarketplaceListingAccountResponse>
				>;
			checkMarketplaceListingStubbedAccount(
				params: Github.AppsCheckMarketplaceListingStubbedAccountParams,
				callback?: Github.Callback<
					Github.Response<
						Github.AppsCheckMarketplaceListingStubbedAccountResponse
						>
					>
			): Promise<
				Github.Response<Github.AppsCheckMarketplaceListingStubbedAccountResponse>
				>;
			createFromManifest(
				params: Github.AppsCreateFromManifestParams,
				callback?: Github.Callback<
					Github.Response<Github.AppsCreateFromManifestResponse>
					>
			): Promise<Github.Response<Github.AppsCreateFromManifestResponse>>;
			createInstallationToken(
				params: Github.AppsCreateInstallationTokenParams,
				callback?: Github.Callback<
					Github.Response<Github.AppsCreateInstallationTokenResponse>
					>
			): Promise<Github.Response<Github.AppsCreateInstallationTokenResponse>>;
			findOrgInstallation(
				params: Github.AppsFindOrgInstallationParams,
				callback?: Github.Callback<
					Github.Response<Github.AppsFindOrgInstallationResponse>
					>
			): Promise<Github.Response<Github.AppsFindOrgInstallationResponse>>;
			findRepoInstallation(
				params: Github.AppsFindRepoInstallationParams,
				callback?: Github.Callback<
					Github.Response<Github.AppsFindRepoInstallationResponse>
					>
			): Promise<Github.Response<Github.AppsFindRepoInstallationResponse>>;
			findUserInstallation(
				params: Github.AppsFindUserInstallationParams,
				callback?: Github.Callback<
					Github.Response<Github.AppsFindUserInstallationResponse>
					>
			): Promise<Github.Response<Github.AppsFindUserInstallationResponse>>;
			get(
				params: Github.EmptyParams,
				callback?: Github.Callback<Github.Response<Github.AppsGetResponse>>
			): Promise<Github.Response<Github.AppsGetResponse>>;
			getForSlug(
				params: Github.AppsGetForSlugParams,
				callback?: Github.Callback<Github.Response<Github.AppsGetForSlugResponse>>
			): Promise<Github.Response<Github.AppsGetForSlugResponse>>;
			getInstallation(
				params: Github.AppsGetInstallationParams,
				callback?: Github.Callback<
					Github.Response<Github.AppsGetInstallationResponse>
					>
			): Promise<Github.Response<Github.AppsGetInstallationResponse>>;
			getInstallationRepositories(
				params: Github.AppsGetInstallationRepositoriesParams,
				callback?: Github.Callback<
					Github.Response<Github.AppsGetInstallationRepositoriesResponse>
					>
			): Promise<Github.Response<Github.AppsGetInstallationRepositoriesResponse>>;
			getInstallations(
				params: Github.AppsGetInstallationsParams,
				callback?: Github.Callback<
					Github.Response<Github.AppsGetInstallationsResponse>
					>
			): Promise<Github.Response<Github.AppsGetInstallationsResponse>>;
			getMarketplaceListingPlanAccounts(
				params: Github.AppsGetMarketplaceListingPlanAccountsParams,
				callback?: Github.Callback<
					Github.Response<Github.AppsGetMarketplaceListingPlanAccountsResponse>
					>
			): Promise<
				Github.Response<Github.AppsGetMarketplaceListingPlanAccountsResponse>
				>;
			getMarketplaceListingPlans(
				params: Github.AppsGetMarketplaceListingPlansParams,
				callback?: Github.Callback<
					Github.Response<Github.AppsGetMarketplaceListingPlansResponse>
					>
			): Promise<Github.Response<Github.AppsGetMarketplaceListingPlansResponse>>;
			getMarketplaceListingStubbedPlanAccounts(
				params: Github.AppsGetMarketplaceListingStubbedPlanAccountsParams,
				callback?: Github.Callback<
					Github.Response<
						Github.AppsGetMarketplaceListingStubbedPlanAccountsResponse
						>
					>
			): Promise<
				Github.Response<
					Github.AppsGetMarketplaceListingStubbedPlanAccountsResponse
					>
				>;
			getMarketplaceListingStubbedPlans(
				params: Github.AppsGetMarketplaceListingStubbedPlansParams,
				callback?: Github.Callback<
					Github.Response<Github.AppsGetMarketplaceListingStubbedPlansResponse>
					>
			): Promise<
				Github.Response<Github.AppsGetMarketplaceListingStubbedPlansResponse>
				>;
			removeRepoFromInstallation(
				params: Github.AppsRemoveRepoFromInstallationParams,
				callback?: Github.Callback<
					Github.Response<Github.AppsRemoveRepoFromInstallationResponse>
					>
			): Promise<Github.Response<Github.AppsRemoveRepoFromInstallationResponse>>;
		};
		authorization: {
			check(
				params: Github.AuthorizationCheckParams,
				callback?: Github.Callback<
					Github.Response<Github.AuthorizationCheckResponse>
					>
			): Promise<Github.Response<Github.AuthorizationCheckResponse>>;
			create(
				params: Github.AuthorizationCreateParams,
				callback?: Github.Callback<
					Github.Response<Github.AuthorizationCreateResponse>
					>
			): Promise<Github.Response<Github.AuthorizationCreateResponse>>;
			delete(
				params: Github.AuthorizationDeleteParams,
				callback?: Github.Callback<
					Github.Response<Github.AuthorizationDeleteResponse>
					>
			): Promise<Github.Response<Github.AuthorizationDeleteResponse>>;
			deleteGrant(
				params: Github.AuthorizationDeleteGrantParams,
				callback?: Github.Callback<
					Github.Response<Github.AuthorizationDeleteGrantResponse>
					>
			): Promise<Github.Response<Github.AuthorizationDeleteGrantResponse>>;
			get(
				params: Github.AuthorizationGetParams,
				callback?: Github.Callback<
					Github.Response<Github.AuthorizationGetResponse>
					>
			): Promise<Github.Response<Github.AuthorizationGetResponse>>;
			getAll(
				params: Github.AuthorizationGetAllParams,
				callback?: Github.Callback<
					Github.Response<Github.AuthorizationGetAllResponse>
					>
			): Promise<Github.Response<Github.AuthorizationGetAllResponse>>;
			getGrant(
				params: Github.AuthorizationGetGrantParams,
				callback?: Github.Callback<
					Github.Response<Github.AuthorizationGetGrantResponse>
					>
			): Promise<Github.Response<Github.AuthorizationGetGrantResponse>>;
			getGrants(
				params: Github.AuthorizationGetGrantsParams,
				callback?: Github.Callback<
					Github.Response<Github.AuthorizationGetGrantsResponse>
					>
			): Promise<Github.Response<Github.AuthorizationGetGrantsResponse>>;
			getOrCreateAuthorizationForApp(
				params: Github.AuthorizationGetOrCreateAuthorizationForAppParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getOrCreateAuthorizationForAppAndFingerprint(
				params: Github.AuthorizationGetOrCreateAuthorizationForAppAndFingerprintParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			reset(
				params: Github.AuthorizationResetParams,
				callback?: Github.Callback<
					Github.Response<Github.AuthorizationResetResponse>
					>
			): Promise<Github.Response<Github.AuthorizationResetResponse>>;
			revoke(
				params: Github.AuthorizationRevokeParams,
				callback?: Github.Callback<
					Github.Response<Github.AuthorizationRevokeResponse>
					>
			): Promise<Github.Response<Github.AuthorizationRevokeResponse>>;
			revokeGrant(
				params: Github.AuthorizationRevokeGrantParams,
				callback?: Github.Callback<
					Github.Response<Github.AuthorizationRevokeGrantResponse>
					>
			): Promise<Github.Response<Github.AuthorizationRevokeGrantResponse>>;
			update(
				params: Github.AuthorizationUpdateParams,
				callback?: Github.Callback<
					Github.Response<Github.AuthorizationUpdateResponse>
					>
			): Promise<Github.Response<Github.AuthorizationUpdateResponse>>;
		};
		checks: {
			create(
				params: Github.ChecksCreateParams,
				callback?: Github.Callback<Github.Response<Github.ChecksCreateResponse>>
			): Promise<Github.Response<Github.ChecksCreateResponse>>;
			createSuite(
				params: Github.ChecksCreateSuiteParams,
				callback?: Github.Callback<
					Github.Response<Github.ChecksCreateSuiteResponse>
					>
			): Promise<Github.Response<Github.ChecksCreateSuiteResponse>>;
			get(
				params: Github.ChecksGetParams,
				callback?: Github.Callback<Github.Response<Github.ChecksGetResponse>>
			): Promise<Github.Response<Github.ChecksGetResponse>>;
			getSuite(
				params: Github.ChecksGetSuiteParams,
				callback?: Github.Callback<Github.Response<Github.ChecksGetSuiteResponse>>
			): Promise<Github.Response<Github.ChecksGetSuiteResponse>>;
			listAnnotations(
				params: Github.ChecksListAnnotationsParams,
				callback?: Github.Callback<
					Github.Response<Github.ChecksListAnnotationsResponse>
					>
			): Promise<Github.Response<Github.ChecksListAnnotationsResponse>>;
			listForRef(
				params: Github.ChecksListForRefParams,
				callback?: Github.Callback<
					Github.Response<Github.ChecksListForRefResponse>
					>
			): Promise<Github.Response<Github.ChecksListForRefResponse>>;
			listForSuite(
				params: Github.ChecksListForSuiteParams,
				callback?: Github.Callback<
					Github.Response<Github.ChecksListForSuiteResponse>
					>
			): Promise<Github.Response<Github.ChecksListForSuiteResponse>>;
			listSuitesForRef(
				params: Github.ChecksListSuitesForRefParams,
				callback?: Github.Callback<
					Github.Response<Github.ChecksListSuitesForRefResponse>
					>
			): Promise<Github.Response<Github.ChecksListSuitesForRefResponse>>;
			rerequestSuite(
				params: Github.ChecksRerequestSuiteParams,
				callback?: Github.Callback<
					Github.Response<Github.ChecksRerequestSuiteResponse>
					>
			): Promise<Github.Response<Github.ChecksRerequestSuiteResponse>>;
			setSuitesPreferences(
				params: Github.ChecksSetSuitesPreferencesParams,
				callback?: Github.Callback<
					Github.Response<Github.ChecksSetSuitesPreferencesResponse>
					>
			): Promise<Github.Response<Github.ChecksSetSuitesPreferencesResponse>>;
			update(
				params: Github.ChecksUpdateParams,
				callback?: Github.Callback<Github.Response<Github.ChecksUpdateResponse>>
			): Promise<Github.Response<Github.ChecksUpdateResponse>>;
		};
		gists: {
			checkStar(
				params: Github.GistsCheckStarParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			create(
				params: Github.GistsCreateParams,
				callback?: Github.Callback<Github.Response<Github.GistsCreateResponse>>
			): Promise<Github.Response<Github.GistsCreateResponse>>;
			createComment(
				params: Github.GistsCreateCommentParams,
				callback?: Github.Callback<
					Github.Response<Github.GistsCreateCommentResponse>
					>
			): Promise<Github.Response<Github.GistsCreateCommentResponse>>;
			delete(
				params: Github.GistsDeleteParams,
				callback?: Github.Callback<Github.Response<Github.GistsDeleteResponse>>
			): Promise<Github.Response<Github.GistsDeleteResponse>>;
			deleteComment(
				params: Github.GistsDeleteCommentParams,
				callback?: Github.Callback<
					Github.Response<Github.GistsDeleteCommentResponse>
					>
			): Promise<Github.Response<Github.GistsDeleteCommentResponse>>;
			edit(
				params: Github.GistsEditParams,
				callback?: Github.Callback<Github.Response<Github.GistsEditResponse>>
			): Promise<Github.Response<Github.GistsEditResponse>>;
			editComment(
				params: Github.GistsEditCommentParams,
				callback?: Github.Callback<
					Github.Response<Github.GistsEditCommentResponse>
					>
			): Promise<Github.Response<Github.GistsEditCommentResponse>>;
			fork(
				params: Github.GistsForkParams,
				callback?: Github.Callback<Github.Response<Github.GistsForkResponse>>
			): Promise<Github.Response<Github.GistsForkResponse>>;
			get(
				params: Github.GistsGetParams,
				callback?: Github.Callback<Github.Response<Github.GistsGetResponse>>
			): Promise<Github.Response<Github.GistsGetResponse>>;
			getAll(
				params: Github.GistsGetAllParams,
				callback?: Github.Callback<Github.Response<Github.GistsGetAllResponse>>
			): Promise<Github.Response<Github.GistsGetAllResponse>>;
			getComment(
				params: Github.GistsGetCommentParams,
				callback?: Github.Callback<
					Github.Response<Github.GistsGetCommentResponse>
					>
			): Promise<Github.Response<Github.GistsGetCommentResponse>>;
			getComments(
				params: Github.GistsGetCommentsParams,
				callback?: Github.Callback<
					Github.Response<Github.GistsGetCommentsResponse>
					>
			): Promise<Github.Response<Github.GistsGetCommentsResponse>>;
			getCommits(
				params: Github.GistsGetCommitsParams,
				callback?: Github.Callback<
					Github.Response<Github.GistsGetCommitsResponse>
					>
			): Promise<Github.Response<Github.GistsGetCommitsResponse>>;
			getForUser(
				params: Github.GistsGetForUserParams,
				callback?: Github.Callback<
					Github.Response<Github.GistsGetForUserResponse>
					>
			): Promise<Github.Response<Github.GistsGetForUserResponse>>;
			getForks(
				params: Github.GistsGetForksParams,
				callback?: Github.Callback<Github.Response<Github.GistsGetForksResponse>>
			): Promise<Github.Response<Github.GistsGetForksResponse>>;
			getPublic(
				params: Github.GistsGetPublicParams,
				callback?: Github.Callback<Github.Response<Github.GistsGetPublicResponse>>
			): Promise<Github.Response<Github.GistsGetPublicResponse>>;
			getRevision(
				params: Github.GistsGetRevisionParams,
				callback?: Github.Callback<
					Github.Response<Github.GistsGetRevisionResponse>
					>
			): Promise<Github.Response<Github.GistsGetRevisionResponse>>;
			getStarred(
				params: Github.GistsGetStarredParams,
				callback?: Github.Callback<
					Github.Response<Github.GistsGetStarredResponse>
					>
			): Promise<Github.Response<Github.GistsGetStarredResponse>>;
			star(
				params: Github.GistsStarParams,
				callback?: Github.Callback<Github.Response<Github.GistsStarResponse>>
			): Promise<Github.Response<Github.GistsStarResponse>>;
			unstar(
				params: Github.GistsUnstarParams,
				callback?: Github.Callback<Github.Response<Github.GistsUnstarResponse>>
			): Promise<Github.Response<Github.GistsUnstarResponse>>;
		};
		gitdata: {
			createBlob(
				params: Github.GitdataCreateBlobParams,
				callback?: Github.Callback<
					Github.Response<Github.GitdataCreateBlobResponse>
					>
			): Promise<Github.Response<Github.GitdataCreateBlobResponse>>;
			createCommit(
				params: Github.GitdataCreateCommitParams,
				callback?: Github.Callback<
					Github.Response<Github.GitdataCreateCommitResponse>
					>
			): Promise<Github.Response<Github.GitdataCreateCommitResponse>>;
			createReference(
				params: Github.GitdataCreateReferenceParams,
				callback?: Github.Callback<
					Github.Response<Github.GitdataCreateReferenceResponse>
					>
			): Promise<Github.Response<Github.GitdataCreateReferenceResponse>>;
			createTag(
				params: Github.GitdataCreateTagParams,
				callback?: Github.Callback<
					Github.Response<Github.GitdataCreateTagResponse>
					>
			): Promise<Github.Response<Github.GitdataCreateTagResponse>>;
			createTree(
				params: Github.GitdataCreateTreeParams,
				callback?: Github.Callback<
					Github.Response<Github.GitdataCreateTreeResponse>
					>
			): Promise<Github.Response<Github.GitdataCreateTreeResponse>>;
			deleteReference(
				params: Github.GitdataDeleteReferenceParams,
				callback?: Github.Callback<
					Github.Response<Github.GitdataDeleteReferenceResponse>
					>
			): Promise<Github.Response<Github.GitdataDeleteReferenceResponse>>;
			getBlob(
				params: Github.GitdataGetBlobParams,
				callback?: Github.Callback<Github.Response<Github.GitdataGetBlobResponse>>
			): Promise<Github.Response<Github.GitdataGetBlobResponse>>;
			getCommit(
				params: Github.GitdataGetCommitParams,
				callback?: Github.Callback<
					Github.Response<Github.GitdataGetCommitResponse>
					>
			): Promise<Github.Response<Github.GitdataGetCommitResponse>>;
			getCommitSignatureVerification(
				params: Github.GitdataGetCommitSignatureVerificationParams,
				callback?: Github.Callback<
					Github.Response<Github.GitdataGetCommitSignatureVerificationResponse>
					>
			): Promise<
				Github.Response<Github.GitdataGetCommitSignatureVerificationResponse>
				>;
			getReference(
				params: Github.GitdataGetReferenceParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getTag(
				params: Github.GitdataGetTagParams,
				callback?: Github.Callback<Github.Response<Github.GitdataGetTagResponse>>
			): Promise<Github.Response<Github.GitdataGetTagResponse>>;
			getTagSignatureVerification(
				params: Github.GitdataGetTagSignatureVerificationParams,
				callback?: Github.Callback<
					Github.Response<Github.GitdataGetTagSignatureVerificationResponse>
					>
			): Promise<
				Github.Response<Github.GitdataGetTagSignatureVerificationResponse>
				>;
			getTree(
				params: Github.GitdataGetTreeParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			updateReference(
				params: Github.GitdataUpdateReferenceParams,
				callback?: Github.Callback<
					Github.Response<Github.GitdataUpdateReferenceResponse>
					>
			): Promise<Github.Response<Github.GitdataUpdateReferenceResponse>>;
		};
		issues: {
			addAssigneesToIssue(
				params: Github.IssuesAddAssigneesToIssueParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesAddAssigneesToIssueResponse>
					>
			): Promise<Github.Response<Github.IssuesAddAssigneesToIssueResponse>>;
			addLabels(
				params: Github.IssuesAddLabelsParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesAddLabelsResponse>
					>
			): Promise<Github.Response<Github.IssuesAddLabelsResponse>>;
			checkAssignee(
				params: Github.IssuesCheckAssigneeParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesCheckAssigneeResponse>
					>
			): Promise<Github.Response<Github.IssuesCheckAssigneeResponse>>;
			create(
				params: Github.IssuesCreateParams,
				callback?: Github.Callback<Github.Response<Github.IssuesCreateResponse>>
			): Promise<Github.Response<Github.IssuesCreateResponse>>;
			createComment(
				params: Github.IssuesCreateCommentParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesCreateCommentResponse>
					>
			): Promise<Github.Response<Github.IssuesCreateCommentResponse>>;
			createLabel(
				params: Github.IssuesCreateLabelParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesCreateLabelResponse>
					>
			): Promise<Github.Response<Github.IssuesCreateLabelResponse>>;
			createMilestone(
				params: Github.IssuesCreateMilestoneParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesCreateMilestoneResponse>
					>
			): Promise<Github.Response<Github.IssuesCreateMilestoneResponse>>;
			deleteComment(
				params: Github.IssuesDeleteCommentParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesDeleteCommentResponse>
					>
			): Promise<Github.Response<Github.IssuesDeleteCommentResponse>>;
			deleteLabel(
				params: Github.IssuesDeleteLabelParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesDeleteLabelResponse>
					>
			): Promise<Github.Response<Github.IssuesDeleteLabelResponse>>;
			deleteMilestone(
				params: Github.IssuesDeleteMilestoneParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesDeleteMilestoneResponse>
					>
			): Promise<Github.Response<Github.IssuesDeleteMilestoneResponse>>;
			edit(
				params: Github.IssuesEditParams,
				callback?: Github.Callback<Github.Response<Github.IssuesEditResponse>>
			): Promise<Github.Response<Github.IssuesEditResponse>>;
			editComment(
				params: Github.IssuesEditCommentParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesEditCommentResponse>
					>
			): Promise<Github.Response<Github.IssuesEditCommentResponse>>;
			get(
				params: Github.IssuesGetParams,
				callback?: Github.Callback<Github.Response<Github.IssuesGetResponse>>
			): Promise<Github.Response<Github.IssuesGetResponse>>;
			getAll(
				params: Github.IssuesGetAllParams,
				callback?: Github.Callback<Github.Response<Github.IssuesGetAllResponse>>
			): Promise<Github.Response<Github.IssuesGetAllResponse>>;
			getAssignees(
				params: Github.IssuesGetAssigneesParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesGetAssigneesResponse>
					>
			): Promise<Github.Response<Github.IssuesGetAssigneesResponse>>;
			getComment(
				params: Github.IssuesGetCommentParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesGetCommentResponse>
					>
			): Promise<Github.Response<Github.IssuesGetCommentResponse>>;
			getComments(
				params: Github.IssuesGetCommentsParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesGetCommentsResponse>
					>
			): Promise<Github.Response<Github.IssuesGetCommentsResponse>>;
			getCommentsForRepo(
				params: Github.IssuesGetCommentsForRepoParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesGetCommentsForRepoResponse>
					>
			): Promise<Github.Response<Github.IssuesGetCommentsForRepoResponse>>;
			getEvent(
				params: Github.IssuesGetEventParams,
				callback?: Github.Callback<Github.Response<Github.IssuesGetEventResponse>>
			): Promise<Github.Response<Github.IssuesGetEventResponse>>;
			getEvents(
				params: Github.IssuesGetEventsParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesGetEventsResponse>
					>
			): Promise<Github.Response<Github.IssuesGetEventsResponse>>;
			getEventsForRepo(
				params: Github.IssuesGetEventsForRepoParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesGetEventsForRepoResponse>
					>
			): Promise<Github.Response<Github.IssuesGetEventsForRepoResponse>>;
			getEventsTimeline(
				params: Github.IssuesGetEventsTimelineParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesGetEventsTimelineResponse>
					>
			): Promise<Github.Response<Github.IssuesGetEventsTimelineResponse>>;
			getForOrg(
				params: Github.IssuesGetForOrgParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesGetForOrgResponse>
					>
			): Promise<Github.Response<Github.IssuesGetForOrgResponse>>;
			getForRepo(
				params: Github.IssuesGetForRepoParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesGetForRepoResponse>
					>
			): Promise<Github.Response<Github.IssuesGetForRepoResponse>>;
			getForUser(
				params: Github.IssuesGetForUserParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesGetForUserResponse>
					>
			): Promise<Github.Response<Github.IssuesGetForUserResponse>>;
			getIssueLabels(
				params: Github.IssuesGetIssueLabelsParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesGetIssueLabelsResponse>
					>
			): Promise<Github.Response<Github.IssuesGetIssueLabelsResponse>>;
			getLabel(
				params: Github.IssuesGetLabelParams,
				callback?: Github.Callback<Github.Response<Github.IssuesGetLabelResponse>>
			): Promise<Github.Response<Github.IssuesGetLabelResponse>>;
			getLabels(
				params: Github.IssuesGetLabelsParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesGetLabelsResponse>
					>
			): Promise<Github.Response<Github.IssuesGetLabelsResponse>>;
			getMilestone(
				params: Github.IssuesGetMilestoneParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesGetMilestoneResponse>
					>
			): Promise<Github.Response<Github.IssuesGetMilestoneResponse>>;
			getMilestoneLabels(
				params: Github.IssuesGetMilestoneLabelsParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesGetMilestoneLabelsResponse>
					>
			): Promise<Github.Response<Github.IssuesGetMilestoneLabelsResponse>>;
			getMilestones(
				params: Github.IssuesGetMilestonesParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesGetMilestonesResponse>
					>
			): Promise<Github.Response<Github.IssuesGetMilestonesResponse>>;
			lock(
				params: Github.IssuesLockParams,
				callback?: Github.Callback<Github.Response<Github.IssuesLockResponse>>
			): Promise<Github.Response<Github.IssuesLockResponse>>;
			removeAllLabels(
				params: Github.IssuesRemoveAllLabelsParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesRemoveAllLabelsResponse>
					>
			): Promise<Github.Response<Github.IssuesRemoveAllLabelsResponse>>;
			removeAssigneesFromIssue(
				params: Github.IssuesRemoveAssigneesFromIssueParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesRemoveAssigneesFromIssueResponse>
					>
			): Promise<Github.Response<Github.IssuesRemoveAssigneesFromIssueResponse>>;
			removeLabel(
				params: Github.IssuesRemoveLabelParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			replaceAllLabels(
				params: Github.IssuesReplaceAllLabelsParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesReplaceAllLabelsResponse>
					>
			): Promise<Github.Response<Github.IssuesReplaceAllLabelsResponse>>;
			unlock(
				params: Github.IssuesUnlockParams,
				callback?: Github.Callback<Github.Response<Github.IssuesUnlockResponse>>
			): Promise<Github.Response<Github.IssuesUnlockResponse>>;
			updateLabel(
				params: Github.IssuesUpdateLabelParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesUpdateLabelResponse>
					>
			): Promise<Github.Response<Github.IssuesUpdateLabelResponse>>;
			updateMilestone(
				params: Github.IssuesUpdateMilestoneParams,
				callback?: Github.Callback<
					Github.Response<Github.IssuesUpdateMilestoneResponse>
					>
			): Promise<Github.Response<Github.IssuesUpdateMilestoneResponse>>;
		};
		migrations: {
			cancelImport(
				params: Github.MigrationsCancelImportParams,
				callback?: Github.Callback<
					Github.Response<Github.MigrationsCancelImportResponse>
					>
			): Promise<Github.Response<Github.MigrationsCancelImportResponse>>;
			deleteArchiveForAuthenticatedUser(
				params: Github.MigrationsDeleteArchiveForAuthenticatedUserParams,
				callback?: Github.Callback<
					Github.Response<
						Github.MigrationsDeleteArchiveForAuthenticatedUserResponse
						>
					>
			): Promise<
				Github.Response<
					Github.MigrationsDeleteArchiveForAuthenticatedUserResponse
					>
				>;
			deleteMigrationArchive(
				params: Github.MigrationsDeleteMigrationArchiveParams,
				callback?: Github.Callback<
					Github.Response<Github.MigrationsDeleteMigrationArchiveResponse>
					>
			): Promise<
				Github.Response<Github.MigrationsDeleteMigrationArchiveResponse>
				>;
			getArchiveForAuthenticatedUser(
				params: Github.MigrationsGetArchiveForAuthenticatedUserParams,
				callback?: Github.Callback<
					Github.Response<Github.MigrationsGetArchiveForAuthenticatedUserResponse>
					>
			): Promise<
				Github.Response<Github.MigrationsGetArchiveForAuthenticatedUserResponse>
				>;
			getImportCommitAuthors(
				params: Github.MigrationsGetImportCommitAuthorsParams,
				callback?: Github.Callback<
					Github.Response<Github.MigrationsGetImportCommitAuthorsResponse>
					>
			): Promise<
				Github.Response<Github.MigrationsGetImportCommitAuthorsResponse>
				>;
			getImportProgress(
				params: Github.MigrationsGetImportProgressParams,
				callback?: Github.Callback<
					Github.Response<Github.MigrationsGetImportProgressResponse>
					>
			): Promise<Github.Response<Github.MigrationsGetImportProgressResponse>>;
			getLargeImportFiles(
				params: Github.MigrationsGetLargeImportFilesParams,
				callback?: Github.Callback<
					Github.Response<Github.MigrationsGetLargeImportFilesResponse>
					>
			): Promise<Github.Response<Github.MigrationsGetLargeImportFilesResponse>>;
			getMigrationArchiveLink(
				params: Github.MigrationsGetMigrationArchiveLinkParams,
				callback?: Github.Callback<
					Github.Response<Github.MigrationsGetMigrationArchiveLinkResponse>
					>
			): Promise<
				Github.Response<Github.MigrationsGetMigrationArchiveLinkResponse>
				>;
			getMigrationStatus(
				params: Github.MigrationsGetMigrationStatusParams,
				callback?: Github.Callback<
					Github.Response<Github.MigrationsGetMigrationStatusResponse>
					>
			): Promise<Github.Response<Github.MigrationsGetMigrationStatusResponse>>;
			getMigrations(
				params: Github.MigrationsGetMigrationsParams,
				callback?: Github.Callback<
					Github.Response<Github.MigrationsGetMigrationsResponse>
					>
			): Promise<Github.Response<Github.MigrationsGetMigrationsResponse>>;
			getStatusForAuthenticatedUser(
				params: Github.MigrationsGetStatusForAuthenticatedUserParams,
				callback?: Github.Callback<
					Github.Response<Github.MigrationsGetStatusForAuthenticatedUserResponse>
					>
			): Promise<
				Github.Response<Github.MigrationsGetStatusForAuthenticatedUserResponse>
				>;
			listForAuthenticatedUser(
				params: Github.MigrationsListForAuthenticatedUserParams,
				callback?: Github.Callback<
					Github.Response<Github.MigrationsListForAuthenticatedUserResponse>
					>
			): Promise<
				Github.Response<Github.MigrationsListForAuthenticatedUserResponse>
				>;
			mapImportCommitAuthor(
				params: Github.MigrationsMapImportCommitAuthorParams,
				callback?: Github.Callback<
					Github.Response<Github.MigrationsMapImportCommitAuthorResponse>
					>
			): Promise<Github.Response<Github.MigrationsMapImportCommitAuthorResponse>>;
			setImportLfsPreference(
				params: Github.MigrationsSetImportLfsPreferenceParams,
				callback?: Github.Callback<
					Github.Response<Github.MigrationsSetImportLfsPreferenceResponse>
					>
			): Promise<
				Github.Response<Github.MigrationsSetImportLfsPreferenceResponse>
				>;
			startForAuthenticatedUser(
				params: Github.MigrationsStartForAuthenticatedUserParams,
				callback?: Github.Callback<
					Github.Response<Github.MigrationsStartForAuthenticatedUserResponse>
					>
			): Promise<
				Github.Response<Github.MigrationsStartForAuthenticatedUserResponse>
				>;
			startImport(
				params: Github.MigrationsStartImportParams,
				callback?: Github.Callback<
					Github.Response<Github.MigrationsStartImportResponse>
					>
			): Promise<Github.Response<Github.MigrationsStartImportResponse>>;
			startMigration(
				params: Github.MigrationsStartMigrationParams,
				callback?: Github.Callback<
					Github.Response<Github.MigrationsStartMigrationResponse>
					>
			): Promise<Github.Response<Github.MigrationsStartMigrationResponse>>;
			unlockRepoForAuthenticatedUser(
				params: Github.MigrationsUnlockRepoForAuthenticatedUserParams,
				callback?: Github.Callback<
					Github.Response<Github.MigrationsUnlockRepoForAuthenticatedUserResponse>
					>
			): Promise<
				Github.Response<Github.MigrationsUnlockRepoForAuthenticatedUserResponse>
				>;
			unlockRepoLockedForMigration(
				params: Github.MigrationsUnlockRepoLockedForMigrationParams,
				callback?: Github.Callback<
					Github.Response<Github.MigrationsUnlockRepoLockedForMigrationResponse>
					>
			): Promise<
				Github.Response<Github.MigrationsUnlockRepoLockedForMigrationResponse>
				>;
			updateImport(
				params: Github.MigrationsUpdateImportParams,
				callback?: Github.Callback<
					Github.Response<Github.MigrationsUpdateImportResponse>
					>
			): Promise<Github.Response<Github.MigrationsUpdateImportResponse>>;
		};
		misc: {
			getCodeOfConduct(
				params: Github.MiscGetCodeOfConductParams,
				callback?: Github.Callback<
					Github.Response<Github.MiscGetCodeOfConductResponse>
					>
			): Promise<Github.Response<Github.MiscGetCodeOfConductResponse>>;
			getCodesOfConduct(
				params: Github.EmptyParams,
				callback?: Github.Callback<
					Github.Response<Github.MiscGetCodesOfConductResponse>
					>
			): Promise<Github.Response<Github.MiscGetCodesOfConductResponse>>;
			getGitignoreTemplate(
				params: Github.MiscGetGitignoreTemplateParams,
				callback?: Github.Callback<
					Github.Response<Github.MiscGetGitignoreTemplateResponse>
					>
			): Promise<Github.Response<Github.MiscGetGitignoreTemplateResponse>>;
			getGitignoreTemplates(
				params: Github.EmptyParams,
				callback?: Github.Callback<
					Github.Response<Github.MiscGetGitignoreTemplatesResponse>
					>
			): Promise<Github.Response<Github.MiscGetGitignoreTemplatesResponse>>;
			getLicense(
				params: Github.MiscGetLicenseParams,
				callback?: Github.Callback<Github.Response<Github.MiscGetLicenseResponse>>
			): Promise<Github.Response<Github.MiscGetLicenseResponse>>;
			getLicenses(
				params: Github.EmptyParams,
				callback?: Github.Callback<
					Github.Response<Github.MiscGetLicensesResponse>
					>
			): Promise<Github.Response<Github.MiscGetLicensesResponse>>;
			getRateLimit(
				params: Github.EmptyParams,
				callback?: Github.Callback<
					Github.Response<Github.MiscGetRateLimitResponse>
					>
			): Promise<Github.Response<Github.MiscGetRateLimitResponse>>;
			getRepoCodeOfConduct(
				params: Github.MiscGetRepoCodeOfConductParams,
				callback?: Github.Callback<
					Github.Response<Github.MiscGetRepoCodeOfConductResponse>
					>
			): Promise<Github.Response<Github.MiscGetRepoCodeOfConductResponse>>;
			getRepoLicense(
				params: Github.MiscGetRepoLicenseParams,
				callback?: Github.Callback<
					Github.Response<Github.MiscGetRepoLicenseResponse>
					>
			): Promise<Github.Response<Github.MiscGetRepoLicenseResponse>>;
			renderMarkdown(
				params: Github.MiscRenderMarkdownParams,
				callback?: Github.Callback<
					Github.Response<Github.MiscRenderMarkdownResponse>
					>
			): Promise<Github.Response<Github.MiscRenderMarkdownResponse>>;
			renderMarkdownRaw(
				params: Github.MiscRenderMarkdownRawParams,
				callback?: Github.Callback<
					Github.Response<Github.MiscRenderMarkdownRawResponse>
					>
			): Promise<Github.Response<Github.MiscRenderMarkdownRawResponse>>;
		};
		orgs: {
			addOrgMembership(
				params: Github.OrgsAddOrgMembershipParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			addTeamMembership(
				params: Github.OrgsAddTeamMembershipParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			addTeamRepo(
				params: Github.OrgsAddTeamRepoParams,
				callback?: Github.Callback<
					Github.Response<Github.OrgsAddTeamRepoResponse>
					>
			): Promise<Github.Response<Github.OrgsAddTeamRepoResponse>>;
			blockUser(
				params: Github.OrgsBlockUserParams,
				callback?: Github.Callback<Github.Response<Github.OrgsBlockUserResponse>>
			): Promise<Github.Response<Github.OrgsBlockUserResponse>>;
			checkBlockedUser(
				params: Github.OrgsCheckBlockedUserParams,
				callback?: Github.Callback<
					Github.Response<Github.OrgsCheckBlockedUserResponse>
					>
			): Promise<Github.Response<Github.OrgsCheckBlockedUserResponse>>;
			checkMembership(
				params: Github.OrgsCheckMembershipParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			checkPublicMembership(
				params: Github.OrgsCheckPublicMembershipParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			checkTeamRepo(
				params: Github.OrgsCheckTeamRepoParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			concealMembership(
				params: Github.OrgsConcealMembershipParams,
				callback?: Github.Callback<
					Github.Response<Github.OrgsConcealMembershipResponse>
					>
			): Promise<Github.Response<Github.OrgsConcealMembershipResponse>>;
			convertMemberToOutsideCollaborator(
				params: Github.OrgsConvertMemberToOutsideCollaboratorParams,
				callback?: Github.Callback<
					Github.Response<Github.OrgsConvertMemberToOutsideCollaboratorResponse>
					>
			): Promise<
				Github.Response<Github.OrgsConvertMemberToOutsideCollaboratorResponse>
				>;
			createHook(
				params: Github.OrgsCreateHookParams,
				callback?: Github.Callback<Github.Response<Github.OrgsCreateHookResponse>>
			): Promise<Github.Response<Github.OrgsCreateHookResponse>>;
			createInvitation(
				params: Github.OrgsCreateInvitationParams,
				callback?: Github.Callback<
					Github.Response<Github.OrgsCreateInvitationResponse>
					>
			): Promise<Github.Response<Github.OrgsCreateInvitationResponse>>;
			createTeam(
				params: Github.OrgsCreateTeamParams,
				callback?: Github.Callback<Github.Response<Github.OrgsCreateTeamResponse>>
			): Promise<Github.Response<Github.OrgsCreateTeamResponse>>;
			deleteHook(
				params: Github.OrgsDeleteHookParams,
				callback?: Github.Callback<Github.Response<Github.OrgsDeleteHookResponse>>
			): Promise<Github.Response<Github.OrgsDeleteHookResponse>>;
			deleteTeam(
				params: Github.OrgsDeleteTeamParams,
				callback?: Github.Callback<Github.Response<Github.OrgsDeleteTeamResponse>>
			): Promise<Github.Response<Github.OrgsDeleteTeamResponse>>;
			deleteTeamRepo(
				params: Github.OrgsDeleteTeamRepoParams,
				callback?: Github.Callback<
					Github.Response<Github.OrgsDeleteTeamRepoResponse>
					>
			): Promise<Github.Response<Github.OrgsDeleteTeamRepoResponse>>;
			editHook(
				params: Github.OrgsEditHookParams,
				callback?: Github.Callback<Github.Response<Github.OrgsEditHookResponse>>
			): Promise<Github.Response<Github.OrgsEditHookResponse>>;
			editTeam(
				params: Github.OrgsEditTeamParams,
				callback?: Github.Callback<Github.Response<Github.OrgsEditTeamResponse>>
			): Promise<Github.Response<Github.OrgsEditTeamResponse>>;
			get(
				params: Github.OrgsGetParams,
				callback?: Github.Callback<Github.Response<Github.OrgsGetResponse>>
			): Promise<Github.Response<Github.OrgsGetResponse>>;
			getAll(
				params: Github.OrgsGetAllParams,
				callback?: Github.Callback<Github.Response<Github.OrgsGetAllResponse>>
			): Promise<Github.Response<Github.OrgsGetAllResponse>>;
			getBlockedUsers(
				params: Github.OrgsGetBlockedUsersParams,
				callback?: Github.Callback<
					Github.Response<Github.OrgsGetBlockedUsersResponse>
					>
			): Promise<Github.Response<Github.OrgsGetBlockedUsersResponse>>;
			getChildTeams(
				params: Github.OrgsGetChildTeamsParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getForUser(
				params: Github.OrgsGetForUserParams,
				callback?: Github.Callback<Github.Response<Github.OrgsGetForUserResponse>>
			): Promise<Github.Response<Github.OrgsGetForUserResponse>>;
			getHook(
				params: Github.OrgsGetHookParams,
				callback?: Github.Callback<Github.Response<Github.OrgsGetHookResponse>>
			): Promise<Github.Response<Github.OrgsGetHookResponse>>;
			getHooks(
				params: Github.OrgsGetHooksParams,
				callback?: Github.Callback<Github.Response<Github.OrgsGetHooksResponse>>
			): Promise<Github.Response<Github.OrgsGetHooksResponse>>;
			getInvitationTeams(
				params: Github.OrgsGetInvitationTeamsParams,
				callback?: Github.Callback<
					Github.Response<Github.OrgsGetInvitationTeamsResponse>
					>
			): Promise<Github.Response<Github.OrgsGetInvitationTeamsResponse>>;
			getMembers(
				params: Github.OrgsGetMembersParams,
				callback?: Github.Callback<Github.Response<Github.OrgsGetMembersResponse>>
			): Promise<Github.Response<Github.OrgsGetMembersResponse>>;
			getOrgMembership(
				params: Github.OrgsGetOrgMembershipParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getOutsideCollaborators(
				params: Github.OrgsGetOutsideCollaboratorsParams,
				callback?: Github.Callback<
					Github.Response<Github.OrgsGetOutsideCollaboratorsResponse>
					>
			): Promise<Github.Response<Github.OrgsGetOutsideCollaboratorsResponse>>;
			getPendingOrgInvites(
				params: Github.OrgsGetPendingOrgInvitesParams,
				callback?: Github.Callback<
					Github.Response<Github.OrgsGetPendingOrgInvitesResponse>
					>
			): Promise<Github.Response<Github.OrgsGetPendingOrgInvitesResponse>>;
			getPendingTeamInvites(
				params: Github.OrgsGetPendingTeamInvitesParams,
				callback?: Github.Callback<
					Github.Response<Github.OrgsGetPendingTeamInvitesResponse>
					>
			): Promise<Github.Response<Github.OrgsGetPendingTeamInvitesResponse>>;
			getPublicMembers(
				params: Github.OrgsGetPublicMembersParams,
				callback?: Github.Callback<
					Github.Response<Github.OrgsGetPublicMembersResponse>
					>
			): Promise<Github.Response<Github.OrgsGetPublicMembersResponse>>;
			getTeam(
				params: Github.OrgsGetTeamParams,
				callback?: Github.Callback<Github.Response<Github.OrgsGetTeamResponse>>
			): Promise<Github.Response<Github.OrgsGetTeamResponse>>;
			getTeamMembers(
				params: Github.OrgsGetTeamMembersParams,
				callback?: Github.Callback<
					Github.Response<Github.OrgsGetTeamMembersResponse>
					>
			): Promise<Github.Response<Github.OrgsGetTeamMembersResponse>>;
			getTeamMembership(
				params: Github.OrgsGetTeamMembershipParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getTeamRepos(
				params: Github.OrgsGetTeamReposParams,
				callback?: Github.Callback<
					Github.Response<Github.OrgsGetTeamReposResponse>
					>
			): Promise<Github.Response<Github.OrgsGetTeamReposResponse>>;
			getTeams(
				params: Github.OrgsGetTeamsParams,
				callback?: Github.Callback<Github.Response<Github.OrgsGetTeamsResponse>>
			): Promise<Github.Response<Github.OrgsGetTeamsResponse>>;
			pingHook(
				params: Github.OrgsPingHookParams,
				callback?: Github.Callback<Github.Response<Github.OrgsPingHookResponse>>
			): Promise<Github.Response<Github.OrgsPingHookResponse>>;
			publicizeMembership(
				params: Github.OrgsPublicizeMembershipParams,
				callback?: Github.Callback<
					Github.Response<Github.OrgsPublicizeMembershipResponse>
					>
			): Promise<Github.Response<Github.OrgsPublicizeMembershipResponse>>;
			removeMember(
				params: Github.OrgsRemoveMemberParams,
				callback?: Github.Callback<
					Github.Response<Github.OrgsRemoveMemberResponse>
					>
			): Promise<Github.Response<Github.OrgsRemoveMemberResponse>>;
			removeOrgMembership(
				params: Github.OrgsRemoveOrgMembershipParams,
				callback?: Github.Callback<
					Github.Response<Github.OrgsRemoveOrgMembershipResponse>
					>
			): Promise<Github.Response<Github.OrgsRemoveOrgMembershipResponse>>;
			removeOutsideCollaborator(
				params: Github.OrgsRemoveOutsideCollaboratorParams,
				callback?: Github.Callback<
					Github.Response<Github.OrgsRemoveOutsideCollaboratorResponse>
					>
			): Promise<Github.Response<Github.OrgsRemoveOutsideCollaboratorResponse>>;
			removeTeamMembership(
				params: Github.OrgsRemoveTeamMembershipParams,
				callback?: Github.Callback<
					Github.Response<Github.OrgsRemoveTeamMembershipResponse>
					>
			): Promise<Github.Response<Github.OrgsRemoveTeamMembershipResponse>>;
			unblockUser(
				params: Github.OrgsUnblockUserParams,
				callback?: Github.Callback<
					Github.Response<Github.OrgsUnblockUserResponse>
					>
			): Promise<Github.Response<Github.OrgsUnblockUserResponse>>;
			update(
				params: Github.OrgsUpdateParams,
				callback?: Github.Callback<Github.Response<Github.OrgsUpdateResponse>>
			): Promise<Github.Response<Github.OrgsUpdateResponse>>;
		};
		projects: {
			addCollaborator(
				params: Github.ProjectsAddCollaboratorParams,
				callback?: Github.Callback<
					Github.Response<Github.ProjectsAddCollaboratorResponse>
					>
			): Promise<Github.Response<Github.ProjectsAddCollaboratorResponse>>;
			createOrgProject(
				params: Github.ProjectsCreateOrgProjectParams,
				callback?: Github.Callback<
					Github.Response<Github.ProjectsCreateOrgProjectResponse>
					>
			): Promise<Github.Response<Github.ProjectsCreateOrgProjectResponse>>;
			createProjectCard(
				params: Github.ProjectsCreateProjectCardParams,
				callback?: Github.Callback<
					Github.Response<Github.ProjectsCreateProjectCardResponse>
					>
			): Promise<Github.Response<Github.ProjectsCreateProjectCardResponse>>;
			createProjectColumn(
				params: Github.ProjectsCreateProjectColumnParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			createRepoProject(
				params: Github.ProjectsCreateRepoProjectParams,
				callback?: Github.Callback<
					Github.Response<Github.ProjectsCreateRepoProjectResponse>
					>
			): Promise<Github.Response<Github.ProjectsCreateRepoProjectResponse>>;
			deleteProject(
				params: Github.ProjectsDeleteProjectParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			deleteProjectCard(
				params: Github.ProjectsDeleteProjectCardParams,
				callback?: Github.Callback<
					Github.Response<Github.ProjectsDeleteProjectCardResponse>
					>
			): Promise<Github.Response<Github.ProjectsDeleteProjectCardResponse>>;
			deleteProjectColumn(
				params: Github.ProjectsDeleteProjectColumnParams,
				callback?: Github.Callback<
					Github.Response<Github.ProjectsDeleteProjectColumnResponse>
					>
			): Promise<Github.Response<Github.ProjectsDeleteProjectColumnResponse>>;
			getCollaborators(
				params: Github.ProjectsGetCollaboratorsParams,
				callback?: Github.Callback<
					Github.Response<Github.ProjectsGetCollaboratorsResponse>
					>
			): Promise<Github.Response<Github.ProjectsGetCollaboratorsResponse>>;
			getOrgProjects(
				params: Github.ProjectsGetOrgProjectsParams,
				callback?: Github.Callback<
					Github.Response<Github.ProjectsGetOrgProjectsResponse>
					>
			): Promise<Github.Response<Github.ProjectsGetOrgProjectsResponse>>;
			getProject(
				params: Github.ProjectsGetProjectParams,
				callback?: Github.Callback<
					Github.Response<Github.ProjectsGetProjectResponse>
					>
			): Promise<Github.Response<Github.ProjectsGetProjectResponse>>;
			getProjectCard(
				params: Github.ProjectsGetProjectCardParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getProjectCards(
				params: Github.ProjectsGetProjectCardsParams,
				callback?: Github.Callback<
					Github.Response<Github.ProjectsGetProjectCardsResponse>
					>
			): Promise<Github.Response<Github.ProjectsGetProjectCardsResponse>>;
			getProjectColumn(
				params: Github.ProjectsGetProjectColumnParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getProjectColumns(
				params: Github.ProjectsGetProjectColumnsParams,
				callback?: Github.Callback<
					Github.Response<Github.ProjectsGetProjectColumnsResponse>
					>
			): Promise<Github.Response<Github.ProjectsGetProjectColumnsResponse>>;
			getRepoProjects(
				params: Github.ProjectsGetRepoProjectsParams,
				callback?: Github.Callback<
					Github.Response<Github.ProjectsGetRepoProjectsResponse>
					>
			): Promise<Github.Response<Github.ProjectsGetRepoProjectsResponse>>;
			getUserPermissionLevel(
				params: Github.ProjectsGetUserPermissionLevelParams,
				callback?: Github.Callback<
					Github.Response<Github.ProjectsGetUserPermissionLevelResponse>
					>
			): Promise<Github.Response<Github.ProjectsGetUserPermissionLevelResponse>>;
			moveProjectCard(
				params: Github.ProjectsMoveProjectCardParams,
				callback?: Github.Callback<
					Github.Response<Github.ProjectsMoveProjectCardResponse>
					>
			): Promise<Github.Response<Github.ProjectsMoveProjectCardResponse>>;
			moveProjectColumn(
				params: Github.ProjectsMoveProjectColumnParams,
				callback?: Github.Callback<
					Github.Response<Github.ProjectsMoveProjectColumnResponse>
					>
			): Promise<Github.Response<Github.ProjectsMoveProjectColumnResponse>>;
			removeCollaborator(
				params: Github.ProjectsRemoveCollaboratorParams,
				callback?: Github.Callback<
					Github.Response<Github.ProjectsRemoveCollaboratorResponse>
					>
			): Promise<Github.Response<Github.ProjectsRemoveCollaboratorResponse>>;
			updateProject(
				params: Github.ProjectsUpdateProjectParams,
				callback?: Github.Callback<
					Github.Response<Github.ProjectsUpdateProjectResponse>
					>
			): Promise<Github.Response<Github.ProjectsUpdateProjectResponse>>;
			updateProjectCard(
				params: Github.ProjectsUpdateProjectCardParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			updateProjectColumn(
				params: Github.ProjectsUpdateProjectColumnParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
		};
		pullRequests: {
			checkMerged(
				params: Github.PullRequestsCheckMergedParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			create(
				params: Github.PullRequestsCreateParams,
				callback?: Github.Callback<
					Github.Response<Github.PullRequestsCreateResponse>
					>
			): Promise<Github.Response<Github.PullRequestsCreateResponse>>;
			createComment(
				params: Github.PullRequestsCreateCommentParams,
				callback?: Github.Callback<
					Github.Response<Github.PullRequestsCreateCommentResponse>
					>
			): Promise<Github.Response<Github.PullRequestsCreateCommentResponse>>;
			createCommentReply(
				params: Github.PullRequestsCreateCommentReplyParams,
				callback?: Github.Callback<
					Github.Response<Github.PullRequestsCreateCommentReplyResponse>
					>
			): Promise<Github.Response<Github.PullRequestsCreateCommentReplyResponse>>;
			createFromIssue(
				params: Github.PullRequestsCreateFromIssueParams,
				callback?: Github.Callback<
					Github.Response<Github.PullRequestsCreateFromIssueResponse>
					>
			): Promise<Github.Response<Github.PullRequestsCreateFromIssueResponse>>;
			createReview(
				params: Github.PullRequestsCreateReviewParams,
				callback?: Github.Callback<
					Github.Response<Github.PullRequestsCreateReviewResponse>
					>
			): Promise<Github.Response<Github.PullRequestsCreateReviewResponse>>;
			createReviewRequest(
				params: Github.PullRequestsCreateReviewRequestParams,
				callback?: Github.Callback<
					Github.Response<Github.PullRequestsCreateReviewRequestResponse>
					>
			): Promise<Github.Response<Github.PullRequestsCreateReviewRequestResponse>>;
			deleteComment(
				params: Github.PullRequestsDeleteCommentParams,
				callback?: Github.Callback<
					Github.Response<Github.PullRequestsDeleteCommentResponse>
					>
			): Promise<Github.Response<Github.PullRequestsDeleteCommentResponse>>;
			deletePendingReview(
				params: Github.PullRequestsDeletePendingReviewParams,
				callback?: Github.Callback<
					Github.Response<Github.PullRequestsDeletePendingReviewResponse>
					>
			): Promise<Github.Response<Github.PullRequestsDeletePendingReviewResponse>>;
			deleteReviewRequest(
				params: Github.PullRequestsDeleteReviewRequestParams,
				callback?: Github.Callback<
					Github.Response<Github.PullRequestsDeleteReviewRequestResponse>
					>
			): Promise<Github.Response<Github.PullRequestsDeleteReviewRequestResponse>>;
			dismissReview(
				params: Github.PullRequestsDismissReviewParams,
				callback?: Github.Callback<
					Github.Response<Github.PullRequestsDismissReviewResponse>
					>
			): Promise<Github.Response<Github.PullRequestsDismissReviewResponse>>;
			editComment(
				params: Github.PullRequestsEditCommentParams,
				callback?: Github.Callback<
					Github.Response<Github.PullRequestsEditCommentResponse>
					>
			): Promise<Github.Response<Github.PullRequestsEditCommentResponse>>;
			get(
				params: Github.PullRequestsGetParams,
				callback?: Github.Callback<
					Github.Response<Github.PullRequestsGetResponse>
					>
			): Promise<Github.Response<Github.PullRequestsGetResponse>>;
			getAll(
				params: Github.PullRequestsGetAllParams,
				callback?: Github.Callback<
					Github.Response<Github.PullRequestsGetAllResponse>
					>
			): Promise<Github.Response<Github.PullRequestsGetAllResponse>>;
			getComment(
				params: Github.PullRequestsGetCommentParams,
				callback?: Github.Callback<
					Github.Response<Github.PullRequestsGetCommentResponse>
					>
			): Promise<Github.Response<Github.PullRequestsGetCommentResponse>>;
			getComments(
				params: Github.PullRequestsGetCommentsParams,
				callback?: Github.Callback<
					Github.Response<Github.PullRequestsGetCommentsResponse>
					>
			): Promise<Github.Response<Github.PullRequestsGetCommentsResponse>>;
			getCommentsForRepo(
				params: Github.PullRequestsGetCommentsForRepoParams,
				callback?: Github.Callback<
					Github.Response<Github.PullRequestsGetCommentsForRepoResponse>
					>
			): Promise<Github.Response<Github.PullRequestsGetCommentsForRepoResponse>>;
			getCommits(
				params: Github.PullRequestsGetCommitsParams,
				callback?: Github.Callback<
					Github.Response<Github.PullRequestsGetCommitsResponse>
					>
			): Promise<Github.Response<Github.PullRequestsGetCommitsResponse>>;
			getFiles(
				params: Github.PullRequestsGetFilesParams,
				callback?: Github.Callback<
					Github.Response<Github.PullRequestsGetFilesResponse>
					>
			): Promise<Github.Response<Github.PullRequestsGetFilesResponse>>;
			getReview(
				params: Github.PullRequestsGetReviewParams,
				callback?: Github.Callback<
					Github.Response<Github.PullRequestsGetReviewResponse>
					>
			): Promise<Github.Response<Github.PullRequestsGetReviewResponse>>;
			getReviewComments(
				params: Github.PullRequestsGetReviewCommentsParams,
				callback?: Github.Callback<
					Github.Response<Github.PullRequestsGetReviewCommentsResponse>
					>
			): Promise<Github.Response<Github.PullRequestsGetReviewCommentsResponse>>;
			getReviewRequests(
				params: Github.PullRequestsGetReviewRequestsParams,
				callback?: Github.Callback<
					Github.Response<Github.PullRequestsGetReviewRequestsResponse>
					>
			): Promise<Github.Response<Github.PullRequestsGetReviewRequestsResponse>>;
			getReviews(
				params: Github.PullRequestsGetReviewsParams,
				callback?: Github.Callback<
					Github.Response<Github.PullRequestsGetReviewsResponse>
					>
			): Promise<Github.Response<Github.PullRequestsGetReviewsResponse>>;
			merge(
				params: Github.PullRequestsMergeParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			submitReview(
				params: Github.PullRequestsSubmitReviewParams,
				callback?: Github.Callback<
					Github.Response<Github.PullRequestsSubmitReviewResponse>
					>
			): Promise<Github.Response<Github.PullRequestsSubmitReviewResponse>>;
			update(
				params: Github.PullRequestsUpdateParams,
				callback?: Github.Callback<
					Github.Response<Github.PullRequestsUpdateResponse>
					>
			): Promise<Github.Response<Github.PullRequestsUpdateResponse>>;
		};
		reactions: {
			createForCommitComment(
				params: Github.ReactionsCreateForCommitCommentParams,
				callback?: Github.Callback<
					Github.Response<Github.ReactionsCreateForCommitCommentResponse>
					>
			): Promise<Github.Response<Github.ReactionsCreateForCommitCommentResponse>>;
			createForIssue(
				params: Github.ReactionsCreateForIssueParams,
				callback?: Github.Callback<
					Github.Response<Github.ReactionsCreateForIssueResponse>
					>
			): Promise<Github.Response<Github.ReactionsCreateForIssueResponse>>;
			createForIssueComment(
				params: Github.ReactionsCreateForIssueCommentParams,
				callback?: Github.Callback<
					Github.Response<Github.ReactionsCreateForIssueCommentResponse>
					>
			): Promise<Github.Response<Github.ReactionsCreateForIssueCommentResponse>>;
			createForPullRequestReviewComment(
				params: Github.ReactionsCreateForPullRequestReviewCommentParams,
				callback?: Github.Callback<
					Github.Response<
						Github.ReactionsCreateForPullRequestReviewCommentResponse
						>
					>
			): Promise<
				Github.Response<Github.ReactionsCreateForPullRequestReviewCommentResponse>
				>;
			createForTeamDiscussion(
				params: Github.ReactionsCreateForTeamDiscussionParams,
				callback?: Github.Callback<
					Github.Response<Github.ReactionsCreateForTeamDiscussionResponse>
					>
			): Promise<
				Github.Response<Github.ReactionsCreateForTeamDiscussionResponse>
				>;
			createForTeamDiscussionComment(
				params: Github.ReactionsCreateForTeamDiscussionCommentParams,
				callback?: Github.Callback<
					Github.Response<Github.ReactionsCreateForTeamDiscussionCommentResponse>
					>
			): Promise<
				Github.Response<Github.ReactionsCreateForTeamDiscussionCommentResponse>
				>;
			delete(
				params: Github.ReactionsDeleteParams,
				callback?: Github.Callback<
					Github.Response<Github.ReactionsDeleteResponse>
					>
			): Promise<Github.Response<Github.ReactionsDeleteResponse>>;
			getForCommitComment(
				params: Github.ReactionsGetForCommitCommentParams,
				callback?: Github.Callback<
					Github.Response<Github.ReactionsGetForCommitCommentResponse>
					>
			): Promise<Github.Response<Github.ReactionsGetForCommitCommentResponse>>;
			getForIssue(
				params: Github.ReactionsGetForIssueParams,
				callback?: Github.Callback<
					Github.Response<Github.ReactionsGetForIssueResponse>
					>
			): Promise<Github.Response<Github.ReactionsGetForIssueResponse>>;
			getForIssueComment(
				params: Github.ReactionsGetForIssueCommentParams,
				callback?: Github.Callback<
					Github.Response<Github.ReactionsGetForIssueCommentResponse>
					>
			): Promise<Github.Response<Github.ReactionsGetForIssueCommentResponse>>;
			getForPullRequestReviewComment(
				params: Github.ReactionsGetForPullRequestReviewCommentParams,
				callback?: Github.Callback<
					Github.Response<Github.ReactionsGetForPullRequestReviewCommentResponse>
					>
			): Promise<
				Github.Response<Github.ReactionsGetForPullRequestReviewCommentResponse>
				>;
			getForTeamDiscussion(
				params: Github.ReactionsGetForTeamDiscussionParams,
				callback?: Github.Callback<
					Github.Response<Github.ReactionsGetForTeamDiscussionResponse>
					>
			): Promise<Github.Response<Github.ReactionsGetForTeamDiscussionResponse>>;
			getForTeamDiscussionComment(
				params: Github.ReactionsGetForTeamDiscussionCommentParams,
				callback?: Github.Callback<
					Github.Response<Github.ReactionsGetForTeamDiscussionCommentResponse>
					>
			): Promise<
				Github.Response<Github.ReactionsGetForTeamDiscussionCommentResponse>
				>;
		};
		repos: {
			addCollaborator(
				params: Github.ReposAddCollaboratorParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			addDeployKey(
				params: Github.ReposAddDeployKeyParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposAddDeployKeyResponse>
					>
			): Promise<Github.Response<Github.ReposAddDeployKeyResponse>>;
			addProtectedBranchAdminEnforcement(
				params: Github.ReposAddProtectedBranchAdminEnforcementParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposAddProtectedBranchAdminEnforcementResponse>
					>
			): Promise<
				Github.Response<Github.ReposAddProtectedBranchAdminEnforcementResponse>
				>;
			addProtectedBranchRequiredSignatures(
				params: Github.ReposAddProtectedBranchRequiredSignaturesParams,
				callback?: Github.Callback<
					Github.Response<
						Github.ReposAddProtectedBranchRequiredSignaturesResponse
						>
					>
			): Promise<
				Github.Response<Github.ReposAddProtectedBranchRequiredSignaturesResponse>
				>;
			addProtectedBranchRequiredStatusChecksContexts(
				params: Github.ReposAddProtectedBranchRequiredStatusChecksContextsParams,
				callback?: Github.Callback<
					Github.Response<
						Github.ReposAddProtectedBranchRequiredStatusChecksContextsResponse
						>
					>
			): Promise<
				Github.Response<
					Github.ReposAddProtectedBranchRequiredStatusChecksContextsResponse
					>
				>;
			addProtectedBranchTeamRestrictions(
				params: Github.ReposAddProtectedBranchTeamRestrictionsParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposAddProtectedBranchTeamRestrictionsResponse>
					>
			): Promise<
				Github.Response<Github.ReposAddProtectedBranchTeamRestrictionsResponse>
				>;
			addProtectedBranchUserRestrictions(
				params: Github.ReposAddProtectedBranchUserRestrictionsParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposAddProtectedBranchUserRestrictionsResponse>
					>
			): Promise<
				Github.Response<Github.ReposAddProtectedBranchUserRestrictionsResponse>
				>;
			checkCollaborator(
				params: Github.ReposCheckCollaboratorParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			compareCommits(
				params: Github.ReposCompareCommitsParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposCompareCommitsResponse>
					>
			): Promise<Github.Response<Github.ReposCompareCommitsResponse>>;
			create(
				params: Github.ReposCreateParams,
				callback?: Github.Callback<Github.Response<Github.ReposCreateResponse>>
			): Promise<Github.Response<Github.ReposCreateResponse>>;
			createCommitComment(
				params: Github.ReposCreateCommitCommentParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposCreateCommitCommentResponse>
					>
			): Promise<Github.Response<Github.ReposCreateCommitCommentResponse>>;
			createDeployment(
				params: Github.ReposCreateDeploymentParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			createDeploymentStatus(
				params: Github.ReposCreateDeploymentStatusParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposCreateDeploymentStatusResponse>
					>
			): Promise<Github.Response<Github.ReposCreateDeploymentStatusResponse>>;
			createFile(
				params: Github.ReposCreateFileParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposCreateFileResponse>
					>
			): Promise<Github.Response<Github.ReposCreateFileResponse>>;
			createForOrg(
				params: Github.ReposCreateForOrgParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposCreateForOrgResponse>
					>
			): Promise<Github.Response<Github.ReposCreateForOrgResponse>>;
			createHook(
				params: Github.ReposCreateHookParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposCreateHookResponse>
					>
			): Promise<Github.Response<Github.ReposCreateHookResponse>>;
			createRelease(
				params: Github.ReposCreateReleaseParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposCreateReleaseResponse>
					>
			): Promise<Github.Response<Github.ReposCreateReleaseResponse>>;
			createStatus(
				params: Github.ReposCreateStatusParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposCreateStatusResponse>
					>
			): Promise<Github.Response<Github.ReposCreateStatusResponse>>;
			delete(
				params: Github.ReposDeleteParams,
				callback?: Github.Callback<Github.Response<Github.ReposDeleteResponse>>
			): Promise<Github.Response<Github.ReposDeleteResponse>>;
			deleteAsset(
				params: Github.ReposDeleteAssetParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposDeleteAssetResponse>
					>
			): Promise<Github.Response<Github.ReposDeleteAssetResponse>>;
			deleteCommitComment(
				params: Github.ReposDeleteCommitCommentParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposDeleteCommitCommentResponse>
					>
			): Promise<Github.Response<Github.ReposDeleteCommitCommentResponse>>;
			deleteDeployKey(
				params: Github.ReposDeleteDeployKeyParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposDeleteDeployKeyResponse>
					>
			): Promise<Github.Response<Github.ReposDeleteDeployKeyResponse>>;
			deleteDownload(
				params: Github.ReposDeleteDownloadParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposDeleteDownloadResponse>
					>
			): Promise<Github.Response<Github.ReposDeleteDownloadResponse>>;
			deleteFile(
				params: Github.ReposDeleteFileParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposDeleteFileResponse>
					>
			): Promise<Github.Response<Github.ReposDeleteFileResponse>>;
			deleteHook(
				params: Github.ReposDeleteHookParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposDeleteHookResponse>
					>
			): Promise<Github.Response<Github.ReposDeleteHookResponse>>;
			deleteInvite(
				params: Github.ReposDeleteInviteParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposDeleteInviteResponse>
					>
			): Promise<Github.Response<Github.ReposDeleteInviteResponse>>;
			deleteRelease(
				params: Github.ReposDeleteReleaseParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposDeleteReleaseResponse>
					>
			): Promise<Github.Response<Github.ReposDeleteReleaseResponse>>;
			edit(
				params: Github.ReposEditParams,
				callback?: Github.Callback<Github.Response<Github.ReposEditResponse>>
			): Promise<Github.Response<Github.ReposEditResponse>>;
			editAsset(
				params: Github.ReposEditAssetParams,
				callback?: Github.Callback<Github.Response<Github.ReposEditAssetResponse>>
			): Promise<Github.Response<Github.ReposEditAssetResponse>>;
			editHook(
				params: Github.ReposEditHookParams,
				callback?: Github.Callback<Github.Response<Github.ReposEditHookResponse>>
			): Promise<Github.Response<Github.ReposEditHookResponse>>;
			editRelease(
				params: Github.ReposEditReleaseParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposEditReleaseResponse>
					>
			): Promise<Github.Response<Github.ReposEditReleaseResponse>>;
			fork(
				params: Github.ReposForkParams,
				callback?: Github.Callback<Github.Response<Github.ReposForkResponse>>
			): Promise<Github.Response<Github.ReposForkResponse>>;
			get(
				params: Github.ReposGetParams,
				callback?: Github.Callback<Github.Response<Github.ReposGetResponse>>
			): Promise<Github.Response<Github.ReposGetResponse>>;
			getAll(
				params: Github.ReposGetAllParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getAllCommitComments(
				params: Github.ReposGetAllCommitCommentsParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetAllCommitCommentsResponse>
					>
			): Promise<Github.Response<Github.ReposGetAllCommitCommentsResponse>>;
			getArchiveLink(
				params: Github.ReposGetArchiveLinkParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetArchiveLinkResponse>
					>
			): Promise<Github.Response<Github.ReposGetArchiveLinkResponse>>;
			getAsset(
				params: Github.ReposGetAssetParams,
				callback?: Github.Callback<Github.Response<Github.ReposGetAssetResponse>>
			): Promise<Github.Response<Github.ReposGetAssetResponse>>;
			getAssets(
				params: Github.ReposGetAssetsParams,
				callback?: Github.Callback<Github.Response<Github.ReposGetAssetsResponse>>
			): Promise<Github.Response<Github.ReposGetAssetsResponse>>;
			getBranch(
				params: Github.ReposGetBranchParams,
				callback?: Github.Callback<Github.Response<Github.ReposGetBranchResponse>>
			): Promise<Github.Response<Github.ReposGetBranchResponse>>;
			getBranchProtection(
				params: Github.ReposGetBranchProtectionParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetBranchProtectionResponse>
					>
			): Promise<Github.Response<Github.ReposGetBranchProtectionResponse>>;
			getBranches(
				params: Github.ReposGetBranchesParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetBranchesResponse>
					>
			): Promise<Github.Response<Github.ReposGetBranchesResponse>>;
			getClones(
				params: Github.ReposGetClonesParams,
				callback?: Github.Callback<Github.Response<Github.ReposGetClonesResponse>>
			): Promise<Github.Response<Github.ReposGetClonesResponse>>;
			getCollaborators(
				params: Github.ReposGetCollaboratorsParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetCollaboratorsResponse>
					>
			): Promise<Github.Response<Github.ReposGetCollaboratorsResponse>>;
			getCombinedStatusForRef(
				params: Github.ReposGetCombinedStatusForRefParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetCombinedStatusForRefResponse>
					>
			): Promise<Github.Response<Github.ReposGetCombinedStatusForRefResponse>>;
			getCommit(
				params: Github.ReposGetCommitParams,
				callback?: Github.Callback<Github.Response<Github.ReposGetCommitResponse>>
			): Promise<Github.Response<Github.ReposGetCommitResponse>>;
			getCommitComment(
				params: Github.ReposGetCommitCommentParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetCommitCommentResponse>
					>
			): Promise<Github.Response<Github.ReposGetCommitCommentResponse>>;
			getCommitComments(
				params: Github.ReposGetCommitCommentsParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetCommitCommentsResponse>
					>
			): Promise<Github.Response<Github.ReposGetCommitCommentsResponse>>;
			getCommits(
				params: Github.ReposGetCommitsParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetCommitsResponse>
					>
			): Promise<Github.Response<Github.ReposGetCommitsResponse>>;
			getCommunityProfileMetrics(
				params: Github.ReposGetCommunityProfileMetricsParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetCommunityProfileMetricsResponse>
					>
			): Promise<Github.Response<Github.ReposGetCommunityProfileMetricsResponse>>;
			getContent(
				params: Github.ReposGetContentParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getContributors(
				params: Github.ReposGetContributorsParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getDeployKey(
				params: Github.ReposGetDeployKeyParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetDeployKeyResponse>
					>
			): Promise<Github.Response<Github.ReposGetDeployKeyResponse>>;
			getDeployKeys(
				params: Github.ReposGetDeployKeysParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetDeployKeysResponse>
					>
			): Promise<Github.Response<Github.ReposGetDeployKeysResponse>>;
			getDeployment(
				params: Github.ReposGetDeploymentParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetDeploymentResponse>
					>
			): Promise<Github.Response<Github.ReposGetDeploymentResponse>>;
			getDeploymentStatus(
				params: Github.ReposGetDeploymentStatusParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetDeploymentStatusResponse>
					>
			): Promise<Github.Response<Github.ReposGetDeploymentStatusResponse>>;
			getDeploymentStatuses(
				params: Github.ReposGetDeploymentStatusesParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetDeploymentStatusesResponse>
					>
			): Promise<Github.Response<Github.ReposGetDeploymentStatusesResponse>>;
			getDeployments(
				params: Github.ReposGetDeploymentsParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetDeploymentsResponse>
					>
			): Promise<Github.Response<Github.ReposGetDeploymentsResponse>>;
			getDownload(
				params: Github.ReposGetDownloadParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetDownloadResponse>
					>
			): Promise<Github.Response<Github.ReposGetDownloadResponse>>;
			getDownloads(
				params: Github.ReposGetDownloadsParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetDownloadsResponse>
					>
			): Promise<Github.Response<Github.ReposGetDownloadsResponse>>;
			getForOrg(
				params: Github.ReposGetForOrgParams,
				callback?: Github.Callback<Github.Response<Github.ReposGetForOrgResponse>>
			): Promise<Github.Response<Github.ReposGetForOrgResponse>>;
			getForUser(
				params: Github.ReposGetForUserParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getForks(
				params: Github.ReposGetForksParams,
				callback?: Github.Callback<Github.Response<Github.ReposGetForksResponse>>
			): Promise<Github.Response<Github.ReposGetForksResponse>>;
			getHook(
				params: Github.ReposGetHookParams,
				callback?: Github.Callback<Github.Response<Github.ReposGetHookResponse>>
			): Promise<Github.Response<Github.ReposGetHookResponse>>;
			getHooks(
				params: Github.ReposGetHooksParams,
				callback?: Github.Callback<Github.Response<Github.ReposGetHooksResponse>>
			): Promise<Github.Response<Github.ReposGetHooksResponse>>;
			getInvites(
				params: Github.ReposGetInvitesParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetInvitesResponse>
					>
			): Promise<Github.Response<Github.ReposGetInvitesResponse>>;
			getLanguages(
				params: Github.ReposGetLanguagesParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetLanguagesResponse>
					>
			): Promise<Github.Response<Github.ReposGetLanguagesResponse>>;
			getLatestPagesBuild(
				params: Github.ReposGetLatestPagesBuildParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getLatestRelease(
				params: Github.ReposGetLatestReleaseParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetLatestReleaseResponse>
					>
			): Promise<Github.Response<Github.ReposGetLatestReleaseResponse>>;
			getPages(
				params: Github.ReposGetPagesParams,
				callback?: Github.Callback<Github.Response<Github.ReposGetPagesResponse>>
			): Promise<Github.Response<Github.ReposGetPagesResponse>>;
			getPagesBuild(
				params: Github.ReposGetPagesBuildParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getPagesBuilds(
				params: Github.ReposGetPagesBuildsParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getPaths(
				params: Github.ReposGetPathsParams,
				callback?: Github.Callback<Github.Response<Github.ReposGetPathsResponse>>
			): Promise<Github.Response<Github.ReposGetPathsResponse>>;
			getProtectedBranchAdminEnforcement(
				params: Github.ReposGetProtectedBranchAdminEnforcementParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getProtectedBranchPullRequestReviewEnforcement(
				params: Github.ReposGetProtectedBranchPullRequestReviewEnforcementParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getProtectedBranchRequiredSignatures(
				params: Github.ReposGetProtectedBranchRequiredSignaturesParams,
				callback?: Github.Callback<
					Github.Response<
						Github.ReposGetProtectedBranchRequiredSignaturesResponse
						>
					>
			): Promise<
				Github.Response<Github.ReposGetProtectedBranchRequiredSignaturesResponse>
				>;
			getProtectedBranchRequiredStatusChecks(
				params: Github.ReposGetProtectedBranchRequiredStatusChecksParams,
				callback?: Github.Callback<
					Github.Response<
						Github.ReposGetProtectedBranchRequiredStatusChecksResponse
						>
					>
			): Promise<
				Github.Response<
					Github.ReposGetProtectedBranchRequiredStatusChecksResponse
					>
				>;
			getProtectedBranchRequiredStatusChecksContexts(
				params: Github.ReposGetProtectedBranchRequiredStatusChecksContextsParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getProtectedBranchRestrictions(
				params: Github.ReposGetProtectedBranchRestrictionsParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getProtectedBranchTeamRestrictions(
				params: Github.ReposGetProtectedBranchTeamRestrictionsParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetProtectedBranchTeamRestrictionsResponse>
					>
			): Promise<
				Github.Response<Github.ReposGetProtectedBranchTeamRestrictionsResponse>
				>;
			getProtectedBranchUserRestrictions(
				params: Github.ReposGetProtectedBranchUserRestrictionsParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getPublic(
				params: Github.ReposGetPublicParams,
				callback?: Github.Callback<Github.Response<Github.ReposGetPublicResponse>>
			): Promise<Github.Response<Github.ReposGetPublicResponse>>;
			getReadme(
				params: Github.ReposGetReadmeParams,
				callback?: Github.Callback<Github.Response<Github.ReposGetReadmeResponse>>
			): Promise<Github.Response<Github.ReposGetReadmeResponse>>;
			getReferrers(
				params: Github.ReposGetReferrersParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetReferrersResponse>
					>
			): Promise<Github.Response<Github.ReposGetReferrersResponse>>;
			getRelease(
				params: Github.ReposGetReleaseParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetReleaseResponse>
					>
			): Promise<Github.Response<Github.ReposGetReleaseResponse>>;
			getReleaseByTag(
				params: Github.ReposGetReleaseByTagParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetReleaseByTagResponse>
					>
			): Promise<Github.Response<Github.ReposGetReleaseByTagResponse>>;
			getReleases(
				params: Github.ReposGetReleasesParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetReleasesResponse>
					>
			): Promise<Github.Response<Github.ReposGetReleasesResponse>>;
			getShaOfCommitRef(
				params: Github.ReposGetShaOfCommitRefParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetShaOfCommitRefResponse>
					>
			): Promise<Github.Response<Github.ReposGetShaOfCommitRefResponse>>;
			getStatsCodeFrequency(
				params: Github.ReposGetStatsCodeFrequencyParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetStatsCodeFrequencyResponse>
					>
			): Promise<Github.Response<Github.ReposGetStatsCodeFrequencyResponse>>;
			getStatsCommitActivity(
				params: Github.ReposGetStatsCommitActivityParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetStatsCommitActivityResponse>
					>
			): Promise<Github.Response<Github.ReposGetStatsCommitActivityResponse>>;
			getStatsContributors(
				params: Github.ReposGetStatsContributorsParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetStatsContributorsResponse>
					>
			): Promise<Github.Response<Github.ReposGetStatsContributorsResponse>>;
			getStatsParticipation(
				params: Github.ReposGetStatsParticipationParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetStatsParticipationResponse>
					>
			): Promise<Github.Response<Github.ReposGetStatsParticipationResponse>>;
			getStatsPunchCard(
				params: Github.ReposGetStatsPunchCardParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetStatsPunchCardResponse>
					>
			): Promise<Github.Response<Github.ReposGetStatsPunchCardResponse>>;
			getStatuses(
				params: Github.ReposGetStatusesParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposGetStatusesResponse>
					>
			): Promise<Github.Response<Github.ReposGetStatusesResponse>>;
			getTags(
				params: Github.ReposGetTagsParams,
				callback?: Github.Callback<Github.Response<Github.ReposGetTagsResponse>>
			): Promise<Github.Response<Github.ReposGetTagsResponse>>;
			getTeams(
				params: Github.ReposGetTeamsParams,
				callback?: Github.Callback<Github.Response<Github.ReposGetTeamsResponse>>
			): Promise<Github.Response<Github.ReposGetTeamsResponse>>;
			getTopics(
				params: Github.ReposGetTopicsParams,
				callback?: Github.Callback<Github.Response<Github.ReposGetTopicsResponse>>
			): Promise<Github.Response<Github.ReposGetTopicsResponse>>;
			getViews(
				params: Github.ReposGetViewsParams,
				callback?: Github.Callback<Github.Response<Github.ReposGetViewsResponse>>
			): Promise<Github.Response<Github.ReposGetViewsResponse>>;
			merge(
				params: Github.ReposMergeParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			pingHook(
				params: Github.ReposPingHookParams,
				callback?: Github.Callback<Github.Response<Github.ReposPingHookResponse>>
			): Promise<Github.Response<Github.ReposPingHookResponse>>;
			removeBranchProtection(
				params: Github.ReposRemoveBranchProtectionParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposRemoveBranchProtectionResponse>
					>
			): Promise<Github.Response<Github.ReposRemoveBranchProtectionResponse>>;
			removeCollaborator(
				params: Github.ReposRemoveCollaboratorParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposRemoveCollaboratorResponse>
					>
			): Promise<Github.Response<Github.ReposRemoveCollaboratorResponse>>;
			removeProtectedBranchAdminEnforcement(
				params: Github.ReposRemoveProtectedBranchAdminEnforcementParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			removeProtectedBranchPullRequestReviewEnforcement(
				params: Github.ReposRemoveProtectedBranchPullRequestReviewEnforcementParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			removeProtectedBranchRequiredSignatures(
				params: Github.ReposRemoveProtectedBranchRequiredSignaturesParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			removeProtectedBranchRequiredStatusChecks(
				params: Github.ReposRemoveProtectedBranchRequiredStatusChecksParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			removeProtectedBranchRequiredStatusChecksContexts(
				params: Github.ReposRemoveProtectedBranchRequiredStatusChecksContextsParams,
				callback?: Github.Callback<
					Github.Response<
						Github.ReposRemoveProtectedBranchRequiredStatusChecksContextsResponse
						>
					>
			): Promise<
				Github.Response<
					Github.ReposRemoveProtectedBranchRequiredStatusChecksContextsResponse
					>
				>;
			removeProtectedBranchRestrictions(
				params: Github.ReposRemoveProtectedBranchRestrictionsParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			removeProtectedBranchTeamRestrictions(
				params: Github.ReposRemoveProtectedBranchTeamRestrictionsParams,
				callback?: Github.Callback<
					Github.Response<
						Github.ReposRemoveProtectedBranchTeamRestrictionsResponse
						>
					>
			): Promise<
				Github.Response<Github.ReposRemoveProtectedBranchTeamRestrictionsResponse>
				>;
			removeProtectedBranchUserRestrictions(
				params: Github.ReposRemoveProtectedBranchUserRestrictionsParams,
				callback?: Github.Callback<
					Github.Response<
						Github.ReposRemoveProtectedBranchUserRestrictionsResponse
						>
					>
			): Promise<
				Github.Response<Github.ReposRemoveProtectedBranchUserRestrictionsResponse>
				>;
			replaceProtectedBranchRequiredStatusChecksContexts(
				params: Github.ReposReplaceProtectedBranchRequiredStatusChecksContextsParams,
				callback?: Github.Callback<
					Github.Response<
						Github.ReposReplaceProtectedBranchRequiredStatusChecksContextsResponse
						>
					>
			): Promise<
				Github.Response<
					Github.ReposReplaceProtectedBranchRequiredStatusChecksContextsResponse
					>
				>;
			replaceProtectedBranchTeamRestrictions(
				params: Github.ReposReplaceProtectedBranchTeamRestrictionsParams,
				callback?: Github.Callback<
					Github.Response<
						Github.ReposReplaceProtectedBranchTeamRestrictionsResponse
						>
					>
			): Promise<
				Github.Response<
					Github.ReposReplaceProtectedBranchTeamRestrictionsResponse
					>
				>;
			replaceProtectedBranchUserRestrictions(
				params: Github.ReposReplaceProtectedBranchUserRestrictionsParams,
				callback?: Github.Callback<
					Github.Response<
						Github.ReposReplaceProtectedBranchUserRestrictionsResponse
						>
					>
			): Promise<
				Github.Response<
					Github.ReposReplaceProtectedBranchUserRestrictionsResponse
					>
				>;
			replaceTopics(
				params: Github.ReposReplaceTopicsParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposReplaceTopicsResponse>
					>
			): Promise<Github.Response<Github.ReposReplaceTopicsResponse>>;
			requestPageBuild(
				params: Github.ReposRequestPageBuildParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposRequestPageBuildResponse>
					>
			): Promise<Github.Response<Github.ReposRequestPageBuildResponse>>;
			reviewUserPermissionLevel(
				params: Github.ReposReviewUserPermissionLevelParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			testHook(
				params: Github.ReposTestHookParams,
				callback?: Github.Callback<Github.Response<Github.ReposTestHookResponse>>
			): Promise<Github.Response<Github.ReposTestHookResponse>>;
			transfer(
				params: Github.ReposTransferParams,
				callback?: Github.Callback<Github.Response<Github.ReposTransferResponse>>
			): Promise<Github.Response<Github.ReposTransferResponse>>;
			updateBranchProtection(
				params: Github.ReposUpdateBranchProtectionParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposUpdateBranchProtectionResponse>
					>
			): Promise<Github.Response<Github.ReposUpdateBranchProtectionResponse>>;
			updateCommitComment(
				params: Github.ReposUpdateCommitCommentParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposUpdateCommitCommentResponse>
					>
			): Promise<Github.Response<Github.ReposUpdateCommitCommentResponse>>;
			updateFile(
				params: Github.ReposUpdateFileParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposUpdateFileResponse>
					>
			): Promise<Github.Response<Github.ReposUpdateFileResponse>>;
			updateInvite(
				params: Github.ReposUpdateInviteParams,
				callback?: Github.Callback<
					Github.Response<Github.ReposUpdateInviteResponse>
					>
			): Promise<Github.Response<Github.ReposUpdateInviteResponse>>;
			updateProtectedBranchPullRequestReviewEnforcement(
				params: Github.ReposUpdateProtectedBranchPullRequestReviewEnforcementParams,
				callback?: Github.Callback<
					Github.Response<
						Github.ReposUpdateProtectedBranchPullRequestReviewEnforcementResponse
						>
					>
			): Promise<
				Github.Response<
					Github.ReposUpdateProtectedBranchPullRequestReviewEnforcementResponse
					>
				>;
			updateProtectedBranchRequiredStatusChecks(
				params: Github.ReposUpdateProtectedBranchRequiredStatusChecksParams,
				callback?: Github.Callback<
					Github.Response<
						Github.ReposUpdateProtectedBranchRequiredStatusChecksResponse
						>
					>
			): Promise<
				Github.Response<
					Github.ReposUpdateProtectedBranchRequiredStatusChecksResponse
					>
				>;
			uploadAsset(
				params: Github.ReposUploadAssetParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
		};
		search: {
			code(
				params: Github.SearchCodeParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			commits(
				params: Github.SearchCommitsParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			issues(
				params: Github.SearchIssuesParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			labels(
				params: Github.SearchLabelsParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			repos(
				params: Github.SearchReposParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			topics(
				params: Github.SearchTopicsParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			users(
				params: Github.SearchUsersParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
		};
		users: {
			acceptRepoInvite(
				params: Github.UsersAcceptRepoInviteParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersAcceptRepoInviteResponse>
					>
			): Promise<Github.Response<Github.UsersAcceptRepoInviteResponse>>;
			addEmails(
				params: Github.UsersAddEmailsParams,
				callback?: Github.Callback<Github.Response<Github.UsersAddEmailsResponse>>
			): Promise<Github.Response<Github.UsersAddEmailsResponse>>;
			addRepoToInstallation(
				params: Github.UsersAddRepoToInstallationParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersAddRepoToInstallationResponse>
					>
			): Promise<Github.Response<Github.UsersAddRepoToInstallationResponse>>;
			blockUser(
				params: Github.UsersBlockUserParams,
				callback?: Github.Callback<Github.Response<Github.UsersBlockUserResponse>>
			): Promise<Github.Response<Github.UsersBlockUserResponse>>;
			checkBlockedUser(
				params: Github.UsersCheckBlockedUserParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersCheckBlockedUserResponse>
					>
			): Promise<Github.Response<Github.UsersCheckBlockedUserResponse>>;
			checkFollowing(
				params: Github.UsersCheckFollowingParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			checkIfOneFollowersOther(
				params: Github.UsersCheckIfOneFollowersOtherParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			createGpgKey(
				params: Github.UsersCreateGpgKeyParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersCreateGpgKeyResponse>
					>
			): Promise<Github.Response<Github.UsersCreateGpgKeyResponse>>;
			createKey(
				params: Github.UsersCreateKeyParams,
				callback?: Github.Callback<Github.Response<Github.UsersCreateKeyResponse>>
			): Promise<Github.Response<Github.UsersCreateKeyResponse>>;
			declineRepoInvite(
				params: Github.UsersDeclineRepoInviteParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersDeclineRepoInviteResponse>
					>
			): Promise<Github.Response<Github.UsersDeclineRepoInviteResponse>>;
			deleteEmails(
				params: Github.UsersDeleteEmailsParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersDeleteEmailsResponse>
					>
			): Promise<Github.Response<Github.UsersDeleteEmailsResponse>>;
			deleteGpgKey(
				params: Github.UsersDeleteGpgKeyParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersDeleteGpgKeyResponse>
					>
			): Promise<Github.Response<Github.UsersDeleteGpgKeyResponse>>;
			deleteKey(
				params: Github.UsersDeleteKeyParams,
				callback?: Github.Callback<Github.Response<Github.UsersDeleteKeyResponse>>
			): Promise<Github.Response<Github.UsersDeleteKeyResponse>>;
			editOrgMembership(
				params: Github.UsersEditOrgMembershipParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersEditOrgMembershipResponse>
					>
			): Promise<Github.Response<Github.UsersEditOrgMembershipResponse>>;
			followUser(
				params: Github.UsersFollowUserParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersFollowUserResponse>
					>
			): Promise<Github.Response<Github.UsersFollowUserResponse>>;
			get(
				params: Github.EmptyParams,
				callback?: Github.Callback<Github.AnyResponse>
			): Promise<Github.AnyResponse>;
			getAll(
				params: Github.UsersGetAllParams,
				callback?: Github.Callback<Github.Response<Github.UsersGetAllResponse>>
			): Promise<Github.Response<Github.UsersGetAllResponse>>;
			getBlockedUsers(
				params: Github.EmptyParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersGetBlockedUsersResponse>
					>
			): Promise<Github.Response<Github.UsersGetBlockedUsersResponse>>;
			getContextForUser(
				params: Github.UsersGetContextForUserParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersGetContextForUserResponse>
					>
			): Promise<Github.Response<Github.UsersGetContextForUserResponse>>;
			getEmails(
				params: Github.UsersGetEmailsParams,
				callback?: Github.Callback<Github.Response<Github.UsersGetEmailsResponse>>
			): Promise<Github.Response<Github.UsersGetEmailsResponse>>;
			getFollowers(
				params: Github.UsersGetFollowersParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersGetFollowersResponse>
					>
			): Promise<Github.Response<Github.UsersGetFollowersResponse>>;
			getFollowersForUser(
				params: Github.UsersGetFollowersForUserParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersGetFollowersForUserResponse>
					>
			): Promise<Github.Response<Github.UsersGetFollowersForUserResponse>>;
			getFollowing(
				params: Github.UsersGetFollowingParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersGetFollowingResponse>
					>
			): Promise<Github.Response<Github.UsersGetFollowingResponse>>;
			getFollowingForUser(
				params: Github.UsersGetFollowingForUserParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersGetFollowingForUserResponse>
					>
			): Promise<Github.Response<Github.UsersGetFollowingForUserResponse>>;
			getForUser(
				params: Github.UsersGetForUserParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersGetForUserResponse>
					>
			): Promise<Github.Response<Github.UsersGetForUserResponse>>;
			getGpgKey(
				params: Github.UsersGetGpgKeyParams,
				callback?: Github.Callback<Github.Response<Github.UsersGetGpgKeyResponse>>
			): Promise<Github.Response<Github.UsersGetGpgKeyResponse>>;
			getGpgKeys(
				params: Github.UsersGetGpgKeysParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersGetGpgKeysResponse>
					>
			): Promise<Github.Response<Github.UsersGetGpgKeysResponse>>;
			getGpgKeysForUser(
				params: Github.UsersGetGpgKeysForUserParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersGetGpgKeysForUserResponse>
					>
			): Promise<Github.Response<Github.UsersGetGpgKeysForUserResponse>>;
			getInstallationRepos(
				params: Github.UsersGetInstallationReposParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersGetInstallationReposResponse>
					>
			): Promise<Github.Response<Github.UsersGetInstallationReposResponse>>;
			getInstallations(
				params: Github.UsersGetInstallationsParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersGetInstallationsResponse>
					>
			): Promise<Github.Response<Github.UsersGetInstallationsResponse>>;
			getKey(
				params: Github.UsersGetKeyParams,
				callback?: Github.Callback<Github.Response<Github.UsersGetKeyResponse>>
			): Promise<Github.Response<Github.UsersGetKeyResponse>>;
			getKeys(
				params: Github.UsersGetKeysParams,
				callback?: Github.Callback<Github.Response<Github.UsersGetKeysResponse>>
			): Promise<Github.Response<Github.UsersGetKeysResponse>>;
			getKeysForUser(
				params: Github.UsersGetKeysForUserParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersGetKeysForUserResponse>
					>
			): Promise<Github.Response<Github.UsersGetKeysForUserResponse>>;
			getMarketplacePurchases(
				params: Github.UsersGetMarketplacePurchasesParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersGetMarketplacePurchasesResponse>
					>
			): Promise<Github.Response<Github.UsersGetMarketplacePurchasesResponse>>;
			getMarketplaceStubbedPurchases(
				params: Github.UsersGetMarketplaceStubbedPurchasesParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersGetMarketplaceStubbedPurchasesResponse>
					>
			): Promise<
				Github.Response<Github.UsersGetMarketplaceStubbedPurchasesResponse>
				>;
			getOrgMembership(
				params: Github.UsersGetOrgMembershipParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersGetOrgMembershipResponse>
					>
			): Promise<Github.Response<Github.UsersGetOrgMembershipResponse>>;
			getOrgMemberships(
				params: Github.UsersGetOrgMembershipsParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersGetOrgMembershipsResponse>
					>
			): Promise<Github.Response<Github.UsersGetOrgMembershipsResponse>>;
			getOrgs(
				params: Github.UsersGetOrgsParams,
				callback?: Github.Callback<Github.Response<Github.UsersGetOrgsResponse>>
			): Promise<Github.Response<Github.UsersGetOrgsResponse>>;
			getPublicEmails(
				params: Github.UsersGetPublicEmailsParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersGetPublicEmailsResponse>
					>
			): Promise<Github.Response<Github.UsersGetPublicEmailsResponse>>;
			getRepoInvites(
				params: Github.UsersGetRepoInvitesParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersGetRepoInvitesResponse>
					>
			): Promise<Github.Response<Github.UsersGetRepoInvitesResponse>>;
			getTeams(
				params: Github.UsersGetTeamsParams,
				callback?: Github.Callback<Github.Response<Github.UsersGetTeamsResponse>>
			): Promise<Github.Response<Github.UsersGetTeamsResponse>>;
			removeRepoFromInstallation(
				params: Github.UsersRemoveRepoFromInstallationParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersRemoveRepoFromInstallationResponse>
					>
			): Promise<Github.Response<Github.UsersRemoveRepoFromInstallationResponse>>;
			togglePrimaryEmailVisibility(
				params: Github.UsersTogglePrimaryEmailVisibilityParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersTogglePrimaryEmailVisibilityResponse>
					>
			): Promise<
				Github.Response<Github.UsersTogglePrimaryEmailVisibilityResponse>
				>;
			unblockUser(
				params: Github.UsersUnblockUserParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersUnblockUserResponse>
					>
			): Promise<Github.Response<Github.UsersUnblockUserResponse>>;
			unfollowUser(
				params: Github.UsersUnfollowUserParams,
				callback?: Github.Callback<
					Github.Response<Github.UsersUnfollowUserResponse>
					>
			): Promise<Github.Response<Github.UsersUnfollowUserResponse>>;
			update(
				params: Github.UsersUpdateParams,
				callback?: Github.Callback<Github.Response<Github.UsersUpdateResponse>>
			): Promise<Github.Response<Github.UsersUpdateResponse>>;
		};
	}

	export = Github;

}