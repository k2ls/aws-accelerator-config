/**
 *  Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import {
  CustomerGatewayConfig,
  Ec2FirewallInstanceConfig,
  SubnetConfig,
  TransitGatewayConfig,
  VpcConfig,
  VpcTemplatesConfig,
} from '@aws-accelerator/config';
import {
  IIpamSubnet,
  PrefixList,
  RouteTable,
  SecurityGroup,
  Subnet,
  Vpc,
  VpnConnection,
} from '@aws-accelerator/constructs';
import { createLogger } from '@aws-accelerator/utils';

const logger = createLogger(['getter-utils']);

/**
 * Returns a prefix list object or tokenized ID from a given map if it exists
 * @param prefixListMap
 * @param prefixListName
 * @returns
 */
export function getPrefixList(
  prefixListMap: Map<string, PrefixList> | Map<string, string>,
  prefixListName: string,
): PrefixList | string {
  const prefixList = prefixListMap.get(prefixListName);

  if (!prefixList) {
    logger.error(`Prefix list ${prefixListName} does not exist in map`);
    throw new Error(`Configuration validation failed at runtime.`);
  }

  return prefixList;
}

/**
 * Returns a route table construct object from a given map if it exists
 * @param routeTableMap
 * @param vpcName
 * @param routeTableName
 * @returns
 */
export function getRouteTable(
  routeTableMap: Map<string, RouteTable> | Map<string, string>,
  vpcName: string,
  routeTableName: string,
): RouteTable | string {
  const key = `${vpcName}_${routeTableName}`;
  const routeTable = routeTableMap.get(key);

  if (!routeTable) {
    logger.error(`VPC ${vpcName} route table ${routeTableName} does not exist in map`);
    throw new Error(`Configuration validation failed at runtime.`);
  }

  return routeTable;
}

/**
 * Returns a security group construct object or tokenized ID from a given map if it exists
 * @param securityGroupMap
 * @param vpcName
 * @param securityGroupName
 * @returns
 */
export function getSecurityGroup(
  securityGroupMap: Map<string, SecurityGroup> | Map<string, string>,
  vpcName: string,
  securityGroupName: string,
): SecurityGroup | string {
  const key = `${vpcName}_${securityGroupName}`;
  const securityGroup = securityGroupMap.get(key);

  if (!securityGroup) {
    logger.error(`VPC ${vpcName} security group ${securityGroupName} does not exist in map`);
    throw new Error(`Configuration validation failed at runtime.`);
  }

  return securityGroup;
}

/**
 * Returns a subnet construct object or tokenized ID from a given map if it exists
 * @param subnetMap
 * @param vpcName
 * @param subnetName
 * @returns
 */
export function getSubnet(
  subnetMap: Map<string, Subnet> | Map<string, IIpamSubnet>,
  vpcName: string,
  subnetName: string,
  accountName?: string,
): Subnet | IIpamSubnet {
  const key = accountName ? `${vpcName}_${accountName}_${subnetName}` : `${vpcName}_${subnetName}`;
  const subnet = subnetMap.get(key);

  if (!subnet) {
    logger.error(`VPC ${vpcName} subnet ${subnetName} does not exist in map`);
    throw new Error(`Configuration validation failed at runtime.`);
  }

  return subnet;
}

/**
 * Get Transit Gateway ID from a given map, if it exists
 * @param transitGatewayMap
 * @param tgwName
 * @returns
 */
export function getTransitGatewayId(transitGatewayMap: Map<string, string>, tgwName: string): string {
  const tgwId = transitGatewayMap.get(tgwName);

  if (!tgwId) {
    logger.error(`Transit Gateway ${tgwName} does not exist in map`);
    throw new Error(`Configuration validation failed at runtime.`);
  }

  return tgwId;
}

/**
 * Get Transit Gateway route table ID from a given map, if it exists
 * @param tgwRouteTableMap Map<string, string>
 * @param tgwName string
 * @param routeTableName string
 * @returns string
 */
