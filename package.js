Package.describe({
  name: 'awei01:service-container',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'A dependency injection solution for Meteor',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use([
    'ecmascript',
    'underscore',
  ]);
  api.addFiles([
    'source/container.js',
    'source/namespace.js',
    'source/provider.js',
  ]);
  api.export('Container');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('sanjo:jasmine@0.20.3');
  api.use('awei01:service-container');
  api.addFiles([
    'tests/container.spec.js',
    'tests/namespace.spec.js',
    'tests/provider.spec.js',
  ]);
});
