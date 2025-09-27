// lib/resources/route53.ts
import { Construct } from "constructs";
import { CfnRecordSet, IHostedZone } from "aws-cdk-lib/aws-route53";

export type Route53RecordType = "A" | "AAAA" | "CNAME" | "TXT" | "MX";

export interface Route53Props {
  cfnRecordSets: [
    {
      type: string;
      name: string;
      target: { kind: string; targetKey: string };
      route53hostedZone: {
        zoneName: string;
        hostedZoneId: string;
      };
    }
  ];
  loadbalancerStack: {
    loadbalancerHostedZone: {
      zoneName: string;
      hostedZoneId: string;
    };
  };
}

export class Route53Resources extends Construct {
  public readonly hostedZone: IHostedZone;

  constructor(scope: Construct, id: string, props: Route53Props) {
    super(scope, id);

    props.cfnRecordSets.forEach((cfnRecordSet) => {
      // 'name' が空のときは apex 扱い
      const recordName = `${cfnRecordSet.name}.${cfnRecordSet.route53hostedZone.zoneName}`
        .replace(/\.\.$/, ".")
        .replace(/^\./, "");

      if (cfnRecordSet.type === "A" || cfnRecordSet.type === "AAAA") {
        // A/AAAA エイリアス
        if (cfnRecordSet.target.kind === "alb") {
          new CfnRecordSet(this, cfnRecordSet.name, {
            hostedZoneId: cfnRecordSet.route53hostedZone.hostedZoneId,
            name: recordName,
            type: cfnRecordSet.type,
            aliasTarget: {
              dnsName: props.loadbalancerStack.loadbalancerHostedZone.zoneName,
              hostedZoneId: props.loadbalancerStack.loadbalancerHostedZone.hostedZoneId,
              evaluateTargetHealth: true,
            },
          });
        }
        return;
      }
    });
  }
}
