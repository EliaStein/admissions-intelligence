import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core'
import Oas from 'oas';
import APICore from 'api/dist/core';
import definition from './openapi.json';

class SDK {
  spec: Oas;
  core: APICore;

  constructor() {
    this.spec = Oas.init(definition);
    this.core = new APICore(this.spec, 'viral-loops-docs/3.0.0 (api/6.1.3)');
  }

  /**
   * Optionally configure various options that the SDK allows.
   *
   * @param config Object of supported SDK options and toggles.
   * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
   * should be represented in milliseconds.
   */
  config(config: ConfigOptions) {
    this.core.setConfig(config);
  }

  /**
   * If the API you're using requires authentication you can supply the required credentials
   * through this method and the library will magically determine how they should be used
   * within your API request.
   *
   * With the exception of OpenID and MutualTLS, it supports all forms of authentication
   * supported by the OpenAPI specification.
   *
   * @example <caption>HTTP Basic auth</caption>
   * sdk.auth('username', 'password');
   *
   * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
   * sdk.auth('myBearerToken');
   *
   * @example <caption>API Keys</caption>
   * sdk.auth('myApiKey');
   *
   * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
   * @param values Your auth credentials for the API; can specify up to two strings or numbers.
   */
  auth(...values: string[] | number[]) {
    this.core.setAuth(...values);
    return this;
  }

  /**
   * If the API you're using offers alternate server URLs, and server variables, you can tell
   * the SDK which one to use with this method. To use it you can supply either one of the
   * server URLs that are contained within the OpenAPI definition (along with any server
   * variables), or you can pass it a fully qualified URL to use (that may or may not exist
   * within the OpenAPI definition).
   *
   * @example <caption>Server URL with server variables</caption>
   * sdk.server('https://{region}.api.example.com/{basePath}', {
   *   name: 'eu',
   *   basePath: 'v14',
   * });
   *
   * @example <caption>Fully qualified server URL</caption>
   * sdk.server('https://eu.api.example.com/v14');
   *
   * @param url Server URL
   * @param variables An object of variables to replace into the server URL.
   */
  server(url: string, variables = {}) {
    this.core.setServer(url, variables);
  }

  /**
   * Get the public information of a campaign.
   *                 
   *
   * > 🚧 Warning 
   * > For this request you can use the campaign's `publicToken` or the secret `apiToken`.
   * You should **never** expose the `apiToken` in the front-end of your application. <a
   * href='/'> Learn more about a campaign's tokens </a>
   *
   * @summary Campaign Info
   * @throws FetchError<4XX, types.GetCampaignResponse4XX> Programmer error response
   * @throws FetchError<5XX, types.GetCampaignResponse5XX> Server side error response
   */
  getCampaign(metadata?: types.GetCampaignMetadataParam): Promise<FetchResponse<200, types.GetCampaignResponse200>> {
    return this.core.fetch('/campaign', 'get', metadata);
  }

  /**
   * Get the number of leads and the total referral count of your campaign.
   *
   * @summary Campaign Stats
   * @throws FetchError<4XX, types.GetCampaignStatsResponse4XX> Programmer error response
   * @throws FetchError<5XX, types.GetCampaignStatsResponse5XX> Server side error response
   */
  getCampaignStats(metadata: types.GetCampaignStatsMetadataParam): Promise<FetchResponse<200, types.GetCampaignStatsResponse200>> {
    return this.core.fetch('/campaign/stats', 'get', metadata);
  }

  /**
   * Register a new participant for a campaign
   *                 
   *
   * > 🚧 Warning 
   * > For this request you can use the campaign's `publicToken` or the secret `apiToken`.
   * You should **never** expose the `apiToken` in the front-end of your application. <a
   * href='/'> Learn more about a campaign's tokens </a>
   *
   * @summary Participant Registration
   * @throws FetchError<4XX, types.PostCampaignParticipantResponse4XX> Programmer error response
   * @throws FetchError<5XX, types.PostCampaignParticipantResponse5XX> Server side error response
   */
  postCampaignParticipant(body: types.PostCampaignParticipantBodyParam, metadata?: types.PostCampaignParticipantMetadataParam): Promise<FetchResponse<200, types.PostCampaignParticipantResponse200>> {
    return this.core.fetch('/campaign/participant', 'post', body, metadata);
  }

