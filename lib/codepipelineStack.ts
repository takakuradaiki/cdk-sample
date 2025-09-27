// lib/codePipelineStack.ts
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import config = require("config");
import { CodePipelines, CodePipelineProps } from "./resoures/codepipeline";

export interface CodePipelineStackProps extends StackProps {
  iamStack: {
    pipelineRoleArn: string;
  };
}

export class CodePipelineStack extends Stack {
  codePipelines: CodePipelines;
  constructor(scope: Construct, id: string, props: CodePipelineStackProps) {
    super(scope, id, props);
    this.codePipelines = new CodePipelines(this, "CodePipelines", {
      ...config.get<CodePipelineProps>("codepipeline.codepipelineConfig"),
      iamStack: {
        pipelineRoleArn: props.iamStack.pipelineRoleArn,
      },
    });
  }
}
