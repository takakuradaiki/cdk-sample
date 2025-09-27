import {
  CfnEIP,
  CfnInternetGateway,
  CfnNatGateway,
  CfnRoute,
  CfnRouteTable,
  CfnSecurityGroup,
  CfnSubnet,
  CfnSubnetRouteTableAssociation,
  CfnVPC,
  CfnVPCEndpoint,
  CfnVPCGatewayAttachment,
} from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

type SgIngress = {
  ipProtocol: string;
  fromPort: number;
  toPort: number;
  cidrIp?: string;
  cidrIpv6?: string;
  sourceSecurityGroupIdRef?: string;
};
type SgEgress = {
  ipProtocol: string;
  fromPort: number;
  toPort: number;
  cidrIp?: string;
  cidrIpv6?: string;
  destinationSecurityGroupIdRef?: string;
};

export interface NetworkProps {
  CfnVPC: {
    cidrBlock: string;
    enableDnsSupport: boolean;
    enableDnsHostnames: boolean;
    tags: [
      {
        key: string;
        value: string;
      }
    ];
  };
  cfnSubnets: [
    {
      id: string;
      cidrBlock: string;
      availabilityZone: string;
      mapPublicIpOnLaunch: boolean;
      tags: [
        {
          key: string;
          value: string;
        }
      ];
    }
  ];

  CfnInternetGateway: {
    id: string;
    tags: [
      {
        key: string;
        value: string;
      }
    ];
  };

  CfnEIP: {
    id: string;
    domain: string;
    tags: { key: string; value: string }[];
  };

  CfnNatGateway: {
    id: string;
    subnetId: string; // e.g.
    eipRef: string; // e.g. "NatEIP"
    tags: { key: string; value: string }[];
  };

  cfnRouteTables: [
    {
      id: string;
      isPublic: boolean; // trueならIGW, falseならNAT
      routes: [
        {
          id: string;
          destinationCidrBlock: string;
          gatewayType: "igw" | "nat"; // どちらを参照するか
        }
      ];
      associations: [
        {
          id: string;
          subnetId: string;
        }
      ];
      tags: { key: string; value: string }[];
    }
  ];

  cfnVPCEndpoints: [
    {
      id: string;
      serviceName: string;
      routeTableIds: string[];
      vpcEndpointType: "Gateway" | "Interface";
      tags: { key: string; value: string }[];
    }
  ];

  cfnSecurityGroups: [
    {
      groupName: string;
      description?: string;
      ingress?: SgIngress[];
      egress?: SgEgress[];
      tags?: { key: string; value: string }[];
    }
  ];
}

