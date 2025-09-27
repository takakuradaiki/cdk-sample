import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";

export interface InlinePolicy {
  name: string;
  statements: any[];
}

export interface IamRoleItem {
  roleName: string;
  assumeService: string;
  managedPolicyArns?: string[];
  tags?: { key: string; value: string }[];
  iamPolicies: [
    {
      name: string;
      statements: [
        {
          //effect: string;
          resources: string[];
          actions: string[];
        }
      ];
    }
  ];
}

export interface IamRolesProps {
  iamRoles: IamRoleItem[];
}

export class IamRoles extends Construct {
  public readonly iamRoles: Record<string, iam.Role> = {};

  constructor(scope: Construct, id: string, props: IamRolesProps) {
    super(scope, id);

    props.iamRoles.forEach((iamRole) => {
      // IAM Role
      this.iamRoles[iamRole.roleName] = new iam.Role(this, iamRole.roleName, {
        roleName: iamRole.roleName,
        assumedBy: new iam.ServicePrincipal(iamRole.assumeService),
        managedPolicies: iamRole.managedPolicyArns?.map((arn, i) =>
          iam.ManagedPolicy.fromManagedPolicyArn(this, `${iamRole.roleName}-policy`, arn)
        ),
      });

      iamRole.iamPolicies.forEach((iampPolicy) => {
        // IAM Policy
        const customerManagedPolicy = new iam.ManagedPolicy(this, iampPolicy.name, {
          managedPolicyName: iampPolicy.name + 1, // fix
          statements: iampPolicy.statements.map((statement) => new iam.PolicyStatement(statement)),
        });
        this.iamRoles[iamRole.roleName].addManagedPolicy(customerManagedPolicy);
      });
    });
  }
}
