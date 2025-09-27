// lib/resources/codepipelines.ts
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";

export interface CodePipelineProps {
  iamStack: {
    pipelineRoleArn: string;
  };
  artifactStore: { type: string; location: string; encryptionKey: { id: string; type: string } };
  SourceConnection: { codestarConnectionArn: string };
  codeBuildProjectNamesById?: Record<string, string>;
  cfnPipelines: Array<{
    name: string;
    stages: Array<codepipeline.CfnPipeline.StageDeclarationProperty | cdk.IResolvable>;
  }>;
}

export class CodePipelines extends Construct {
  constructor(scope: Construct, id: string, props: CodePipelineProps) {
    super(scope, id);

    props.cfnPipelines.forEach((pl) => {
      new codepipeline.CfnPipeline(this, `${pl.name}`, {
        name: pl.name,
        roleArn: props.iamStack.pipelineRoleArn,
        artifactStore: props.artifactStore,
        stages: pl.stages,
      });
    });
  }
}
