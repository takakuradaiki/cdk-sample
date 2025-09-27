import { CfnRepository } from "aws-cdk-lib/aws-ecr";
import { Construct } from "constructs";

export interface EcrConfigProps {
  cfnRepositories: [
    {
      repositoryName: string;
      scanOnPush?: boolean;
      imageTagMutability?: "IMMUTABLE" | "MUTABLE";
      lifecycle?: { maxImageCount?: number };
      tags?: { key: string; value: string }[];
    }
  ];
}

export class EcrResources extends Construct {
  constructor(scope: Construct, id: string, props: EcrConfigProps) {
    super(scope, id);

    props.cfnRepositories.forEach((cfnRepository) => {
      const keep = cfnRepository.lifecycle?.maxImageCount;

      const repo = new CfnRepository(this, cfnRepository.repositoryName, {
        repositoryName: cfnRepository.repositoryName,
        imageScanningConfiguration: { scanOnPush: cfnRepository.scanOnPush },
        imageTagMutability: cfnRepository.imageTagMutability,
        lifecyclePolicy: {
          lifecyclePolicyText: JSON.stringify({
            rules: [
              {
                rulePriority: 1,
                description: `keep last ${keep} images`,
                selection: {
                  tagStatus: "any",
                  countType: "imageCountMoreThan",
                  countNumber: keep,
                },
                action: { type: "expire" },
              },
            ],
          }),
        },
      });
    });
  }
}