export function getTgwRouteTableId(
  tgwRouteTableMap: Map<string, string>,
  tgwName: string,
  routeTableName: string,
): string {
  const key = `${tgwName}_${routeTableName}`;
  const routeTableId = tgwRouteTableMap.get(key);

  if (!routeTableId) {
    logger.error(`Transit Gateway ${tgwName} route table ${routeTableName} does not exist in map`);
    throw new Error(`Configuration validation failed at runtime.`);
  }

  return routeTableId;
}

/**
 * Returns a VPC construct object from a given map if it exists
 * @param vpcMap
 * @param vpcName
 * @returns
 */
export function getVpc(vpcMap: Map<string, Vpc> | Map<string, string>, vpcName: string): Vpc | string {
  const vpc = vpcMap.get(vpcName);

  if (!vpc) {
    logger.error(`VPC ${vpcName} does not exist in map`);
    throw new Error(`Configuration validation failed at runtime.`);
  }

  return vpc;
}

/**
 * Returns a TGW VPN connection construct object from a given map if it exists
 * @param vpnMap Map<string, VpnConnection>
 * @param tgwName string
 * @param vpnName string
 * @returns VpnConnection
 */
export function getTgwVpnConnection(
  vpnMap: Map<string, VpnConnection>,
  tgwName: string,
  vpnName: string,
): VpnConnection {
  const key = `${tgwName}_${vpnName}`;
  const vpn = vpnMap.get(key);

  if (!vpn) {
    logger.error(`VPN connection ${vpnName} for transit gateway ${tgwName} does not exist in map`);
    throw new Error(`Configuration validation failed at runtime.`);
  }

  return vpn;
}

/**
 * Returns a TGW VPN attachment ID from a given map if it exists
 * @param attachmentMap Map<string, string>
 * @param tgwName string
 * @param vpnName string
 * @returns string
 */
export function getVpnAttachmentId(attachmentMap: Map<string, string>, tgwName: string, vpnName: string): string {
  const key = `${tgwName}_${vpnName}`;
  const attachmentId = attachmentMap.get(key);

  if (!attachmentId) {
    logger.error(`VPN attachment ID for VPN ${vpnName} to transit gateway ${tgwName} does not exist in map`);
    throw new Error(`Configuration validation failed at runtime.`);
  }

  return attachmentId;
}

/**
 * Returns a Transit Gateway configuration object from a given list of configurations if it exists
 * @param tgwResources TransitGatewayConfig[]
 * @param tgwName string
 * @returns TransitGatewayConfig
 */
export function getTgwConfig(tgwResources: TransitGatewayConfig[], tgwName: string): TransitGatewayConfig {
  const tgwConfig = tgwResources.find(tgw => tgw.name === tgwName);
  if (!tgwConfig) {
    logger.error(`Transit Gateway configuration for TGW ${tgwName} not found`);
    throw new Error(`Configuration validation failed at runtime.`);
  }
  return tgwConfig;
}

/**
 * Returns a VPC configuration object from a given list of configurations if it exists
 * @param vpcResources
 * @param vpcName
 * @returns
 */
export function getVpcConfig(
  vpcResources: (VpcConfig | VpcTemplatesConfig)[],
  vpcName: string,
): VpcConfig | VpcTemplatesConfig {
  const vpcConfig = vpcResources.find(vpc => vpc.name === vpcName);
  if (!vpcConfig) {
    logger.error(`VPC configuration for VPC ${vpcName} not found`);
    throw new Error(`Configuration validation failed at runtime.`);
  }
  return vpcConfig;
}

/**
 * Returns a subnet configuration object from a given list of configurations if it exists
 * @param vpcItem
 * @param subnetName
 * @returns
 */
export function getSubnetConfig(vpcItem: VpcConfig | VpcTemplatesConfig, subnetName: string): SubnetConfig {
  const subnetConfig = vpcItem.subnets?.find(subnet => subnet.name === subnetName);
  if (!subnetConfig) {
    logger.error(`Subnet configuration for VPC ${vpcItem.name} subnet ${subnetName} not found`);
    throw new Error(`Configuration validation failed at runtime.`);
  }
  return subnetConfig;
}

