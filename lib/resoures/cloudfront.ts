import { Construct } from "constructs";
import { CfnDistribution, CfnOriginAccessControl } from "aws-cdk-lib/aws-cloudfront";
import { Bucket, IBucket } from "aws-cdk-lib/aws-s3";
import { Tags } from "aws-cdk-lib";

export interface CloudFrontConfig {
  name: string;
  s3: {
    bucketName: string;
    createIfNotExists?: boolean;
    logging?: { enabled: boolean; bucketName?: string; createIfNotExists?: boolean; prefix?: string };
  };
  distribution: {
    comment?: string;
    aliases?: string[];
    priceClass?: "PriceClass_100" | "PriceClass_200" | "PriceClass_All";
    defaultRootObject?: string;
    errorResponses?: Array<{
      httpStatus: number;
      responseHttpStatus: number;
      responsePagePath: string;
      ttl: number;
    }>;
    cachePolicy?: {
      minTtl: number;
      defaultTtl: number;
      maxTtl: number;
      enableAcceptEncodingBrotli?: boolean;
      enableAcceptEncodingGzip?: boolean;
    };
    acmCertificateArnKey: string;
  };
  tags?: { key: string; value: string }[];
}

export interface CloudFrontProps extends CloudFrontConfig {
  certArnsByKey: Record<string, string>; // { cfCertArn: "arn:..." }
}

export class CloudFrontResources extends Construct {
  public readonly distributionDomainName: string;
  public readonly distributionId: string;

  constructor(scope: Construct, id: string, props: CloudFrontProps) {
    super(scope, id);

    // 既存 S3
    const webBucket: IBucket = props.s3.createIfNotExists
      ? new Bucket(this, "WebBucket", { bucketName: props.s3.bucketName })
      : Bucket.fromBucketName(this, "WebBucket", props.s3.bucketName);

    // OAC（推奨）
    const oac = new CfnOriginAccessControl(this, "OAC", {
      originAccessControlConfig: {
        name: `${props.name}-oac`,
        originAccessControlOriginType: "s3",
        signingBehavior: "always",
        signingProtocol: "sigv4",
      },
    });

    const certArn = props.certArnsByKey[props.distribution.acmCertificateArnKey];
    if (!certArn) throw new Error(`ACM arn not found for key: ${props.distribution.acmCertificateArnKey}`);

    const dist = new CfnDistribution(this, "Distribution", {
      distributionConfig: {
        enabled: true,
        comment: props.distribution.comment,
        aliases: props.distribution.aliases,
        defaultRootObject: props.distribution.defaultRootObject ?? "index.html",
        priceClass: props.distribution.priceClass ?? "PriceClass_200",

        // オリジン（S3 + OAC）
        origins: [
          {
            id: "spa-s3-origin",
            domainName: `${props.s3.bucketName}.s3.${process.env.CDK_DEFAULT_REGION}.amazonaws.com`,
            originAccessControlId: oac.attrId,
            s3OriginConfig: {},
          },
        ],

        // デフォルトビヘイビア（HTTP → HTTPS）
        defaultCacheBehavior: {
          targetOriginId: "spa-s3-origin",
          viewerProtocolPolicy: "redirect-to-https",
          allowedMethods: ["GET", "HEAD", "OPTIONS"],
          cachedMethods: ["GET", "HEAD", "OPTIONS"],
          compress: true,
          forwardedValues: { queryString: true, headers: ["Accept", "Accept-Encoding"] },
          minTtl: props.distribution.cachePolicy?.minTtl ?? 0,
          defaultTtl: props.distribution.cachePolicy?.defaultTtl ?? 300,
          maxTtl: props.distribution.cachePolicy?.maxTtl ?? 86400,
        },

        // 404 → /404.html（404で返す）
        customErrorResponses: props.distribution.errorResponses?.map((e) => ({
          errorCode: e.httpStatus,
          responseCode: e.responseHttpStatus,
          responsePagePath: e.responsePagePath,
          errorCachingMinTtl: e.ttl,
        })),

        // 証明書
        viewerCertificate: {
          acmCertificateArn: certArn,
          sslSupportMethod: "sni-only",
          minimumProtocolVersion: "TLSv1.2_2021",
        },

        // （スクショは Off）ログ無効
        logging: undefined,
      },
    });

    // タグ
    props.tags?.forEach((t) => Tags.of(dist).add(t.key, t.value));

    this.distributionDomainName = dist.attrDomainName;
    this.distributionId = dist.ref;
  }
}
