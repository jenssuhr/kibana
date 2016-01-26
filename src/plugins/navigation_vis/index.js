module.exports = function (kibana) {

  return new kibana.Plugin({

    uiExports: {
      visTypes: [
        'plugins/navigation_vis/navigation_vis'
      ]
    }

  });

};
