// config/dev/networkConfig.ts
import { common } from "../common/dev-common";
import { Aws } from "aws-cdk-lib";

const VPC_CIDR = "10.0.0.0/16";
const WEB_IP_RESTRICTION_ENABLED = true;
const IP_V4_WHITELIST = [
  // 例: 管理画面の許可IP
  // IPを追加したい場合以下に追加
  "0.0.0.0/0",
];
const ALB_ALLOWED_IPV4 = WEB_IP_RESTRICTION_ENABLED ? IP_V4_WHITELIST : ["0.0.0.0/0"];
const ALB_ALLOWED_IPV6 = WEB_IP_RESTRICTION_ENABLED ? [] : ["::/0"];

export const networkConfig = {
  CfnVPC: {
    cidrBlock: "10.0.0.0/16",
    enableDnsSupport: true,
    enableDnsHostnames: true,
    tags: [
      {
        key: "Name",
        value: "vpc",
      },
    ],
  },

  cfnSubnets: [
    {
      id: common.network.subnets.names.publicA,
      cidrBlock: "10.0.0.0/24",
      availabilityZone: common.network.azs.a,
      mapPublicIpOnLaunch: true,
      tags: [{ key: "Name", value: common.network.subnets.names.publicA }],
    },
    {
      id: common.network.subnets.names.publicC,
      cidrBlock: "10.0.1.0/24",
      availabilityZone: common.network.azs.c,
      mapPublicIpOnLaunch: true,
      tags: [{ key: "Name", value: common.network.subnets.names.publicC }],
    },
    {
      id: common.network.subnets.names.appA,
      cidrBlock: "10.0.2.0/24",
      availabilityZone: common.network.azs.a,
      mapPublicIpOnLaunch: false,
      tags: [{ key: "Name", value: common.network.subnets.names.appA }],
    },
    {
      id: common.network.subnets.names.appC,
      cidrBlock: "10.0.3.0/24",
      availabilityZone: common.network.azs.c,
      mapPublicIpOnLaunch: false,
      tags: [{ key: "Name", value: common.network.subnets.names.appC }],
    },
    {
      id: common.network.subnets.names.batchA,
      cidrBlock: "10.0.4.0/24",
      availabilityZone: common.network.azs.a,
      mapPublicIpOnLaunch: false,
      tags: [{ key: "Name", value: common.network.subnets.names.batchA }],
    },
    {
      id: common.network.subnets.names.batchC,
      cidrBlock: "10.0.5.0/24",
      availabilityZone: common.network.azs.c,
      mapPublicIpOnLaunch: false,
      tags: [{ key: "Name", value: common.network.subnets.names.batchC }],
    },
    {
      id: common.network.subnets.names.dbA,
      cidrBlock: "10.0.6.0/24",
      availabilityZone: common.network.azs.a,
      mapPublicIpOnLaunch: false,
      tags: [{ key: "Name", value: common.network.subnets.names.dbA }],
    },
    {
      id: common.network.subnets.names.dbC,
      cidrBlock: "10.0.7.0/24",
      availabilityZone: common.network.azs.c,
      mapPublicIpOnLaunch: false,
      tags: [{ key: "Name", value: common.network.subnets.names.dbC }],
    },
  ],

  CfnInternetGateway: {
    id: "igw",
    tags: [{ key: "Name", value: "igw" }],
  },

  CfnEIP: {
    id: "NatEIP",
    domain: "nat-gateway-eip",
    tags: [{ key: "Name", value: "NatEIP" }],
  },

  CfnNatGateway: {
    id: "nat-gateway",
    subnetId: common.network.subnets.names.publicA,
    eipRef: "NatEIP",
    tags: [{ key: "Name", value: "nat-gateway" }],
  },

  cfnRouteTables: [
    {
      id: "public-subnet-route-table",
      isPublic: true,
      routes: [
        {
          id: "public-subnet-route",
          destinationCidrBlock: "0.0.0.0/0",
          gatewayType: "igw",
        },
      ],
      associations: [
        { id: "AssocPublicSubnet1a", subnetId: common.network.subnets.names.publicA },
        { id: "AssocPublicSubnet1c", subnetId: common.network.subnets.names.publicC },
      ],
      tags: [{ key: "Name", value: "public-subnet-route-table" }],
    },
    {
      id: "private-subnet-route-table",
      isPublic: false,
      routes: [
        {
          id: "private-subnet-route",
          destinationCidrBlock: "0.0.0.0/0",
          gatewayType: "nat",
        },
      ],
      associations: [
        { id: "AssocPrivateApp1a", subnetId: common.network.subnets.names.appA },
        { id: "AssocPrivateApp1c", subnetId: common.network.subnets.names.appC },
        { id: "AssocPrivateBatch1a", subnetId: common.network.subnets.names.batchA },
        { id: "AssocPrivateBatch1c", subnetId: common.network.subnets.names.batchC },
        { id: "AssocPrivateDb1a", subnetId: common.network.subnets.names.dbA },
        { id: "AssocPrivateDb1c", subnetId: common.network.subnets.names.dbC },
      ],
      tags: [{ key: "Name", value: "private-subnet-route-table" }],
    },
  ],
  cfnVPCEndpoints: [
    {
      id: "s3GatewayEndpoint",
      serviceName: `com.amazonaws.${Aws.REGION}.s3`,
      vpcEndpointType: "Gateway",
      routeTableIds: ["private-subnet-route-table"],
      tags: [{ key: "Name", value: "s3-endpoint" }],
    },
  ],
  cfnSecurityGroups: [
    // egress-aws-sg
    {
      groupName: common.network.securityGroups.names.egress,
      description: "egress aws security group",
      egress: [
        { ipProtocol: "tcp", fromPort: 443, toPort: 443, cidrIp: "0.0.0.0/0" },
        { ipProtocol: "tcp", fromPort: 3306, toPort: 3306, cidrIp: "0.0.0.0/0" },
      ],
      tags: [{ key: "Name", value: common.network.securityGroups.names.egress }],
    },

    // app-sg
    {
      groupName: common.network.securityGroups.names.app,
      description: "APP",
      ingress: [
        { ipProtocol: "tcp", fromPort: 80, toPort: 80, cidrIp: VPC_CIDR },
        { ipProtocol: "tcp", fromPort: 3000, toPort: 3000, cidrIp: VPC_CIDR },
      ],
      egress: [{ ipProtocol: "-1", fromPort: 0, toPort: 0, cidrIp: VPC_CIDR }],
      tags: [{ key: "Name", value: common.network.securityGroups.names.app }],
    },

    // alb-sg
    {
      groupName: common.network.securityGroups.names.alb,
      description: "ALB",
      ingress: [
        // 80
        ...ALB_ALLOWED_IPV4.map((cidr) => ({
          ipProtocol: "tcp",
          fromPort: 80,
          toPort: 80,
          cidrIp: cidr,
        })),
        // 443 (IPv4)
        ...ALB_ALLOWED_IPV4.map((cidr) => ({
          ipProtocol: "tcp",
          fromPort: 443,
          toPort: 443,
          cidrIp: cidr,
        })),
        // 443 (IPv6)
        ...ALB_ALLOWED_IPV6.map((cidrIpv6) => ({
          ipProtocol: "tcp",
          fromPort: 443,
          toPort: 443,
          cidrIpv6,
        })),
      ],
      egress: [{ ipProtocol: "-1", fromPort: 0, toPort: 0, cidrIp: VPC_CIDR }],
      tags: [{ key: "Name", value: common.network.securityGroups.names.alb }],
    },

    // batch-sg
    {
      groupName: common.network.securityGroups.names.batch,
      description: "Batch Serve",
      egress: [{ ipProtocol: "-1", fromPort: 0, toPort: 0, cidrIp: "0.0.0.0/0" }],
      tags: [{ key: "Name", value: common.network.securityGroups.names.batch }],
    },

    // app-db-migration-sg
    {
      groupName: common.network.securityGroups.names.migration,
      description: "APP DB Migration",
      egress: [{ ipProtocol: "-1", fromPort: 0, toPort: 0, cidrIp: VPC_CIDR }],
      tags: [{ key: "Name", value: common.network.securityGroups.names.migration }],
    },

    // bastion-sg
    {
      groupName: common.network.securityGroups.names.bastion,
      description: "Bastion",
      ingress: [
        // SSH はホワイトリスト
        ...IP_V4_WHITELIST.map((cidr) => ({
          ipProtocol: "tcp",
          fromPort: 22,
          toPort: 22,
          cidrIp: cidr,
        })),
        // HTTP は ALB SG から
        {
          ipProtocol: "tcp",
          fromPort: 80,
          toPort: 80,
          sourceSecurityGroupIdRef: common.network.securityGroups.names.alb,
        },
        // 443 は app-sg から（SSM 絡みの前提に合わせて）
        {
          ipProtocol: "tcp",
          fromPort: 443,
          toPort: 443,
          sourceSecurityGroupIdRef: common.network.securityGroups.names.app,
        },
      ],
      egress: [
        { ipProtocol: "-1", fromPort: 0, toPort: 0, cidrIp: VPC_CIDR },
        { ipProtocol: "tcp", fromPort: 80, toPort: 80, cidrIp: "0.0.0.0/0" },
        { ipProtocol: "tcp", fromPort: 443, toPort: 443, cidrIp: "0.0.0.0/0" },
        { ipProtocol: "tcp", fromPort: 22, toPort: 22, cidrIp: "0.0.0.0/0" },
      ],
      tags: [{ key: "Name", value: common.network.securityGroups.names.bastion }],
    },

    // db-sg（3306 を複数 SG から許可）
    {
      groupName: common.network.securityGroups.names.db,
      description: "DB",
      ingress: [
        {
          ipProtocol: "tcp",
          fromPort: 3306,
          toPort: 3306,
          sourceSecurityGroupIdRef: common.network.securityGroups.names.app,
        },
        {
          ipProtocol: "tcp",
          fromPort: 3306,
          toPort: 3306,
          sourceSecurityGroupIdRef: common.network.securityGroups.names.egress,
        },
        {
          ipProtocol: "tcp",
          fromPort: 3306,
          toPort: 3306,
          sourceSecurityGroupIdRef: common.network.securityGroups.names.bastion,
        },
        {
          ipProtocol: "tcp",
          fromPort: 3306,
          toPort: 3306,
          sourceSecurityGroupIdRef: common.network.securityGroups.names.batch,
        },
        {
          ipProtocol: "tcp",
          fromPort: 3306,
          toPort: 3306,
          sourceSecurityGroupIdRef: common.network.securityGroups.names.migration,
        },
      ],
      tags: [{ key: "Name", value: common.network.securityGroups.names.db }],
    },
  ],
} as const;
