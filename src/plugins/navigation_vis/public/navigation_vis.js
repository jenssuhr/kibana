define(function (require) {
  // we need to load the css ourselves
  require('plugins/navigation_vis/navigation_vis.less');

  // we also need to load the controller and used by the template
  require('plugins/navigation_vis/navigation_vis_controller');

  // register the provider with the visTypes registry so that other know it exists
  require('ui/registry/vis_types').register(ReshinNavigationVisProvider);

  function ReshinNavigationVisProvider(Private) {
    var TemplateVisType = Private(require('ui/template_vis_type/TemplateVisType'));

    // return the visType object, which kibana will use to display and configure new
    // Vis object of this type.
    return new TemplateVisType({
      name: 'navigation',
      title: 'Navigation widget',
      icon: 'fa-navicon',
      description: 'Useful for adding inner navigation between dashboards.',
      template: require('plugins/navigation_vis/navigation_vis.html'),
      params: {
        editor: require('plugins/navigation_vis/navigation_vis_params.html')
      },
      requiresSearch: false
    });
  }

  // export the provider so that the visType can be required with Private()
  return ReshinNavigationVisProvider;
});
