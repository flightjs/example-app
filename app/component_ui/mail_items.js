'use strict';

define(

  [
    'components/flight/lib/component',
    './with_select'
  ],

  function(defineComponent, withSelect) {
    //create a component constructor augmented by the mailItems function and withSelect mixin
    return defineComponent(mailItems, withSelect);

    function mailItems() {
      //attributes that are not expected to be modified, but can be overriden during attachTo
      this.defaultAttrs({
        deleteFolder: 'trash',
        selectedClass: 'selected',
        allowMultiSelect: true,
        selectionChangedEvent: 'uiMailItemSelectionChanged',
        selectedMailItems: [],
        selectedFolders: [],
        //selectors
        itemSelector: 'tr.mail-item',
        selectedItemSelector: 'tr.mail-item.selected'
      });

      //inject markup into UI
      this.renderItems = function(ev, data) {
        this.select('itemContainerSelector').html(data.markup);
        //new items, so no selections
        this.trigger('uiMailItemSelectionChanged', {selectedIds: []});
      }

      this.updateMailItemSelections = function(ev, data) {
        this.attr.selectedMailItems = data.selectedIds;
      }

      this.updateFolderSelections = function(ev, data) {
        this.attr.selectedFolders = data.selectedIds;
      }

      //ask for data items to be deleted
      this.requestDeletion = function() {
        this.trigger('uiMoveItemsRequested', {
          itemIds: this.attr.selectedMailItems,
          fromFolder: this.attr.selectedFolders[0],
          toFolder: this.attr.deleteFolder
        });
      };

     //code to be run when the instance is created
      this.after('initialize', function() {
        this.on(document, 'dataMailItemsServed', this.renderItems);
        this.on(document, 'uiDeleteMail', this.requestDeletion);

        this.on('uiMailItemSelectionChanged', this.updateMailItemSelections);
        this.on(document, 'uiFolderSelectionChanged', this.updateFolderSelections);

        //begin by asking for initial items
        this.trigger('uiMailItemsRequested');
      });
    }
  }
);
