// lib/resoures/ssmParams.ts
import { Construct } from "constructs";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from "aws-cdk-lib/custom-resources";

export type ParamType = "String" | "StringList" | "SecureString";
export type Tier = "Standard" | "Advanced" | "Intelligent-Tiering";

export interface SsmParamsProps {
  Parameters: Array<{
    name: string;
    type: ParamType;
    value?: string; // String / SecureString
    values?: string[]; // StringList
    description?: string;
    tier?: Tier;
    // 任意: KMS を明示したい場合はここに keyId を追加してもOK
    // keyId?: string; // alias/aws/ssm で良ければ不要
  }>;
}

export class SsmParams extends Construct {
  // 便宜上型は any に。StringParameter だったり AwsCustomResource だったり混在するため
  public readonly parametersByName: Record<string, any> = {};

  constructor(scope: Construct, id: string, props: SsmParamsProps) {
    super(scope, id);

    props.Parameters.forEach((p) => {
      const logicalId = p.name.replace(/[^\w./-]/g, "_");

      if (p.type === "String") {
        const param = new ssm.StringParameter(this, logicalId, {
          parameterName: p.name,
          stringValue: p.value ?? "",
          description: p.description,
          tier: p.tier as any,
        });
        this.parametersByName[p.name] = param;
        return;
      }

      if (p.type === "StringList") {
        const param = new ssm.StringListParameter(this, logicalId, {
          parameterName: p.name,
          stringListValue: p.values ?? [],
          description: p.description,
          tier: p.tier as any,
        });
        this.parametersByName[p.name] = param;
        return;
      }

      // === SecureString は CloudFormation 非対応なので Custom Resource で作成 ===
      const cr = new AwsCustomResource(this, `${logicalId}_SecureString`, {
        policy: AwsCustomResourcePolicy.fromSdkCalls({
          resources: AwsCustomResourcePolicy.ANY_RESOURCE,
        }),
        onCreate: {
          service: "SSM",
          action: "putParameter",
          parameters: {
            Name: p.name,
            Type: "SecureString",
            Value: p.value ?? "",
            Overwrite: true,
            // KeyId: p.keyId, // 使う場合はコメントアウト解除
            Tier: p.tier,
          },
          physicalResourceId: PhysicalResourceId.of(`ssm-secure-${p.name}`),
        },
        onUpdate: {
          service: "SSM",
          action: "putParameter",
          parameters: {
            Name: p.name,
            Type: "SecureString",
            Value: p.value ?? "",
            Overwrite: true,
            // KeyId: p.keyId,
            Tier: p.tier,
          },
          physicalResourceId: PhysicalResourceId.of(`ssm-secure-${p.name}`),
        },
        onDelete: {
          service: "SSM",
          action: "deleteParameter",
          parameters: { Name: p.name },
        },
      });

      this.parametersByName[p.name] = cr;
    });
  }
}
