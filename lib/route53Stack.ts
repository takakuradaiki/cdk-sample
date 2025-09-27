// lib/route53Stack.ts
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import config = require("config");
import { Route53Resources, type Route53Props } from "./resoures/route53";

export interface Route53StackProps extends StackProps {
  loadbalancerStack: { dnsName: string; hostedZoneId: string };
}

export class Route53Stack extends Stack {
  public readonly r53: Route53Resources;
  constructor(scope: Construct, id: string, props: Route53StackProps) {
    super(scope, id, props);

    const r53cfg = config.get<Route53Props>("route53.route53Config");

    this.r53 = new Route53Resources(this, "Route53", {
      ...r53cfg,
      loadbalancerStack: {
        loadbalancerHostedZone: {
          zoneName: props.loadbalancerStack.dnsName,
          hostedZoneId: props.loadbalancerStack.hostedZoneId,
        },
      },
    });
  }
}
