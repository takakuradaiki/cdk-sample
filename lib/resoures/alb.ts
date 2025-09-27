// lib/resources/alb.ts
import { Construct } from "constructs";
import {
  CfnListener,
  CfnListenerRule,
  CfnLoadBalancer,
  CfnTargetGroup,
} from "aws-cdk-lib/aws-elasticloadbalancingv2";

export interface LoadbalancerProps {
  networkStack: { vpcId: string; publicSubnetIds: string[]; albSecurityGroupId: string[] };
  certificateArn: string;
  cfnLoadBalancer: {
    name: string;
    scheme?: "internet-facing" | "internal";
    type?: "network" | "application";
    loadBalancerAttributes: { key: string; value: string }[];
    tags: { key: string; value: string }[];
  };
  cfnTargetGroups: [
    {
      name: string;
      port: number;
      protocol?: "HTTP" | "HTTPS";
      healthCheckPath?: string;
      healthCheckIntervalSeconds: number;
      healthCheckTimeoutSeconds: number;
      healthyThresholdCount: number;
      unhealthyThresholdCount: number;
      matcher: string;
      tags: { key: string; value: string }[];
    }
  ];
  // 80/443 両方ここで
  cfnListeners: [
    {
      id: string;
      port: number;
      protocol: "HTTP" | "HTTPS";
      sslPolicy?: string;
      defaultAction:
        | { type: "forward"; targetGroupRef: string }
        | {
            type: "redirect";
            redirectPort?: string;
            redirectProtocol?: "HTTP" | "HTTPS";
            statusCode?: "HTTP_301" | "HTTP_302";
          };
    }
  ];
  // HostHeader + Source IP 条件に対応
  cfnListenerRules?: [
    {
      id: string;
      listenerRef: string;
      priority: number;
      conditions: {
        hostHeaders?: string[];
        pathPatterns?: string[];
        sourceIps?: string[];
      };
      action:
        | { type: "forward"; targetGroupRef: string }
        | {
            type: "fixed-response";
            fixedResponse: { statusCode: string; contentType?: string; messageBody?: string };
          };
    }
  ];
}

export class Loadbalancer extends Construct {
  public readonly cfnLoadBalancer: CfnLoadBalancer;
  private cfnlistener: CfnListener;
  public cfnTargetGroups: Record<string, CfnTargetGroup> = {};

  constructor(scope: Construct, id: string, props: LoadbalancerProps) {
    super(scope, id);
    // ALB
    this.cfnLoadBalancer = new CfnLoadBalancer(this, props.cfnLoadBalancer.name, {
      type: props.cfnLoadBalancer.type,
      scheme: props.cfnLoadBalancer.scheme,
      subnets: props.networkStack.publicSubnetIds,
      securityGroups: props.networkStack.albSecurityGroupId,
      name: props.cfnLoadBalancer.name,
      loadBalancerAttributes: props.cfnLoadBalancer.loadBalancerAttributes,
      tags: props.cfnLoadBalancer.tags,
    });
    // 複数TG
    props.cfnTargetGroups.forEach((t) => {
      this.cfnTargetGroups[t.name] = new CfnTargetGroup(this, t.name, {
        name: t.name,
        vpcId: props.networkStack.vpcId,
        targetType: "ip",
        protocol: t.protocol,
        port: t.port,
        healthCheckEnabled: true,
        healthCheckPath: t.healthCheckPath,
        healthCheckIntervalSeconds: t.healthCheckIntervalSeconds,
        healthCheckTimeoutSeconds: t.healthCheckTimeoutSeconds,
        healthyThresholdCount: t.healthyThresholdCount,
        unhealthyThresholdCount: t.unhealthyThresholdCount,
        matcher: { httpCode: t.matcher },
        tags: t.tags,
      });
    });

    // Listeners
    props.cfnListeners.forEach((l) => {
      const defaultActions: CfnListener.ActionProperty[] =
        l.defaultAction.type === "forward"
          ? [{ type: "forward", targetGroupArn: this.cfnTargetGroups[l.defaultAction.targetGroupRef].ref }]
          : [
              {
                type: "redirect",
                redirectConfig: {
                  port: l.defaultAction.redirectPort ?? "443",
                  protocol: l.defaultAction.redirectProtocol ?? "HTTPS",
                  statusCode: l.defaultAction.statusCode ?? "HTTP_301",
                },
              },
            ];

      this.cfnlistener = new CfnListener(this, l.id, {
        loadBalancerArn: this.cfnLoadBalancer.ref,
        port: l.port,
        protocol: l.protocol,
        ...(l.protocol === "HTTPS"
          ? { certificates: [{ certificateArn: props.certificateArn }], sslPolicy: l.sslPolicy }
          : {}),
        defaultActions,
      });
    });

    // ルール
    props.cfnListenerRules?.forEach((r) => {
      const conds: CfnListenerRule.RuleConditionProperty[] = [];
      if (r.conditions.hostHeaders?.length) {
        conds.push({ field: "host-header", hostHeaderConfig: { values: r.conditions.hostHeaders } });
      }
      if (r.conditions.pathPatterns?.length) {
        conds.push({ field: "path-pattern", pathPatternConfig: { values: r.conditions.pathPatterns } });
      }
      if (r.conditions.sourceIps?.length) {
        conds.push({ field: "source-ip", sourceIpConfig: { values: r.conditions.sourceIps } });
      }
      const actions: CfnListenerRule.ActionProperty[] =
        r.action.type === "forward"
          ? [{ type: "forward", targetGroupArn: this.cfnTargetGroups[r.action.targetGroupRef].ref }]
          : [{ type: "fixed-response", fixedResponseConfig: r.action.fixedResponse }];

      new CfnListenerRule(this, r.id, {
        listenerArn: this.cfnlistener.ref,
        priority: r.priority,
        conditions: conds,
        actions,
      });
    });
  }
}
