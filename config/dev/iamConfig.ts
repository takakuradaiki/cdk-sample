//config/dev/iamConfig.ts
import { Aws } from "aws-cdk-lib";
import { common } from "../common/dev-common";

export const ecsIamConfig = {
  iamRoles: [
    {
      // CodeBuild
      roleName: common.iam.roles.names.codebuild,
      assumeService: "codebuild.amazonaws.com",
      iamPolicies: [
        {
          name: "codebuild-role-base-policy",
          statements: [
            {
              effect: "Allow",
              actions: ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
              resources: [
                `arn:aws:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:log-group:codebuild-logs`,
                `arn:aws:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:log-group:codebuild-logs:*`,
              ],
            },
            {
              // S3（CodePipelineアーティファクト取得/配置用：bucket と bucket/* の両方
              effect: "Allow",
              actions: [
                "s3:PutObject",
                "s3:GetObject",
                "s3:GetObjectVersion",
                "s3:GetObjectAcl",
                "s3:GetBucketLocation",
              ],
              resources: [
                `arn:aws:s3:::codepipeline-${Aws.REGION}-${Aws.ACCOUNT_ID}`,
                `arn:aws:s3:::codepipeline-${Aws.REGION}-${Aws.ACCOUNT_ID}/*`,
              ],
            },
            {
              // （既存の広い S3 権限。別用途でも使う場合は残す）
              effect: "Allow",
              actions: ["s3:*"],
              resources: ["arn:aws:s3:::*"],
            },
            {
              // --- CodeBuild レポート ---
              effect: "Allow",
              actions: [
                "codebuild:CreateReportGroup",
                "codebuild:CreateReport",
                "codebuild:UpdateReport",
                "codebuild:BatchPutTestCases",
                "codebuild:BatchPutCodeCoverages",
              ],
              resources: [`arn:aws:codebuild:${Aws.REGION}:${Aws.ACCOUNT_ID}:report-group/*`],
            },
            {
              // --- ENI / VPC 関連（不足しがちな権限を補完）---
              effect: "Allow",
              actions: [
                "ec2:CreateNetworkInterface",
                "ec2:CreateNetworkInterfacePermission",
                "ec2:DeleteNetworkInterface",
                "ec2:DescribeNetworkInterfaces",
                "ec2:DescribeNetworkInterfaceAttribute",
                "ec2:DescribeSubnets",
                "ec2:DescribeSecurityGroups",
                "ec2:DescribeVpcs",
                "ec2:DescribeDhcpOptions",
                "ec2:AssignPrivateIpAddresses",
                "ec2:UnassignPrivateIpAddresses",
                "ec2:CreateTags",
                "ec2:DeleteTags",
              ],
              resources: ["*"],
            },
            {
              // --- SSM（パラメータ参照しているなら必要）---
              effect: "Allow",
              actions: ["ssm:Describe*", "ssm:Get*", "ssm:List*"],
              resources: ["*"],
            },
            {
              // --- ECR push/pull 一式 ---
              effect: "Allow",
              actions: [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:GetRepositoryPolicy",
                "ecr:DescribeRepositories",
                "ecr:ListImages",
                "ecr:DescribeImages",
                "ecr:BatchGetImage",
                "ecr:GetLifecyclePolicy",
                "ecr:GetLifecyclePolicyPreview",
                "ecr:ListTagsForResource",
                "ecr:DescribeImageScanFindings",
                "ecr:InitiateLayerUpload",
                "ecr:UploadLayerPart",
                "ecr:CompleteLayerUpload",
                "ecr:PutImage",
              ],
              resources: ["*"],
            },
            {
              // --- CloudFront（必要な場合のみ）---
              effect: "Allow",
              actions: ["cloudfront:GetDistribution", "cloudfront:CreateInvalidation"],
              resources: [`arn:aws:cloudfront::${Aws.ACCOUNT_ID}:distribution/*`],
            },
          ],
        },
      ],
    },
    {
      // CodePipeline
      roleName: common.iam.roles.names.codepipeline,
      assumeService: "codepipeline.amazonaws.com",
      iamPolicies: [
        {
          name: "codepipeline-role-base-policy",
          statements: [
            {
              effect: "Allow",
              actions: ["iam:PassRole"],
              resources: ["*"],
              Condition: {
                StringEqualsIfExists: {
                  "iam:PassedToService": [
                    "cloudformation.amazonaws.com",
                    "elasticbeanstalk.amazonaws.com",
                    "ec2.amazonaws.com",
                    "ecs-tasks.amazonaws.com",
                  ],
                },
              },
            },
            {
              effect: "Allow",
              actions: [
                "codecommit:CancelUploadArchive",
                "codecommit:GetBranch",
                "codecommit:GetCommit",
                "codecommit:GetUploadArchiveStatus",
                "codecommit:UploadArchive",
              ],
              resources: ["*"],
            },
            {
              effect: "Allow",
              actions: [
                "codedeploy:CreateDeployment",
                "codedeploy:GetApplication",
                "codedeploy:GetApplicationRevision",
                "codedeploy:GetDeployment",
                "codedeploy:GetDeploymentConfig",
                "codedeploy:RegisterApplicationRevision",
              ],
              resources: ["*"],
            },
            {
              effect: "Allow",
              actions: [
                "codebuild:BatchGetBuilds",
                "codebuild:StartBuild",
                "codebuild:BatchGetBuildBatches",
                "codebuild:StartBuildBatch",
              ],
              resources: ["*"],
            },
            {
              effect: "Allow",
              actions: ["codestar-connections:UseConnection"],
              resources: ["*"],
            },
            {
              effect: "Allow",
              actions: [
                "elasticbeanstalk:*",
                "ec2:*",
                "elasticloadbalancing:*",
                "autoscaling:*",
                "cloudwatch:*",
                "s3:*",
                "sns:*",
                "cloudformation:*",
                "rds:*",
                "sqs:*",
                "ecs:*",
              ],
              resources: ["*"],
            },
            {
              effect: "Allow",
              actions: [
                "cloudformation:CreateStack",
                "cloudformation:DeleteStack",
                "cloudformation:DescribeStacks",
                "cloudformation:UpdateStack",
                "cloudformation:CreateChangeSet",
                "cloudformation:DeleteChangeSet",
                "cloudformation:DescribeChangeSet",
                "cloudformation:ExecuteChangeSet",
                "cloudformation:SetStackPolicy",
                "cloudformation:ValidateTemplate",
              ],
              resources: ["*"],
            },
            {
              effect: "Allow",
              actions: ["ecr:DescribeImages"],
              resources: ["*"],
            },
            {
              effect: "Allow",
              actions: ["states:DescribeExecution", "states:DescribeStateMachine", "states:StartExecution"],
              resources: ["*"],
            },
            {
              effect: "Allow",
              actions: ["lambda:InvokeFunction", "lambda:ListFunctions"],
              resources: ["*"],
            },
          ],
        },
      ],
    },
    {
      // ECS Task Execution Role
      roleName: common.iam.roles.names.ecsTaskeExecution,
      assumeService: "ecs-tasks.amazonaws.com",
      managedPolicyArns: ["arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"],
      iamPolicies: [
        {
          name: "ecs-task-execution-base-policy",
          statements: [
            {
              effect: "Allow",
              actions: ["ssm:Describe*", "ssm:Get*", "ssm:List*"],
              resources: ["*"],
            },
            {
              effect: "Allow",
              actions: ["logs:CreateLogGroup"],
              resources: ["*"],
            },
          ],
        },
      ],
    },
    {
      // ECS Task Role（App）
      roleName: common.iam.roles.names.ecsTask,
      assumeService: "ecs-tasks.amazonaws.com",
      iamPolicies: [
        {
          name: "ecs-task-app-server-base-policy",
          statements: [
            {
              effect: "Allow",
              actions: ["ses:SendEmail", "ses:SendRawEmail"],
              resources: ["*"],
            },
            {
              effect: "Allow",
              actions: ["s3:ListBucket"],
              resources: ["arn:aws:s3:::*"],
            },
            {
              effect: "Allow",
              actions: [
                "ssmmessages:CreateControlChannel",
                "ssmmessages:CreateDataChannel",
                "ssmmessages:OpenControlChannel",
                "ssmmessages:OpenDataChannel",
              ],
              resources: ["*"],
            },
          ],
        },
      ],
    },
    {
      // ECS Scheduling Task Role（EventBridge）
      roleName: common.iam.roles.names.ecsSchedulingTask,
      assumeService: "events.amazonaws.com",
      managedPolicyArns: ["arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceEventsRole"],
      iamPolicies: [],
    },
    {
      // EC2 管理用
      roleName: common.iam.roles.names.bastion,
      assumeService: "ec2.amazonaws.com",
      iamPolicies: [
        {
          name: "manage-server-role-base-policy",
          statements: [
            {
              effect: "Allow",
              actions: [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUriForLayer",
                "ecr:GetRepositoryPolicy",
                "ecr:DescribeRepositories",
                "ecr:ListImages",
                "ecr:DescribeImages",
                "ecr:BatchGetImage",
                "ecr:GetLifecyclePolicy",
                "ecr:GetLifecyclePolicyPreview",
                "ecr:ListTagsForResource",
                "ecr:DescribeImageScanFindings",
                "ecr:InitiateLayerUpload",
                "ecr:UploadLayerPart",
                "ecr:CompleteLayerUpload",
                "ecr:PutImage",
              ],
              resources: ["*"],
            },
            {
              effect: "Allow",
              actions: [
                "ssm:DescribeAssociation",
                "ssm:GetDeployablePatchSnapshotForInstance",
                "ssm:GetDocument",
                "ssm:DescribeDocument",
                "ssm:GetManifest",
                "ssm:GetParameter",
                "ssm:GetParameters",
                "ssm:ListAssociations",
                "ssm:ListInstanceAssociations",
                "ssm:PutInventory",
                "ssm:PutComplianceItems",
                "ssm:PutConfigurePackageResult",
                "ssm:UpdateAssociationStatus",
                "ssm:UpdateInstanceAssociationStatus",
                "ssm:UpdateInstanceInformation",
              ],
              resources: ["*"],
            },
            {
              effect: "Allow",
              actions: [
                "ssmmessages:CreateControlChannel",
                "ssmmessages:CreateDataChannel",
                "ssmmessages:OpenControlChannel",
                "ssmmessages:OpenDataChannel",
              ],
              resources: ["*"],
            },
            {
              effect: "Allow",
              actions: [
                "ec2messages:AcknowledgeMessage",
                "ec2messages:DeleteMessage",
                "ec2messages:FailMessage",
                "ec2messages:GetEndpoint",
                "ec2messages:GetMessages",
                "ec2messages:SendReply",
              ],
              resources: ["*"],
            },
            {
              effect: "Allow",
              actions: ["s3:GetObject", "s3:PutObject"],
              resources: ["arn:aws:s3:::*/*"],
            },
            {
              effect: "Allow",
              actions: ["elasticfilesystem:ClientMount", "elasticfilesystem:DescribeMountTargets"],
              resources: ["*"],
            },
            {
              effect: "Allow",
              actions: ["route53:ListHostedZones", "route53:GetChange", "route53:ChangeResourceRecordSets"],
              resources: ["*"],
            },
          ],
        },
      ],
    },
    {
      // Lambda 共通
      roleName: common.iam.roles.names.lambdaCommon,
      assumeService: "lambda.amazonaws.com",
      iamPolicies: [],
      managedPolicyArns: ["arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"],
    },

    // EventBridge Scheduler → RDS start/stop
    {
      roleName: common.iam.roles.names.schedulerRds,
      assumeService: "scheduler.amazonaws.com",
      iamPolicies: [
        {
          name: "rds-start-stop-policy",
          statements: [
            {
              effect: "Allow",
              actions: ["rds:StartDBCluster", "rds:StopDBCluster"],
              resources: ["*"],
            },
          ],
        },
      ],
    },
  ],
} as const;

// SESユーザー
export const userIamConfig = {
  users: [
    {
      userName: "ses-user-cdk",
      createAccessKey: true,
      iamPolicies: [
        {
          name: "ses-role-base-policy",
          statements: [
            {
              effect: "Allow",
              actions: ["ses:SendEmail", "ses:SendRawEmail"],
              resources: ["*"],
            },
          ],
        },
      ],
    },
  ],
} as const;