export class Network extends Construct {
  public readonly cfnVPC: CfnVPC;
  public readonly cfnSubnets: Record<string, CfnSubnet> = {};
  public readonly cfnSecurityGroups: Record<string, CfnSecurityGroup> = {};
  constructor(scope: Construct, id: string, props: NetworkProps) {
    super(scope, id);

    // vpc
    this.cfnVPC = new CfnVPC(this, "VPC", {
      cidrBlock: props.CfnVPC.cidrBlock,
      enableDnsSupport: props.CfnVPC.enableDnsSupport ?? true,
      enableDnsHostnames: props.CfnVPC.enableDnsHostnames ?? true,
      tags: props.CfnVPC.tags,
    });

    props.cfnSubnets.forEach((cfnSubnet) => {
      this.cfnSubnets[cfnSubnet.id] = new CfnSubnet(this, cfnSubnet.id, {
        vpcId: this.cfnVPC.ref,
        cidrBlock: cfnSubnet.cidrBlock,
        availabilityZone: cfnSubnet.availabilityZone,
        mapPublicIpOnLaunch: cfnSubnet.mapPublicIpOnLaunch,
        tags: cfnSubnet.tags,
      });
    });

    // IGW
    const igw = new CfnInternetGateway(this, props.CfnInternetGateway.id, {
      tags: props.CfnInternetGateway.tags,
    });
    const igwAttach = new CfnVPCGatewayAttachment(this, `${props.CfnInternetGateway.id}-attach`, {
      vpcId: this.cfnVPC.ref,
      internetGatewayId: igw.ref,
    });

    // EIP
    const eip = new CfnEIP(this, props.CfnEIP.id, {
      domain: props.CfnEIP.domain,
      tags: props.CfnEIP.tags,
    });

    // NAT GW
    const natGw = new CfnNatGateway(this, props.CfnNatGateway.id, {
      allocationId: eip.attrAllocationId,
      subnetId: this.cfnSubnets[props.CfnNatGateway.subnetId].ref,
      tags: props.CfnNatGateway.tags,
    });

    // RTB
    const routeTables: Record<string, CfnRouteTable> = {};
    props.cfnRouteTables.forEach((cfnRouteTable) => {
      const rtb = new CfnRouteTable(this, cfnRouteTable.id, {
        vpcId: this.cfnVPC.ref,
        tags: cfnRouteTable.tags,
      });
      routeTables[cfnRouteTable.id] = rtb;

      cfnRouteTable.routes.forEach((route) => {
        const base = {
          routeTableId: rtb.ref,
          destinationCidrBlock: route.destinationCidrBlock,
        };

        if (route.gatewayType === "igw") {
          const cfnRoute = new CfnRoute(this, route.id, { ...base, gatewayId: igw.ref });
          cfnRoute.addDependency(igwAttach);
          return;
        }

        if (route.gatewayType === "nat") {
          const cfnRoute = new CfnRoute(this, route.id, { ...base, natGatewayId: natGw.ref });
          cfnRoute.addDependency(natGw);
          return;
        }
      });

      // Subnet Associations
      cfnRouteTable.associations.forEach((asso) => {
        new CfnSubnetRouteTableAssociation(this, asso.id, {
          routeTableId: rtb.ref,
          subnetId: this.cfnSubnets[asso.subnetId].ref,
        });
      });
    });

    // VPC Endpoint
    props.cfnVPCEndpoints.forEach((cfnVPCEndpoint) => {
      new CfnVPCEndpoint(this, cfnVPCEndpoint.id, {
        vpcId: this.cfnVPC.ref,
        vpcEndpointType: cfnVPCEndpoint.vpcEndpointType, // "Gateway"
        serviceName: cfnVPCEndpoint.serviceName, // 例: "com.amazonaws.us-east-2.s3"
        routeTableIds: cfnVPCEndpoint.routeTableIds.map((routeTableId) => routeTables[routeTableId].ref),
        tags: cfnVPCEndpoint.tags,
      });
    });

    //securitygroup
    props.cfnSecurityGroups.forEach((cfg) => {
      this.cfnSecurityGroups[cfg.groupName] = new CfnSecurityGroup(this, cfg.groupName, {
        vpcId: this.cfnVPC.ref,
        groupName: cfg.groupName,
        groupDescription: cfg.description ?? cfg.groupName,
        tags: cfg.tags,
      });
    });

    //参照系ルール（sourceSecurityGroupIdRef など）を解決して設定
    props.cfnSecurityGroups.forEach((cfg) => {
      const ingress = (cfg.ingress ?? []).map((r) => ({
        ipProtocol: r.ipProtocol,
        fromPort: r.fromPort,
        toPort: r.toPort,
        cidrIp: r.cidrIp,
        cidrIpv6: r.cidrIpv6,
        ...(r.sourceSecurityGroupIdRef
          ? { sourceSecurityGroupId: this.cfnSecurityGroups[r.sourceSecurityGroupIdRef].ref }
          : {}),
      }));
      const egress = (cfg.egress ?? []).map((r) => ({
        ipProtocol: r.ipProtocol,
        fromPort: r.fromPort,
        toPort: r.toPort,
        cidrIp: r.cidrIp,
        cidrIpv6: r.cidrIpv6,
        ...(r.destinationSecurityGroupIdRef
          ? { destinationSecurityGroupId: this.cfnSecurityGroups[r.destinationSecurityGroupIdRef].ref }
          : {}),
      }));

      if (ingress.length)
        this.cfnSecurityGroups[cfg.groupName].addPropertyOverride("SecurityGroupIngress", ingress);
      if (egress.length) this.cfnSecurityGroups[cfg.groupName].addPropertyOverride("SecurityGroupEgress", egress);
    });
  }
}