/**
 * Returns a firewall instance configuration object from a given list of configurations if it exists
 * @param firewallName string
 * @param firewallInstanceConfig Ec2FirewallInstanceConfig[] | undefined
 * @returns Ec2FirewallInstanceConfig
 */
export function getFirewallInstanceConfig(
  firewallName: string,
  firewallInstanceConfig?: Ec2FirewallInstanceConfig[],
): Ec2FirewallInstanceConfig {
  if (!firewallInstanceConfig) {
    logger.error(
      `Firewall instance configuration for firewall ${firewallName} not found. Firewall instances are not configured in customizations-config.yaml.`,
    );
    throw new Error(`Configuration validation failed at runtime.`);
  }

  const instanceConfig = firewallInstanceConfig.find(firewall => firewall.name === firewallName);
  if (!instanceConfig) {
    logger.error(`Firewall instance configuration for firewall ${firewallName} not found`);
    throw new Error(`Configuration validation failed at runtime.`);
  }
  return instanceConfig;
}

/**
 * Returns a customer gateway name associated with the given VPN connection name
 * @param customerGateway CustomerGatewayConfig[]
 * @param vpnName string
 * @returns string
 */
export function getCustomerGatewayName(customerGateways: CustomerGatewayConfig[], vpnName: string): string {
  const customerGatewayName = customerGateways.find(cgw => cgw.vpnConnections?.find(vpn => vpn.name === vpnName))?.name;
  if (!customerGatewayName) {
    logger.error(`Customer gateway name for VPN ${vpnName} not found`);
    throw new Error(`Configuration validation failed at runtime.`);
  }
  return customerGatewayName;
}

/**
 * Returns a physical ID mapping for an availability zone respective to an AWS region.
 * @param region
 * @returns
 */
export function getAvailabilityZoneMap(region: string) {
  const availabilityZoneIdMap = new Map<string, string>([
    ['us-east-1', 'use1-az'],
    ['us-east-2', 'use2-az'],
    ['us-west-1', 'usw1-az'],
    ['us-west-2', 'usw2-az'],
    ['ca-central-1', 'cac1-az'],
    ['ap-east-1', 'ape1-az'],
    ['ap-south-1', 'aps1-az'],
    ['ap-south-2', 'aps2-az'],
    ['ap-northeast-1', 'apne1-az'],
    ['ap-northeast-2', 'apne2-az'],
    ['ap-northeast-3', 'apne3-az'],
    ['ap-southeast-1', 'apse1-az'],
    ['ap-southeast-2', 'apse2-az'],
    ['ap-southeast-3', 'apse3-az'],
    ['ap-southeast-4', 'apse4-az'],
    ['af-south-1', 'afs1-az'],
    ['eu-central-1', 'euc1-az'],
    ['eu-west-1', 'euw1-az'],
    ['eu-west-2', 'euw2-az'],
    ['eu-west-3', 'euw3-az'],
    ['eu-north-1', 'eun1-az'],
    ['eu-central-2', 'euc2-az'],
    ['eu-south-1', 'eus1-az'],
    ['eu-south-2', 'eus2-az'],
    ['sa-east-1', 'sae1-az'],
    ['ma-central-1', 'mec1-az'],
    ['ma-south-1', 'mes1-az'],
    ['us-gov-west-1', 'usgw1-az'],
    ['us-gov-east-1', 'usge1-az'],
  ]);
  const availabilityZoneId = availabilityZoneIdMap.get(region);
  if (!availabilityZoneIdMap.get(region)) {
    logger.error(`The ${region} provided does not support Physical AZ IDs.`);
    throw new Error(`Configuration validation failed at runtime.`);
  }
  return availabilityZoneId;
}

/**
 * Returns all keys with defined values for a given object
 * @param obj object
 * @returns string[]
 */
export function getObjectKeys(obj: object): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      keys.push(key);
    }
  }
  return keys;
}
