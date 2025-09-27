// lib/networkStack.ts
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import config = require("config");
import { Network, NetworkProps } from "./resoures/network";

export interface S3StackProps extends StackProps {}

export class NetworkStack extends Stack {
  public readonly Network: Network;

  constructor(scope: Construct, id: string, props: S3StackProps) {
    super(scope, id, props);
    this.Network = new Network(this, "Network", config.get<NetworkProps>("network.networkConfig"));
  }
}