  /**
   * Use this Endpont to edit the First Name, Last Name and Referral Count of your
   * Participants
   *             
   * > 📘 Info 
   * > You can change this attributes by using our new Campaign Dashboard as well!
   *
   * @summary Edit Participant
   * @throws FetchError<4XX, types.PutCampaignParticipantResponse4XX> Programmer error response
   * @throws FetchError<5XX, types.PutCampaignParticipantResponse5XX> Server side error response
   */
  putCampaignParticipant(body: types.PutCampaignParticipantBodyParam, metadata: types.PutCampaignParticipantMetadataParam): Promise<FetchResponse<200, types.PutCampaignParticipantResponse200>> {
    return this.core.fetch('/campaign/participant', 'put', body, metadata);
  }

  /**
   * Returns information about a single participant. Calls with the API Token retrieve full
   * information. Calls with the public token return anonymized data.
   *                 
   *
   * > 🚧 Warning 
   * > For this request you can use the campaign's `publicToken` or the secret `apiToken`.
   * You should **never** expose the `apiToken` in the front-end of your application. <a
   * href='/'> Learn more about a campaign's tokens </a>
   *
   * @summary Participant Data
   * @throws FetchError<4XX, types.GetCampaignParticipantDataResponse4XX> Programmer error response
   * @throws FetchError<5XX, types.GetCampaignParticipantDataResponse5XX> Server side error response
   */
  getCampaignParticipantData(metadata?: types.GetCampaignParticipantDataMetadataParam): Promise<FetchResponse<200, types.GetCampaignParticipantDataResponse200>> {
    return this.core.fetch('/campaign/participant/data', 'get', metadata);
  }

  /**
   * Returns a paginated list of the participant's referrals. Calls with the API Token
   * retrieve full information. Calls with the public token return anonymized data.
   *                 
   *
   * > 🚧 Warning 
   * > For this request you can use the campaign's `publicToken` or the secret `apiToken`.
   * You should **never** expose the `apiToken` in the front-end of your application. <a
   * href='/'> Learn more about a campaign's tokens </a>
   *
   * @summary Participant Referrals
   * @throws FetchError<4XX, types.GetCampaignParticipantReferralsResponse4XX> Programmer error response
   * @throws FetchError<5XX, types.GetCampaignParticipantReferralsResponse5XX> Server side error response
   */
  getCampaignParticipantReferrals(metadata?: types.GetCampaignParticipantReferralsMetadataParam): Promise<FetchResponse<200, types.GetCampaignParticipantReferralsResponse200>> {
    return this.core.fetch('/campaign/participant/referrals', 'get', metadata);
  }

  /**
   * Tracks a conversion event for a registered participant
   *                 
   * > 📘 Info 
   * > You can now convert a Participant from out new Dashboard!
   *
   *                 
   * [Learn More about
   * conversion](https://intercom.help/viral-loops/en/articles/1080462-api-rewarding
   * "@embed")
   *
   *                 
   *
   * > 📘 Info 
   * > This feature is available for the following templates: 
   *  - The Milestone Referral
   *  - The Altruistic Referral
   *  - Online to Offline
   *  - The Universal Referral
   *
   * @summary Participant Conversion
   * @throws FetchError<4XX, types.PostCampaignParticipantConvertResponse4XX> Programmer error response
   * @throws FetchError<5XX, types.PostCampaignParticipantConvertResponse5XX> Server side error response
   */
  postCampaignParticipantConvert(body?: types.PostCampaignParticipantConvertBodyParam, metadata?: types.PostCampaignParticipantConvertMetadataParam): Promise<FetchResponse<200, types.PostCampaignParticipantConvertResponse200>> {
    return this.core.fetch('/campaign/participant/convert', 'post', body, metadata);
  }

  /**
   * Returns information about the participants of the campaign
   *
   * @summary Participant Query
   * @throws FetchError<4XX, types.PostCampaignParticipantQueryResponse4XX> Programmer error response
   * @throws FetchError<5XX, types.PostCampaignParticipantQueryResponse5XX> Server side error response
   */
  postCampaignParticipantQuery(body: types.PostCampaignParticipantQueryBodyParam, metadata: types.PostCampaignParticipantQueryMetadataParam): Promise<FetchResponse<200, types.PostCampaignParticipantQueryResponse200>>;
  postCampaignParticipantQuery(metadata: types.PostCampaignParticipantQueryMetadataParam): Promise<FetchResponse<200, types.PostCampaignParticipantQueryResponse200>>;
  postCampaignParticipantQuery(body?: types.PostCampaignParticipantQueryBodyParam | types.PostCampaignParticipantQueryMetadataParam, metadata?: types.PostCampaignParticipantQueryMetadataParam): Promise<FetchResponse<200, types.PostCampaignParticipantQueryResponse200>> {
    return this.core.fetch('/campaign/participant/query', 'post', body, metadata);
  }

