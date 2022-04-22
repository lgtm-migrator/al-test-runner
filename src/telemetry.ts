import * as vscode from 'vscode';
import TelemetryReporter, { TelemetryEventMeasurements, TelemetryEventProperties } from "@vscode/extension-telemetry";
import { appInsightsKey, RunType } from "./constants";
import { alTestController, getExtension, telemetryReporter } from "./extension";
import { numberOfTests } from './testController';

export function createTelemetryReporter(): TelemetryReporter {
    const extensionId = getExtension()!.id;
    const extensionVersion = getExtension()!.packageJSON.version;
    return new TelemetryReporter(extensionId, extensionVersion, appInsightsKey);
}

export function sendTestRunStartEvent(request: vscode.TestRunRequest) {
    sendTestRunEvent('001-TestStarted', request);
}

export function sendTestRunFinishedEvent(request: vscode.TestRunRequest) {
    sendTestRunEvent('002-TestFinished', request);
}

function sendTestRunEvent(eventName: string, request: vscode.TestRunRequest) {
    let runType: RunType;
    let testCount: number;
    if (request.include === undefined) {
        runType = RunType.All;
        testCount = numberOfTests;
    }
    else {
        const testItem = request.include[0]!;
        if (testItem.parent) {
            runType = RunType.Test;
            testCount = 1;
        }
        else {
            runType = RunType.Codeunit;
            testCount = testItem.children.size;
        }
    }

    sendEvent(eventName, {}, { 'runType': runType, 'testCount': testCount });
}

export function sendEvent(eventName: string, properties?: TelemetryEventProperties, measurements?: TelemetryEventMeasurements) {
    telemetryReporter.sendTelemetryEvent(eventName, properties, measurements);
}