// lib/logsStack.ts
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { LogGroups, LogGroupsProps } from "./resoures/logGroups"; // ← resources の綴り注意
import config = require("config");

export class LogsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // config から設定を取得
    const lgProps = config.get<LogGroupsProps>("logs.logGroupConfig");
    const logGroups = new LogGroups(this, "LogGroups", lgProps);
  }
}
