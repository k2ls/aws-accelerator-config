/**
 * Accelerator imported bucket type enum
 */
export enum AcceleratorImportedBucketType {
  /**
   * Server access logs Bucket
   */
  SERVER_ACCESS_LOGS_BUCKET = 'access-logs',
  /**
   * Central logs Bucket
   */
  CENTRAL_LOGS_BUCKET = 'central-logs',
  /**
   * ELB logs Bucket
   */
  ELB_LOGS_BUCKET = 'elb-logs',
}

/**
 * Principal Org id condition for policy
 */
export type PrincipalOrgIdConditionType = {
  [key: string]: string | string[];
};

/**
 * AWS principal access types used for CentralLogsBucket access policy configuration
 */
export type AwsPrincipalAccessesType = { name: string; principal: string; accessType: string };

/**
 * IAM policy statement type used in custom resource to update policy of existing resources
 */
export type PolicyStatementType = {
  /**
   * The Sid (statement ID) is an optional identifier that you provide for the
   * policy statement. You can assign a Sid value to each statement in a
   * statement array. In services that let you specify an ID element, such as
   * SQS and SNS, the Sid value is just a sub-ID of the policy document's ID. In
   * IAM, the Sid value must be unique within a JSON policy.
   *
   * @default - no sid
   */
  readonly Sid?: string;
  /**
   * List of actions to add to the statement
   *
   * @default - no actions
   */
  readonly Action: string | string[];
  /**
   * List of not actions to add to the statement
   *
   * @default - no not-actions
   */
  readonly NotActions?: string[];
  /**
   * Principal to add to the statement
   *
   * @default - no principal
   */
  readonly Principal?: PrincipalOrgIdConditionType;
  /**
   * Principal to add to the statement
   *
   * @default - no not principal
   */
  readonly NotPrincipal?: PrincipalOrgIdConditionType;
  /**
   * Resource ARNs to add to the statement
   *
   * @default - no resource
   */
  readonly Resource?: string | string[];
  /**
   * NotResource ARNs to add to the statement
   *
   * @default - no not-resources
   */
  readonly NotResource?: string[];
  /**
   * Condition to add to the statement
   *
   * @default - no condition
   */
  readonly Condition?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  /**
   * Whether to allow or deny the actions in this statement
   *
   * @default Effect.ALLOW
   */
  readonly Effect?: 'Allow' | 'Deny';
};

/**
 * Bucket access type
 */
export enum BucketAccessType {
  /**
   * When service need read only access to bucket and CMK
   */
  READONLY = 'readonly',
  /**
   * When service need write only access to bucket and CMK
   */
  WRITEONLY = 'writeonly',
  /**
   * When service need read write access to bucket and CMK
   */
  READWRITE = 'readwrite',
  /**
   * When service need no access like SessionManager, but the service name required for other logical changes in bucket or CMK policy
   */
  NO_ACCESS = 'no_access',
}
