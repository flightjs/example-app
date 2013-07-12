'use strict';

define(

  [
    'components/flight/lib/component',
    './with_select'
  ],

  function(defineComponent, withSelect) {
    //create a component constructor augmented by the composeBox function and withSelect mixin
    return defineComponent(folders, withSelect);

    function folders() {
      //attributes that are not expected to be modified, but can be overriden during attachTo
      this.defaultAttrs({
        selectedClass: 'selected',
        selectionChangedEvent: 'uiFolderSelectionChanged',
        //selectors
        itemSelector: 'li.folder-item',
        selectedItemSelector: 'li.folder-item.selected'
      });

      //request items for given folder
      this.fetchMailItems = function(ev, data) {
          this.trigger('uiMailItemsRequested', {folder: data.selectedIds[0]});
      }

      //code to be run when the instance is created
      this.after('initialize', function() {
        this.on('uiFolderSelectionChanged', this.fetchMailItems);
      });
    }
  }
);
