import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as config from '../config.json';

export class GenaiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const envName = process.env.DEPLOY_ENV || 'dev';
    const envConfig = (config as any)[envName];

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'GenaiQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    const myKmsKey = new kms.Key(this, 'myKMSKey');

    const myBucket = new s3.Bucket(this, 'Bucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: myKmsKey,
      enforceSSL: true,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const vpc = ec2.Vpc.fromLookup(this, 'DefaultVPC', {
      vpcId: envConfig.vpcId,
    });

    const subnet = ec2.Subnet.fromSubnetAttributes(this, 'ExistingSubnet', {
      subnetId: envConfig.subnetId,
      availabilityZone: envConfig.availabilityZone, // optional but recommended
    });
    //const subnet = ec2.Subnet.fromSubnetId(this, 'ExistingSubnet', 'subnet-05badfe3396ca4402');


    const instance = new ec2.Instance(this, 'Instance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      vpcSubnets: { subnets: [subnet] },
    });


  }
}
