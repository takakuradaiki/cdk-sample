// lib/resources/rds.ts
import { Construct } from "constructs";
import { CfnDBCluster, CfnDBInstance, CfnDBSubnetGroup } from "aws-cdk-lib/aws-rds";

export interface RdsProps {
  networkStack: {
    dbSubnetIds: string[];
    dbsecurityGroupId: string[];
  };
  cfnDBCluster: {
    identifier: string;
    engine: "aurora-mysql";
    engineVersion: string;
    databaseName?: string;
    masterUsername: string;
    subnetIds: string[];
  };
  cfnWriterDBInstance: {
    identifier: string;
    instanceClass: string;
    az: string;
  };
  cfnReaderDBInstance: {
    identifier: string;
    instanceClass: string;
    az: string;
  };
}

export class Rds extends Construct {
  public readonly cluster: CfnDBCluster;
  public readonly writerInstance: CfnDBInstance;
  public readonly readerInstances: CfnDBInstance;

  constructor(scope: Construct, id: string, props: RdsProps) {
    super(scope, id);

    const subnetGroup = new CfnDBSubnetGroup(this, "SubnetGroup", {
      dbSubnetGroupDescription: "aurora-subnets",
      subnetIds: props.networkStack.dbSubnetIds,
      dbSubnetGroupName: "aurora-subnet-group",
    });

    // Cluster（物理名固定＋既存SGを紐付け）
    this.cluster = new CfnDBCluster(this, props.cfnDBCluster.identifier, {
      dbClusterIdentifier: props.cfnDBCluster.identifier,
      engine: props.cfnDBCluster.engine,
      engineVersion: props.cfnDBCluster.engineVersion,
      databaseName: props.cfnDBCluster.databaseName,
      masterUsername: props.cfnDBCluster.masterUsername,
      manageMasterUserPassword: true,
      dbSubnetGroupName: subnetGroup.ref,
      vpcSecurityGroupIds: props.networkStack.dbsecurityGroupId,
      port: 3306,
    });
    this.cluster.addDependency(subnetGroup);

    this.writerInstance = new CfnDBInstance(this, props.cfnWriterDBInstance.identifier, {
      dbClusterIdentifier: this.cluster.ref,
      dbInstanceIdentifier: props.cfnWriterDBInstance.identifier,
      dbInstanceClass: props.cfnWriterDBInstance.instanceClass,
      engine: props.cfnDBCluster.engine,
      availabilityZone: props.cfnWriterDBInstance.az,
      publiclyAccessible: false,
    });
    this.writerInstance.addDependency(this.cluster);

    this.readerInstances = new CfnDBInstance(this, props.cfnReaderDBInstance.identifier, {
      dbClusterIdentifier: this.cluster.ref,
      dbInstanceIdentifier: props.cfnReaderDBInstance.identifier,
      dbInstanceClass: props.cfnReaderDBInstance.instanceClass,
      engine: props.cfnDBCluster.engine,
      availabilityZone: props.cfnReaderDBInstance.az,
      publiclyAccessible: false,
    });
    this.readerInstances.addDependency(this.cluster);
  }
}
