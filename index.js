  // tracing.js
  'use strict'
  require('dotenv').config();
  const process = require('process');
  const opentelemetry = require('@opentelemetry/sdk-node');
  const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
  const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
  const { Resource } = require('@opentelemetry/resources');
  const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

  const SERVICE_NAME = process.env.SERVICE_NAME || 'nodejs-service';
  const SERVICE_ENVIRONMENT = process.env.SERVICE_ENVIRONMENT || 'development';
  console.log('Initializing tracing...');

  const exporterOptions = {
    url: 'http://182.100.0.35:4318/v1/traces'
  }
  
  const traceExporter = new OTLPTraceExporter(exporterOptions);
  const sdk = new opentelemetry.NodeSDK({
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: `${SERVICE_NAME}-${SERVICE_ENVIRONMENT}`,
    })
    });
    
    // initialize the SDK and register with the OpenTelemetry API
    // this enables the API to record telemetry
    sdk.start()
    
    // gracefully shut down the SDK on process exit
    process.on('SIGTERM', () => {
      sdk.shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.log('Error terminating tracing', error))
      .finally(() => process.exit(0));
      });