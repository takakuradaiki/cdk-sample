// lib/resources/acm.ts
import { Construct } from "constructs";
import { DnsValidatedCertificate, CertificateValidation } from "aws-cdk-lib/aws-certificatemanager";

import * as route53 from "aws-cdk-lib/aws-route53";
export interface CertificateProps {
  hostedZoneId: string;
  domainName: string;
  DnsValidatedCertificates: [
    {
      domainName: string;
      subjectAlternativeNames: string[];
    }
  ];
}
export class Certificate extends Construct {
  public readonly dnsValidatedCertificates: Record<string, DnsValidatedCertificate> = {};

  constructor(scope: Construct, id: string, props: CertificateProps) {
    super(scope, id);

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
      hostedZoneId: props.hostedZoneId,
      zoneName: props.domainName,
    });

    props.DnsValidatedCertificates.forEach((dnsValidatedCertificate) => {
      this.dnsValidatedCertificates[dnsValidatedCertificate.domainName] = new DnsValidatedCertificate(
        this,
        "AlbCertificate",
        {
          domainName: dnsValidatedCertificate.domainName,
          subjectAlternativeNames: dnsValidatedCertificate.subjectAlternativeNames,
          hostedZone: hostedZone, // 対応する HostedZone
          validation: CertificateValidation.fromDns(hostedZone),
          // 作成リージョンを明示（ALB と同リージョンに！）
          region: "us-east-2",
        }
      );
    });
  }
}
