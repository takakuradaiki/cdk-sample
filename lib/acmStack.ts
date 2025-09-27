import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import config = require("config");

import { Certificate, CertificateProps } from "./resoures/certificate";

export class AcmStack extends Stack {
  public readonly certArn: string;
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const cfg = config.get<CertificateProps>("acm.albAcmConfig");
    const certificate = new Certificate(this, "Certificate", cfg);
    this.certArn = certificate.dnsValidatedCertificates[cfg.DnsValidatedCertificates[0].domainName].certificateArn;
  }
}