  /**
   * Used to flag participants that have gotten early access or a reward and should be
   * removed from the waiting list or leaderboard. The participants are not deleted from the
   * campaign, they are simply excluded from the waitlist or leaderboard. This means they are
   * also not displayed in the waitlist or leaderboard in the Viral Loops popup but you can
   * still see them in your Campaign Dashboard and campaign exports.
   *
   * @summary Flag Participant
   * @throws FetchError<4XX, types.PostCampaignParticipantFlagResponse4XX> Programmer error response
   * @throws FetchError<5XX, types.PostCampaignParticipantFlagResponse5XX> Server side error response
   */
  postCampaignParticipantFlag(body: types.PostCampaignParticipantFlagBodyParam, metadata: types.PostCampaignParticipantFlagMetadataParam): Promise<FetchResponse<200, types.PostCampaignParticipantFlagResponse200>> {
    return this.core.fetch('/campaign/participant/flag', 'post', body, metadata);
  }

  /**
   * Returns the order in which the participant joined the campaign. For example, the first
   * participant who joins the campaign will have an order of 1, the second one will have an
   * order of 2 etc.
   *
   * @summary Participant Order
   * @throws FetchError<4XX, types.GetCampaignParticipantOrderResponse4XX> Programmer error response
   * @throws FetchError<5XX, types.GetCampaignParticipantOrderResponse5XX> Server side error response
   */
  getCampaignParticipantOrder(metadata?: types.GetCampaignParticipantOrderMetadataParam): Promise<FetchResponse<200, types.GetCampaignParticipantOrderResponse200>> {
    return this.core.fetch('/campaign/participant/order', 'get', metadata);
  }

  /**
   * Only participants that have not been flagged are returned (see Flag participants). Use
   * this to programmatically check who is at the top of the waiting list or leaderboard.
   *
   * >
   *
   * @summary Participant Rank
   * @throws FetchError<4XX, types.GetCampaignParticipantRankResponse4XX> Programmer error response
   * @throws FetchError<5XX, types.GetCampaignParticipantRankResponse5XX> Server side error response
   */
  getCampaignParticipantRank(metadata?: types.GetCampaignParticipantRankMetadataParam): Promise<FetchResponse<200, types.GetCampaignParticipantRankResponse200>> {
    return this.core.fetch('/campaign/participant/rank', 'get', metadata);
  }

  /**
   * Use this Endpont to get the Participant's Referrer
   *
   *             
   * > 📘 Info 
   * > You can also do this by using our new Campaign Dashboard as well!
   *
   * @summary Get Participant's Referrer
   * @throws FetchError<4XX, types.GetCampaignParticipantReferrerResponse4XX> Programmer error response
   * @throws FetchError<5XX, types.GetCampaignParticipantReferrerResponse5XX> Server side error response
   */
  getCampaignParticipantReferrer(metadata?: types.GetCampaignParticipantReferrerMetadataParam): Promise<FetchResponse<200, types.GetCampaignParticipantReferrerResponse200>> {
    return this.core.fetch('/campaign/participant/referrer', 'get', metadata);
  }

  /**
   * Retrieve the pending rewards of a campaign's participant
   *
   *                 
   * > 📘 Info 
   * > You can omit the `user` parameter to get a paginated list of the campaign participants
   * and their pending rewards
   *
   *                 
   * [Learn More about
   * rewarding](https://intercom.help/viral-loops/en/articles/1080462-api-rewarding "@embed")
   *
   * @summary Pending Rewards
   * @throws FetchError<4XX, types.GetCampaignParticipantRewardsPendingResponse4XX> Programmer error response
   * @throws FetchError<5XX, types.GetCampaignParticipantRewardsPendingResponse5XX> Server side error response
   */
  getCampaignParticipantRewardsPending(metadata: types.GetCampaignParticipantRewardsPendingMetadataParam): Promise<FetchResponse<200, types.GetCampaignParticipantRewardsPendingResponse200>> {
    return this.core.fetch('/campaign/participant/rewards/pending', 'get', metadata);
  }

  /**
   * Redeem a pending reward of a campaign's participant.
   *                 
   * > 📘 Info 
   * > This will move the reward from the pending rewards to the given rewards.
   *
   *                 
   * [Learn More about
   * rewarding](https://intercom.help/viral-loops/en/articles/1080462-api-rewarding "@embed")
   *
   * @summary Redeem a Reward
   * @throws FetchError<4XX, types.PostCampaignParticipantRewardsRedeemResponse4XX> Programmer error response
   * @throws FetchError<5XX, types.PostCampaignParticipantRewardsRedeemResponse5XX> Server side error response
   */
  postCampaignParticipantRewardsRedeem(body: types.PostCampaignParticipantRewardsRedeemBodyParam, metadata: types.PostCampaignParticipantRewardsRedeemMetadataParam): Promise<FetchResponse<200, types.PostCampaignParticipantRewardsRedeemResponse200>> {
    return this.core.fetch('/campaign/participant/rewards/redeem', 'post', body, metadata);
  }

