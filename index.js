  // tracing.js
  'use strict'
  require('dotenv').config();
  const process = require('process');
  const opentelemetry = require('@opentelemetry/sdk-node');
  const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
  const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
  const { Resource } = require('@opentelemetry/resources');
  const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

  const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
  const { PgInstrumentation } = require('@opentelemetry/instrumentation-pg');
  const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
  const { NestInstrumentation } = require('@opentelemetry/instrumentation-nestjs-core');
  const { WinstonInstrumentation } = require('@opentelemetry/instrumentation-winston');


  const SERVICE_NAME = process.env.APP_NAME || '';
  const SERVICE_ENVIRONMENT = process.env.ENVIRONMENT || '';
  const METRICS = process.env.METRICS || '';

  if (SERVICE_NAME && SERVICE_ENVIRONMENT && METRICS === 'true' ) {
    console.log('Initializing tracing...');

    const exporterOptions = {
      url: 'http://182.100.0.35:4318/v1/traces' 
    }
  
    const traceExporter = new OTLPTraceExporter(exporterOptions);
    const sdk = new opentelemetry.NodeSDK({
      traceExporter,
      instrumentations: [
        new HttpInstrumentation(),
        new PgInstrumentation(),
        new ExpressInstrumentation(),
        new NestInstrumentation(),
        new WinstonInstrumentation(),
        // getNodeAutoInstrumentations()
      ],
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: `${SERVICE_NAME}-${SERVICE_ENVIRONMENT}`,
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: `${SERVICE_ENVIRONMENT}`,
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
    
}