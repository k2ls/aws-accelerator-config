/**
 *  Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 *  with the License. A copy of the License is located at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
 *  and limitations under the License.
 */

import * as ram from 'aws-cdk-lib/aws-ram';
import * as core from 'aws-cdk-lib';
import { pascalCase } from 'change-case';
import { v4 as uuidv4 } from 'uuid';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';

const path = require('path');

export interface IResourceShare extends core.IResource {
  /**
   * The identifier of the resource share
   *
   * @attribute
   */
  readonly resourceShareId: string;

  /**
   * The name of the resource share
   *
   * @attribute
   */
  readonly resourceShareName: string;

  /**
   * The ARN of the resource share
   *
   * @attribute
   */
  readonly resourceShareArn: string;

  /**
   * The owner type of the resource share
   *
   * @attribute
   */
  readonly resourceShareOwner: ResourceShareOwner;
}

export enum ResourceShareOwner {
  SELF = 'SELF',
  OTHER_ACCOUNTS = 'OTHER-ACCOUNTS',
}

export interface ResourceShareLookupOptions {
  readonly resourceShareOwner: ResourceShareOwner;
  readonly resourceShareName: string;
  readonly owningAccountId?: string;
}

export interface ResourceShareProps {
  readonly name: string;
  readonly allowExternalPrincipals?: boolean;
  readonly permissionArns?: string[];
  readonly principals?: string[];
  readonly resourceArns?: string[];
}

export interface ResourceShareItemLookupOptions {
  readonly resourceShare: IResourceShare;
  readonly resourceShareItemType: string;
  /**
   * Custom resource lambda log group encryption key
   */
  readonly kmsKey: cdk.aws_kms.Key;
  /**
   * Custom resource lambda log retention in days
   */
  readonly logRetentionInDays: number;
}
export interface IResourceShareItem extends core.IResource {
  /**
   * The identifier of the shared resource item
   *
   * @attribute
   */
  readonly resourceShareItemId: string;
}

export abstract class ResourceShareItem extends core.Resource implements IResourceShareItem {
  readonly resourceShareItemId: string = '';
  readonly resourceShareItemType: string = '';

  public static fromLookup(scope: Construct, id: string, options: ResourceShareItemLookupOptions): IResourceShareItem {
    class Import extends core.Resource implements IResourceShareItem {
      public readonly resourceShareItemId: string;

      constructor(scope: Construct, id: string) {
        super(scope, id);

        console.log(options.resourceShare.resourceShareId);
        const GET_RESOURCE_SHARE_ITEM = 'Custom::GetResourceShareItem';

        const provider = core.CustomResourceProvider.getOrCreateProvider(this, GET_RESOURCE_SHARE_ITEM, {
          codeDirectory: path.join(__dirname, 'get-resource-share-item/dist'),
          runtime: core.CustomResourceProviderRuntime.NODEJS_14_X,
          policyStatements: [
            {
              Effect: 'Allow',
              Action: ['ram:ListResources'],
              Resource: '*',
            },
          ],
        });

        const resource = new core.CustomResource(this, 'Resource', {
          resourceType: GET_RESOURCE_SHARE_ITEM,
          serviceToken: provider.serviceToken,
          properties: {
            resourceOwner: options.resourceShare.resourceShareOwner,
            resourceShareArn: options.resourceShare.resourceShareArn,
            resourceType: options.resourceShareItemType,
            uuid: uuidv4(), // Generates a new UUID to force the resource to update
          },
        });

        /**
         * Singleton pattern to define the log group for the singleton function
         * in the stack
         */
        const stack = cdk.Stack.of(scope);
        const logGroup =
          (stack.node.tryFindChild(`${provider.node.id}LogGroup`) as cdk.aws_logs.LogGroup) ??
          new cdk.aws_logs.LogGroup(stack, `${provider.node.id}LogGroup`, {
            logGroupName: `/aws/lambda/${(provider.node.findChild('Handler') as cdk.aws_lambda.CfnFunction).ref}`,
            retention: options.logRetentionInDays,
            encryptionKey: options.kmsKey,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
          });
        resource.node.addDependency(logGroup);

        this.resourceShareItemId = resource.ref;
      }
    }
    return new Import(scope, id);
  }
}

/**
 * Creates a Resource Share
 */
export class ResourceShare extends core.Resource implements IResourceShare {
  public static fromLookup(scope: Construct, id: string, options: ResourceShareLookupOptions): IResourceShare {
    class Import extends core.Resource implements IResourceShare {
      public readonly resourceShareId: string;
      public readonly resourceShareName = options.resourceShareName;
      public readonly resourceShareOwner = options.resourceShareOwner;
      public readonly resourceShareArn;

      constructor(scope: Construct, id: string) {
        super(scope, id);
        const GET_RESOURCE_SHARE = 'Custom::GetResourceShare';

        //
        // Get the Resource Share Definition (by name)
        //
        const cr = core.CustomResourceProvider.getOrCreateProvider(this, GET_RESOURCE_SHARE, {
          codeDirectory: path.join(__dirname, 'get-resource-share/dist'),
          runtime: core.CustomResourceProviderRuntime.NODEJS_14_X,
          policyStatements: [
            {
              Effect: 'Allow',
              Action: ['ram:GetResourceShares'],
              Resource: '*',
            },
          ],
        });

        const resource = new core.CustomResource(this, 'Resource', {
          resourceType: GET_RESOURCE_SHARE,
          serviceToken: cr.serviceToken,
          properties: {
            name: options.resourceShareName,
            resourceOwner: options.resourceShareOwner,
            owningAccountId: options.owningAccountId,
            uuid: uuidv4(), // Generates a new UUID to force the resource to update
          },
        });

        this.resourceShareId = resource.ref;

        this.resourceShareArn = core.Stack.of(this).formatArn({
          service: 'ram',
          account: options.owningAccountId,
          resource: 'resource-share',
          arnFormat: core.ArnFormat.SLASH_RESOURCE_NAME,
          resourceName: this.resourceShareId,
        });
      }
    }
    return new Import(scope, id);
  }

  public readonly resourceShareId: string;
  public readonly resourceShareName: string;
  public readonly resourceShareArn: string;
  public readonly resourceShareOwner: ResourceShareOwner;

  constructor(scope: Construct, id: string, props: ResourceShareProps) {
    super(scope, id);

    const resource = new ram.CfnResourceShare(this, pascalCase(`${props.name}ResourceShare`), {
      name: props.name,
      allowExternalPrincipals: props.allowExternalPrincipals,
      permissionArns: props.permissionArns,
      principals: props.principals,
      resourceArns: props.resourceArns,
    });

    this.resourceShareId = resource.ref;
    this.resourceShareName = props.name;
    this.resourceShareArn = resource.attrArn;
    this.resourceShareOwner = ResourceShareOwner.SELF;
  }
}
