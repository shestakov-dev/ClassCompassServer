export class InviteEntity {
	/**
	 * The unique code representing the invite
	 * @example "8e60ec97300552081eb1291ee35d9fba2288af648f784c2e766933c2f2221a26"
	 */
	inviteCode: string;

	/**
	 * The URL that can be used to accept the invite
	 * @example "https://api.classcompass.shestakov.app/invite/8e60ec97300552081eb1291ee35d9fba2288af648f784c2e766933c2f2221a26"
	 */
	inviteUrl: string;
}
