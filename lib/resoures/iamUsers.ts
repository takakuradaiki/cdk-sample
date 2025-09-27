import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import { Stack } from "aws-cdk-lib";

export interface InlinePolicy {
  name: string;
  statements: any[];
}

export interface IamUserItem {
  userName: string; // ユーザー名
  path?: string; // 例: "/"
  inlinePolicies?: InlinePolicy[];
  createAccessKey?: boolean; // trueでアクセスキーを発行（※秘密鍵の取り扱い注意）
}

export interface IamUsersProps {
  users: IamUserItem[];
}

function deepSubstitute(obj: any, region: string, account: string): any {
  if (typeof obj === "string") {
    return obj.replace(/\$\{region\}/g, region).replace(/\$\{account\}/g, account);
  }
  if (Array.isArray(obj)) return obj.map((v) => deepSubstitute(v, region, account));
  if (obj && typeof obj === "object") {
    const o: any = {};
    for (const k of Object.keys(obj)) o[k] = deepSubstitute(obj[k], region, account);
    return o;
  }
  return obj;
}

export class IamUsers extends Construct {
  /** AccessKeyId を参照したい場合に */
  public readonly accessKeyIdsByUserId: Record<string, string> = {};

  constructor(scope: Construct, id: string, props: IamUsersProps) {
    super(scope, id);

    const region = Stack.of(this).region;
    const account = Stack.of(this).account;

    for (const u of props.users) {
      const user = new iam.CfnUser(this, u.userName, {
        userName: u.userName,
        path: u.path,
      });

      for (const p of u.inlinePolicies ?? []) {
        new iam.CfnUserPolicy(this, `${p.name}`, {
          userName: user.ref, // UserName
          policyName: p.name,
          policyDocument: deepSubstitute(
            {
              Version: "2012-10-17",
              Statement: p.statements,
            },
            region,
            account
          ),
        });
      }

      if (u.createAccessKey) {
        const key = new iam.CfnAccessKey(this, `${u.userName}-ak`, { userName: user.ref });
        // SecretAccessKey は CloudFormation の出力で NoEcho になるため、
        // セキュアな出力/保管フロー（例: Secrets Manager へ後段で登録）を別途用意してください。
        this.accessKeyIdsByUserId[u.userName] = key.ref; // ← AccessKeyId
      }
    }
  }
}
