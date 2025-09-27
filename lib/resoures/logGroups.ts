import { CfnLogGroup } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

export interface LogGroupItem {
  name: string;
  retentionInDays?: number;
  kmsKeyId?: string;
  tags?: { key: string; value: string }[];
}

export interface LogGroupsProps {
  cfnLogGroups: LogGroupItem[];
}

export class LogGroups extends Construct {
  public readonly cfnLogGroups: Record<string, CfnLogGroup> = {};
  constructor(scope: Construct, id: string, props: LogGroupsProps) {
    super(scope, id);

    props.cfnLogGroups.forEach((cfnLogGroup) => {
      const idForCdk = cfnLogGroup.name.replace(/[^A-Za-z0-9]/g, "-");
      this.cfnLogGroups[idForCdk] = new CfnLogGroup(this, idForCdk, {
        logGroupName: cfnLogGroup.name,
        retentionInDays: cfnLogGroup.retentionInDays,
        kmsKeyId: cfnLogGroup.kmsKeyId,
        tags: cfnLogGroup.tags,
      });
    });
  }
}
