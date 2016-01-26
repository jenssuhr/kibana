define(function (require) {
  var marked = require('marked');
  marked.setOptions({
    gfm: true, // Github-flavored markdown
    sanitize: true // Sanitize HTML tags
  });

  var renderer = new marked.Renderer();
  renderer.paragraph = function (text) {
    text = text.replace(/##([^\s]+)\b/g, function (original, dashboardName) {
      return '<a href="#/dashboard/' + dashboardName + '">' + dashboardName + '</a>';
    });

    return marked.Renderer.prototype.paragraph.apply(this, arguments);
  };

  var module = require('ui/modules').get('kibana/reshin_navigation_vis', ['kibana']);
  module.controller('ReshinNavigationVisController', function ($scope, $sce) {
    $scope.$watch('vis.params.reshin.navigation.markdown', function (html) {
      if (!html) return;
      $scope.html = $sce.trustAsHtml(marked(html, {renderer: renderer}));
    });
  });
});