  /**
   * Retrieve the given rewards of a campaign's participant
   *                 
   * > 📘 Info 
   * > You can omit the `user` parameter to get a paginated list of the campaign participants
   * and their given rewards
   *
   *                 
   * [Learn More about
   * rewarding](https://intercom.help/viral-loops/en/articles/1080462-api-rewarding "@embed")
   *
   * @summary Given Rewards
   * @throws FetchError<4XX, types.GetCampaignParticipantRewardsGivenResponse4XX> Programmer error response
   * @throws FetchError<5XX, types.GetCampaignParticipantRewardsGivenResponse5XX> Server side error response
   */
  getCampaignParticipantRewardsGiven(metadata: types.GetCampaignParticipantRewardsGivenMetadataParam): Promise<FetchResponse<200, types.GetCampaignParticipantRewardsGivenResponse200>> {
    return this.core.fetch('/campaign/participant/rewards/given', 'get', metadata);
  }
}

const createSDK = (() => { return new SDK(); })()
;

export default createSDK;

export type { GetCampaignMetadataParam, GetCampaignParticipantDataMetadataParam, GetCampaignParticipantDataResponse200, GetCampaignParticipantDataResponse4XX, GetCampaignParticipantDataResponse5XX, GetCampaignParticipantOrderMetadataParam, GetCampaignParticipantOrderResponse200, GetCampaignParticipantOrderResponse4XX, GetCampaignParticipantOrderResponse5XX, GetCampaignParticipantRankMetadataParam, GetCampaignParticipantRankResponse200, GetCampaignParticipantRankResponse4XX, GetCampaignParticipantRankResponse5XX, GetCampaignParticipantReferralsMetadataParam, GetCampaignParticipantReferralsResponse200, GetCampaignParticipantReferralsResponse4XX, GetCampaignParticipantReferralsResponse5XX, GetCampaignParticipantReferrerMetadataParam, GetCampaignParticipantReferrerResponse200, GetCampaignParticipantReferrerResponse4XX, GetCampaignParticipantReferrerResponse5XX, GetCampaignParticipantRewardsGivenMetadataParam, GetCampaignParticipantRewardsGivenResponse200, GetCampaignParticipantRewardsGivenResponse4XX, GetCampaignParticipantRewardsGivenResponse5XX, GetCampaignParticipantRewardsPendingMetadataParam, GetCampaignParticipantRewardsPendingResponse200, GetCampaignParticipantRewardsPendingResponse4XX, GetCampaignParticipantRewardsPendingResponse5XX, GetCampaignResponse200, GetCampaignResponse4XX, GetCampaignResponse5XX, GetCampaignStatsMetadataParam, GetCampaignStatsResponse200, GetCampaignStatsResponse4XX, GetCampaignStatsResponse5XX, PostCampaignParticipantBodyParam, PostCampaignParticipantConvertBodyParam, PostCampaignParticipantConvertMetadataParam, PostCampaignParticipantConvertResponse200, PostCampaignParticipantConvertResponse4XX, PostCampaignParticipantConvertResponse5XX, PostCampaignParticipantFlagBodyParam, PostCampaignParticipantFlagMetadataParam, PostCampaignParticipantFlagResponse200, PostCampaignParticipantFlagResponse4XX, PostCampaignParticipantFlagResponse5XX, PostCampaignParticipantMetadataParam, PostCampaignParticipantQueryBodyParam, PostCampaignParticipantQueryMetadataParam, PostCampaignParticipantQueryResponse200, PostCampaignParticipantQueryResponse4XX, PostCampaignParticipantQueryResponse5XX, PostCampaignParticipantResponse200, PostCampaignParticipantResponse4XX, PostCampaignParticipantResponse5XX, PostCampaignParticipantRewardsRedeemBodyParam, PostCampaignParticipantRewardsRedeemMetadataParam, PostCampaignParticipantRewardsRedeemResponse200, PostCampaignParticipantRewardsRedeemResponse4XX, PostCampaignParticipantRewardsRedeemResponse5XX, PutCampaignParticipantBodyParam, PutCampaignParticipantMetadataParam, PutCampaignParticipantResponse200, PutCampaignParticipantResponse4XX, PutCampaignParticipantResponse5XX } from './types';
