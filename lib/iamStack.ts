import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import config = require("config");
import { IamRolesProps, IamRoles } from "./resoures/iamRoles";
import { IamUsersProps, IamUsers } from "./resoures/iamUsers";

export class IamStack extends Stack {
  public readonly accessKeyIdsByUserId: Record<string, string> = {};
  public readonly roles: IamRoles;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.roles = new IamRoles(this, "IamRoles", config.get<IamRolesProps>("iam.ecsIamConfig"));

    // Users (存在すれば)
    if (config.has("iam.userIamConfig")) {
      const usersProp = config.get<IamUsersProps>("iam.userIamConfig");
      const users = new IamUsers(this, "IamUsers", usersProp);
      this.accessKeyIdsByUserId = users.accessKeyIdsByUserId;
    }
  }
}
