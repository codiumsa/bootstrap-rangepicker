Package.describe({
  name: 'nahu:bootstrap-rangepicker',
  version: '0.1',
  summary: 'Number range picker component for Bootstrap',
  git: 'https://github.com/nahu/bootstrap-rangepicker',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.0.1');

  api.use('twbs:bootstrap@3.3.4', ["client"]);
  api.use('jquery@1.11.3_2', ["client"]);

  api.addFiles('rangepicker.js', ["client"]);
  api.addFiles('rangepicker.css', ["client"]);
});
