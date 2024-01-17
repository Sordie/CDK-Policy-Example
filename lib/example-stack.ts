import { Schedule, ScheduleExpression } from "@aws-cdk/aws-scheduler-alpha";
import { LambdaInvoke } from "@aws-cdk/aws-scheduler-targets-alpha";
import * as cdk from "aws-cdk-lib";
import { Stack } from "aws-cdk-lib";
import {
  Effect,
  PolicyStatement,
  PrincipalWithConditions,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class ExampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.defineRole();
  }

  /**
   * Direct example
   */
  defineRole() {
    const principal = new PrincipalWithConditions(
      new ServicePrincipal("scheduler.amazonaws.com"),
      {
        StringEquals: {
          "aws:SourceAccount": Stack.of(this).account,
        },
      }
    );

    const role = new Role(this, "Role", {
      assumedBy: principal,
    });

    role.assumeRolePolicy?.addStatements(
      new PolicyStatement({
        effect: Effect.ALLOW,
        principals: [principal],
        actions: ["sts:AssumeRole"],
      })
    );
  }

  /**
   * Indirect example
   */
  defineSchedule() {
    const func = new Function(this, "Function", {
      code: Code.fromInline("exports.handler = async () => {}"),
      handler: "index.handler",
      runtime: Runtime.NODEJS_18_X,
    });

    new Schedule(this, "Schedule1", {
      schedule: ScheduleExpression.cron({}),
      target: new LambdaInvoke(func, {}),
    });
    new Schedule(this, "Schedule2", {
      schedule: ScheduleExpression.cron({}),
      target: new LambdaInvoke(func, {}),
    });
  }
}
